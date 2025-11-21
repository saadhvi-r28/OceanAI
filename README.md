# AI-Assisted Document Authoring and Generation Platform

A full-stack AI-powered web application that allows authenticated users to generate, refine, and export structured business documents (Word .docx and PowerPoint .pptx files) using Google's Gemini AI.

## 🎯 Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication with registration and login
- **Project Management**: Create, view, update, and delete document projects
- **Document Types**: Support for both Microsoft Word (.docx) and PowerPoint (.pptx)
- **AI Content Generation**: Leverage Gemini AI to generate section/slide content
- **AI Outline Generation**: Auto-generate document structure based on topic
- **Interactive Refinement**: Refine generated content with natural language prompts
- **Feedback System**: Like/dislike and comment on generated content
- **Real-time Editing**: Edit content directly in the interface
- **Document Export**: Download projects as formatted .docx or .pptx files

### Technical Features
- **FastAPI Backend**: High-performance async API with proper error handling
- **React Frontend**: Modern, responsive UI built with Vite and Tailwind CSS
- **SQLite Database**: Persistent storage with SQLAlchemy ORM
- **Real-time Updates**: Optimistic UI updates for smooth user experience
- **Token-based Auth**: Secure JWT authentication with automatic token refresh
- **CORS Support**: Properly configured for local development

## 🏗️ Architecture

```
OceanAI/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   │   ├── auth.py     # Authentication routes
│   │   │   ├── projects.py # Project management
│   │   │   ├── sections.py # Section/content management
│   │   │   └── export.py   # Document export
│   │   ├── core/           # Core utilities
│   │   │   ├── config.py   # Configuration management
│   │   │   └── security.py # JWT & password hashing
│   │   ├── database/       # Database setup
│   │   │   └── session.py  # SQLAlchemy session management
│   │   ├── models/         # Database models
│   │   │   ├── user.py     # User model
│   │   │   └── project.py  # Project, Section, Refinement models
│   │   ├── schemas/        # Pydantic schemas
│   │   │   ├── user.py     # User schemas
│   │   │   └── project.py  # Project schemas
│   │   ├── services/       # Business logic
│   │   │   ├── gemini_service.py    # Gemini AI integration
│   │   │   └── document_service.py  # Document generation
│   │   └── main.py         # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variables template
│
└── frontend/               # React Frontend
    ├── src/
    │   ├── api/           # API client
    │   │   └── api.js     # Axios configuration
    │   ├── components/    # Reusable components
    │   │   ├── Button.jsx
    │   │   ├── Input.jsx
    │   │   ├── Card.jsx
    │   │   ├── Modal.jsx
    │   │   └── Layout.jsx
    │   ├── pages/         # Page components
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── CreateProject.jsx
    │   │   └── ProjectEditor.jsx
    │   ├── store/         # State management
    │   │   └── authStore.js
    │   ├── App.jsx        # Main app component
    │   ├── main.jsx       # Entry point
    │   └── index.css      # Global styles
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## 🚀 Setup Instructions

### Prerequisites
- Python 3.9 or higher
- Node.js 18 or higher
- npm or yarn
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Backend Setup

1. **Navigate to the backend directory:**
```bash
cd backend
```

2. **Create a virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Create `.env` file from template:**
```bash
cp .env.example .env
```

5. **Configure environment variables in `.env`:**
```env
DATABASE_URL=sqlite+aiosqlite:///./doc_generator.db
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
GEMINI_API_KEY=your-gemini-api-key-here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Important Environment Variables:**
- `SECRET_KEY`: Random string for JWT token signing (generate with `openssl rand -hex 32`)
- `GEMINI_API_KEY`: Your Google Gemini API key (required)
- `DATABASE_URL`: SQLite database path (default works for local dev)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time (default: 30 days)

6. **Run the backend server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to the frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file from template:**
```bash
cp .env.example .env
```

4. **Configure environment variables in `.env`:**
```env
VITE_API_URL=http://localhost:8000
```

5. **Run the development server:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📖 Usage Guide

### 1. User Registration & Login

1. Open `http://localhost:3000` in your browser
2. Click "Sign up" to create a new account
3. Fill in username, email, and password
4. After registration, log in with your credentials

### 2. Creating a New Project

1. From the dashboard, click "New Project"
2. Fill in project details:
   - **Title**: Name your project
   - **Description**: Optional project description
   - **Document Type**: Choose Word (.docx) or PowerPoint (.pptx)
   - **Topic**: Main subject of your document
3. Define sections/slides:
   - Manually add section titles, or
   - Click "AI Generate" to auto-create an outline
4. Click "Create Project"

### 3. Generating Content

1. Open a project from the dashboard
2. For each section:
   - Click "Generate" to create AI-powered content
   - Or click "Generate All" to create all sections at once
3. Content appears in editable text areas
4. Manually edit content as needed

### 4. Refining Content

