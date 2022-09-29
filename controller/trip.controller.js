const { isValidObjectId } = require('mongoose');
const tripModel = require('../models/Trip.model');
const userModel = require('../models/User.model');

const getAll = (req, res, next) => {
    tripModel.find({ isFinished: false })
        .then((trips) => res.status(200).json(trips))
        .catch(next)

    // TODO: Sort by distance
};

const create = (req, res, next) => {
    const {
        from_lat,
        from_lng,
        to_lat,
        to_lng,
        price,
        client,
    } = req.body;

    tripModel
        .create({
            from: {
                type: 'Point',
                coordinates: [from_lng, from_lat],
            },
            to: {
                type: 'Point',
                coordinates: [to_lng, to_lat]
            },
            price,
            client,
        })
        .then(() => {
            res.sendStatus(201);
        })
        .catch(next);
};

const setDriver = async (req, res, next) => {
    try {
        const { driverId } = req.body
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            throw new Error('Error: Invalid mongo ID');
        }

        const trip = await tripModel.findByIdAndUpdate(id, { driver: driverId }, { new: true })
        await userModel.findByIdAndUpdate(trip.client[0], { inProcess: true })
        await userModel.findByIdAndUpdate(trip.driver[0], { inProcess: true })
        res.status(200).json({ trip });

    } catch (err) {
        res.status(400).json({ errorMessage: err.message });
    }
};

const finishTrip = async (req, res, next) => {
    try {
        const { id } = req.params
        const updatedTrip = await tripModel.findByIdAndUpdate(id, { isFinished: true }, { new: true })
        console.log(updatedTrip.client);
        console.log(updatedTrip.driver);
        // const aux = await tripModel.findById(tripId);
        // console.log('====================================');
        // console.log(aux);
        // console.log('====================================');

        await userModel.findOneAndUpdate({ _id: updatedTrip.client }, { $addToSet: { oldtrips: id }, $inc: { credit: -updatedTrip.price }, inProcess: false })
        await userModel.findOneAndUpdate({ _id: updatedTrip.driver }, { $addToSet: { oldtrips: id }, $inc: { credit: updatedTrip.price }, inProcess: false })
        res.sendStatus(201)
    } catch (err) {
        console.log('Error: ', err)
        next(err)
    }
}



module.exports = {
    getAll,
    create,
    setDriver,
    finishTrip
};