#!/bin/bash

echo "Starting renderer process..."
npm run start:renderer &
RENDERER_PID=$!

echo "Waiting for renderer to start..."
sleep 5

echo "Starting main Electron process..."
NODE_ENV=development npx electron --no-sandbox . &
MAIN_PID=$!

echo "App is starting..."
echo "Press Ctrl+C to stop both processes"

# Wait for either process to exit
wait $RENDERER_PID $MAIN_PID

# Clean up background processes
kill $RENDERER_PID $MAIN_PID 2>/dev/null