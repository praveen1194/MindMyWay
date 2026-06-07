#!/bin/bash
# Mind My Way 2 — Startup Script
# Run this to install dependencies and start both client and server

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🧠 Mind My Way 2 — Starting Up"
echo "================================"
echo ""

# Check for .env
if [ ! -f .env ]; then
  echo "⚠️  No .env file found. Creating from .env.example..."
  cp .env.example .env
  echo "📝 Please edit .env and add your ANTHROPIC_API_KEY, then re-run this script."
  exit 1
fi

# Check for API key
if grep -q "your-api-key-here" .env; then
  echo "⚠️  ANTHROPIC_API_KEY not set in .env."
  echo "📝 Please edit .env and add your key, then re-run this script."
  exit 1
fi

# Install root dependencies
if [ ! -d "node_modules" ]; then
  echo "📦 Installing root dependencies..."
  npm install
fi

# Install server dependencies
if [ ! -d "server/node_modules" ]; then
  echo "📦 Installing server dependencies..."
  cd server && npm install && cd ..
fi

# Install client dependencies
if [ ! -d "client/node_modules" ]; then
  echo "📦 Installing client dependencies..."
  cd client && npm install && cd ..
fi

# Kill any existing processes
echo "🧹 Cleaning up any existing processes..."
pkill -f "tsx.*src/index.ts" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 1

# Start server
echo "🚀 Starting server..."
cd server
npx tsx src/index.ts &
SERVER_PID=$!
cd ..

# Wait for server to be ready
echo "⏳ Waiting for server..."
for i in $(seq 1 15); do
  if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Server is running (PID: $SERVER_PID)"
    break
  fi
  sleep 1
done

# Start client
echo "🚀 Starting client..."
cd client
npx vite --host 0.0.0.0 &
CLIENT_PID=$!
cd ..

# Wait for client to be ready
echo "⏳ Waiting for client..."
for i in $(seq 1 15); do
  if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Client is running (PID: $CLIENT_PID)"
    break
  fi
  sleep 1
done

echo ""
echo "================================"
echo "🧠 Mind My Way 2 is ready!"
echo ""
echo "   📱 App:  http://localhost:5173"
echo "   🔌 API:  http://localhost:3001/api/health"
echo ""
echo "   Press Ctrl+C to stop both servers"
echo "================================"

# Keep script running and handle cleanup
cleanup() {
  echo ""
  echo "🛑 Shutting down..."
  kill $SERVER_PID 2>/dev/null || true
  kill $CLIENT_PID 2>/dev/null || true
  echo "👋 Done!"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for either process to exit
wait $SERVER_PID $CLIENT_PID 2>/dev/null || true
