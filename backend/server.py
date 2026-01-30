from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, status, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import base64
import random
from io import BytesIO
from PIL import Image
import httpx
from fastapi.responses import JSONResponse
import smtplib
from email.message import EmailMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# LLM Configuration removed (chat service disabled in this build)
# If you want to enable an external AI service later, configure it here

security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# ---------------------- Security & Rate Limiting ----------------------
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

# Config (override via environment)
BACKEND_MAX_BODY_SIZE_BYTES = int(os.environ.get("BACKEND_MAX_BODY_SIZE_BYTES", str(2 * 1024 * 1024)))  # 2MB default
BACKEND_RATE_LIMIT_WINDOW_SECONDS = int(os.environ.get("BACKEND_RATE_LIMIT_WINDOW_SECONDS", "60"))
BACKEND_RATE_LIMIT_MAX_REQUESTS = int(os.environ.get("BACKEND_RATE_LIMIT_MAX_REQUESTS", "120"))

# In-memory store for rate limiter: ip -> (count, window_start)
RATE_LIMIT_STORE = {}

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # Default security headers
        csp = os.environ.get("CONTENT_SECURITY_POLICY", "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:;")
        response.headers.setdefault("Content-Security-Policy", csp)
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        # HSTS - safe to set in production behind TLS
        response.headers.setdefault("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
        return response

class BodySizeLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                if int(content_length) > BACKEND_MAX_BODY_SIZE_BYTES:
                    return JSONResponse(status_code=413, content={"detail": "Request body too large"})
            except ValueError:
                pass
        return await call_next(request)

class SimpleRateLimiterMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        entry = RATE_LIMIT_STORE.get(client_ip)
        if entry:
            count, window_start = entry
            if now - window_start <= BACKEND_RATE_LIMIT_WINDOW_SECONDS:
                count += 1
                if count > BACKEND_RATE_LIMIT_MAX_REQUESTS:
                    return JSONResponse(status_code=429, content={"detail": "Too many requests"})
                RATE_LIMIT_STORE[client_ip] = (count, window_start)
            else:
                RATE_LIMIT_STORE[client_ip] = (1, now)
        else:
            RATE_LIMIT_STORE[client_ip] = (1, now)
        return await call_next(request)

# Apply middleware (order matters)
# CORS must be added first for it to work properly
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(BodySizeLimitMiddleware)
app.add_middleware(SimpleRateLimiterMiddleware)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== AUTH MODELS ====================
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "user"  # user, hotel_owner, admin

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class VerifyEmail(BaseModel):
    email: EmailStr
    code: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    role: str = "user"  # user, hotel_owner, admin
    profile_picture: Optional[str] = None
    email_verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # Hotel owner specific fields (optional)
    business_name: Optional[str] = None
    business_phone: Optional[str] = None
    business_address: Optional[str] = None

class AuthResponse(BaseModel):
    token: str
    user: User
    verification_required: Optional[bool] = False

# ==================== HOTEL MODELS ====================
class Hotel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    location: str
    city: str
    latitude: float
    longitude: float
    price_per_night: float
    rating: float
    description: str
    amenities: List[str]
    contact: str
    image_url: Optional[str] = None
    images: Optional[List[str]] = None  # Multiple images
    available_rooms: int
    owner_id: Optional[str] = None  # Link to hotel owner
    owner_name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HotelCreate(BaseModel):
    name: str
    location: str
    city: str
    latitude: float
    longitude: float
    price_per_night: float
    description: str
    amenities: List[str]
    contact: str
    available_rooms: int

class HotelUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_night: Optional[float] = None
    description: Optional[str] = None
    amenities: Optional[List[str]] = None
    contact: Optional[str] = None
    available_rooms: Optional[int] = None

# ==================== BOOKING MODELS ====================
class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    user_email: str
    hotel_id: str
    hotel_name: str
    check_in: str
    check_out: str
    guests: int
    total_price: float
    status: str  # confirmed, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BookingCreate(BaseModel):
    hotel_id: str
    check_in: str
    check_out: str
    guests: int

# ==================== PERMIT MODELS ====================
class Permit(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    user_email: str
    permit_type: str  # TIMS, Annapurna, Everest, etc.
    full_name: str
    passport_number: str
    nationality: str
    trek_area: str
    start_date: str
    end_date: str
    status: str  # pending, approved, rejected, cancelled
    admin_note: Optional[str] = None
    document_data: Optional[str] = None  # base64 encoded passport photo
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None

class PermitCreate(BaseModel):
    permit_type: str
    full_name: str
    passport_number: str
    nationality: str
    trek_area: str
    start_date: str
    end_date: str

class PermitUpdate(BaseModel):
    status: str
    admin_note: Optional[str] = None

class PermitType(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PermitTypeCreate(BaseModel):
    name: str
    description: str
    price: float

# ==================== SAFETY MODELS ====================
class EmergencyContact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    category: str  # police, ambulance, embassy, rescue
    location: str
    latitude: float
    longitude: float
    available_24_7: bool

class SafetyTip(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str  # health, weather, trekking, general
    importance: str  # high, medium, low

# ==================== TOURIST SPOT MODELS ====================
class TouristSpot(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str  # temple, mountain, lake, park, etc.
    description: str
    latitude: float
    longitude: float
    location: str
    rating: float
    best_time_to_visit: str

# ==================== CHATBOT MODELS ====================
class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

# ==================== AUTH HELPERS ====================
def generate_verification_code() -> str:
    """Generate 6-digit verification code"""
    return str(random.randint(100000, 999999))


def send_verification_email(to_email: str, code: str):
    """Send a professional HTML verification email with the code. If SMTP not configured, print the code to logs."""
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_pass = os.environ.get('SMTP_PASS')
    email_from = os.environ.get('EMAIL_FROM', smtp_user or f"no-reply@{os.environ.get('HOSTNAME','localhost')}")

    subject = "🔐 Verify Your NepSafe Email"
    
    # Professional HTML email template
    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">Welcome to NepSafe!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 14px;">Your trusted travel companion</p>
                </div>
                
                <!-- Content -->
                <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
                    <p style="margin-top: 0;">Hi there,</p>
                    <p>Thank you for signing up with NepSafe! To complete your registration and secure your account, please verify your email address using the code below:</p>
                    
                    <!-- Verification Code Box -->
                    <div style="background-color: white; border: 2px solid #059669; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
                        <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Your Verification Code</p>
                        <p style="margin: 10px 0 0 0; font-size: 36px; font-weight: bold; color: #059669; letter-spacing: 5px;">{code}</p>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px;">This code will expire in 24 hours.</p>
                    
                    <p style="margin-top: 25px;">If you didn't create this account, please ignore this email.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
                    
                    <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                        <strong>Need help?</strong> Contact our support team at support@nepsafe.com
                    </p>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
                    <p style="margin: 0;">© 2024 NepSafe. All rights reserved.</p>
                    <p style="margin: 5px 0 0 0;">Making travel to Nepal safe and secure.</p>
                </div>
            </div>
        </body>
    </html>
    """
    
    # Plain text fallback
    text_body = f"Your NepSafe verification code is: {code}\n\nThis code will expire in 24 hours.\n\nIf you didn't create this account, please ignore this email."

    if not smtp_host or not smtp_user or not smtp_pass:
        # SMTP not configured; log the code so devs can copy it during development
        logging.info(f"[SMTP Not Configured] Verification code for {to_email}: {code}")
        print(f"[SMTP Not Configured] Verification code for {to_email}: {code}")
        return

    try:
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = email_from
        msg['To'] = to_email
        msg.set_content(text_body)
        msg.add_alternative(html_body, subtype='html')

        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        logging.info(f"Verification email sent successfully to {to_email}")
        print(f"✓ Verification email sent to {to_email}")
    except Exception as e:
        logging.error(f"Failed to send verification email to {to_email}: {str(e)}")
        print(f"✗ Failed to send verification email to {to_email}: {str(e)}")


def send_password_reset_email(to_email: str, code: str):
    """Send a professional HTML password reset email with the code."""
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_pass = os.environ.get('SMTP_PASS')
    email_from = os.environ.get('EMAIL_FROM', smtp_user or f"no-reply@{os.environ.get('HOSTNAME','localhost')}")

    subject = "🔐 Reset Your NepSafe Password"
    
    # Professional HTML email template
    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">Password Reset Request</h1>
                    <p style="margin: 10px 0 0 0; font-size: 14px;">Your account security is important to us</p>
                </div>
                
                <!-- Content -->
                <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
                    <p style="margin-top: 0;">Hi there,</p>
                    <p>We received a request to reset your NepSafe account password. Use the code below to complete the password reset process:</p>
                    
                    <!-- Reset Code Box -->
                    <div style="background-color: white; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
                        <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Your Password Reset Code</p>
                        <p style="margin: 10px 0 0 0; font-size: 36px; font-weight: bold; color: #dc2626; letter-spacing: 5px;">{code}</p>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px;">This code will expire in 24 hours.</p>
                    
                    <p style="color: #dc2626; font-weight: bold; margin-top: 20px;">⚠️ Important Security Notice:</p>
                    <p style="color: #dc2626; font-size: 14px;">If you did not request this password reset, your account may be at risk. Please secure your account immediately by:</p>
                    <ul style="color: #dc2626; font-size: 14px;">
                        <li>Changing your password immediately</li>
                        <li>Reviewing your account activity</li>
                        <li>Contacting our support team if you believe your account is compromised</li>
                    </ul>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
                    
                    <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                        <strong>Need help?</strong> Contact our support team at support@nepsafe.com
                    </p>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
                    <p style="margin: 0;">© 2024 NepSafe. All rights reserved.</p>
                    <p style="margin: 5px 0 0 0;">Making travel to Nepal safe and secure.</p>
                </div>
            </div>
        </body>
    </html>
    """
    
    # Plain text fallback
    text_body = f"Your NepSafe password reset code is: {code}\n\nThis code will expire in 24 hours.\n\n⚠️ If you did not request this, your account may be at risk. Please secure your account immediately."

    if not smtp_host or not smtp_user or not smtp_pass:
        # SMTP not configured; log the code so devs can copy it during development
        logging.info(f"[SMTP Not Configured] Password reset code for {to_email}: {code}")
        print(f"[SMTP Not Configured] Password reset code for {to_email}: {code}")
        return

    try:
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = email_from
        msg['To'] = to_email
        msg.set_content(text_body)
        msg.add_alternative(html_body, subtype='html')

        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        logging.info(f"Password reset email sent successfully to {to_email}")
        print(f"✓ Password reset email sent to {to_email}")
    except Exception as e:
        logging.error(f"Failed to send password reset email to {to_email}: {str(e)}")
        print(f"✗ Failed to send password reset email to {to_email}: {str(e)}")


def create_access_token(user_id: str, role: str) -> str:
    """Create JWT access token for authentication"""
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": user_id, "role": role, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role", "user")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"user_id": user_id, "role": role}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(current_user: dict = Depends(get_current_user)) -> str:
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user["user_id"]

async def get_hotel_owner(current_user: dict = Depends(get_current_user)) -> str:
    if current_user["role"] != "hotel_owner":
        raise HTTPException(status_code=403, detail="Hotel owner access required")
    return current_user["user_id"]

# ==================== AUTH ROUTES ====================
@api_router.post("/auth/register", response_model=AuthResponse)
async def register(user_input: UserRegister, background: BackgroundTasks):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_input.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate role
    if user_input.role not in ["user", "hotel_owner"]:
        raise HTTPException(status_code=400, detail="Invalid role. Use 'user' or 'hotel_owner'")
    
    # Hash password
    hashed_password = bcrypt.hashpw(user_input.password.encode('utf-8'), bcrypt.gensalt())
    
    # Generate verification code
    verification_code = generate_verification_code()
    
    # Create user
    user = User(
        email=user_input.email, 
        name=user_input.name, 
        role=user_input.role, 
        email_verified=False
    )
    user_dict = user.model_dump()
    user_dict['password'] = hashed_password.decode('utf-8')
    user_dict['verification_code'] = verification_code
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Send verification email in background (or log code if SMTP not configured)
    background.add_task(send_verification_email, user_input.email, verification_code)
    
    # Create token
    token = create_access_token(user.id, user.role)
    
    return AuthResponse(token=token, user=user, verification_required=True)

@api_router.post("/auth/verify-email", response_model=AuthResponse)
async def verify_email(verify_data: VerifyEmail):
    user_doc = await db.users.find_one({"email": verify_data.email})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert both to strings for comparison (in case code is stored differently)
    stored_code = str(user_doc.get('verification_code', '')).strip()
    provided_code = str(verify_data.code).strip()
    
    # Debug logging
    print(f"\n=== VERIFICATION DEBUG ===")
    print(f"Email: {verify_data.email}")
    print(f"Stored Code: '{stored_code}' (length: {len(stored_code)}, type: {type(stored_code)})")
    print(f"Provided Code: '{provided_code}' (length: {len(provided_code)}, type: {type(provided_code)})")
    print(f"Match: {stored_code == provided_code}")
    print(f"========================\n")
    
    if stored_code != provided_code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    # Update user as verified
    await db.users.update_one(
        {"email": verify_data.email},
        {"$set": {"email_verified": True}, "$unset": {"verification_code": ""}}
    )
    
    # Fetch updated user
    updated_user_doc = await db.users.find_one({"email": verify_data.email})
    user = User(**updated_user_doc)
    
    # Create new token for verified user
    token = create_access_token(user.id, user.role)
    
    return AuthResponse(token=token, user=user, verification_required=False)

@api_router.post("/auth/resend-verification")
async def resend_verification(email: dict, background: BackgroundTasks):
    user_doc = await db.users.find_one({"email": email.get('email')})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_doc.get('email_verified'):
        raise HTTPException(status_code=400, detail="Email already verified")
    
    # Generate new code and send
    verification_code = generate_verification_code()
    await db.users.update_one(
        {"email": email.get('email')},
        {"$set": {"verification_code": verification_code}}
    )
    background.add_task(send_verification_email, email.get('email'), verification_code)
    return {"message": "Verification code sent"}

@api_router.post("/auth/forgot-password")
async def forgot_password(email: dict, background: BackgroundTasks):
    """Send password reset code to email"""
    user_doc = await db.users.find_one({"email": email.get('email')})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate reset code
    reset_code = generate_verification_code()
    
    # Store reset code with 24-hour expiry
    await db.users.update_one(
        {"email": email.get('email')},
        {"$set": {
            "password_reset_code": reset_code,
            "password_reset_expiry": datetime.now(timezone.utc) + timedelta(hours=24)
        }}
    )
    
    # Send reset email
    background.add_task(send_password_reset_email, email.get('email'), reset_code)
    return {"message": "Password reset code sent to your email"}

@api_router.post("/auth/reset-password")
async def reset_password(reset_data: dict):
    """Reset password with reset code"""
    try:
        email = reset_data.get('email')
        code = reset_data.get('code')
        new_password = reset_data.get('new_password')
        
        logging.info(f"[RESET PASSWORD] Request - Email: {email}, Code: {code}")
        
        if not email or not code or not new_password:
            raise HTTPException(status_code=400, detail="Email, code, and new password required")
        
        user_doc = await db.users.find_one({"email": email})
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if reset code exists
        stored_code = user_doc.get('password_reset_code')
        logging.info(f"[RESET PASSWORD] Stored code: {stored_code}, Type: {type(stored_code)}")
        
        if not stored_code:
            raise HTTPException(status_code=400, detail="No reset code found. Please request a new password reset.")
        
        # Check reset code - convert both to strings and strip whitespace
        stored_code_str = str(stored_code).strip()
        provided_code_str = str(code).strip()
        
        logging.info(f"[RESET PASSWORD] Comparing: '{stored_code_str}' == '{provided_code_str}'")
        
        if stored_code_str != provided_code_str:
            raise HTTPException(status_code=400, detail="Invalid reset code")
        
        # Check expiry - handle both datetime objects and ISO strings
        expiry = user_doc.get('password_reset_expiry')
        logging.info(f"[RESET PASSWORD] Expiry: {expiry}, Type: {type(expiry)}")
        
        if expiry:
            # If it's a string, parse it; if it's a datetime object, use directly
            if isinstance(expiry, str):
                expiry_dt = datetime.fromisoformat(expiry)
            else:
                expiry_dt = expiry
            
            # Ensure both datetimes are timezone-aware for comparison
            now_utc = datetime.now(timezone.utc)
            
            # If expiry_dt is naive, assume it's UTC
            if expiry_dt.tzinfo is None:
                expiry_dt = expiry_dt.replace(tzinfo=timezone.utc)
            
            logging.info(f"[RESET PASSWORD] Expiry check - Expiry: {expiry_dt}, Now: {now_utc}")
            
            if expiry_dt < now_utc:
                raise HTTPException(status_code=400, detail="Reset code expired")
        
        # Update password and clear reset fields
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        result = await db.users.update_one(
            {"email": email},
            {"$set": {
                "password": hashed_password.decode('utf-8')
            }, "$unset": {
                "password_reset_code": "",
                "password_reset_expiry": ""
            }}
        )
        
        logging.info(f"[RESET PASSWORD] Password updated - Matched: {result.matched_count}, Modified: {result.modified_count}")
        
        return {"message": "Password reset successfully. You can now login with your new password."}
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"[RESET PASSWORD] Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(user_input: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": user_input.email})
    if not user_doc:
        logging.error(f"[LOGIN] User not found: {user_input.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check password
    stored_password = user_doc['password']
    logging.info(f"[LOGIN] Stored password type: {type(stored_password)}, first 20 chars: {str(stored_password)[:20]}")
    
    # Handle both bytes and string formats from MongoDB
    if isinstance(stored_password, str):
        stored_password_bytes = stored_password.encode('utf-8')
    else:
        stored_password_bytes = stored_password
    
    incoming_password_bytes = user_input.password.encode('utf-8')
    
    logging.info(f"[LOGIN] Incoming password length: {len(incoming_password_bytes)}")
    logging.info(f"[LOGIN] Stored password bytes length: {len(stored_password_bytes)}")
    
    try:
        password_match = bcrypt.checkpw(incoming_password_bytes, stored_password_bytes)
        logging.info(f"[LOGIN] Password match result: {password_match}")
    except Exception as e:
        logging.error(f"[LOGIN] bcrypt.checkpw error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not password_match:
        logging.error(f"[LOGIN] Password mismatch for user: {user_input.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create user object
    user = User(
        id=user_doc['id'],
        email=user_doc['email'],
        name=user_doc['name'],
        role=user_doc.get('role', 'user'),
        profile_picture=user_doc.get('profile_picture'),
        email_verified=user_doc.get('email_verified', False),
        business_name=user_doc.get('business_name'),
        business_phone=user_doc.get('business_phone'),
        business_address=user_doc.get('business_address'),
        created_at=datetime.fromisoformat(user_doc['created_at']) if isinstance(user_doc['created_at'], str) else user_doc['created_at']
    )
    
    # Create token
    token = create_access_token(user.id, user.role)
    # If email not verified, indicate verification_required so frontend can prompt user
    verification_required = not user.email_verified
    logging.info(f"[LOGIN] Login successful for user: {user_input.email}")
    return AuthResponse(token=token, user=user, verification_required=verification_required)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0, "password": 0, "verification_code": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

@api_router.post("/auth/upload-profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Read file
    contents = await file.read()
    
    # Convert to base64
    image_data = base64.b64encode(contents).decode('utf-8')
    image_url = f"data:image/jpeg;base64,{image_data}"
    
    # Update user profile
    await db.users.update_one(
        {"id": current_user["user_id"]},
        {"$set": {"profile_picture": image_url}}
    )
    
    return {"message": "Profile picture uploaded", "profile_picture": image_url}

# ==================== HOTEL ROUTES (Public) ====================
@api_router.get("/hotels", response_model=List[Hotel])
async def get_hotels(city: Optional[str] = None):
    query = {}
    if city:
        query['city'] = {"$regex": city, "$options": "i"}
    
    hotels = await db.hotels.find(query, {"_id": 0}).to_list(100)
    for hotel in hotels:
        if isinstance(hotel['created_at'], str):
            hotel['created_at'] = datetime.fromisoformat(hotel['created_at'])
    return hotels

@api_router.get("/hotels/{hotel_id}", response_model=Hotel)
async def get_hotel(hotel_id: str):
    hotel = await db.hotels.find_one({"id": hotel_id}, {"_id": 0})
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    if isinstance(hotel['created_at'], str):
        hotel['created_at'] = datetime.fromisoformat(hotel['created_at'])
    return Hotel(**hotel)

# ==================== HOTEL OWNER ROUTES ====================
@api_router.post("/hotel-owner/hotels", response_model=Hotel)
async def create_hotel(hotel_input: HotelCreate, current_user: dict = Depends(get_current_user)):
    # Verify user is hotel owner
    if current_user["role"] != "hotel_owner":
        raise HTTPException(status_code=403, detail="Hotel owner access required")
    
    # Get hotel owner details
    owner = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    
    # Create hotel
    hotel = Hotel(
        **hotel_input.model_dump(),
        rating=0.0,
        owner_id=current_user["user_id"],
        owner_name=owner['name']
    )
    
    hotel_dict = hotel.model_dump()
    hotel_dict['created_at'] = hotel_dict['created_at'].isoformat()
    
    await db.hotels.insert_one(hotel_dict)
    return hotel

@api_router.get("/hotel-owner/hotels", response_model=List[Hotel])
async def get_owner_hotels(owner_id: str = Depends(get_hotel_owner)):
    hotels = await db.hotels.find({"owner_id": owner_id}, {"_id": 0}).to_list(100)
    for hotel in hotels:
        if isinstance(hotel['created_at'], str):
            hotel['created_at'] = datetime.fromisoformat(hotel['created_at'])
    return hotels

@api_router.patch("/hotel-owner/hotels/{hotel_id}")
async def update_hotel(hotel_id: str, hotel_update: HotelUpdate, owner_id: str = Depends(get_hotel_owner)):
    # Verify hotel belongs to owner
    hotel = await db.hotels.find_one({"id": hotel_id, "owner_id": owner_id})
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found or access denied")
    
    # Update only provided fields
    update_data = {k: v for k, v in hotel_update.model_dump().items() if v is not None}
    if update_data:
        await db.hotels.update_one({"id": hotel_id}, {"$set": update_data})
    
    return {"message": "Hotel updated successfully"}

@api_router.post("/hotel-owner/hotels/{hotel_id}/images")
async def upload_hotel_images(
    hotel_id: str,
    files: List[UploadFile] = File(...),
    owner_id: str = Depends(get_hotel_owner)
):
    # Verify hotel belongs to owner
    hotel = await db.hotels.find_one({"id": hotel_id, "owner_id": owner_id})
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found or access denied")
    
    # Process images
    image_urls = []
    for file in files:
        contents = await file.read()
        image_data = base64.b64encode(contents).decode('utf-8')
        image_url = f"data:image/jpeg;base64,{image_data}"
        image_urls.append(image_url)
    
    # Update hotel with images - handle None case properly
    existing_images = hotel.get('images') if hotel.get('images') is not None else []
    all_images = existing_images + image_urls
    
    await db.hotels.update_one(
        {"id": hotel_id},
        {"$set": {"images": all_images, "image_url": all_images[0] if all_images else None}}
    )
    
    return {"message": f"{len(image_urls)} images uploaded successfully", "images": image_urls}

@api_router.get("/hotel-owner/bookings", response_model=List[Booking])
async def get_owner_bookings(owner_id: str = Depends(get_hotel_owner)):
    # Get all hotels owned by this owner
    hotels = await db.hotels.find({"owner_id": owner_id}, {"_id": 0, "id": 1}).to_list(100)
    hotel_ids = [h['id'] for h in hotels]
    
    # Get bookings for these hotels
    bookings = await db.bookings.find({"hotel_id": {"$in": hotel_ids}}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for booking in bookings:
        if isinstance(booking['created_at'], str):
            booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    return bookings

@api_router.patch("/hotel-owner/bookings/{booking_id}/cancel")
async def owner_cancel_booking(booking_id: str, owner_id: str = Depends(get_hotel_owner)):
    # Get booking
    booking = await db.bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Verify hotel belongs to owner
    hotel = await db.hotels.find_one({"id": booking['hotel_id'], "owner_id": owner_id})
    if not hotel:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if booking['status'] == 'cancelled':
        raise HTTPException(status_code=400, detail="Booking already cancelled")
    
    await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": "cancelled"}}
    )
    return {"message": "Booking cancelled successfully"}

@api_router.get("/hotel-owner/stats")
async def get_owner_stats(owner_id: str = Depends(get_hotel_owner)):
    # Get all hotels owned by this owner
    hotels = await db.hotels.find({"owner_id": owner_id}, {"_id": 0, "id": 1}).to_list(100)
    hotel_ids = [h['id'] for h in hotels]
    
    total_hotels = len(hotels)
    total_bookings = await db.bookings.count_documents({"hotel_id": {"$in": hotel_ids}})
    confirmed_bookings = await db.bookings.count_documents({"hotel_id": {"$in": hotel_ids}, "status": "confirmed"})
    cancelled_bookings = await db.bookings.count_documents({"hotel_id": {"$in": hotel_ids}, "status": "cancelled"})
    
    return {
        "total_hotels": total_hotels,
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "cancelled_bookings": cancelled_bookings
    }

# ==================== BOOKING ROUTES (User) ====================
@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_input: BookingCreate, current_user: dict = Depends(get_current_user)):
    # Get hotel details
    hotel = await db.hotels.find_one({"id": booking_input.hotel_id}, {"_id": 0})
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    # Get user details
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    
    # Calculate total price
    from datetime import datetime as dt
    check_in_date = dt.fromisoformat(booking_input.check_in)
    check_out_date = dt.fromisoformat(booking_input.check_out)
    nights = (check_out_date - check_in_date).days
    total_price = nights * hotel['price_per_night']
    
    # Create booking
    booking = Booking(
        user_id=current_user["user_id"],
        user_name=user['name'],
        user_email=user['email'],
        hotel_id=booking_input.hotel_id,
        hotel_name=hotel['name'],
        check_in=booking_input.check_in,
        check_out=booking_input.check_out,
        guests=booking_input.guests,
        total_price=total_price,
        status="confirmed"
    )
    
    booking_dict = booking.model_dump()
    booking_dict['created_at'] = booking_dict['created_at'].isoformat()
    
    await db.bookings.insert_one(booking_dict)
    return booking

@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings(current_user: dict = Depends(get_current_user)):
    bookings = await db.bookings.find({"user_id": current_user["user_id"]}, {"_id": 0}).to_list(100)
    for booking in bookings:
        if isinstance(booking['created_at'], str):
            booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    return bookings

@api_router.patch("/bookings/{booking_id}/cancel")
async def cancel_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    booking = await db.bookings.find_one({"id": booking_id, "user_id": current_user["user_id"]})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking['status'] == 'cancelled':
        raise HTTPException(status_code=400, detail="Booking already cancelled")
    
    await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": "cancelled"}}
    )
    return {"message": "Booking cancelled successfully"}

# ==================== PERMIT ROUTES (User) ====================
@api_router.post("/permits")
async def create_permit(
    permit_type: str = Form(...),
    full_name: str = Form(...),
    passport_number: str = Form(...),
    nationality: str = Form(...),
    trek_area: str = Form(...),
    start_date: str = Form(...),
    end_date: str = Form(...),
    document: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    # Get user details
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    
    # Process document if uploaded
    document_data = None
    if document:
        contents = await document.read()
        document_data = base64.b64encode(contents).decode('utf-8')
    
    # Create permit
    permit = Permit(
        user_id=current_user["user_id"],
        user_name=user['name'],
        user_email=user['email'],
        permit_type=permit_type,
        full_name=full_name,
        passport_number=passport_number,
        nationality=nationality,
        trek_area=trek_area,
        start_date=start_date,
        end_date=end_date,
        status="pending",
        document_data=document_data
    )
    
    permit_dict = permit.model_dump()
    permit_dict['created_at'] = permit_dict['created_at'].isoformat()
    
    await db.permits.insert_one(permit_dict)
    return {"message": "Permit application submitted successfully", "permit_id": permit.id}

@api_router.get("/permits", response_model=List[Permit])
async def get_permits(current_user: dict = Depends(get_current_user)):
    permits = await db.permits.find({"user_id": current_user["user_id"]}, {"_id": 0}).to_list(100)
    for permit in permits:
        if isinstance(permit['created_at'], str):
            permit['created_at'] = datetime.fromisoformat(permit['created_at'])
    return permits

@api_router.patch("/permits/{permit_id}/cancel")
async def cancel_permit(permit_id: str, current_user: dict = Depends(get_current_user)):
    permit = await db.permits.find_one({"id": permit_id, "user_id": current_user["user_id"]})
    if not permit:
        raise HTTPException(status_code=404, detail="Permit not found")
    
    if permit['status'] != 'pending':
        raise HTTPException(status_code=400, detail="Can only cancel pending permits")
    
    await db.permits.update_one(
        {"id": permit_id},
        {"$set": {"status": "cancelled", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Permit application cancelled successfully"}

# ==================== ADMIN ROUTES ====================
@api_router.get("/admin/permits", response_model=List[Permit])
async def admin_get_permits(admin_id: str = Depends(get_admin_user)):
    permits = await db.permits.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for permit in permits:
        if isinstance(permit['created_at'], str):
            permit['created_at'] = datetime.fromisoformat(permit['created_at'])
    return permits

@api_router.get("/admin/permits/{permit_id}", response_model=Permit)
async def admin_get_permit_details(permit_id: str, admin_id: str = Depends(get_admin_user)):
    """Get full permit details including passport photo"""
    permit = await db.permits.find_one({"id": permit_id}, {"_id": 0})
    if not permit:
        raise HTTPException(status_code=404, detail="Permit not found")
    
    if isinstance(permit['created_at'], str):
        permit['created_at'] = datetime.fromisoformat(permit['created_at'])
    
    return Permit(**permit)

@api_router.patch("/admin/permits/{permit_id}")
async def admin_update_permit(permit_id: str, update: PermitUpdate, admin_id: str = Depends(get_admin_user)):
    permit = await db.permits.find_one({"id": permit_id})
    if not permit:
        raise HTTPException(status_code=404, detail="Permit not found")
    
    update_data = {"status": update.status, "updated_at": datetime.now(timezone.utc).isoformat()}
    if update.admin_note:
        update_data["admin_note"] = update.admin_note
    
    await db.permits.update_one({"id": permit_id}, {"$set": update_data})
    return {"message": "Permit updated successfully"}

@api_router.get("/admin/bookings", response_model=List[Booking])
async def admin_get_bookings(admin_id: str = Depends(get_admin_user)):
    bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for booking in bookings:
        if isinstance(booking['created_at'], str):
            booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    return bookings

@api_router.get("/admin/users")
async def admin_get_users(admin_id: str = Depends(get_admin_user)):
    """Get all users with their details"""
    users = await db.users.find({}, {"_id": 0, "password": 0, "verification_code": 0}).sort("created_at", -1).to_list(1000)
    return users

@api_router.get("/admin/stats")
async def admin_get_stats(admin_id: str = Depends(get_admin_user)):
    total_users = await db.users.count_documents({"role": "user"})
    total_hotel_owners = await db.users.count_documents({"role": "hotel_owner"})
    total_bookings = await db.bookings.count_documents({})
    total_permits = await db.permits.count_documents({})
    pending_permits = await db.permits.count_documents({"status": "pending"})
    approved_permits = await db.permits.count_documents({"status": "approved"})
    rejected_permits = await db.permits.count_documents({"status": "rejected"})
    cancelled_bookings = await db.bookings.count_documents({"status": "cancelled"})
    confirmed_bookings = await db.bookings.count_documents({"status": "confirmed"})
    total_hotels = await db.hotels.count_documents({})
    
    return {
        "total_users": total_users,
        "total_hotel_owners": total_hotel_owners,
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "total_permits": total_permits,
        "pending_permits": pending_permits,
        "approved_permits": approved_permits,
        "rejected_permits": rejected_permits,
        "cancelled_bookings": cancelled_bookings,
        "total_hotels": total_hotels
    }

@api_router.post("/admin/permit-types", response_model=PermitType)
async def create_permit_type(permit_type: PermitTypeCreate, admin_id: str = Depends(get_admin_user)):
    """Create new permit type"""
    new_permit_type = PermitType(**permit_type.model_dump())
    permit_type_dict = new_permit_type.model_dump()
    permit_type_dict['created_at'] = permit_type_dict['created_at'].isoformat()
    
    await db.permit_types.insert_one(permit_type_dict)
    return new_permit_type

@api_router.get("/permit-types", response_model=List[PermitType])
async def get_permit_types():
    """Get all permit types (public endpoint)"""
    permit_types = await db.permit_types.find({}, {"_id": 0}).to_list(100)
    for pt in permit_types:
        if isinstance(pt['created_at'], str):
            pt['created_at'] = datetime.fromisoformat(pt['created_at'])
    return permit_types

# ==================== EMERGENCY CONTACTS ====================
@api_router.get("/emergency-contacts", response_model=List[EmergencyContact])
async def get_emergency_contacts():
    contacts = await db.emergency_contacts.find({}, {"_id": 0}).to_list(100)
    return contacts

# ==================== SAFETY TIPS ====================
@api_router.get("/safety-tips", response_model=List[SafetyTip])
async def get_safety_tips():
    tips = await db.safety_tips.find({}, {"_id": 0}).to_list(100)
    return tips

# ==================== TOURIST SPOTS ====================
@api_router.get("/tourist-spots", response_model=List[TouristSpot])
async def get_tourist_spots():
    spots = await db.tourist_spots.find({}, {"_id": 0}).to_list(100)
    return spots


# ==================== POINTS OF INTEREST (POI) - Overpass (OSM) PROXY ====================
@api_router.get('/pois')
async def get_pois(lat: float, lon: float, radius: int = 1500, types: Optional[str] = 'restaurant|hotel|cafe|atm'):
    """Query Overpass API for nearby POIs (restaurants, hotels, ATMs, etc.) and return simplified list."""
    # Build Overpass QL
    if not lat or not lon:
        raise HTTPException(status_code=400, detail="lat and lon are required")

    # limit types to amenity and shop tags commonly used for POIs
    overpass_query = f"""[out:json][timeout:25];(node["amenity"~"{types}"](around:{radius},{lat},{lon});way["amenity"~"{types}"](around:{radius},{lat},{lon});relation["amenity"~"{types}"](around:{radius},{lat},{lon});node["shop"~"{types}"](around:{radius},{lat},{lon});way["shop"~"{types}"](around:{radius},{lat},{lon});relation["shop"~"{types}"](around:{radius},{lat},{lon}););out center;"""

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post('https://overpass-api.de/api/interpreter', data=overpass_query)
            resp.raise_for_status()
            data = resp.json()

        pois = []
        for el in data.get('elements', []):
            tags = el.get('tags', {}) or {}
            name = tags.get('name') or tags.get('operator') or tags.get('brand') or 'Unknown'
            # node has lat/lon, way/relation have center
            if el.get('type') == 'node':
                lat_e = el.get('lat')
                lon_e = el.get('lon')
            else:
                center = el.get('center') or {}
                lat_e = center.get('lat')
                lon_e = center.get('lon')

            if lat_e is None or lon_e is None:
                continue

            # Normalize type: prefer amenity, then shop or tourism
            poi_type = tags.get('amenity') or tags.get('shop') or tags.get('tourism') or 'unknown'

            # Clean up name (strip whitespace)
            name = str(name).strip()

            pois.append({
                'id': el.get('id'),
                'osm_type': el.get('type'),
                'name': name,
                'type': poi_type,
                'latitude': lat_e,
                'longitude': lon_e,
                'tags': tags
            })

        # De-duplicate by (osm_type,id)
        seen = set()
        unique_pois = []
        for p in pois:
            key = (p['osm_type'], p['id'])
            if key not in seen:
                seen.add(key)
                unique_pois.append(p)

        # Limit results to 2000 for safety
        return unique_pois[:2000]
    except httpx.HTTPError as e:
        logging.error(f"Overpass request failed: {str(e)}")
        raise HTTPException(status_code=502, detail="Failed to fetch POIs from Overpass")


# ==================== WEATHER PROXY (OpenWeatherMap) ====================
@api_router.get('/weather')
async def get_weather(lat: float, lon: float):
    """Return current weather and alerts for the given coordinates using OpenWeatherMap One Call API.
    Requires OPENWEATHER_API_KEY in environment.
    """
    api_key = os.environ.get('OPENWEATHER_API_KEY')
    if not api_key:
        return JSONResponse(status_code=400, content={"detail": "OPENWEATHER_API_KEY not configured"})

    # Use One Call API (v2.5/3.0 compatibility). Exclude minutely and hourly to keep response small
    url = f"https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude=minutely,hourly&units=metric&appid={api_key}"

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()

        # Only return useful fields to the frontend
        result = {
            'lat': lat,
            'lon': lon,
            'current': {
                'temp': data.get('current', {}).get('temp'),
                'weather': data.get('current', {}).get('weather', []),
                'humidity': data.get('current', {}).get('humidity'),
                'wind_speed': data.get('current', {}).get('wind_speed'),
            },
            'alerts': data.get('alerts', [])
        }
        return result
    except httpx.HTTPError as e:
        logging.error(f"OpenWeather request failed: {str(e)}")
        raise HTTPException(status_code=502, detail="Failed to fetch weather data")


@api_router.get('/weather/fallback')
async def get_weather_fallback(lat: float, lon: float):
    """Fallback weather using Open-Meteo (no API key required). Returns basic current weather only."""
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&timezone=UTC"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()

        cw = data.get('current_weather', {})
        result = {
            'lat': lat,
            'lon': lon,
            'current': {
                'temp': cw.get('temperature'),
                'weather': [{'description': 'Current weather from Open-Meteo'}],
                'humidity': None,
                'wind_speed': cw.get('windspeed')
            },
            'alerts': [],
            'source': 'open-meteo'
        }
        return result
    except httpx.HTTPError as e:
        logging.error(f"Open-Meteo request failed: {str(e)}")
        raise HTTPException(status_code=502, detail="Failed to fetch fallback weather data")


# ==================== TOURIST POIS (Overpass) ====================
@api_router.get('/tourist-pois')
async def get_tourist_pois(bbox: Optional[str] = None, country: Optional[str] = None, limit: int = 1000):
    """Query Overpass API for tourist-related POIs. Use bbox (minlat,minlon,maxlat,maxlon) or country name (e.g., 'Nepal')."""
    if not bbox and not country:
        raise HTTPException(status_code=400, detail="Provide bbox or country")

    if country:
        # Use area query for country
        overpass_query = f"[out:json][timeout:60];area[name=\"{country}\"][admin_level=2]->.searchArea;(node[\"tourism\"](area.searchArea);way[\"tourism\"](area.searchArea);relation[\"tourism\"](area.searchArea););out center {limit};"
    else:
        # bbox format: minlat,minlon,maxlat,maxlon
        try:
            minlat, minlon, maxlat, maxlon = map(float, bbox.split(','))
        except Exception:
            raise HTTPException(status_code=400, detail="bbox must be minlat,minlon,maxlat,maxlon")
        overpass_query = f"[out:json][timeout:60];(node[\"tourism\"]({minlat},{minlon},{maxlat},{maxlon});way[\"tourism\"]({minlat},{minlon},{maxlat},{maxlon});relation[\"tourism\"]({minlat},{minlon},{maxlat},{maxlon}););out center {limit};"

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post('https://overpass-api.de/api/interpreter', data=overpass_query)
            resp.raise_for_status()
            data = resp.json()

        pois = []
        for el in data.get('elements', []):
            tags = el.get('tags', {}) or {}
            name = tags.get('name') or tags.get('operator') or tags.get('brand') or 'Unknown'
            if el.get('type') == 'node':
                lat_e = el.get('lat')
                lon_e = el.get('lon')
            else:
                center = el.get('center') or {}
                lat_e = center.get('lat')
                lon_e = center.get('lon')

            if lat_e is None or lon_e is None:
                continue

            poi_type = tags.get('tourism') or tags.get('amenity') or 'tourist_spot'

            pois.append({
                'id': el.get('id'),
                'osm_type': el.get('type'),
                'name': str(name).strip(),
                'type': poi_type,
                'latitude': lat_e,
                'longitude': lon_e,
                'tags': tags
            })

        # Deduplicate and limit
        seen = set()
        unique = []
        for p in pois:
            key = (p['osm_type'], p['id'])
            if key not in seen:
                seen.add(key)
                unique.append(p)

        return unique[:min(limit, 5000)]
    except httpx.HTTPError as e:
        logging.error(f"Overpass tourist request failed: {str(e)}")
        raise HTTPException(status_code=502, detail="Failed to fetch tourist POIs from Overpass")

# ==================== SOS EMERGENCY ENDPOINT ====================
class SOSRequest(BaseModel):
    latitude: float
    longitude: float
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_phone: Optional[str] = None
    emergency_type: str = "general"  # general, medical, accident, lost
    message: Optional[str] = None

class SOSResponse(BaseModel):
    id: str
    status: str
    message: str
    nearest_contacts: List[dict]

@api_router.post("/sos", response_model=SOSResponse)
async def send_sos(sos_request: SOSRequest, background: BackgroundTasks):
    """Send emergency SOS alert with GPS location to rescue teams"""
    try:
        # Create SOS record
        sos_id = str(uuid.uuid4())
        sos_record = {
            "id": sos_id,
            "latitude": sos_request.latitude,
            "longitude": sos_request.longitude,
            "user_name": sos_request.user_name or "Anonymous",
            "user_email": sos_request.user_email,
            "user_phone": sos_request.user_phone,
            "emergency_type": sos_request.emergency_type,
            "message": sos_request.message,
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "google_maps_link": f"https://www.google.com/maps?q={sos_request.latitude},{sos_request.longitude}"
        }
        
        await db.sos_alerts.insert_one(sos_record)
        
        # Get nearest emergency contacts
        emergency_contacts = await db.emergency_contacts.find({}).to_list(10)
        nearest_contacts = []
        
        for contact in emergency_contacts:
            nearest_contacts.append({
                "name": contact.get("name"),
                "phone": contact.get("phone"),
                "category": contact.get("category")
            })
        
        # Send email notification to rescue team (background task)
        background.add_task(send_sos_notification, sos_record, nearest_contacts)
        
        logging.info(f"[SOS] Emergency alert created: {sos_id} at ({sos_request.latitude}, {sos_request.longitude})")
        
        return SOSResponse(
            id=sos_id,
            status="sent",
            message="Emergency alert sent! Help is on the way. Stay calm and stay where you are if safe.",
            nearest_contacts=nearest_contacts[:5]
        )
        
    except Exception as e:
        logging.error(f"[SOS] Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send SOS alert")

def send_sos_notification(sos_record: dict, contacts: list):
    """Send SOS email notification to rescue teams"""
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_user = os.environ.get('SMTP_USER')
    smtp_pass = os.environ.get('SMTP_PASS')
    
    if not smtp_host or not smtp_user or not smtp_pass:
        logging.info(f"[SOS EMAIL] Would send alert for: {sos_record['id']} - Location: {sos_record['google_maps_link']}")
        return
    
    try:
        subject = f"🚨 EMERGENCY SOS ALERT - {sos_record['emergency_type'].upper()}"
        html_body = f"""
        <html>
        <body style="font-family: Arial; padding: 20px;">
            <div style="background: #DC143C; color: white; padding: 20px; border-radius: 8px;">
                <h1>🚨 EMERGENCY SOS ALERT</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9; margin-top: 10px; border-radius: 8px;">
                <h2>Emergency Details</h2>
                <p><strong>Type:</strong> {sos_record['emergency_type']}</p>
                <p><strong>Name:</strong> {sos_record['user_name']}</p>
                <p><strong>Email:</strong> {sos_record.get('user_email', 'Not provided')}</p>
                <p><strong>Phone:</strong> {sos_record.get('user_phone', 'Not provided')}</p>
                <p><strong>Message:</strong> {sos_record.get('message', 'No message')}</p>
                <h2>📍 Location</h2>
                <p><strong>Coordinates:</strong> {sos_record['latitude']}, {sos_record['longitude']}</p>
                <p><a href="{sos_record['google_maps_link']}" style="background: #003893; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View on Google Maps</a></p>
                <p><strong>Time:</strong> {sos_record['created_at']}</p>
            </div>
        </body>
        </html>
        """
        
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = smtp_user
        msg['To'] = smtp_user  # Send to admin email
        msg.set_content(f"SOS Alert from {sos_record['user_name']} at {sos_record['google_maps_link']}")
        msg.add_alternative(html_body, subtype='html')
        
        with smtplib.SMTP(smtp_host, 587, timeout=10) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        
        logging.info(f"[SOS] Email notification sent for alert {sos_record['id']}")
    except Exception as e:
        logging.error(f"[SOS] Failed to send email: {str(e)}")

@api_router.get("/admin/sos-alerts")
async def get_sos_alerts(admin_id: str = Depends(get_admin_user)):
    """Get all SOS alerts (admin only)"""
    alerts = await db.sos_alerts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return alerts

@api_router.patch("/admin/sos-alerts/{alert_id}")
async def update_sos_alert(alert_id: str, status: dict, admin_id: str = Depends(get_admin_user)):
    """Update SOS alert status"""
    await db.sos_alerts.update_one(
        {"id": alert_id},
        {"$set": {"status": status.get("status", "resolved"), "resolved_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Alert updated"}

# ==================== CHATBOT ENDPOINT ====================
# Store conversation history in memory (for production, use a database)
conversation_history = {}

def _local_chatbot_reply(message: str) -> str:
    """Fallback response generator when external LLM is unavailable."""
    text = (message or "").lower()
    if any(k in text for k in ["permit", "tims", "annapurna", "everest", "langtang", "manaslu"]):
        return (
            "For trekking permits in Nepal, you typically need a TIMS card and a park or restricted area permit. "
            "Popular routes like Everest and Annapurna require national park or conservation entry permits. "
            "Tell me your route and dates, and I can suggest the exact permits."
        )
    if any(k in text for k in ["hotel", "stay", "accommodation", "book"]):
        return (
            "You can browse verified hotels by city in the Hotels page. "
            "Let me know your destination and budget, and I can suggest options."
        )
    if any(k in text for k in ["weather", "season", "best time", "visit"]):
        return (
            "Spring (Mar–May) and autumn (Sep–Nov) are the best seasons for most treks. "
            "Winter is colder but clear, and monsoon brings heavy rain."
        )
    if any(k in text for k in ["safety", "emergency", "altitude", "sos"]):
        return (
            "For safety: acclimatize gradually, stay hydrated, and monitor symptoms of altitude sickness. "
            "In emergencies, use the SOS button for immediate help."
        )
    if any(k in text for k in ["visa", "immigration", "entry"]):
        return (
            "Most travelers can get a visa on arrival at Tribhuvan International Airport. "
            "Ensure your passport is valid for at least 6 months and carry a passport photo."
        )
    return (
        "Namaste! I can help with permits, hotels, safety, weather, and travel tips in Nepal. "
        "What would you like to know?"
    )

@api_router.post("/chatbot", response_model=ChatResponse)
async def chat_with_bot(chat_input: ChatMessage):
    """AI-powered travel assistant using OpenAI ChatGPT"""
    try:
        from openai import OpenAI
        
        session_id = chat_input.session_id or str(uuid.uuid4())
        api_key = os.environ.get('OPENAI_API_KEY')
        
        if not api_key:
            logging.warning("OPENAI_API_KEY not configured, using fallback")
            return ChatResponse(
                response=_local_chatbot_reply(chat_input.message),
                session_id=session_id
            )
        
        # Initialize OpenAI client with new API
        client = OpenAI(api_key=api_key)

        system_message = """You are NepSafe AI Assistant, an expert travel guide for Nepal tourism.

Your expertise includes:
- Trekking permits (TIMS, Annapurna, Everest, Langtang, Manaslu)
- Visa requirements and immigration
- Hotels and accommodation across Nepal
- Best times to visit different regions
- Weather conditions and seasonal advice
- Safety tips and emergency procedures  
- Local culture, festivals, and traditions
- Food recommendations and dietary tips
- Transportation and logistics
- Altitude sickness prevention

Guidelines:
- Be friendly, helpful, and concise
- Provide practical, actionable advice
- Include safety warnings when relevant
- Suggest alternatives when appropriate
- You can respond in English or Nepali based on the user's language
- For emergencies, always recommend using the SOS button"""
        
        # Call OpenAI API with new client
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": chat_input.message}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        bot_response = response.choices[0].message.content
        
        logging.info(f"[CHATBOT] Response generated for session {session_id}")
        return ChatResponse(response=bot_response, session_id=session_id)
        
    except Exception as e:
        logging.error(f"Chatbot error: {str(e)}")
        return ChatResponse(
            response="I apologize, but I'm having trouble right now. Please try again later or use the SOS button for emergencies.",
            session_id=chat_input.session_id or str(uuid.uuid4())
        )

# ==================== SEED DATA ====================
@api_router.post("/seed-data")
async def seed_data():
    # Always create admin user if not exists
    admin_exists = await db.users.find_one({"email": "admin@nepsafe.com"})
    if not admin_exists:
        hashed_password = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt())
        admin_user = {
            "id": str(uuid.uuid4()),
            "email": "admin@nepsafe.com",
            "name": "Government Admin",
            "role": "admin",
            "email_verified": True,
            "password": hashed_password.decode('utf-8'),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_user)
    
    # Check if data already exists
    existing_hotels = await db.hotels.count_documents({})
    if existing_hotels > 0:
        return {"message": "Data seeded. Admin: admin@nepsafe.com / admin123"}
    
    # Seed Hotels with images
    hotels = [
        {
            "id": str(uuid.uuid4()),
            "name": "Himalayan Paradise Hotel",
            "location": "Thamel, Kathmandu",
            "city": "Kathmandu",
            "latitude": 27.7156,
            "longitude": 85.3131,
            "price_per_night": 80.0,
            "rating": 4.5,
            "description": "Comfortable hotel in the heart of Thamel with modern amenities",
            "amenities": ["WiFi", "Restaurant", "24/7 Reception", "Tour Desk"],
            "contact": "+977-1-4123456",
            "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
            "available_rooms": 25,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Lakeside Retreat",
            "location": "Lakeside, Pokhara",
            "city": "Pokhara",
            "latitude": 28.2096,
            "longitude": 83.9555,
            "price_per_night": 60.0,
            "rating": 4.3,
            "description": "Beautiful lakeside hotel with mountain views",
            "amenities": ["WiFi", "Lake View", "Restaurant", "Parking"],
            "contact": "+977-61-234567",
            "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
            "available_rooms": 30,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mountain View Lodge",
            "location": "Nagarkot",
            "city": "Nagarkot",
            "latitude": 27.7172,
            "longitude": 85.5206,
            "price_per_night": 100.0,
            "rating": 4.7,
            "description": "Stunning Himalayan views from every room",
            "amenities": ["WiFi", "Mountain View", "Restaurant", "Trekking Guide"],
            "contact": "+977-1-6680034",
            "image_url": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
            "available_rooms": 15,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.hotels.insert_many(hotels)
    
    # Seed Emergency Contacts with coordinates
    emergency_contacts = [
        {
            "id": str(uuid.uuid4()),
            "name": "Nepal Police",
            "phone": "100",
            "category": "police",
            "location": "Nationwide",
            "latitude": 27.7172,
            "longitude": 85.3240,
            "available_24_7": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Ambulance Service",
            "phone": "102",
            "category": "ambulance",
            "location": "Nationwide",
            "latitude": 27.7172,
            "longitude": 85.3340,
            "available_24_7": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Tourist Police",
            "phone": "+977-1-4247041",
            "category": "police",
            "location": "Kathmandu",
            "latitude": 27.7172,
            "longitude": 85.3140,
            "available_24_7": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Helicopter Rescue",
            "phone": "+977-1-4442920",
            "category": "rescue",
            "location": "Kathmandu",
            "latitude": 27.7172,
            "longitude": 85.3440,
            "available_24_7": True
        }
    ]
    await db.emergency_contacts.insert_many(emergency_contacts)
    
    # Seed Safety Tips
    safety_tips = [
        {
            "id": str(uuid.uuid4()),
            "title": "Altitude Sickness Prevention",
            "description": "Ascend gradually, stay hydrated, and listen to your body. If symptoms worsen, descend immediately.",
            "category": "health",
            "importance": "high"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Weather Awareness",
            "description": "Check weather forecasts daily. Monsoon season (June-August) brings heavy rain and landslides.",
            "category": "weather",
            "importance": "high"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Trekking Insurance",
            "description": "Always have travel insurance that covers trekking and helicopter rescue.",
            "category": "trekking",
            "importance": "high"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Respect Local Culture",
            "description": "Dress modestly, ask permission before taking photos, and remove shoes before entering temples.",
            "category": "general",
            "importance": "medium"
        }
    ]
    await db.safety_tips.insert_many(safety_tips)
    
    # Seed Tourist Spots
    tourist_spots = [
        {
            "id": str(uuid.uuid4()),
            "name": "Pashupatinath Temple",
            "category": "temple",
            "description": "Sacred Hindu temple complex on the banks of Bagmati River",
            "latitude": 27.7104,
            "longitude": 85.3489,
            "location": "Kathmandu",
            "rating": 4.8,
            "best_time_to_visit": "October to November"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Phewa Lake",
            "category": "lake",
            "description": "Beautiful freshwater lake with stunning mountain reflections",
            "latitude": 28.2090,
            "longitude": 83.9592,
            "location": "Pokhara",
            "rating": 4.7,
            "best_time_to_visit": "October to April"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Everest Base Camp",
            "category": "mountain",
            "description": "Iconic trekking destination at the base of Mount Everest",
            "latitude": 28.0026,
            "longitude": 86.8528,
            "location": "Solukhumbu",
            "rating": 5.0,
            "best_time_to_visit": "March to May, September to November"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Chitwan National Park",
            "category": "park",
            "description": "UNESCO World Heritage Site known for wildlife and jungle safaris",
            "latitude": 27.5291,
            "longitude": 84.3542,
            "location": "Chitwan",
            "rating": 4.6,
            "best_time_to_visit": "October to March"
        }
    ]
    await db.tourist_spots.insert_many(tourist_spots)
    
    # Seed default permit types
    permit_types = [
        {
            "id": str(uuid.uuid4()),
            "name": "TIMS Card",
            "description": "Trekkers' Information Management System card for general trekking",
            "price": 20.0,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Annapurna Conservation Area Permit",
            "description": "Required for trekking in Annapurna region",
            "price": 30.0,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Sagarmatha National Park Permit",
            "description": "Required for Everest region trekking",
            "price": 50.0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.permit_types.insert_many(permit_types)
    
    return {"message": "Data seeded successfully. Admin credentials: admin@nepsafe.com / admin123"}

# Include the router in the main app
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
