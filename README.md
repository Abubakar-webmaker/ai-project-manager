# 🚀 AI Project Manager

> A powerful, enterprise-level project management tool with 16 AI features built with the MERN stack, Socket.io, and Groq AI (LLaMA 3.3 70B).

![AI Project Manager](https://img.shields.io/badge/Stack-MERN-green)
![AI](https://img.shields.io/badge/AI-LLaMA%203.3%2070B-purple)
![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-black)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)

## ✨ Features

### 🤖 16 AI Features (Powered by Groq + LLaMA 3.3 70B)
- **AI Task Generator** — Describe project, AI generates complete task list
- **AI Sprint Planner** — Smart sprint planning based on team capacity
- **AI Priority Suggester** — Optimal task priority recommendations
- **AI Progress Report** — Comprehensive project progress reports
- **AI Standup Generator** — Auto-generate daily standup notes
- **AI Risk Analyzer** — Identify project risks before they happen
- **AI Task Estimator** — Accurate time estimation using historical data
- **AI Code Reviewer** — Instant code review with bug detection
- **AI Meeting Minutes** — Extract action items from meeting notes
- **AI Team Mood Analyzer** — Detect team stress and motivation levels
- **AI Deadline Predictor** — Predict realistic completion dates
- **AI Conflict Detector** — Detect scheduling and resource conflicts
- **AI Client Report Generator** — Professional client-ready reports
- **AI Resource Allocator** — Optimal task assignment recommendations
- **AI Scope Creep Detector** — Detect unplanned project additions
- **AI Bug Detector** — Identify missing info in task descriptions

### 📋 Core Features
- ✅ Kanban Board with drag & drop
- ✅ Real-time collaboration (Socket.io)
- ✅ Task management (subtasks, checklists, attachments)
- ✅ Team collaboration with mentions
- ✅ Time tracking (intelligent idle detection)
- ✅ Project health score (0-100)
- ✅ Gamification (XP, badges, leaderboard)
- ✅ Client portal (separate client access)
- ✅ Voice to task
- ✅ Recurring tasks automation
- ✅ WhatsApp notifications
- ✅ Multi-workspace support
- ✅ Role-based access control
- ✅ Dark/Light mode
- ✅ File attachments (Cloudinary)
- ✅ Email notifications
- ✅ Analytics dashboard
- ✅ Burndown charts
- ✅ Activity logs
- ✅ Global search

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + TypeScript | UI Framework |
| Vite | Build Tool |
| Redux Toolkit | State Management |
| Tailwind CSS | Styling |
| Socket.io Client | Real-time |
| DnD Kit | Drag & Drop |
| Recharts | Analytics Charts |
| React Hook Form + Zod | Forms & Validation |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | Server |
| TypeScript | Language |
| MongoDB + Mongoose | Database |
| Socket.io | Real-time |
| JWT + Refresh Tokens | Authentication |
| Groq API (LLaMA 3.3 70B) | AI Features |
| Cloudinary | File Storage |
| NodeMailer | Email |
| Twilio | WhatsApp |
| Node-cron | Scheduled Jobs |
| Zod | Validation |

## 📁 Project Structure

ai-project-manager/

├── apps/

│   ├── web/          # React + TypeScript Frontend

│   └── server/       # Node.js + Express Backend

└── README.md

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Groq API key
- Cloudinary account
- Gmail account (for emails)

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/Abubakar-webmaker/ai-project-manager.git
cd ai-project-manager
```

#### 2. Backend Setup
```bash
cd apps/server
npm install
cp .env.example .env
# Fill in your environment variables
npm run dev
```

#### 3. Frontend Setup
```bash
cd apps/web
npm install
cp .env.example .env
# Fill in your environment variables
npm run dev
```

### Environment Variables

#### Backend (`apps/server/.env`)
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_secret_min_32_chars
REFRESH_TOKEN_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=your_gmail@gmail.com
FROM_NAME=AI Project Manager
GROQ_API_KEY=your_groq_api_key
TWILIO_ACCOUNT_SID=optional
TWILIO_AUTH_TOKEN=optional
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

#### Frontend (`apps/web/.env`)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 📊 API Endpoints

### Auth
POST   /api/v1/auth/register

POST   /api/v1/auth/login

POST   /api/v1/auth/logout

POST   /api/v1/auth/refresh

GET    /api/v1/auth/me

POST   /api/v1/auth/google

GET    /api/v1/auth/verify-email

POST   /api/v1/auth/forgot-password

POST   /api/v1/auth/reset-password

### Workspaces
GET    /api/v1/workspaces

POST   /api/v1/workspaces

GET    /api/v1/workspaces/:id

PATCH  /api/v1/workspaces/:id

DELETE /api/v1/workspaces/:id

POST   /api/v1/workspaces/:id/members

DELETE /api/v1/workspaces/:id/members/:memberId

### Projects
GET    /api/v1/workspaces/:workspaceId/projects

POST   /api/v1/workspaces/:workspaceId/projects

GET    /api/v1/projects/:id

PATCH  /api/v1/projects/:id

DELETE /api/v1/projects/:id

GET    /api/v1/projects/:id/analytics

### Tasks
GET    /api/v1/projects/:projectId/tasks

POST   /api/v1/projects/:projectId/tasks

GET    /api/v1/tasks/:id

PATCH  /api/v1/tasks/:id

DELETE /api/v1/tasks/:id

PATCH  /api/v1/tasks/:id/move

POST   /api/v1/tasks/:id/subtasks

POST   /api/v1/tasks/:id/time/start

POST   /api/v1/tasks/:id/time/stop

### AI

POST   /api/v1/ai/generate-tasks

POST   /api/v1/ai/sprint-plan

GET    /api/v1/ai/projects/:id/progress-report

GET    /api/v1/ai/projects/:id/standup

GET    /api/v1/ai/projects/:id/risks

GET    /api/v1/ai/projects/:id/mood

GET    /api/v1/ai/projects/:id/conflicts

GET    /api/v1/ai/projects/:id/client-report

GET    /api/v1/ai/projects/:id/allocate-resources

GET    /api/v1/ai/projects/:id/scope-creep

POST   /api/v1/ai/review-code

POST   /api/v1/ai/meeting-minutes

POST   /api/v1/ai/estimate-task

GET    /api/v1/ai/tasks/:id/predict-deadline

## 🎮 Gamification System

| Badge | Requirement |
|-------|------------|
| 🎯 First Task | Complete first task |
| ⭐ Task Master | Complete 10 tasks |
| 👑 Productivity King | Complete 50 tasks |
| ⚡ Speed Runner | Complete 5 tasks on time |
| 💬 Communicator | Add 20 comments |
| 🔥 On Fire | 7 day streak |
| 🚀 Unstoppable | 30 day streak |

## 👨‍💻 Author

**Abubakar** — Full Stack Developer
- GitHub: [@Abubakar-webmaker](https://github.com/Abubakar-webmaker)
- Portfolio: [abubakar-portfolio-sage.vercel.app](https://abubakar-portfolio-sage.vercel.app)
- LinkedIn: [linkedin.com/in/abubakar-webmaker](https://linkedin.com/in/abubakar-webmaker)

## 📄 License

MIT License — feel free to use this project for learning and portfolio purposes.

---

⭐ **Star this repo if you found it helpful!**
