#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Start the backend service
startBackend() {
    cd backend && ./gradlew build && java -jar build/libs/backend-0.0.1-SNAPSHOT.jar && cd ..
}

# Start the frontend service
startFrontend(){
    cd frontend && npm run dev && cd .. 
}

# Wait for all services to start, kill with CTRL+C
startFrontend & startBackend; trap "exit" SIGINT; wait
