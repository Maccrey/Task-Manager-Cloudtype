# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Korean braille book production management dashboard that tracks and manages the progress of braille book creation. The application allows users to search for books via the National Library of Korea API, register new book projects, and manage multi-stage production workflows including proofreading and transcription.

## Development Commands

### Backend Server
- **Start backend server**: `cd backend && node server.js` or `npm run backend` from root
- **Backend runs on**: http://localhost:3000 (listens on 0.0.0.0)
- **Backend start command (from backend dir)**: `npm start`

### Frontend
- **Open frontend**: Open `frontend/index.html` in a web browser
- **Frontend connects to**: http://172.30.1.52:3000 (hardcoded backend IP)

### Dependencies
- **Install all dependencies**: `npm install` (from root directory)
- **Install backend dependencies**: `cd backend && npm install`
- **Root package.json**: Contains frontend dependencies (@mui/material, @emotion/react, etc.)
- **Backend dependencies**: Express.js 4.18.2, CORS 2.8.5

## Architecture

### Backend (`backend/`)
- **Framework**: Express.js with CORS
- **Data Storage**: JSON file-based (`bookworklist.json`)
- **Key File**: `server.js` - RESTful API server handling book and notes operations
- **Port**: 3000, accessible from all interfaces (0.0.0.0)

### Frontend (`frontend/`)
- **Technology**: Vanilla HTML/CSS/JavaScript (no frameworks)
- **Key Files**:
  - `index.html` - Main dashboard interface
  - `script.js` - Core application logic, API calls, DOM manipulation
  - `style.css` - All styling and responsive design

### Data Model
Books are stored with properties including:
- Basic info (title, author, ISBN, totalPages)
- Workflow stages (corrector1/2/3, transcriber assignments)
- Progress tracking (pages completed, dates)
- Notes system (author, content, timestamps)

### API Endpoints
- `GET/POST/PUT/DELETE /books` - Book CRUD operations
- `GET/POST/PUT/DELETE /books/:id/notes` - Notes management
- Data persisted to `backend/bookworklist.json`

### External API Integration
- **National Library of Korea API**: Book search functionality
- **API Key Required**: Configure in `frontend/script.js` (apiKey variable)

### Key Features
- Book search and registration
- Multi-stage proofreading workflow management
- Progress tracking with visual indicators
- Notes system for task comments
- Admin panel for data management
- Completed books view
- Export functionality

### UI Components
- Modal-based forms for book registration and updates
- Progress update dialogs for tracking work completion
- Notes management with CRUD operations
- Admin panel with tabbed interface
- Responsive card-based task display

## Development Notes

- Frontend hardcoded to connect to IP `172.30.1.52:3000` - update for different environments
- No build process required - static files served directly
- Korean language interface throughout
- File-based storage requires manual backup of `bookworklist.json`
- Recent feature requests include special notes/comments system integration

## File Structure
```
/
├── backend/
│   ├── server.js              # Main Express server
│   ├── package.json           # Backend dependencies
│   ├── bookworklist.json      # Main data storage
│   └── bookworklist.backup.json # Data backup
├── frontend/
│   ├── index.html            # Main UI
│   ├── script.js             # Frontend logic and API calls
│   ├── style.css             # All styling
│   └── package-lock.json     # Frontend dependencies lock
├── package.json              # Root dependencies and scripts
└── README.md                 # Korean documentation
```

## Environment Configuration
- **Node.js version**: 18.x (specified in backend/package.json)
- **No build tools**: Direct file serving
- **CORS enabled**: Backend accepts requests from any origin
- **Static file serving**: Backend serves frontend files from Express