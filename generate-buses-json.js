const fs = require('fs');

// Usage:
// node generate-buses-json.js --start=2025-12-19 --days=90 --batches=1 --out=buses-to-import.json
// Defaults: start=today, days=90, batches=1, out=buses-to-import.json

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { start: null, days: 90, batches: 1, outFile: 'buses-to-import.json' };
  args.forEach(a => {
    if (a.startsWith('--start=')) out.start = a.split('=')[1];
    if (a.startsWith('--days=')) out.days = parseInt(a.split('=')[1], 10);
    if (a.startsWith('--batches=')) out.batches = parseInt(a.split('=')[1], 10);
    if (a.startsWith('--out=')) out.outFile = a.split('=')[1];
  });
  return out;
}

function toDateOnlyUTC(d) {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0));
}

function makeDocs(startStr, days, batches) {
  const docs = [];
  const start = startStr ? new Date(startStr) : new Date();
  for (let b = 0; b < batches; b++) {
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + b * days + i);
      const dateUTC = toDateOnlyUTC(d);
      const dateISO = dateUTC.toISOString();
      const dateLabel = dateISO.split('T')[0];

      const seats = [];
      for (let s = 1; s <= 40; s++) seats.push({ seatNumber: `S${s.toString().padStart(2, '0')}`, isBooked: false });

      docs.push({
        busNumber: `MH01014-${dateLabel}`,
        busName: 'Mercedes Benz',
        image: 'images/bus-placeholder.jpg',
        from: 'Mumbai',
        to: 'Pune',
        departureTime: '21:00',
        arrivalTime: '00:00',
        price: 500,
        totalSeats: 40,
        availableSeats: 40,
        departureDate: { "$date": dateISO },
        isActive: true,
        seats
      });
    }
  }
  return docs;
}

(function main(){
  const opts = parseArgs();
  const docs = makeDocs(opts.start, opts.days, opts.batches);
  fs.writeFileSync(opts.outFile, JSON.stringify(docs, null, 2));
  console.log(`Wrote ${opts.outFile} with ${docs.length} documents (${opts.batches} batch(es) x ${opts.days} days)`);
})();
