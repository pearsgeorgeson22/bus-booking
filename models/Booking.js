const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus',
        required: true
    },
    seats: [{
        seatNumber: String,
        passengerName: String,
        passengerAge: Number,
        passengerGender: String
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    refundAmount: {
        type: Number,
        default: 0
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'refunded'],
        default: 'confirmed'
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    cancellationDate: Date,
    passengerDetails: {
        mobile: String,
        email: String
    },
    paymentMethod: {
        type: String,
        enum: ['upi', 'qr'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'refunded'],
        default: 'completed'
    }
    ,
    // Snapshot of journey date/time to avoid timezone shifts and future changes
    journeyDate: {
        type: Date
    },
    journeyDateISO: {
        type: String
    },
    departureTimeSnapshot: {
        type: String
    },
    arrivalTimeSnapshot: {
        type: String
    }
});

module.exports = mongoose.model('Booking', bookingSchema);