#!/bin/bash
set -e

echo "============================================================"
echo "Running All Tests: Backend & Frontend"
echo "============================================================"

# Backend tests
echo "1. Running Backend Tests..."
python backend/tests/run_tests.py

# Frontend build & typecheck
echo "2. Running Frontend Build & Typecheck..."
cd frontend
npm run build
cd ..

echo "============================================================"
echo "ALL TESTS PASSED SUCCESSFULLY!"
echo "============================================================"
