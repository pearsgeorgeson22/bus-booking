const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Check if JWT_SECRET is set (only exit in local development, not in serverless)
if (!process.env.JWT_SECRET && require.main === module) {
    console.error('\n❌ ERROR: JWT_SECRET is not defined in .env file!');
    console.error('📝 Please create a .env file with JWT_SECRET');
    console.error('💡 Run: create-env.bat (Windows) or ./create-env.sh (Mac/Linux)\n');
    process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files - handle both local and Vercel environments
const staticPath = __dirname;
app.use(express.static(staticPath));
app.use('/images', express.static(path.join(staticPath, 'images')));

// Database connection with caching for serverless environments
let isConnected = false;
let connectionPromise = null;

const connectDB = async () => {
  // Return existing connection if already connected
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return mongoose.connection;
  }

  // Return existing promise if connection is in progress
  if (connectionPromise) {
    console.log('MongoDB connection in progress, waiting...');
    return connectionPromise;
  }

  // Start new connection
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  console.log('Connecting to MongoDB...');
  
  connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // 10 seconds timeout
    socketTimeoutMS: 45000, // 45 seconds socket timeout
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 1, // Maintain at least 1 socket connection
    bufferMaxEntries: 0, // Disable mongoose buffering
    bufferCommands: false, // Disable mongoose buffering
  })
  .then((conn) => {
    isConnected = true;
    console.log('MongoDB connected successfully:', conn.connection.host);
    return conn;
  })
  .catch((err) => {
    isConnected = false;
    connectionPromise = null;
    console.error('MongoDB connection error:', err.message);
    throw err;
  });

  return connectionPromise;
};

// Connect to database (non-blocking for serverless)
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
  // Don't exit in serverless environment
  if (require.main === module) {
    process.exit(1);
  }
});

// Middleware to ensure DB connection before handling requests
const ensureDBConnection = async (req, res, next) => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return next();
    }

    // Wait for connection
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    res.status(503).json({ 
      error: 'Database connection failed',
      message: 'Please check your MongoDB connection settings'
    });
  }
};

// Models
const User = require('./models/User');
const Bus = require('./models/Bus');
const Booking = require('./models/Booking');

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. Please login again.' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        // Clear invalid token and ask user to login again
        return res.status(401).json({ 
            error: 'Session expired. Please login again.',
            expired: true 
        });
    }
};

// Generate ticket ID
const generateTicketId = () => {
    return 'TICKET' + Date.now() + Math.floor(Math.random() * 1000);
};

// Date-only UTC function
function dateOnlyUTC(dateStr) {
  const d = new Date(dateStr); // '2025-12-23' or ISO
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0,0,0));
}

// Email validation function
function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    // Must contain @ and a valid domain with TLD
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    // Must have a valid TLD (at least 2 characters after the last dot)
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    const domain = parts[1];
    const domainParts = domain.split('.');
    if (domainParts.length < 2) return false;
    const tld = domainParts[domainParts.length - 1];
    return tld.length >= 2 && /^[a-zA-Z]+$/.test(tld);
}

// UPI ID validation function
function isValidUPI(upiId) {
    if (!upiId || typeof upiId !== 'string') return false;
    // UPI format: username@provider
    // Common providers: upi, paytm, okaxis, phonepe, gpay, ybl, axl, etc.
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return upiRegex.test(upiId.trim());
}

// Routes

