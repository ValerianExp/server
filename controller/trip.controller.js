const { isValidObjectId } = require('mongoose');
const tripModel = require('../models/Trip.model');
const userModel = require('../models/User.model');

const getAll = (req, res, next) => {
    tripModel.find()
        .then((trips) => res.status(200).json(trips))
        .catch(next)

    // TODO: Sort by distance
};

const create = (req, res, next) => {
    const {
        from,
        to,
        price,
        client,
    } = req.body;
    console.log(req.body);

    tripModel.create({
        from,
        to,
        price,
        client,
    })
        .then(() => {
            res.sendStatus(201);
        })
        .catch(next);
};

const setDriver = (req, res, next) => {
    try {
        const { driverId } = req.body
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            throw new Error('Error: Invalid mongo ID');
        }
        tripModel
            .findByIdAndUpdate(id, { driver: driverId }, { new: true })
            .then((trip) => {
                console.log('The updated trip is ', trip)
                res.sendStatus(204);
            })
            .catch(next);
    } catch (err) {
        res.status(400).json({ errorMessage: err.message });
    }
};

const finishTrip = async (req, res, next) => {
    try {
        const { tripId } = req.params
        const updatedTrip = await tripModel.findByIdAndUpdate(tripId, { isFinished: true })
        await userModel.findOneAndUpdate(updatedTrip.client, { $addToSet: { oldtrips: tripId }, $inc: { credit: -updatedTrip.price } })
        await userModel.findOneAndUpdate(updatedTrip.driver, { $addToSet: { oldtrips: tripId }, $inc: { credit: updatedTrip.price } })
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