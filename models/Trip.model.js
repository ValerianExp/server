const { Schema, model } = require("mongoose");

const TripSchema = new Schema({
    from: { type: { type: String }, coordinates: [Number] },
    to: { type: { type: String }, coordinates: [Number] },
    price: { type: Number },
    client: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    driver: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    isFinished: { type: Boolean, default: false },
    passengers: [{ type: Schema.Types.ObjectId, ref: 'users' }]
},
    {
        // this second object adds extra properties: `createdAt` and `updatedAt`
        timestamps: true,
        versionKey: false
    })

TripSchema.index({ from: '2dsphere', to: '2dsphere' });
// TripSchema.index({ to: '2dsphere' });

const TripModel = model('trips', TripSchema)

module.exports = TripModel