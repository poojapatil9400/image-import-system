#!/bin/bash

echo "Starting Worker Service..."
node services/worker-service/worker.js &

echo "Starting API Service..."
node services/api-service/index.js &

echo "Starting Frontend..."
cd services/frontend
npm install
npm start
