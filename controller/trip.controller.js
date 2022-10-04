const { isValidObjectId } = require('mongoose');
const { findById } = require('../models/Trip.model');
const tripModel = require('../models/Trip.model');
const UserModel = require('../models/User.model');
const userModel = require('../models/User.model');

const getAll = (req, res, next) => {
    const { latDriver, lngDriver, maxDistance } = req.query;
    tripModel
        .find({
            $and: [{
                from: {
                    $near: {
                        // TODO maxdistance
                        $maxDistance: maxDistance,
                        // $maxDistance: maxDistance / 111.12,
                        // $maxDistance: 1 / 111.12,
                        $geometry: {
                            type: "Point",
                            coordinates: [latDriver, lngDriver],
                        }
                    }
                }
            }, { isFinished: false }]
        })
        .populate("client")
        .then((trips) => {
            trips.filter((trip) => {
                if (!trip.isFinished) {
                    return trip;
                }
            });
            res.status(200).json(trips);
        })
        .catch(next)

    // TODO: Sort by distance
    // Show unfinished and with no driver(driver.length = 0)
};

const create = async (req, res, next) => {
    try {
        console.log('ROLE', req.user.role)
        if (req.user.role === 'CLIENT') {
            const {
                from_lat,
                from_lng,
                to_lat,
                to_lng,
                price,
                client,
            } = req.body;

            const trip = await tripModel.create({
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
            await UserModel.findByIdAndUpdate(req.user._id, { currentTrip: trip._id, inProcess: true })
            res.status(201).json(trip);
        } else {
            res.status(401).json({ errorMessage: 'Only clients can create new trips ' })
        }
    } catch (err) {
        res.status(500).json({ errorMessage: 'An error ocurred during the creation' })
    }

};

const setDriver = async (req, res, next) => {
    console.log('ROLE', req.user.role)
    if (req.user.role === 'DRIVER') {
        try {
            const { driverId } = req.query
            const { id } = req.params;
            console.log('ID', id)
            console.log('DRIVERID', driverId)
            if (!isValidObjectId(id)) {
                throw new Error('Error: Invalid mongo ID');
            }

            const trip = await tripModel.findByIdAndUpdate(id, { $addToSet: { driver: driverId } }, { new: true })
            console.log('TRIP', trip)
            // TODO updateMany
            await userModel.findByIdAndUpdate(trip.driver[0], { inProcess: true, currentTrip: trip._id })
            res.status(200).json({ trip });

        } catch (err) {
            console.log('Error')
            res.status(400).json({ errorMessage: err.message });
        }
    } else {
        res.status(401).json({ errorMessage: 'Only driver can accept trips' })
    }
};

const finishTrip = async (req, res, next) => {
    try {
        const { id } = req.params
        const trip = await tripModel.findById(id)
        console.log(trip)
        console.log(trip.driver[0]._id)
        console.log(req.user._id)
        if (req.user._id === trip.driver[0]._id.toString()) {
            const updatedTrip = await tripModel.findByIdAndUpdate(id, { isFinished: true }, { new: true })
            console.log(updatedTrip.client);
            console.log(updatedTrip.driver);
            // const aux = await tripModel.findById(tripId);
            // console.log('====================================');
            // console.log(aux);
            // console.log('====================================');

            await userModel.findOneAndUpdate({ _id: updatedTrip.client }, { $addToSet: { oldtrips: id }, $inc: { credit: -updatedTrip.price }, inProcess: false, currentTrip: undefined })
            await userModel.findOneAndUpdate({ _id: updatedTrip.driver }, { $addToSet: { oldtrips: id }, $inc: { credit: updatedTrip.price }, inProcess: false, currentTrip: undefined })
            res.status(201).json(updatedTrip)
        } else {
            res.status(401).json({ errorMessage: 'Only the driver of the trip can finished it' })
        }
    } catch (err) {
        console.log('Error: ', err)
        next(err)
    }


}

const getTrip = (req, res, next) => {
    const { tripId } = req.params
    tripModel.findById(tripId)
        .then((trip) => {
            if (trip.driver.includes(req.user._id) || trip.client.includes(req.user._id)) {
                res.status(200).json(trip)
            } else {
                res.status(401).json({ errorMessage: 'Only the driver or the client can see the trip' })
            }
        })
        .catch((err) => {
            console.log(err)
            next(err)
        })
}



module.exports = {
    getAll,
    create,
    setDriver,
    finishTrip,
    getTrip
};