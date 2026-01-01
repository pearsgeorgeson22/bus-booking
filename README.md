# 🚌 Bus Booking System

A full-stack bus booking application built with Node.js, Express, MongoDB, and vanilla JavaScript.

## ✨ Features

- User authentication (Register/Login)
- Bus search and booking
- Seat selection
- Ticket generation with QR code
- PDF ticket download
- Booking management
- Payment integration
- Email notifications

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **PDF Generation**: PDFKit
- **QR Code**: QRCode
- **Email**: Nodemailer

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/bus-booking.git
   cd bus-booking
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   
   **Windows:**
   ```cmd
   create-env.bat
   ```
   
   **Mac/Linux:**
   ```bash
   chmod +x create-env.sh
   ./create-env.sh
   ```
   
   Or create `.env` manually:
   ```env
   MONGODB_URI=mongodb://localhost:27017/bus-booking
   JWT_SECRET=your-super-secret-jwt-key-change-this
   PORT=5000
   ```

4. **Start MongoDB**:
   - Make sure MongoDB is running on your system
   - Or use MongoDB Atlas (cloud database)

5. **Run the application**:
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   - Navigate to `http://localhost:5000`

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions on:
- Adding project to GitHub
- Deploying to Vercel
- Setting up MongoDB Atlas
- Environment variables configuration

## 📁 Project Structure

```
bus-booking/
├── api/
│   └── index.js          # Vercel serverless function wrapper
├── frontend/             # Frontend files
├── images/               # Bus images
├── models/               # MongoDB models
│   ├── User.js
│   ├── Bus.js
│   └── Booking.js
├── server.js             # Express server
├── package.json          # Dependencies
├── vercel.json           # Vercel configuration
└── .env                  # Environment variables (not in git)
```

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/bus-booking` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `PORT` | Server port (optional) | `5000` |

## 📝 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/user` - Get current user (protected)

### Buses
- `GET /api/buses` - Get all buses
- `GET /api/buses/:id` - Get bus by ID
- `POST /api/buses` - Create bus (admin)

### Bookings
- `POST /api/bookings` - Create booking (protected)
- `GET /api/bookings` - Get user bookings (protected)
- `GET /api/bookings/:id` - Get booking by ID (protected)
- `GET /api/bookings/:id/ticket` - Download ticket PDF (protected)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Your Name

## 🙏 Acknowledgments

- Express.js community
- MongoDB team
- All open-source contributors

---

For deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

# h
