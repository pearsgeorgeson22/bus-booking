const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    busNumber: {
        type: String,
        required: true,
        unique: true
    },
    busName: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: 'images/bus1.jpg'
    },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    departureTime: {
        type: String,
        required: true
    },
    arrivalTime: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    totalSeats: {
        type: Number,
        default: 40
    },
    availableSeats: {
        type: Number,
        default: 40
    },
    departureDate: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    seats: [{
        seatNumber: String,
        isBooked: {
            type: Boolean,
            default: false
        },
        bookedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
});

module.exports = mongoose.model('Bus', busSchema);