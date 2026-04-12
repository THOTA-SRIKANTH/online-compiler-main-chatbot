# Copilot Instructions for Online Compiler Codebase

## Project Overview
This is a **collaborative online code editor and compiler** platform with real-time code synchronization, user authentication, code execution, and video/voice meeting capabilities. It's a full-stack MERN application with Socket.IO for real-time features and MongoDB for persistence.

**Key Technologies:** React 18 + Vite, Express, Socket.IO, Monaco Editor, MongoDB, JWT Auth, Nodemailer

---

## Architecture Overview

### Frontend (`/client`)
- **Build Tool:** Vite with React 18
- **State Management:** React Context API (`Context.jsx` + `SocketProvider.jsx`)
- **Real-time Communication:** Socket.IO client (initialized in `SocketProvider`)
- **Code Editor:** Monaco Editor (react-monaco-editor)
- **Styling:** Tailwind CSS + Material-UI
- **Routing:** React Router v7

**Context Hierarchy:**
```
AppProvider (user, repos, teammates, auth state)
  ├─ SocketProvider (socket instance via useSocket hook)
  ├─ BrowserRouter
  └─ Components
```

**Key Files:**
- `src/context/Context.jsx` - Global app state (user, repos, teammates, API URL)
- `src/context/SocketProvider.jsx` - Socket.IO connection provider
- `src/components/editorComponents/` - Code editor UI components (MonacoCodeEditor, FileBar, Terminal, etc.)
- `src/components/meetComponents/` - Video meeting components
- `src/components/ProtectedRoute.jsx` - Route guard checking `user` from AppContext

### Backend (`/server`)
- **Runtime:** Node.js with ES Modules
- **Server:** Express + Socket.IO on port 8000
- **Database:** MongoDB with Mongoose
- **Architecture:** Route → Controller → Model pattern
- **Auth:** JWT tokens (Bearer format in Authorization header)

**Data Model:**
- **User:** email, password (bcrypt hashed), verification state, teammates list, shared repos
- **Repository:** files, ownership, sharing settings
- **File:** code content, language metadata

**Key Routes:**
- `/api/user/*` - Authentication, teammates, invitations (userRoutes.js)
- `/repo/*` - Repository CRUD and sharing (repoRoutes.js)
- `/code/*` - Code execution (codeRoutes.js)
- `/file/*` - File operations (fileRoutes.js)
- `/chat/*` - Chat/messaging (chatRoutes.js)

**Real-time Events (Socket.IO):**
- `create-room` - Initialize collaboration space
- `codeChange` - Broadcast code changes to room participants
- Custom events for chat and meeting features

---

## Critical Developer Workflows

### Running Locally
```bash
# Terminal 1: Backend
cd server
npm install
npm run dev          # Starts on port 8000 with nodemon

# Terminal 2: Frontend
cd client
npm install
npm run dev          # Starts Vite dev server

# Environment variables needed:
# server/.env: MONGODB_URI, JWT_SECRET, EMAIL credentials for nodemailer
# client/vite.config.js: VITE_API_URL for backend connection
```

### Building for Production
```bash
# Frontend build
cd client
npm run build        # Outputs to dist/
npm start            # Serves dist/ on port 3000 via serve

# Backend runs as: node index.js (production)
```

### Code Execution Flow
Code execution is **synchronous within the same server instance** (not distributed):
1. Client sends code + language to `/code/run` endpoint
2. Backend writes code to temp file in `server/controllers/codes/`
3. Executes via `child_process.exec()` (Python, Java, JavaScript, C++ partially)
4. Returns stdout/stderr as JSON response
5. Temp files cleaned up after execution

**Languages Supported:**
- Python, Java, JavaScript fully implemented
- C++ returns "not implemented yet" (see codeController.js line 86)

---

## Project-Specific Patterns & Conventions

### Authentication & Protected Routes
- **Frontend:** JWT token stored in `localStorage` under `"token"` key
- **Backend:** Token validated in middleware via `Authorization: Bearer <token>` header
- **Route Protection:** `ProtectedRoute` component checks `user` from AppContext
- **Login Flow:** User fetches data in `Context.jsx` useEffect after token retrieval
- Always pass token in axios requests: `headers: { Authorization: "Bearer " + token }`

### API URL Resolution
- Frontend detects API URL via `import.meta.env.VITE_API_URL` (Vite environment variable)
- Fallback to `"http://localhost:8000"` for development
- Set in `.env` files or Vite config as `VITE_API_URL`

### Socket.IO Room-based Collaboration
- Rooms keyed by repository/session ID
- Track connected sockets in `rooms` object on backend
- Code changes broadcasted only to other participants (socket.id check prevents echo)
- No persistent room state (resets on server restart)

### Component Structure Pattern
- Large features organized in subdirectories: `/editorComponents`, `/meetComponents`
- Components receive props bundled in a single `props` object (e.g., `CodeEditor` receives `{props}`)
- Context accessed via `useContext(AppContext)` and `useSocket()` hook

### Email Verification Workflow
- OTP-based (6-digit, numeric only)
- Generated via `otp-generator` library
- Expires in 5 minutes
- Spam protection: Can't request new OTP until previous expires
- Uses Nodemailer service (see `server/services/mailer.js`)

---

