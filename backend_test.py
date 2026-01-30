#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import uuid

class NepSafeAPITester:
    def __init__(self, base_url="https://git-repo-support.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        print(f"   Expected Status: {expected_status}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=30)

            print(f"   Actual Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    self.log_test(name, True, f"Status: {response.status_code}")
                    return True, response_data
                except:
                    self.log_test(name, True, f"Status: {response.status_code} (No JSON response)")
                    return True, {}
            else:
                try:
                    error_data = response.json()
                    self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}. Error: {error_data}")
                except:
                    self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:200]}")
                return False, {}

        except requests.exceptions.Timeout:
            self.log_test(name, False, "Request timeout (30s)")
            return False, {}
        except requests.exceptions.ConnectionError:
            self.log_test(name, False, "Connection error - server may be down")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration endpoint"""
        test_email = f"test_user_{datetime.now().strftime('%H%M%S')}@example.com"
        registration_data = {
            "name": "Test User",
            "email": test_email,
            "password": "TestPass123!",
            "role": "user"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "api/auth/register",
            200,
            data=registration_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print(f"   ✓ Token received: {self.token[:20]}...")
            return test_email
        return None

    def test_user_login(self, email=None):
        """Test user login endpoint"""
        if not email:
            # Create a test user first
            email = self.test_user_registration()
            if not email:
                self.log_test("User Login (Setup Failed)", False, "Could not create test user")
                return False
        
        login_data = {
            "email": email,
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "api/auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print(f"   ✓ Login successful, token: {self.token[:20]}...")
            return True
        return False

    def test_hotel_owner_registration(self):
        """Test hotel owner registration"""
        test_email = f"hotel_owner_{datetime.now().strftime('%H%M%S')}@example.com"
        registration_data = {
            "name": "Hotel Owner Test",
            "email": test_email,
            "password": "TestPass123!",
            "role": "hotel_owner"
        }
        
        success, response = self.run_test(
            "Hotel Owner Registration",
            "POST",
            "api/auth/register",
            200,
            data=registration_data
        )
        
        return success and 'token' in response

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        invalid_data = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        success, response = self.run_test(
            "Invalid Login (Should Fail)",
            "POST",
            "api/auth/login",
            401,
            data=invalid_data
        )
        
        return success  # Success means we got the expected 401

    def test_get_current_user(self):
        """Test getting current user info"""
        if not self.token:
            self.log_test("Get Current User (No Token)", False, "No authentication token available")
            return False
            
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "api/auth/me",
            200
        )
        
        return success and 'email' in response

    def test_duplicate_registration(self):
        """Test registering with existing email"""
        # First register a user
        test_email = f"duplicate_test_{datetime.now().strftime('%H%M%S')}@example.com"
        registration_data = {
            "name": "First User",
            "email": test_email,
            "password": "TestPass123!",
            "role": "user"
        }
        
        # First registration should succeed
        success1, _ = self.run_test(
            "First Registration",
            "POST",
            "api/auth/register",
            200,
            data=registration_data
        )
        
        if not success1:
            self.log_test("Duplicate Registration Test (Setup Failed)", False, "First registration failed")
            return False
        
        # Second registration with same email should fail
        registration_data["name"] = "Second User"
        success2, _ = self.run_test(
            "Duplicate Registration (Should Fail)",
            "POST",
            "api/auth/register",
            400,
            data=registration_data
        )
        
        return success2  # Success means we got the expected 400

    def test_email_verification(self):
        """Test email verification flow"""
        # Register a new user
        test_email = f"verify_test_{datetime.now().strftime('%H%M%S')}@example.com"
        registration_data = {
            "name": "Verify Test User",
            "email": test_email,
            "password": "TestPass123!",
            "role": "user"
        }
        
        success, response = self.run_test(
            "Registration for Verification Test",
            "POST",
            "api/auth/register",
            200,
            data=registration_data
        )
        
        if not success:
            return False
        
        # Test verification with invalid code (should fail)
        verify_data = {
            "email": test_email,
            "code": "123456"  # Invalid code
        }
        
        success, _ = self.run_test(
            "Email Verification with Invalid Code (Should Fail)",
            "POST",
            "api/auth/verify-email",
            400,
            data=verify_data
        )
        
        return success

    def test_forgot_password_flow(self):
        """Test forgot password flow"""
        # First register a user
        test_email = f"forgot_test_{datetime.now().strftime('%H%M%S')}@example.com"
        registration_data = {
            "name": "Forgot Password Test",
            "email": test_email,
            "password": "TestPass123!",
            "role": "user"
        }
        
        success, _ = self.run_test(
            "Registration for Forgot Password Test",
            "POST",
            "api/auth/register",
            200,
            data=registration_data
        )
        
        if not success:
            return False
        
        # Test forgot password request
        success, _ = self.run_test(
            "Forgot Password Request",
            "POST",
            "api/auth/forgot-password",
            200,
            data={"email": test_email}
        )
        
        if not success:
            return False
        
        # Test reset password with invalid code (should fail)
        reset_data = {
            "email": test_email,
            "code": "123456",  # Invalid code
            "new_password": "NewPassword123!"
        }
        
        success, _ = self.run_test(
            "Reset Password with Invalid Code (Should Fail)",
            "POST",
            "api/auth/reset-password",
            400,
            data=reset_data
        )
        
        return success

    def test_sos_endpoint(self):
        """Test SOS emergency endpoint"""
        sos_data = {
            "latitude": 27.7172,
            "longitude": 85.3240,
            "user_name": "Test User",
            "user_email": "test@example.com",
            "user_phone": "+977-1234567890",
            "emergency_type": "medical",
            "message": "Test emergency alert"
        }
        
        success, response = self.run_test(
            "SOS Emergency Alert",
            "POST",
            "api/sos",
            200,
            data=sos_data
        )
        
        return success and 'id' in response and 'status' in response

    def test_chatbot_endpoint(self):
        """Test chatbot endpoint"""
        chat_data = {
            "message": "What permits do I need for Everest Base Camp?",
            "session_id": None
        }
        
        success, response = self.run_test(
            "Chatbot Query",
            "POST",
            "api/chatbot",
            200,
            data=chat_data
        )
        
        return success and 'response' in response and 'session_id' in response

    def test_admin_login(self):
        """Test admin login"""
        admin_data = {
            "email": "admin@nepsafe.com",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/auth/login",
            200,
            data=admin_data
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   ✓ Admin token received: {self.admin_token[:20]}...")
            return True
        return False

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        if not hasattr(self, 'admin_token') or not self.admin_token:
            self.log_test("Admin Stats (No Admin Token)", False, "Admin login required first")
            return False
        
        # Temporarily store user token and use admin token
        user_token = self.token
        self.token = self.admin_token
        
        success, response = self.run_test(
            "Admin Dashboard Stats",
            "GET",
            "api/admin/stats",
            200
        )
        
        # Restore user token
        self.token = user_token
        
        return success and 'total_users' in response

    def run_all_tests(self):
        """Run comprehensive API tests"""
        print("=" * 60)
        print("🚀 Starting NepSafe Comprehensive API Tests")
        print("=" * 60)
        
        # Authentication Tests
        print("\n📋 AUTHENTICATION TESTS")
        print("-" * 30)
        test_email = self.test_user_registration()
        
        if test_email:
            self.test_user_login(test_email)
        
        self.test_hotel_owner_registration()
        self.test_invalid_login()
        self.test_get_current_user()
        self.test_duplicate_registration()
        
        # Email Verification Tests
        print("\n📧 EMAIL VERIFICATION TESTS")
        print("-" * 30)
        self.test_email_verification()
        
        # Password Reset Tests
        print("\n🔐 PASSWORD RESET TESTS")
        print("-" * 30)
        self.test_forgot_password_flow()
        
        # Emergency & Chatbot Tests
        print("\n🚨 EMERGENCY & AI TESTS")
        print("-" * 30)
        self.test_sos_endpoint()
        self.test_chatbot_endpoint()
        
        # Admin Tests
        print("\n👑 ADMIN TESTS")
        print("-" * 30)
        self.test_admin_login()
        self.test_admin_stats()
        
        # Print Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed. Check details above.")
            return 1

def main():
    tester = NepSafeAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())