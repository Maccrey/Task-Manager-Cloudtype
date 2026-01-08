# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Korean braille book production management dashboard that tracks and manages the progress of braille book creation. The application allows users to search for books via the National Library of Korea API, register new book projects, and manage multi-stage production workflows including proofreading and transcription.

## Development Commands

### Backend Server
- **Start backend server**: `cd backend && node server.js` or `npm run backend` from root
- **Backend runs on**: http://localhost:3005 (listens on 0.0.0.0)
- **Backend start command (from backend dir)**: `npm start`

### Frontend
- **Open frontend**: Open `frontend/index.html` in a web browser
- **Frontend connects to**: Firebase Realtime Database (direct connection)

### Dependencies
- **Install all dependencies**: `npm install` (from root directory)
- **Install backend dependencies**: `cd backend && npm install`
- **Root package.json**: Minimal dependencies (Express, CORS, WebSocket)
- **Backend dependencies**: Express.js 4.18.2, CORS 2.8.5, Firebase Admin SDK, WebSocket

## Architecture

### Backend (`backend/`)
- **Framework**: Express.js with CORS
- **Data Storage**: Firebase Realtime Database with local caching
- **Key Files**:
  - `server.js` - Express server with Firebase integration and WebSocket support
  - `firebase.js` - Firebase initialization and helper functions
  - `firebase-service-account.json` - Firebase service account credentials (not in git)
- **Port**: 3005, accessible from all interfaces (0.0.0.0)

### Frontend (`frontend/`)
- **Technology**: Vanilla HTML/CSS/JavaScript (no frameworks)
- **Key Files**:
  - `index.html` - Main dashboard interface
  - `script.js` - Core application logic, Firebase interaction, DOM manipulation
  - `style.css` - All styling and responsive design
  - `firebase-config.js` - Firebase client configuration and helpers
  - `firebase-adapter.js` - Adapter to route API calls to Firebase

### Data Model
Books are stored in Firebase with properties including:
- Basic info (title, author, ISBN, totalPages)
- Workflow stages (corrector1/2/3, transcriber assignments)
- Progress tracking (pages completed, dates)
- Notes system (author, content, timestamps)

### Firebase Collections
- `books` - Book information and work progress
- `staff` - Staff member information
- `workSessions` - Current active work sessions
- `workSessionsHistory` - Completed work session history
- `attendanceMemos` - Attendance notes and memos

### External API Integration
- **National Library of Korea API**: Book search functionality
- **API Key Required**: Configure in `frontend/script.js` (apiKey variable)

### Key Features
- Book search and registration
- Multi-stage proofreading workflow management
- Progress tracking with visual indicators
- Real-time work session tracking
- Attendance calendar and reporting
- Notes system for task comments
- Admin panel for data management
- Completed books view
- Export functionality
- Performance evaluation reports

### UI Components
- Modal-based forms for book registration and updates
- Progress update dialogs for tracking work completion
- Notes management with CRUD operations
- Admin panel with tabbed interface (Tasks, Data, Staff, Attendance, Stats, Evaluation)
- Responsive card-based task display
- Real-time work session indicators

## Development Notes

- Frontend connects directly to Firebase for real-time data synchronization
- Backend server provides WebSocket support and handles some API operations
- No build process required - static files served directly
- Korean language interface throughout
- Firebase handles all data persistence with automatic backup capability
- Real-time updates across all connected clients via Firebase listeners

## File Structure
```
/
├── backend/
│   ├── server.js                    # Main Express server with Firebase
│   ├── firebase.js                  # Firebase initialization and helpers
│   ├── firebase-service-account.json # Firebase credentials (not in git)
│   ├── firebase-service-account.example.json # Example credentials file
│   └── package.json                 # Backend dependencies
├── frontend/
│   ├── index.html                   # Main UI
│   ├── script.js                    # Frontend logic and Firebase interaction
│   ├── style.css                    # All styling
│   ├── firebase-config.js           # Firebase client configuration
│   ├── firebase-adapter.js          # API to Firebase adapter
│   └── attendance-calendar.html     # Attendance calendar view
├── package.json                     # Root dependencies and scripts
└── README.md                        # Korean documentation
```

## Environment Configuration
- **Node.js version**: 18.x (specified in backend/package.json)
- **No build tools**: Direct file serving
- **CORS enabled**: Backend accepts requests from any origin
- **Static file serving**: Backend serves frontend files from Express
- **Firebase**: Realtime Database with admin SDK for backend, client SDK for frontend
