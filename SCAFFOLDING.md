# Project Scaffolding & Structure

Complete guide to the project structure, conventions, and how to extend the application.

## 📁 Directory Structure

```
experiment-nep/
│
├── backend/                          # FastAPI Backend Application
│   ├── server.py                     # Main FastAPI application entry point
│   ├── requirements.txt              # Python dependencies
│   ├── .env.example                  # Environment variables template
│   └── .env                          # Environment variables (local use)
│
├── frontend/                         # React Frontend Application
│   ├── public/
│   │   └── index.html                # HTML entry point
│   │
│   ├── src/
│   │   ├── index.js                  # React entry point
│   │   ├── index.css                 # Global styles
│   │   ├── App.js                    # Main app component with routing
│   │   ├── App.css                   # App styles
│   │
│   ├── components/                   # Reusable React components
│   │   ├── AuthModal.jsx             # Authentication modal
│   │   ├── Chatbot.jsx               # AI chatbot interface
│   │   ├── Navbar.jsx                # Navigation bar component
│   │   ├── SOSButton.jsx             # Emergency SOS button
│   │   ├── LanguageSwitcher.jsx      # Language toggle
│   │   ├── CookieConsent.jsx         # Cookie consent banner
│   │   └── ui/                       # Shadcn UI components
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── input.jsx
│   │       ├── dialog.jsx
│   │       └── ... (35+ UI components)
│   │
│   ├── pages/                        # Page components
│   │   ├── HomePage.jsx              # Landing page
│   │   ├── TouristDestinationsPage.jsx  # Browse destinations
│   │   ├── DestinationDetailPage.jsx    # Destination details
│   │   ├── HotelsPage.jsx            # Hotel listings
│   │   ├── AddHotelPage.jsx          # Add hotel form
│   │   ├── HotelOwnerDashboard.jsx   # Hotel owner panel
│   │   ├── HotelOwnerBookingsPage.jsx # Hotel bookings
│   │   ├── AdminDashboard.jsx        # Admin panel
│   │   ├── AdminBookings.jsx         # All bookings admin view
│   │   ├── AdminPermits.jsx          # Permit management
│   │   ├── AdminPermitTypes.jsx      # Permit types management
│   │   ├── PermitsPage.jsx           # User permits page
│   │   ├── ManageHotelsPage.jsx      # Manage hotels
│   │   ├── ProfilePage.jsx           # User profile
│   │   ├── MapPage.jsx               # Interactive map
│   │   └── SafetyPage.jsx            # Safety guidelines
│   │
│   ├── context/                      # React Context
│   │   └── LanguageContext.jsx       # Global language state
│   │
│   ├── hooks/                        # Custom React hooks
│   │   └── use-toast.js              # Toast notification hook
│   │
│   ├── lib/                          # Utility functions
│   │   └── utils.js                  # Helper functions
│   │
│   ├── package.json                  # NPM dependencies & scripts
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── postcss.config.js             # PostCSS configuration
│   ├── craco.config.js               # Create React App config override
│   ├── jsconfig.json                 # JavaScript configuration
│   └── plugins/                      # Custom plugins
│       ├── health-check/             # Health check plugin
│       └── visual-edits/             # Visual editing plugin
│
├── memory/                           # Application memory/cache
├── temp_repo/                        # Temporary files
├── test_reports/                     # Test results
│   ├── iteration_1.json
│   ├── iteration_2.json
│   ├── iteration_3.json
│   └── pytest/
│
├── tests/                            # Test files
│   └── __init__.py
│
├── docker-compose.yml                # Docker Compose (MongoDB setup)
├── .gitignore                        # Git ignore rules
├── README.md                         # Project documentation
├── SCAFFOLDING.md                    # This file
├── design_guidelines.json            # Design system guidelines
└── backend_test.py                   # Backend testing script
```

## 🏗️ Adding New Features

### Adding a New React Page

1. Create file: `frontend/src/pages/YourNewPage.jsx`

```jsx
import React from 'react';

# Your new page component description
function YourNewPage() {
  return (
    <div className="container">
      <h1>Your Page Title</h1>
      {/* Page content */}
    </div>
  );
}

export default YourNewPage;
```

2. Add route in `frontend/src/App.js`:

```jsx
import YourNewPage from './pages/YourNewPage';

// Inside routes array:
{ path: '/your-route', element: <YourNewPage /> }
```

### Adding a New React Component

1. Create file: `frontend/src/components/YourComponent.jsx`

