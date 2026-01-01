const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

function sanitizeText(s) {
  if (!s && s !== 0) return '';
  return String(s)
    .replace(/\u2018|\u2019|\u201A|\u201B/g, "'")
    .replace(/\u201C|\u201D|\u201E/g, '"')
    .replace(/\u2013|\u2014/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x20-\x7E]/g, '')
    .trim();
}

function sanitizeRoute(s) {
  if (!s && s !== 0) return '';
  return sanitizeText(s)
    .replace(/\s*[!¡`’'"\u2019\u2018\u201B\u201A\u201C\u201D\u201E]+\s*/g, ' - ')
    .replace(/[–—]+/g, '-')
    .replace(/\s+-\s+/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function makeSample() {
  const booking = {
    ticketId: 'SAMPLE123456',
    user: { name: 'John Doe', email: 'johndoe@example.com', mobile: '9876543210' },
    bus: {
      busName: 'SETC Express',
      busNumber: 'TN01-AN0091',
      from: "Sathankulam !’ Chennai",
      to: 'Chennai Central',
      image: 'images/bus-sample.jpg' // optional, may not exist
    },
    seats: [ { seatNumber: 'S27', passengerName: 'Vgjh', passengerAge: 28, passengerGender: 'M' } ],
    totalAmount: 450,
    paymentMethod: 'upi',
    paymentStatus: 'COMPLETED'
  };

  const outPath = path.join(__dirname, 'sample-ticket.pdf');
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // header
  doc.rect(doc.x, doc.y, pageWidth, 56).fill('#28a745');
  doc.fillColor('white').fontSize(16).text('GeoBus Booking', doc.x + 12, doc.y + 14);
  doc.fillColor('white').fontSize(9).text(`Booking ID: ${booking.ticketId}`, doc.x + 12, doc.y + 34);

  const contentTop = doc.page.margins.top + 56 + 12;

  // bus image (if exists)
  const busImagePath = booking.bus.image ? path.join(__dirname, booking.bus.image) : null;
  let imageUsedHeight = 0;
  if (busImagePath && fs.existsSync(busImagePath)) {
    try {
      const imgWidth = Math.floor(pageWidth * 0.75);
      const imgX = doc.x + Math.floor((pageWidth - imgWidth) / 2);
      doc.image(busImagePath, imgX, contentTop, { fit: [imgWidth, 120] });
      imageUsedHeight = 120;
    } catch (e) { console.log('no bus image'); }
  }

  const afterImagesY = contentTop + imageUsedHeight + 12;
  doc.y = afterImagesY;

  // Single-column content: Journey, Passengers table, Payment, Instructions
  // Journey
  doc.fontSize(13).fillColor('#22543d').text('Journey', doc.x, doc.y);
  let y = doc.y + 18;
  doc.fontSize(11).fillColor('#444').text(`Bus No: ${sanitizeText(booking.bus.busNumber)}`, doc.x, y); y += 14;
  doc.text(`Bus: ${sanitizeText(booking.bus.busName)}`, doc.x, y); y += 14;
  doc.text(`Route: ${sanitizeRoute(booking.bus.from)} - ${sanitizeRoute(booking.bus.to)}`, doc.x, y); y += 14;
  doc.text(`Date: 2025-12-27`, doc.x, y); y += 14;
  doc.text(`Departure: 21:00`, doc.x, y); y += 14;
  doc.text(`Arrival: 23:30`, doc.x, y); y += 16;
  const seatNums = booking.seats.map(s=>s.seatNumber).join(', ');
  doc.text(`Seats: ${seatNums}`, doc.x, y); y += 18;

  // Passenger table (full-width)
  doc.moveTo(doc.x, y).lineTo(doc.x + pageWidth, y).strokeColor('#e0e0e0').stroke();
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor('#000').text('Passengers', doc.x, doc.y);
  doc.moveDown(0.5);
  const tableColX = [doc.x, doc.x + 260, doc.x + 340];
  const tableStartY = doc.y;
  doc.fontSize(10).fillColor('#22543d').text('Name', tableColX[0], tableStartY);
  doc.text('Age', tableColX[1], tableStartY);
  doc.text('Gender', tableColX[2], tableStartY);
  let rowY = tableStartY + 14;
  booking.seats.forEach(seat => {
    doc.fillColor('#000').fontSize(10).text(`${sanitizeText(seat.passengerName)}`, tableColX[0], rowY);
    doc.text(seat.passengerAge ? `${seat.passengerAge}` : '-', tableColX[1], rowY);
    doc.text(seat.passengerGender || '-', tableColX[2], rowY);
    rowY += 14;
  });
  doc.y = rowY + 8;

  // payment box (after passengers)
  const boxY = doc.y;
  doc.roundedRect(doc.x, boxY, 340, 80, 6).stroke('#28a745');
  doc.fontSize(12).fillColor('#000').text('Payment Details', doc.x + 10, boxY + 8);
  doc.fontSize(11).fillColor('#444').text(`Total: ₹${booking.totalAmount}`, doc.x + 10, boxY + 28);
  doc.text(`Method: ${booking.paymentMethod.toUpperCase()}`, doc.x + 10, boxY + 46);
  doc.text(`Status: ${booking.paymentStatus}`, doc.x + 180, boxY + 46);
  doc.fontSize(10).fillColor('#444').text(`Transaction ID: SAMPLE_TXN_1234`, doc.x + 10, boxY + 66);
  doc.y = boxY + 96;

  // Important Instructions block (placed below payment box)
  const instrY = doc.y;
  doc.moveTo(doc.x, instrY - 6).lineTo(doc.x + pageWidth, instrY - 6).strokeColor('#e0e0e0').stroke();
  doc.fontSize(12).fillColor('#22543d').text('Important Instructions', doc.x, instrY);
  let insY = instrY + 14;
  const instructions = [
    'Arrive at boarding point 30 minutes before departure',
    'Carry original ID proof (Aadhar/Driving License/Passport)',
    'Show this e-ticket at the time of boarding',
    'Keep ticket safe until journey completion',
    'For cancellations, visit My Bookings section'
  ];
  doc.fontSize(9).fillColor('#444');
  instructions.forEach(line => { doc.text(`* ${line}`, doc.x + 6, insY, { width: pageWidth - 12 }); insY += 12; });
  doc.fontSize(10).fillColor('#000').text('Customer Care: 1234567890 | Email: geopears04@gmail.com', doc.x, insY + 6);
  doc.y = insY + 16;

  // footer
  doc.moveTo(doc.x, doc.page.height - 60).lineTo(doc.x + pageWidth, doc.page.height - 60).strokeColor('#e0e0e0').stroke();
  doc.fontSize(8).fillColor('#666').text('Please carry a valid ID. This ticket is non-transferable. Contact support for changes.', doc.x, doc.page.height - 50, { width: pageWidth, align: 'center' });

  doc.end();

  stream.on('finish', () => {
    console.log('Sample ticket written to', outPath);
  });
}

makeSample().catch(err => console.error(err));
