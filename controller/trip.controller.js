const { isValidObjectId } = require('mongoose');
const tripModel = require('../models/Trip.model');
const userModel = require('../models/User.model');

const getAll = (req, res, next) => {
    const { latDriver, lngDriver, maxDistance } = req.query;

    console.log('====================================');
    console.log(req.body);
    console.log('====================================');

    // const latDriver = 90;
    // const lngDriver = 90;
    tripModel
        .find({
            $and: [{
                from: {
                    $near: {
                        $maxDistance: maxDistance / 111.12,
                        // $maxDistance: 1 / 111.12,
                        $geometry: {
                            type: "Point",
                            coordinates: [latDriver, lngDriver],
                        }
                    }
                }
            }, { isFinished: false }]
        })
        // .populate('client')
        // .where('driver')
        // .near({
        //     center: { type: 'Point', coordinates: [lngDriver, latDriver] },
        //     maxDistance: 10000,
        //     spherical: true,
        // })
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
    console.log(req.body);

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

const setDriver = (req, res, next) => {
    try {
        const { driverId } = req.body
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            throw new Error('Error: Invalid mongo ID');
        }
        console.log(driverId);
        console.log(id);
        tripModel
            .findByIdAndUpdate(id, { driver: driverId }, { new: true })
            .then((trip) => {
                console.log('The updated trip is ', trip)
                res.status(200).json({ trip });
            })
            .catch(next);
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

        await userModel.findOneAndUpdate({ _id: updatedTrip.client }, { $addToSet: { oldtrips: id }, $inc: { credit: -updatedTrip.price } })
        await userModel.findOneAndUpdate({ _id: updatedTrip.driver }, { $addToSet: { oldtrips: id }, $inc: { credit: updatedTrip.price } })
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