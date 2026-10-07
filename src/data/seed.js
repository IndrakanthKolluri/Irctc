// These sample records give the simulation usable stations and routes on first launch.
export const seedUsers = [
  {
    id: 'admin-user',
    name: 'IRCTC Admin',
    email: 'admin@irctc.com',
    mobile: '9999999999',
    password: 'admin123',
    role: 'admin',
    passengers: [],
    savedCards: [],
    upiIds: [],
  },
]

export const seedStations = [
  { id: 'station-ndls', code: 'NDLS', name: 'New Delhi', city: 'Delhi' },
  { id: 'station-cnB', code: 'CNB', name: 'Kanpur Central', city: 'Kanpur' },
  { id: 'station-pnbe', code: 'PNBE', name: 'Patna Junction', city: 'Patna' },
  { id: 'station-hwh', code: 'HWH', name: 'Howrah Junction', city: 'Kolkata' },
  { id: 'station-mas', code: 'MAS', name: 'MGR Chennai Central', city: 'Chennai' },
  { id: 'station-sbc', code: 'SBC', name: 'KSR Bengaluru', city: 'Bengaluru' },
]

export const seedTrains = [
  {
    id: 'train-12301',
    number: '12301',
    name: 'Howrah Rajdhani Express',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { stationCode: 'NDLS', time: '16:55', distance: 0 },
      { stationCode: 'CNB', time: '21:20', distance: 440 },
      { stationCode: 'HWH', time: '09:55', distance: 1447 },
    ],
    classes: [
      { type: 'SL', coaches: 2, seatsPerCoach: 72, fare: 920 },
      { type: '3A', coaches: 4, seatsPerCoach: 64, fare: 2450 },
      { type: '2A', coaches: 2, seatsPerCoach: 48, fare: 3450 },
      { type: '1A', coaches: 1, seatsPerCoach: 24, fare: 5750 },
    ],
  },
  {
    id: 'train-12309',
    number: '12309',
    name: 'New Delhi Rajendra Nagar Tejas Rajdhani',
    runningDays: [0, 2, 4, 6],
    stops: [
      { stationCode: 'NDLS', time: '17:10', distance: 0 },
      { stationCode: 'CNB', time: '21:35', distance: 440 },
      { stationCode: 'PNBE', time: '07:40', distance: 1001 },
    ],
    classes: [
      { type: 'SL', coaches: 2, seatsPerCoach: 72, fare: 850 },
      { type: '3A', coaches: 4, seatsPerCoach: 64, fare: 2100 },
      { type: '2A', coaches: 2, seatsPerCoach: 48, fare: 3000 },
      { type: '1A', coaches: 1, seatsPerCoach: 24, fare: 5100 },
    ],
  },
  {
    id: 'train-12625',
    number: '12625',
    name: 'Karnataka Express',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { stationCode: 'NDLS', time: '20:20', distance: 0 },
      { stationCode: 'CNB', time: '01:45', distance: 440 },
      { stationCode: 'SBC', time: '10:30', distance: 2401 },
    ],
    classes: [
      { type: 'SL', coaches: 5, seatsPerCoach: 72, fare: 1120 },
      { type: '3A', coaches: 6, seatsPerCoach: 64, fare: 2980 },
      { type: '2A', coaches: 2, seatsPerCoach: 48, fare: 4240 },
      { type: '1A', coaches: 1, seatsPerCoach: 24, fare: 7100 },
    ],
  },
  {
    id: 'train-12622',
    number: '12622',
    name: 'Tamil Nadu Express',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { stationCode: 'NDLS', time: '22:30', distance: 0 },
      { stationCode: 'CNB', time: '03:50', distance: 440 },
      { stationCode: 'MAS', time: '07:15', distance: 2182 },
    ],
    classes: [
      { type: 'SL', coaches: 5, seatsPerCoach: 72, fare: 1050 },
      { type: '3A', coaches: 6, seatsPerCoach: 64, fare: 2750 },
      { type: '2A', coaches: 2, seatsPerCoach: 48, fare: 3920 },
      { type: '1A', coaches: 1, seatsPerCoach: 24, fare: 6600 },
    ],
  },
]

export const seedBookings = []
