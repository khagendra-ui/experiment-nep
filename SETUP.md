# Setup Guide - MongoDB with Docker Desktop

This guide will help you run the application using MongoDB in Docker Desktop.

## Prerequisites

1. **Docker Desktop** - Download and install from https://www.docker.com/products/docker-desktop
2. **Node.js** - Download and install from https://nodejs.org/ (LTS version recommended)
3. **Python 3.8+** - Download from https://www.python.org/downloads/

## Step-by-Step Setup

### 1. Start MongoDB with Docker

Open a terminal in the project root folder and run:

```powershell
docker-compose up -d
```

This will:
- Start MongoDB on port 27017
- Start Mongo Express (web UI) on port 8081
- Create persistent data volumes

To verify MongoDB is running:
```powershell
docker ps
```

You should see two containers running: `experiment-nep-mongodb` and `experiment-nep-mongo-express`

**Access Mongo Express Web UI:** Open http://localhost:8081 in your browser to view your database.

### 2. Setup Backend (Python/FastAPI)

Navigate to the backend folder:
```powershell
cd backend
```

Create a `.env` file (copy from `.env.example`):
```powershell
copy .env.example .env
```

Install Python dependencies:
```powershell
pip install -r requirements.txt
```

Start the backend server:
```powershell
python server.py
```

The backend will run on http://localhost:8000

### 3. Setup Frontend (React)

Open a **new terminal** and navigate to the frontend folder:
```powershell
cd frontend
```

Install Node.js dependencies:
```powershell
npm install
```

Start the frontend development server:
```powershell
npm start
```

The frontend will open automatically at http://localhost:3000

## Running Everything

### Quick Start Commands

**Terminal 1 - Docker:**
```powershell
docker-compose up -d
```

**Terminal 2 - Backend:**
```powershell
cd backend
python server.py
```

**Terminal 3 - Frontend:**
```powershell
cd frontend
npm start
```

## Stopping Services

### Stop the application servers:
- Press `Ctrl+C` in the backend and frontend terminals

### Stop MongoDB Docker containers:
```powershell
docker-compose down
```

### Stop and remove data (clean reset):
```powershell
docker-compose down -v
```

## Database Connection Details

- **MongoDB URL:** `mongodb://admin:admin123@localhost:27017/experiment_nep_db?authSource=admin`
- **Database Name:** `experiment_nep_db`
- **Username:** `admin`
- **Password:** `admin123`
- **Mongo Express UI:** http://localhost:8081

## Ports Used

- **3000** - Frontend (React)
- **8000** - Backend (FastAPI)
- **8081** - Mongo Express (Database UI)
- **27017** - MongoDB

## Troubleshooting

### MongoDB won't start
- Ensure Docker Desktop is running
- Check if port 27017 is already in use: `netstat -ano | findstr :27017`
- Try: `docker-compose down` then `docker-compose up -d`

### Backend connection errors
- Verify MongoDB is running: `docker ps`
- Check `.env` file exists in backend folder with correct MONGO_URL
- Ensure no firewall is blocking port 27017

### Frontend won't start
- Delete `node_modules` and reinstall: `rm -r node_modules; npm install`
- Clear npm cache: `npm cache clean --force`
- Check if port 3000 is available

### Python package errors
- Create a virtual environment:
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate
  pip install -r requirements.txt
  ```

## Notes

- All website functionality and design remain **exactly the same**
- MongoDB data persists between restarts (stored in Docker volumes)
- You can view/edit database content via Mongo Express at http://localhost:8081
- The backend automatically creates collections and indexes as needed
