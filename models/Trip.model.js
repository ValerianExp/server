const { Schema, model } = require("mongoose");

const TripSchema = {
    from: { type: { type: { type: String }, coordinates: [Number] }, index: '2dsphere' },
    to: { type: { type: { type: String }, coordinates: [Number] }, index: '2dsphere' },
    price: { type: Number },
    client: { type: Schema.Types.ObjectId, ref: 'users' },
    driver: { type: Schema.Types.ObjectId, ref: 'users' },
    isFinished: { type: Boolean, default: false }
}

// TripSchema.index({ from: '2dsphere' });
// TripSchema.index({ to: '2dsphere' });

const TripModel = model('trips', TripSchema)

module.exports = TripModel