1. Click "Refine" on any section with content
2. Enter a refinement prompt, such as:
   - "Make this more formal"
   - "Add more technical details"
   - "Convert to bullet points"
   - "Shorten to 100 words"
3. Click "Refine" to regenerate with AI
4. The content updates with refined version

### 5. Providing Feedback

1. Click "Feedback" on any section
2. Rate content with Like/Dislike
3. Optionally add comments
4. Feedback is stored for future reference

### 6. Exporting Documents

1. Click "Export" button in the project editor
2. Document downloads as .docx or .pptx
3. Open with Microsoft Word or PowerPoint
4. All content and formatting preserved

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Projects
- `POST /api/projects` - Create new project
- `GET /api/projects` - Get all user projects
- `GET /api/projects/{id}` - Get specific project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `POST /api/projects/generate-outline` - AI-generate outline

### Sections
- `POST /api/sections/{id}/generate` - Generate section content
- `PUT /api/sections/{id}` - Update section
- `POST /api/sections/{id}/refine` - Refine section with AI
- `GET /api/sections/{id}/refinements` - Get refinement history
- `PATCH /api/sections/refinements/{id}/feedback` - Add feedback

### Export
- `GET /api/export/{id}` - Export project as document

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: Lightweight database (easily switchable to PostgreSQL)
- **Google Gemini AI**: Advanced language model for content generation
- **python-docx**: Word document generation
- **python-pptx**: PowerPoint generation
- **JWT**: Token-based authentication
- **Pydantic**: Data validation and settings management

### Frontend
- **React 18**: Modern UI library
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Zustand**: Lightweight state management
- **Tailwind CSS**: Utility-first CSS framework
- **React Icons**: Icon library
- **React Hot Toast**: Toast notifications

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API endpoints
- CORS configuration
- Input validation with Pydantic
- SQL injection prevention with ORM
- XSS protection

## 🎨 UI/UX Features

- Responsive design (mobile, tablet, desktop)
- Loading states and spinners
- Toast notifications for user feedback
- Modal dialogs for complex interactions
- Smooth transitions and animations
- Intuitive navigation
- Clear visual hierarchy
- Accessible components

## 📊 Database Schema

### Users Table
- `id`: Primary key
- `email`: Unique email address
- `username`: Unique username
- `hashed_password`: Bcrypt hashed password
- `created_at`: Account creation timestamp

### Projects Table
- `id`: Primary key
- `user_id`: Foreign key to users
- `title`: Project name
- `description`: Project description
- `document_type`: 'docx' or 'pptx'
- `topic`: Main topic
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Sections Table
- `id`: Primary key
- `project_id`: Foreign key to projects
- `title`: Section/slide title
- `content`: Generated content
- `order`: Display order
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Refinements Table
- `id`: Primary key
- `section_id`: Foreign key to sections
- `prompt`: Refinement prompt
- `previous_content`: Content before refinement
- `refined_content`: Content after refinement
- `feedback`: 'like' or 'dislike'
- `comment`: User comment
- `created_at`: Creation timestamp

## 🚢 Deployment

### Backend Deployment

**For production:**
1. Use PostgreSQL instead of SQLite
2. Update `DATABASE_URL` in `.env`
3. Set strong `SECRET_KEY`
4. Use a production ASGI server (Uvicorn with Gunicorn)
5. Enable HTTPS
6. Configure proper CORS origins

**Docker deployment:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Deployment

1. **Build for production:**
```bash
npm run build
```

2. **Deploy to hosting:**
- Vercel: `vercel deploy`
- Netlify: `netlify deploy`
- AWS S3 + CloudFront
- Any static hosting service

3. **Update API URL:**
Set `VITE_API_URL` to your production backend URL

## 🐛 Troubleshooting

### Backend Issues

**Database errors:**
- Delete `doc_generator.db` and restart to recreate
- Check file permissions

**Gemini API errors:**
- Verify API key is valid
- Check API quota and billing
- Ensure internet connection

**Import errors:**
- Reinstall dependencies: `pip install -r requirements.txt`
- Verify virtual environment is activated

### Frontend Issues

**API connection errors:**
- Verify backend is running on port 8000
- Check CORS configuration
- Inspect browser console for errors

**Build errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`

## 📝 Development

### Running Tests
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

### Code Formatting
```bash
# Backend
black app/
isort app/

# Frontend
npm run format
```

### Linting
```bash
# Backend
pylint app/

# Frontend
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is created for educational purposes as part of an assessment.

## 👥 Support

For issues or questions:
- Check the API documentation at `/docs`
- Review this README
- Check console logs for errors
- Verify environment variables are set correctly

## 🎯 Future Enhancements

- Real-time collaboration
- Document templates library
- Advanced formatting options
- Export to PDF
- Version history
- Document sharing
- Multi-language support
- Advanced AI models (GPT-4, Claude)
- Document analytics
- Custom branding

---

Built with ❤️ using FastAPI, React, and Gemini AI
