# Qodex

![qodex](https://socialify.git.ci/Garvit-Nag/qodex/image?font=Raleway&language=1&name=1&owner=1&pattern=Circuit+Board&theme=Dark)

AI-powered code repository analysis and chat system. Clone GitHub repositories, generate embeddings locally, and have intelligent conversations about your codebase using Gemini AI.

## 🚀 Live Demo
Visit [qodex-gules.vercel.app](https://qodex-gules.vercel.app) to see the application in action.

![Dashboard](qodex-frontend/public/s1.jpg)

## 📝 Project Overview
Qodex combines a Next.js frontend with a FastAPI backend to provide intelligent code understanding. Upload any GitHub repository—the backend clones it, generates embeddings locally using SentenceTransformer, stores full code in PostgreSQL, and indexes vectors in Pinecone. Ask questions and get AI-powered answers with precise code citations.

![Chat Interface](qodex-frontend/public/s3.jpg)

## ✨ Key Features

### 🔐 Secure Authentication
- Appwrite-based authentication with email/password
- Google OAuth integration
- JWT tokens for backend API security
- Session management and data protection

### 📦 Repository Management
- Clone GitHub repositories via URL
- Real-time processing status tracking
- Local embedding generation (no API costs)
- Repository-scoped conversations

### 🤖 AI-Powered Code Chat
- Gemini 2.0 Flash for intelligent responses
- Vector similarity search via Pinecone
- Full code context from PostgreSQL
- Precise code citations and source references

### 🎨 Modern User Interface
- Responsive Next.js 15 with App Router
- Dark theme with glassmorphism design
- Real-time message updates
- Custom loading states and error handling

## 🛠️ Technology Stack

**Frontend:**
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Appwrite (authentication)
- Lucide React (icons)

**Backend:**
- FastAPI (Python web framework)
- PostgreSQL via Neon (full code storage)
- Pinecone (vector embeddings)
- SentenceTransformer (local embeddings - `all-MiniLM-L6-v2`)
- Gemini 2.0 Flash (AI responses)
- SQLAlchemy + Alembic (ORM and migrations)

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.10+
- PostgreSQL (Neon recommended)
- Appwrite account
- Pinecone account
- Google Gemini API key

---

## 🎨 Frontend Setup

### 1. Clone and Install
```bash
git clone https://github.com/Garvit-Nag/qodex.git
cd qodex/qodex-frontend
npm install
```

### 2. Environment Variables

Create `.env.local`:
```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your_appwrite_project_id

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_SECRET=your_backend_secret

# Stripe (Optional - for premium features)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Appwrite Setup
1. Create project at [appwrite.io](https://appwrite.io)
2. Enable Email/Password authentication
3. Configure Google OAuth provider
4. Copy project ID and endpoint to `.env.local`

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Backend Setup

### 1. Navigate and Install
```bash
cd qodex/server
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Database Setup (PostgreSQL)

Create a PostgreSQL database (Neon recommended: [neon.tech](https://neon.tech)), then run these SQL commands:

```sql
-- 1. Repositories table
CREATE TABLE repositories (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    github_url VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'PENDING',
    error_message VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT repositories_user_github_url_key UNIQUE (user_id, github_url)
);

CREATE INDEX ix_repositories_id ON repositories(id);
CREATE INDEX ix_repositories_user_id ON repositories(user_id);

-- 2. Conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    repository_id INTEGER NOT NULL,
    title VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE
);

CREATE INDEX ix_conversations_id ON conversations(id);

-- 3. Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL,
    role VARCHAR NOT NULL,
    content TEXT NOT NULL,
    citations JSON,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX ix_messages_id ON messages(id);

-- 4. Code files table (stores full file content)
CREATE TABLE code_files (
    id SERIAL PRIMARY KEY,
    repository_id INTEGER NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    full_content TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    start_line INTEGER NOT NULL,
    end_line INTEGER NOT NULL,
    chunk_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE
);

CREATE INDEX ix_code_files_id ON code_files(id);
CREATE INDEX ix_code_files_repo_id ON code_files(repository_id);
CREATE INDEX ix_code_files_repo_file_chunk ON code_files(repository_id, file_path, chunk_index);
```

### 3. Environment Variables

Create `.env` in `server/` directory:
```env
# Database (PostgreSQL/Neon)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Security (JWT Authentication)
SECRET_KEY=your-secret-key-change-in-production
NEXTJS_SECRET=your-nextjs-secret-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Pinecone Vector Database
PINECONE_API_KEY=your_pinecone_api_key

# Environment
DEBUG=True
ENVIRONMENT=development
```

### 4. Pinecone Setup
1. Sign up at [pinecone.io](https://pinecone.io)
2. Create index with these specs:
   - Name: `qodex`
   - Dimensions: `384`
   - Metric: `cosine`
3. Copy API key to `.env`

### 5. Run Backend Server
```bash
# Option 1: Using uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Option 2: Using run script
python run_server.py
```

**Access Points:**
- API: `http://localhost:8000`
- Interactive Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

---

## 🏗️ Architecture

**Processing Flow:**
1. User uploads GitHub URL via frontend
2. Backend clones repository
3. Extract code files (`.py`, `.js`, `.ts`, `.tsx`, `.jsx`, etc.)
4. Generate embeddings locally (SentenceTransformer)
5. Store full code in PostgreSQL `code_files` table
6. Store vector embeddings in Pinecone
7. Repository marked as `READY`

**Query Flow:**
1. User asks question → Generate query embedding (local)
2. Pinecone semantic search → Returns top 5 file identifiers
3. PostgreSQL fetches complete code for those files
4. Gemini AI generates answer with full context
5. Return response with citations

---

## 📁 Project Structure

### Frontend
```
qodex-frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── api/               # API routes (Stripe)
│   │   ├── dashboard/         # Main dashboard
│   │   ├── explore/           # Chat interface
│   │   └── pricing/           # Pricing page
│   │
│   ├── components/            # React components
│   │   ├── auth/             # Auth-related components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── explore/          # Chat UI components
│   │   ├── layout/           # Layout components
│   │   ├── pricing/          # Pricing components
│   │   └── ui/               # Reusable UI components
│   │
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and configs
│   └── types/                # TypeScript types
│
└── public/                    # Static assets
```

### Backend
```
server/
├── app/
│   ├── main.py                    # FastAPI app entry
│   ├── database.py                # Database connection
│   │
│   ├── api/v1/                    # API endpoints
│   │   ├── chat.py               # Chat endpoints
│   │   ├── repositories.py       # Repository management
│   │   └── router.py             # Route aggregation
│   │
│   ├── core/                     # Configuration
│   │   ├── config.py             # Settings
│   │   ├── database.py           # DB engine
│   │   └── security.py           # Auth utilities
│   │
│   ├── models/                   # SQLAlchemy models
│   │   ├── repository.py
│   │   ├── conversation.py
│   │   └── code_file.py          # Full code storage
│   │
│   ├── schemas/                  # Pydantic schemas
│   │   ├── chat.py
│   │   └── repository.py
│   │
│   └── services/                 # Business logic
│       ├── chat_service.py       # Gemini integration
│       ├── embedding_service.py  # Local SentenceTransformer
│       ├── github_service.py     # GitHub cloning
│       ├── pinecone_service.py   # Vector storage
│       └── vector_service.py     # Search orchestration
│
├── migrations/                    # Alembic migrations
├── requirements.txt              # Python dependencies
└── Dockerfile                    # Container config
```

---

## 📚 API Documentation

### Authentication Headers (Required)
```
X-User-ID: {user_id}
X-Client-Secret: {nextjs_secret}
```

### Key Endpoints
```http
POST   /api/v1/repositories/          # Upload repository
GET    /api/v1/repositories/          # List repositories
GET    /api/v1/repositories/{id}      # Get details
DELETE /api/v1/repositories/{id}      # Delete repository
GET    /api/v1/repositories/{id}/status # Processing status

POST   /api/v1/chat/                  # Send message
GET    /api/v1/chat/{repo_id}/messages # Get history

GET    /health                        # Health check
GET    /docs                          # Interactive docs
```

### Example Request
```bash
curl -X POST "http://localhost:8000/api/v1/repositories/" \
  -H "X-User-ID: user123" \
  -H "X-Client-Secret: your_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Repo",
    "github_url": "https://github.com/username/repo",
    "user_id": "user123"
  }'
```

---

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository at [vercel.com](https://vercel.com)
3. Add environment variables in dashboard
4. Auto-deploy on push

### Backend (Recommended Platforms)
- **HuggingFace Spaces**: Automatic Docker deployment
- **Render**: Connect GitHub → Deploy
- **Railway**: One-click deploy
- **Google Cloud Run**: Serverless containers

**Docker Deployment:**
```bash
# Build image
docker build -t qodex-backend .

# Run container
docker run -d \
  -p 8000:7860 \
  --env-file .env \
  --name qodex \
  qodex-backend
```

---

## 🔧 Key Technical Details

### Embedding Generation
- **Model**: `all-MiniLM-L6-v2` (384 dimensions)
- **Runtime**: Local on server CPU
- **Speed**: ~100ms per file
- **Cost**: Free, unlimited

### Storage Strategy
- **PostgreSQL**: Complete file contents (3000-5000+ chars per chunk)
- **Pinecone**: Vector embeddings + file identifiers only

### Why This Architecture?
- Pinecone excels at vector similarity search
- PostgreSQL handles text storage efficiently
- Local embeddings eliminate API costs
- Full code context ensures accurate AI responses

---

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 Credits
Design inspired by [@abhisheksharm-3/inquora](https://github.com/abhisheksharm-3/inquora)

---

Built with ❤️ by Garvit Nag
