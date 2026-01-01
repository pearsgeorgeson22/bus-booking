#!/bin/bash
echo "Creating .env file..."
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/bus-booking
JWT_SECRET=my-super-secret-jwt-key-bus-booking-2025
PORT=5000
EOF
echo ".env file created successfully!"
echo ""
echo "Now restart your server with: npm start"

