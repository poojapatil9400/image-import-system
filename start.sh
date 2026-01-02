#!/bin/bash
# start.sh

echo "Starting Worker Service..."
node services/worker-service/worker.js &

echo "Starting API Service..."
cd services/api-service
node index.js &

echo "Building Frontend..."
cd ../frontend
npm install
npm run build

# Serve frontend statically via 'serve'
npm install -g serve
serve -s build -l $PORT
