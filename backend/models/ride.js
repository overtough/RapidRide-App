const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pickup: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  destination: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  vehicleType: { type: String, default: 'Car' },
  fare: { type: Number, required: true },
  distance: { type: Number }, // in km
  duration: { type: Number }, // in minutes
  otp: { type: String }, // 4-digit OTP for ride verification
  status: { 
    type: String, 
    enum: ['requested', 'accepted', 'arrived', 'started', 'completed', 'cancelled'],
    default: 'requested'
  },
  paymentMethod: { type: String, default: 'cash' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  paymentId: { type: String }, // Razorpay payment ID
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String },
  scheduled: { type: Boolean, default: false },
  scheduledTime: { type: Date },
  createdAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date },
  startedAt: { type: Date },
  completedAt: { type: Date }
});

// Indexes for faster queries
rideSchema.index({ riderId: 1, createdAt: -1 }); // Rider history
rideSchema.index({ driverId: 1, status: 1 }); // Driver active rides
rideSchema.index({ status: 1, createdAt: -1 }); // Active rides dashboard
rideSchema.index({ driverId: 1, completedAt: -1 }); // Driver completed rides
rideSchema.index({ riderId: 1, status: 1, createdAt: -1 }); // Rider active/history
rideSchema.index({ status: 1, vehicleType: 1 }); // Ride matching by vehicle

module.exports = mongoose.model('Ride', rideSchema);
