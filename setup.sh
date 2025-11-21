# Quick Setup Script for AI Document Generator

echo "🚀 Setting up AI Document Generator..."

# Backend Setup
echo "\n📦 Setting up Backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Please update backend/.env with your GEMINI_API_KEY and SECRET_KEY"
fi

cd ..

# Frontend Setup
echo "\n📦 Setting up Frontend..."
cd frontend
npm install

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
fi

cd ..

echo "\n✅ Setup complete!"
echo "\n📝 Next steps:"
echo "1. Update backend/.env with your Gemini API key"
echo "2. Generate a SECRET_KEY with: openssl rand -hex 32"
echo "3. Run backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "4. Run frontend: cd frontend && npm run dev"
echo "5. Open http://localhost:3000 in your browser"
