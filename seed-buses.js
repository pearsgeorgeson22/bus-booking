const mongoose = require('mongoose');
const Bus = require('./models/Bus');
require('dotenv').config();

// Usage: set MONGODB_URI in .env then run: node seed-buses.js
// This script will create one bus document per date in the given range.

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const base = {
    busNumber: 'MH01-1001',
    busName: 'Express Line',
    image: 'images/bus1.jpg',
    from: 'Mumbai',
    to: 'Pune',
    departureTime: '20:00',
    arrivalTime: '23:00',
    price: 500,
    totalSeats: 40,
    availableSeats: 40,
    isActive: true
  };

  const start = new Date('2025-12-23');
  const end = new Date('2025-12-30');

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Store at UTC midnight for the date to avoid timezone display shifts
    const dateUTC = new Date(Date.UTC(year, d.getMonth(), d.getDate(), 0, 0, 0));

    const busNumberForDate = `${base.busNumber}-${dateStr}`;

    // Check if a bus with same route and date already exists
    const exists = await Bus.findOne({ from: base.from, to: base.to, departureDate: dateUTC });
    if (exists) {
      console.log('Skipped (exists):', dateStr);
      continue;
    }

    // generate seats
    const seats = [];
    for (let i = 1; i <= (base.totalSeats || 40); i++) {
      seats.push({ seatNumber: `S${i.toString().padStart(2, '0')}`, isBooked: false });
    }

    const doc = {
      ...base,
      busNumber: busNumberForDate,
      departureDate: dateUTC,
      seats,
      availableSeats: seats.length
    };

    await Bus.create(doc);
    console.log('Inserted:', dateStr);
  }

  await mongoose.disconnect();
  console.log('Seeding complete');
}

seed().catch(err => { console.error(err); process.exit(1); });
