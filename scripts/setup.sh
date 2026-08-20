#!/bin/bash
set -e

echo "============================================================"
echo "DevOps Control Center - Local Environment Setup"
echo "============================================================"

# 1. Environment file
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# 2. Backend virtual environment
echo "Setting up Python virtual environment for Backend..."
if [ ! -d "backend/venv" ]; then
    python3 -m venv backend/venv
fi

source backend/venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt

# 3. Frontend dependencies
echo "Installing Node.js dependencies for Frontend..."
cd frontend
npm install
cd ..

# 4. Initialize Database
echo "Initializing and seeding database..."
python scripts/seed_db.py

echo "============================================================"
echo "Setup complete! You can now start the application with:"
echo "  docker-compose up --build"
echo "============================================================"