```jsx
import React from 'react';

# Your component description
function YourComponent({ prop1, prop2 }) {
  return (
    <div className="component">
      {/* Component content */}
    </div>
  );
}

export default YourComponent;
```

2. Import and use in other components:

```jsx
import YourComponent from './YourComponent';

<YourComponent prop1="value" prop2="value" />
```

### Adding a New FastAPI Endpoint

1. Add to `backend/server.py`:

```python
# Endpoint description
@app.get("/api/your-endpoint")
async def your_endpoint_name(param1: str):
    # Your endpoint logic here
    return {"data": result}
```

### Adding a New UI Component

1. Create file: `frontend/src/components/ui/your-component.jsx`

2. Follow the pattern from existing Shadcn components:

```jsx
import React from 'react';

# Your UI component description
const YourComponent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={className} {...props} />
));

YourComponent.displayName = "YourComponent";

export default YourComponent;
```

## 🎨 Styling Conventions

- **Framework**: Tailwind CSS
- **Global Styles**: `frontend/src/index.css`
- **Component Styles**: Inline Tailwind classes in JSX
- **UI Components**: Use Shadcn UI components from `frontend/src/components/ui/`

Example:
```jsx
<div className="flex items-center justify-between px-4 py-2 bg-blue-500 rounded-lg">
  <span className="text-white font-semibold">Title</span>
</div>
```

## 🌐 Language Support

- **English & Nepali** bilingual support
- Use `LanguageContext` for global language state
- Language switching via `LanguageSwitcher` component

Example:
```jsx
import { LanguageContext } from '../context/LanguageContext';

function MyComponent() {
  const { language } = useContext(LanguageContext);
  
  const text = language === 'en' ? 'Hello' : 'नमस्ते';
  return <p>{text}</p>;
}
```

## 📡 API Communication

- Use **Axios** client configured in `App.js`
- Base URL: `http://localhost:8000` (development)
- All requests go through centralized axios instance

Example:
```jsx
import axios from 'axios';

// In component
const response = await axios.get('/api/destinations');
```

## 🔐 Authentication

- JWT-based authentication
- Login via `AuthModal` component
- Protected routes check authentication in `App.js`

## 📝 Naming Conventions

### Files & Folders
- React components: `PascalCase.jsx` (e.g., `UserProfile.jsx`)
- Pages: `PascalCase.jsx` (e.g., `HomePage.jsx`)
- Utilities: `camelCase.js` (e.g., `utils.js`)
- Folders: `kebab-case` (e.g., `ui-components/`)

### Variables & Functions
- Variables: `camelCase` (e.g., `userName`, `isActive`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_URL`, `MAX_RETRIES`)
- Functions: `camelCase` (e.g., `fetchData()`, `handleClick()`)

### React
- Props: `camelCase`
- State: `camelCase` with descriptive names
- Event handlers: `handle{Action}` (e.g., `handleSubmit`, `handleClick`)

## 🧪 Testing

- Test files in `tests/` directory
- Backend tests: `backend_test.py`
- Test reports: `test_reports/` directory

## 📦 Dependencies

### Frontend (Key packages)
- `react` - UI library
- `react-router-dom` - Routing
- `axios` - HTTP client
- `tailwindcss` - Styling
- `shadcn/ui` - UI components

### Backend (Key packages)
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `motor` - Async MongoDB driver
- `pydantic` - Data validation

## 🚀 Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes** following conventions above

3. **Add comments** (medium-level, descriptive)

4. **Test locally**
   ```bash
   # Backend: cd backend && python server.py
   # Frontend: cd frontend && npm start
   ```

5. **Commit with clear message**
   ```bash
   git add .
   git commit -m "Add: description of feature"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature
   ```

## 📋 Code Quality Standards

- **Comments**: Medium-level, humanized (not imperative)
- **Syntax**: Python (`#`), JavaScript (`//` or `/* */`)
- **Formatting**: Consistent indentation (2 spaces JS, 4 spaces Python)
- **Naming**: Clear, descriptive variable/function names
- **Error Handling**: Proper try-catch and error responses

## 🔄 Version Control

- Main branch: `main` (production-ready)
- Feature branches: `feature/{name}`
- Bug fixes: `bugfix/{name}`
- Hotfixes: `hotfix/{name}`

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Shadcn UI Components](https://ui.shadcn.com/)

---

**Last Updated**: January 30, 2026
**Maintained by**: Development Team
