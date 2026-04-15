# CodeMeet — Online Compiler & Video Collaboration Platform

A full-stack real-time collaborative coding platform with video meetings, AI chatbot, and code execution.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS + MUI |
| Backend | Node.js + Express + Socket.IO |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| Code Execution | Python3 (via child_process) |
| AI Chatbot | OpenRouter API |
| Realtime | WebRTC + Socket.IO |
| Email | Nodemailer + Gmail |

## 📁 Project Structure

```
online-compiler/
├── client/          # React frontend (Vite)
│   ├── src/
│   ├── .env.production   # VITE_API_URL for production build
│   └── package.json
├── server/          # Node.js backend
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── services/
│   ├── config/
│   ├── .env         # Server environment variables (not committed)
│   ├── .env.example # Template for server env vars
│   └── package.json
└── package.json     # Root scripts
```

## 🚀 Local Development

### 1. Clone the repo
```bash
git clone https://github.com/THOTA-SRIKANTH/online-compiler-main-chatbot.git
cd online-compiler-main-chatbot
```

### 2. Setup Server
```bash
cd server
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

### 3. Setup Client
```bash
cd client
cp .env.example .env.production
# Set VITE_API_URL=http://localhost:8000 for local dev
npm install
npm run dev
```

## ☁️ AWS Deployment

See `server/AWS_Deployment_Guide_OnlineCompiler.pdf` for the full step-by-step AWS guide.

### Quick Summary
1. **Backend** → EC2 instance running `npm start` (port 8000), managed by PM2
2. **Frontend** → Build with `npm run build`, sync to S3 bucket with static website hosting
3. **Database** → MongoDB Atlas (cloud)

### Environment Variables (Server — set on EC2)

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `EMAIL_USER` | Gmail address for sending OTPs |
| `EMAIL_PASS` | Gmail App Password |
| `PORT` | Server port (default: 8000) |
| `CLIENT_URL` | Frontend URL (EC2 IP or CloudFront) |
| `OPENROUTER_API_KEY` | API key for AI chatbot |

### Client Build

```bash
cd client
# .env.production already has VITE_API_URL set to EC2 IP
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete
```

## 📡 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Health check |
| POST | `/api/user/register` | Register user |
| POST | `/api/user/login` | Login |
| GET | `/repo` | Repository routes |
| POST | `/code/run` | Execute code |
| GET | `/meet/:meetId` | Check meeting status |
| POST | `/api/chat` | AI chatbot |

## ✅ Features

- 🎥 WebRTC video meetings (2-participant, 1-on-1)
- 💻 Collaborative code editor (Monaco Editor)
- 🤖 AI chatbot (OpenRouter)
- 🗂️ Repository & file management
- 👥 Team collaboration & connections
- 📧 OTP email verification
- 🔒 JWT authentication
- 🖥️ Screen sharing
- 💬 In-meeting chat