// 1. User Registration
app.post('/api/register', ensureDBConnection, async (req, res) => {
    try {
        const { name, email, mobile, password } = req.body;
        
        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Please enter a valid email address (e.g., user@example.com)' });
        }
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create new user
        const user = new User({ name, email, mobile, password });
        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. User Login
app.post('/api/login', ensureDBConnection, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Please enter a valid email address (e.g., user@example.com)' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Search buses with future dates only
app.get('/api/search-buses', ensureDBConnection, async (req, res) => {
    try {
        const { from, to, date } = req.query;

        if (!from || !to || !date) {
            return res.status(400).json({ error: 'Missing query parameters. Please provide from, to and date.' });
        }

        // parse date as date-only UTC midnight to avoid timezone issues
        const start = dateOnlyUTC(date);
        if (isNaN(start.getTime())) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD or ISO date.' });
        }

        const today = dateOnlyUTC(new Date().toISOString().split('T')[0]);
        // Only allow dates from tomorrow onwards
        if (start <= today) {
            return res.status(400).json({ error: 'Please select a date from tomorrow onwards' });
        }

        // Check if date exceeds 90 days from tomorrow (90 days in the future)
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const maxDate = new Date(tomorrow.getTime() + 90 * 24 * 60 * 60 * 1000);
        if (start > maxDate) {
            return res.status(400).json({ error: 'Booking is only allowed for dates within 90 days from tomorrow' });
        }

        const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

        // Case-insensitive search with trim - works with any combination
        const fromRegex = new RegExp(String(from).trim(), 'i');
        const toRegex = new RegExp(String(to).trim(), 'i');

        // Helper function to convert time string to minutes for sorting
        function timeToMinutes(timeStr) {
            if (!timeStr) return 9999; // Put times without format at end
            const parts = timeStr.trim().split(/[:\s]/);
            let hours = parseInt(parts[0]) || 0;
            const minutes = parseInt(parts[1]) || 0;
            const period = parts[2]?.toUpperCase() || '';
            
            // Handle 12-hour format
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            
            return hours * 60 + minutes;
        }

        // after computing `start` and `end` (UTC midnight range)
        const buses = await Bus.find({
          from: fromRegex,
          to: toRegex,
          isActive: true,
          $or: [
            { departureDate: { $gte: start, $lt: end } }, // specific-date buses
            { departureDate: { $exists: false } },        // recurring buses (no date)
            { departureDate: null }                       // or explicit null
          ]
        }).select('-seats').lean();

        // Sort buses by departure time (earliest first)
        buses.sort((a, b) => {
            const timeA = timeToMinutes(a.departureTime);
            const timeB = timeToMinutes(b.departureTime);
            return timeA - timeB;
        });

        res.json(buses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3.5. Get route suggestions for autocomplete
app.get('/api/route-suggestions', ensureDBConnection, async (req, res) => {
    try {
        const { q, type } = req.query; // q = query string, type = 'from' or 'to'
        
        if (!q || q.trim().length === 0) {
            return res.json([]);
        }

        const query = q.trim();
        const regex = new RegExp(query, 'i');

        let routes;
        if (type === 'from') {
            // Get unique 'from' locations
            routes = await Bus.distinct('from', {
                from: regex,
                isActive: true
            });
        } else if (type === 'to') {
            // Get unique 'to' locations
            routes = await Bus.distinct('to', {
                to: regex,
                isActive: true
            });
        } else {
            // Get both from and to
            const fromRoutes = await Bus.distinct('from', {
                from: regex,
                isActive: true
            });
            const toRoutes = await Bus.distinct('to', {
                to: regex,
                isActive: true
            });
            routes = [...new Set([...fromRoutes, ...toRoutes])];
        }

        // Sort and limit results
        routes = routes.sort().slice(0, 10);
        res.json(routes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Get bus details with seat status
app.get('/api/bus/:id', ensureDBConnection, async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.id);
        if (!bus) {
            return res.status(404).json({ error: 'Bus not found' });
        }
        // Add a date-only ISO string to avoid timezone shifts on the client
        const busObj = bus.toObject();
        if (req.query.date) {
            const parsed = new Date(req.query.date);
            if (!isNaN(parsed.getTime())) {
                busObj.departureDateISO = parsed.toISOString().split('T')[0];
            } else if (busObj.departureDate) {
                busObj.departureDateISO = new Date(busObj.departureDate).toISOString().split('T')[0];
            }
        } else if (busObj.departureDate) {
            busObj.departureDateISO = new Date(busObj.departureDate).toISOString().split('T')[0];
        }

        res.json(busObj);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/book-seats', ensureDBConnection, authenticateToken, async (req, res) => {
    try {
        const { busId, seats, passengerDetails, paymentMethod, journeyDate, upiId } = req.body;
        
        // Validate email format if provided
        if (passengerDetails && passengerDetails.email) {
            if (!isValidEmail(passengerDetails.email)) {
                return res.status(400).json({ error: 'Please enter a valid email address (e.g., user@example.com)' });
            }
        }
        
        // Validate UPI ID if payment method is UPI
        if (paymentMethod === 'upi') {
            if (!upiId || !upiId.trim()) {
                return res.status(400).json({ error: 'UPI ID is required for UPI payment' });
            }
            if (!isValidUPI(upiId.trim())) {
                return res.status(400).json({ error: 'Please enter a valid UPI ID (e.g., yourname@upi, yourname@paytm, yourname@okaxis)' });
            }
        }
        
        // Get bus
        const bus = await Bus.findById(busId);
        if (!bus) {
            return res.status(404).json({ error: 'Bus not found' });
        }

        // Check if seats are available
        for (const seat of seats) {
            const busSeat = bus.seats.find(s => s.seatNumber === seat.seatNumber);
            if (busSeat && busSeat.isBooked) {
                return res.status(400).json({ error: `Seat ${seat.seatNumber} is already booked` });
            }
        }

        // Generate ticket ID
        const ticketId = generateTicketId();

        // Calculate total amount
        const totalAmount = seats.length * bus.price;

        // Determine journey date: prefer client-selected `journeyDate`, fallback to bus.departureDate
        let journeyDateVal = null;
        let journeyDateISO = undefined;
        if (journeyDate) {
            const parsed = new Date(journeyDate);
            if (isNaN(parsed.getTime())) {
                return res.status(400).json({ error: 'Invalid journeyDate' });
            }
            journeyDateVal = parsed;
            journeyDateISO = parsed.toISOString().split('T')[0];
        } else if (bus.departureDate) {
            journeyDateVal = bus.departureDate;
            journeyDateISO = new Date(bus.departureDate).toISOString().split('T')[0];
        }

        // Create booking and snapshot journey date/time to avoid later mismatches
        const booking = new Booking({
            ticketId,
            user: req.user.userId,
            bus: busId,
            seats,
            totalAmount,
            passengerDetails,
            paymentMethod,
            status: 'confirmed',
            journeyDate: journeyDateVal,
            journeyDateISO: journeyDateISO,
            departureTimeSnapshot: bus.departureTime,
            arrivalTimeSnapshot: bus.arrivalTime
        });

        await booking.save();

        // Update bus seats
        for (const seat of seats) {
            const seatIndex = bus.seats.findIndex(s => s.seatNumber === seat.seatNumber);
            if (seatIndex !== -1) {
                bus.seats[seatIndex].isBooked = true;
                bus.seats[seatIndex].bookedBy = req.user.userId;
            }
        }
        
        bus.availableSeats -= seats.length;
        await bus.save();

        res.status(201).json({
            message: 'Booking successful',
            ticketId: booking.ticketId,
            booking
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Get user bookings
app.get('/api/my-bookings', ensureDBConnection, authenticateToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.userId })
            .populate('bus', 'busName busNumber from to departureTime arrivalTime departureDate')
            .sort({ bookingDate: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 7. Cancel ticket with 80% refund
app.post('/api/cancel-ticket', ensureDBConnection, authenticateToken, async (req, res) => {
    try {
        const { ticketId } = req.body;

        const booking = await Booking.findOne({ 
            ticketId, 
            user: req.user.userId 
        }).populate('bus');

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.isCancelled) {
            return res.status(400).json({ error: 'Ticket already cancelled' });
        }

        // Calculate 80% refund
        const refundAmount = booking.totalAmount * 0.8;

        // Update booking
        booking.isCancelled = true;
        booking.status = 'cancelled';
        booking.paymentStatus = 'refunded';
        booking.refundAmount = refundAmount;
        booking.cancellationDate = new Date();
        await booking.save();

        // Update bus seats
        const bus = await Bus.findById(booking.bus._id);
        for (const seat of booking.seats) {
            const seatIndex = bus.seats.findIndex(s => s.seatNumber === seat.seatNumber);
            if (seatIndex !== -1) {
                bus.seats[seatIndex].isBooked = false;
                bus.seats[seatIndex].bookedBy = null;
            }
        }
        
        bus.availableSeats += booking.seats.length;
        await bus.save();

        res.json({
            message: 'Ticket cancelled successfully',
            refundAmount,
            cancellationDate: booking.cancellationDate
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 8. Download ticket as PDF
app.get('/api/download-ticket/:ticketId', ensureDBConnection, async (req, res) => {
    try {
        // Get token from query parameter for download (since window.open can't send headers)
        const token = req.query.token || req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access denied' });
        }

        let verified;
        try {
            verified = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ error: 'Invalid token' });
        }

        const booking = await Booking.findOne({ 
            ticketId: req.params.ticketId,
            user: verified.userId 
        }).populate('bus').populate('user', 'name email mobile');

        if (!booking) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=ticket-${booking.ticketId}.pdf`);

        doc.pipe(res);

        // Styled ticket layout: header, bus image, two-column details (bus info & passenger info), payment box, instructions
        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

        // Header
        const headerHeight = 64;
        doc.rect(doc.x, doc.y, pageWidth, headerHeight).fill('#28a745');
        doc.fillColor('white').fontSize(18).text('Geobus booking', doc.x + 12, doc.y + 16);
        doc.fillColor('white').fontSize(10).text(`Booking ID: ${booking.ticketId}`, doc.x + 12, doc.y + 38);

        // Reserve space for header and set content start Y
        const contentTop = doc.page.margins.top + headerHeight + 12;

        // Center bus image horizontally
        const imageMaxWidth = pageWidth * 0.60; // 60% of page width
        const imageMaxHeight = 150;
        const busImagePath = booking.bus && booking.bus.image ? path.join(__dirname, booking.bus.image) : null;

        // Draw bus image centered if available
        if (busImagePath && fs.existsSync(busImagePath)) {
            try {
                const imageX = doc.x + (pageWidth - imageMaxWidth) / 2; // Perfectly centered
                doc.image(busImagePath, imageX, contentTop, { fit: [imageMaxWidth, imageMaxHeight], align: 'center' });
            } catch (err) {
                console.log('Could not add bus image to PDF:', err);
            }
        }

        // Move cursor below image
        const afterImagesY = contentTop + imageMaxHeight + 12;
        doc.y = afterImagesY;

        // Two-column layout for bus info (left) and passenger info (right)
        const depDateISO = booking.journeyDateISO || (booking.bus && booking.bus.departureDate ? new Date(booking.bus.departureDate).toISOString().split('T')[0] : '');
        const bookingDateISO = booking.bookingDate ? new Date(booking.bookingDate).toISOString().split('T')[0] : '';
        const passengerAge = booking.seats && booking.seats.length > 0 && booking.seats[0].passengerAge ? booking.seats[0].passengerAge : '-';
        const seatNumbers = booking.seats && booking.seats.length > 0 ? booking.seats.map(s => s.seatNumber).join(', ') : '-';

        const colGap = 20;
        const colWidth = (pageWidth - colGap) / 2;
        const leftColX = doc.x;
        const rightColX = doc.x + colWidth + colGap;
        const startY = afterImagesY;

        // Left column: Bus Information
        let leftCursorY = startY;
        doc.fontSize(13).fillColor('#000').font('Helvetica-Bold').text('Bus Information', leftColX, leftCursorY);
        leftCursorY += 18;
        doc.fontSize(11).fillColor('#444').font('Helvetica');
        doc.text(`Bus Name: ${booking.bus.busName}`, leftColX, leftCursorY);
        leftCursorY += 16;
        doc.text(`Bus Number: ${booking.bus.busNumber}`, leftColX, leftCursorY);
        leftCursorY += 16;
        doc.text(`Journey Date: ${depDateISO}`, leftColX, leftCursorY);
        leftCursorY += 16;
        doc.text(`Booking Date: ${bookingDateISO}`, leftColX, leftCursorY);
        leftCursorY += 16;
        doc.text(`Payment Status: ${(booking.paymentStatus || booking.status || 'completed').toUpperCase()}`, leftColX, leftCursorY);
        leftCursorY += 16;
        doc.text(`Payment ID: ${booking.ticketId}`, leftColX, leftCursorY);

        // Right column: Passenger Information
        let rightCursorY = startY;
        doc.fontSize(13).fillColor('#000').font('Helvetica-Bold').text('Passenger Information', rightColX, rightCursorY);
        rightCursorY += 18;
        doc.fontSize(11).fillColor('#444').font('Helvetica');
        doc.text(`Name: ${booking.user.name}`, rightColX, rightCursorY);
        rightCursorY += 16;
        doc.text(`Seat Number: ${seatNumbers}`, rightColX, rightCursorY);
        rightCursorY += 16;
        doc.text(`Age: ${passengerAge}`, rightColX, rightCursorY);
        rightCursorY += 16;
        doc.text(`Mobile: ${booking.user.mobile}`, rightColX, rightCursorY);
        rightCursorY += 16;
        doc.text(`Email: ${booking.user.email}`, rightColX, rightCursorY);

        // Move cursor to the maximum Y position of both columns
        const maxY = Math.max(leftCursorY, rightCursorY) + 10;
        doc.y = maxY;

        // Draw a divider - full width
        doc.moveTo(leftColX, doc.y).lineTo(leftColX + pageWidth, doc.y).strokeColor('#e0e0e0').stroke();
        doc.moveDown(0.8);

        // Payment box - aligned with left column
        const boxY = doc.y;
        const boxWidth = 220;
        doc.roundedRect(leftColX, boxY, boxWidth, 60, 6).stroke('#28a745');
        doc.fontSize(11).fillColor('#000').font('Helvetica-Bold').text('Payment Details', leftColX + 8, boxY + 8);
        doc.font('Helvetica').fontSize(11).fillColor('#444').text(`Total: ₹${booking.totalAmount}`, leftColX + 8, boxY + 24);
        doc.text(`Method: ${booking.paymentMethod.toUpperCase()}`, leftColX + 8, boxY + 40);
        doc.text(`Status: ${booking.status.toUpperCase()}`, leftColX + 110, boxY + 40);

        // Cancellation/refund info
        if (booking.isCancelled) {
            doc.fillColor('red').fontSize(11).text(`Refund: ₹${booking.refundAmount}`, leftColX + boxWidth + 20, boxY + 24);
            doc.fillColor('#444').text(`Cancelled on: ${booking.cancellationDate.toLocaleDateString()}`, leftColX + boxWidth + 20, boxY + 40);
        }

        // Move cursor below payment box
        doc.y = boxY + 68;
        doc.moveDown(0.6);

        // Draw a divider before instructions - full width
        doc.moveTo(leftColX, doc.y).lineTo(leftColX + pageWidth, doc.y).strokeColor('#e0e0e0').stroke();
        doc.moveDown(0.6);

        // Detailed Instructions Section - aligned with left column
        doc.fontSize(12).fillColor('#000').font('Helvetica-Bold').text('Important Instructions', leftColX, doc.y);
        doc.moveDown(0.5);
        
        const instructions = [
            '• Arrive at boarding point 30 minutes before departure time',
            '• Carry any government ID card (Aadhar/Driving License/Passport)',
            '• This ticket is non-transferable',
            '• Contact support for any changes or cancellations',
            '• Keep this ticket safe for your journey',
            '• Boarding point details will be sent via SMS/Email'
        ];

        doc.fontSize(10).fillColor('#444').font('Helvetica');
        instructions.forEach(instruction => {
            doc.text(instruction, leftColX, doc.y, { width: pageWidth });
            doc.moveDown(0.4);
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 9. Get QR code for payment (using your original image)
app.get('/api/payment-qr', (req, res) => {
    // Serve your original QR code image
    res.sendFile(path.join(__dirname, 'images', 'payment-qr.png'));
});

// 10. Initialize bus seats
app.post('/api/initialize-bus/:id', ensureDBConnection, async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.id);
        if (!bus) {
            return res.status(404).json({ error: 'Bus not found' });
        }

        // Initialize 40 seats if not already initialized
        if (bus.seats.length === 0) {
            for (let i = 1; i <= 40; i++) {
                bus.seats.push({
                    seatNumber: `S${i.toString().padStart(2, '0')}`,
                    isBooked: false
                });
            }
            await bus.save();
        }

        res.json({ message: 'Bus seats initialized' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve index.html for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    // Serve index.html for all other routes
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;

// Only start server if not in Vercel environment
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export app for Vercel serverless functions
module.exports = app;