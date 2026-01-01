@echo off
echo Creating .env file...
(
echo MONGODB_URI=mongodb://localhost:27017/bus-booking
echo JWT_SECRET=my-super-secret-jwt-key-bus-booking-2025
echo PORT=5000
) > .env
echo .env file created successfully!
echo.
echo Now restart your server with: npm start
pause

