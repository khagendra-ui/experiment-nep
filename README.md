# Nepal Tourist Destination & Hotel Management Platform

A full-stack web application for exploring tourist destinations in Nepal and managing hotel bookings, permits, and administrative functions. Built with React, FastAPI, and MongoDB.

## 🌟 Features

### Tourist Exploration
- **Destination Discovery**: Browse and explore 29+ popular tourist destinations in Nepal
- **Destination Details**: View comprehensive information about each location with bilingual support
- **Interactive Mapping**: Map integration for location visualization
- **Bilingual Interface**: Full support for English and Nepali languages

### Booking & Reservations
- **Hotel Listings**: Explore available hotels across different destinations
- **Booking Management**: Create, view, and manage hotel reservations
- **Hotel Owner Dashboard**: Manage your hotel properties and bookings
- **Admin Dashboard**: Oversee all bookings and user activities

### Permits & Safety
- **Permit Management**: Apply for and track travel permits
- **Permit Types**: Different permit categories for various activities
- **Safety Information**: Emergency SOS button and safety guidelines

### Authentication & Authorization
- **User Authentication**: Secure login and registration
- **Role-Based Access**: Different dashboards for users, hotel owners, and admins
- **Profile Management**: User profile management and preferences

## 🏗️ Architecture

### Frontend
- **Framework**: React with React Router
- **Styling**: Tailwind CSS with responsive design
- **State Management**: React Context API for language switching
- **UI Components**: Custom reusable components (buttons, modals, cards, etc.)
- **HTTP Client**: Axios for API communication

**Key Pages:**
- `HomePage` - Main landing page with featured destinations
- `TouristDestinationsPage` - Browse all destinations
- `DestinationDetailPage` - Detailed destination information
- `HotelsPage` - Hotel listings and search
- `AddHotelPage` - Add new hotel (hotel owners)
- `HotelOwnerDashboard` - Manage hotel properties
- `AdminDashboard` - System administration
- `PermitsPage` - Permit management
- `MapPage` - Interactive destination map
- `SafetyPage` - Safety information and guidelines

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB with Motor (async driver)
- **Authentication**: JWT-based authentication
- **Server**: Uvicorn with async support
- **Features**: RESTful API with comprehensive endpoints

**API Endpoints:**
- `/api/destinations` - Destination management
- `/api/hotels` - Hotel operations
- `/api/bookings` - Booking management
- `/api/permits` - Permit handling
- `/api/auth` - User authentication
- `/api/admin` - Administrative functions
- `/api/seed-data` - Database seeding

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ and npm
- Python 3.8+
- MongoDB (via Docker Compose)
- Docker and Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/khagendra-ui/experiment-nep.git
   cd experiment-nep
   ```

2. **Set up Backend**
   ```bash
   cd backend
   cp .env.example .env
   pip install -r requirements.txt
   ```

3. **Set up Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start Services**
   ```bash
   # Start MongoDB (from root directory)
   docker-compose up -d
   
   # Start Backend (from backend directory)
   python server.py
   
   # Start Frontend (from frontend directory, in new terminal)
   npm start
   ```

### Running Locally
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Swagger UI)

## 📁 Project Structure

```
experiment-nep/
├── backend/
│   ├── server.py              # FastAPI application entry point
│   ├── requirements.txt        # Python dependencies
│   └── .env.example           # Environment variables template
├── frontend/
│   ├── public/
│   │   └── index.html         # HTML entry point
│   ├── src/
│   │   ├── App.js             # Main React component with routing
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React Context (language switching)
│   │   ├── hooks/             # Custom React hooks
│   │   └── lib/               # Utility functions
│   ├── package.json           # NPM dependencies
│   └── tailwind.config.js     # Tailwind CSS configuration
├── docker-compose.yml         # Docker Compose for MongoDB
└── README.md                  # This file
```

## 🔐 Environment Variables

Create `.env` file in the backend directory with:
```
DATABASE_URL=mongodb://localhost:27017
JWT_SECRET=your_secret_key
API_HOST=0.0.0.0
API_PORT=8000
```

## 🛠️ Technology Stack

**Frontend:**
- React 18
- React Router for navigation
- Tailwind CSS for styling
- Axios for HTTP requests
- JavaScript (ES6+)

**Backend:**
- FastAPI for REST API
- MongoDB for data storage
- Motor for async MongoDB driver
- Uvicorn for ASGI server
- Python 3.8+

**DevOps:**
- Docker & Docker Compose
- Git version control

## 📝 Code Quality

All files have been updated with medium-level comments for better code readability and maintainability.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 📞 Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

---

**Last Updated**: January 30, 2026