## Integration Points & Dependencies

### External Services
- **Nodemailer:** Email sending for OTP, password reset
- **OpenRouter/AI Service:** Chatbot features via `openRouterService.js` (endpoints not fully documented)
- **Code Execution:** Local system exec (requires Python, Java, Node installed on server)
- **JDoodle Integration:** File in controllers suggests code compilation support (check `jDoodle.js`)

### Cross-Component Communication
- **Global state → Context API:** User, repos, teammates
- **Real-time updates → Socket.IO:** Code changes, chat messages
- **HTTP requests → Axios:** File/repo operations, auth, code execution
- No Redux or state library; pure Context + hooks

### Key Middleware
- CORS configured with `*` origin (open to all domains)
- Token validation via `validateToken` middleware (extracts JWT, sets `req.user`)
- Body parsing: Default Express (JSON/urlencoded)

---

## Important Conventions & Gotchas

1. **Module System:** Server uses ES Modules (`type: "module"` in package.json) - use `import`/`export`
2. **File Cleanup:** Temp code files MUST be deleted after execution to prevent disk bloat
3. **Socket.IO Events:** Emit to specific sockets via `io.to(socketId).emit()`, not broadcast
4. **Password Hashing:** Always use `bcryptjs` for sensitive data (already in use)
5. **Verification Flow:** New users must verify email (OTP) before login; unverified users can resend OTP
6. **Timezone Handling:** Message timestamps use `Date.now()` (no timezone offset in schema)
7. **Error Responses:** Backend returns `{ error: "message" }` or `{ message: "status" }` inconsistently—standardize when fixing

---

## Common Tasks & Where to Make Changes

| Task | Primary Files |
|------|---|
| Add new API endpoint | `server/routes/*.js` → `server/controllers/*.js` → `server/models/*.js` |
| Add UI feature | `client/src/components/*.jsx` + update `client/src/context/Context.jsx` if state needed |
| Add real-time event | `server/server.js` (io.on event handler) + emit from client via `useSocket()` |
| Modify auth flow | `server/controllers/userController.js` + `client/src/context/Context.jsx` |
| Add code language | `server/controllers/codeController.js` (add case in runCode switch) |
| Database schema change | `server/models/*.js` (Mongoose schema) + update controllers |

---

## Meeting Feature Architecture

### WebRTC Peer Connection Flow
- **Initialization:** `PeerService.jsx` creates singleton `RTCPeerConnection` with STUN servers
- **Offer/Answer Exchange:** Signaling happens via Socket.IO; SDP offers/answers passed through `server.js` event handlers
- **Track Management:** User's stream tracks added once via `peer.peer.addTrack()`, then toggled via `enabled` property
- **Renegotiation:** `negotiationneeded` event triggers new offer when tracks change (screen share, audio/video toggle)

### Meeting Invitation System
- **Flow:** User clicks "Invite Guest" → Email dialog → API call to `/api/user/send-meeting-invite`
- **Backend:** `userController.sendMeetingInvite()` validates recipient, generates meeting URL, sends via Nodemailer
- **Frontend:** `Meeting.jsx` calls `sendMeetingInvitation(email)` which constructs `window.location.origin/meeting/{id}`
- **IMPORTANT:** Set `FRONTEND_URL` in `.env` for production meeting links (otherwise uses client-side origin)

### Common Meeting Issues & Fixes
1. **Video not displaying:** Check conditional rendering in JSX (use `{video && <video>}` not `display:none`)
2. **"Peer connection is 'new'" errors:** Old code checked `connectionState !== 'new'` - now permissive (allows any state for initialization)
3. **Audio/video toggle lag:** Uses `track.enabled = false` (instant) instead of recreating tracks (unless negotiation needed)
4. **Screen share flickering:** Don't close peer connection on disconnect - it's a singleton. Only remove tracks via `removeTrack(sender)`
5. **Remote video black:** Ensure `remoteVideoRef.current.srcObject` updated when `handleTrackEvent` fires (happens after offer/answer exchange)
6. **Extra video element visible when not sharing:** Only render screen share container when `screenShareStream` is active (conditional render)
7. **Video state inconsistent (console shows true but no video):** Use `userStream && video` together for rendering - don't rely on state alone

### UI/UX Meeting Features
- **Local video fallback:** Green avatar with user initial shown when camera off
- **Remote video waiting state:** Dashed border placeholder with "Waiting for participant..." text
- **Screen share label:** Green "🖥️ Screen Share" badge on screen share container with border highlight
- **Status indicators:** "(camera off)" label shown on local video when video disabled
- **Responsive sizing:** Screen share expands to 100% width and 45vh height when active, hidden when inactive
- **Smooth transitions:** All controls have 0.2s ease transitions for better UX
- **Tooltips:** Hover titles on all control buttons (Mute, Stop video, Share screen, End call, More options)

---

## Environment Variables Needed

**Backend (`server/.env`):**
```
MONGODB_URI=<connection_string>
JWT_SECRET=<random_secret>
EMAIL_USER=<gmail_address>
EMAIL_PASS=<gmail_app_password>
FRONTEND_URL=http://localhost:5173  # For meeting links in emails
```

**Frontend (`client/.env` or `vite.config.js`):**
```
VITE_API_URL=http://localhost:8000
```

