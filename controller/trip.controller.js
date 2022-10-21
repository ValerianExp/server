const { isValidObjectId } = require('mongoose');
const tripModel = require('../models/Trip.model');
const userModel = require('../models/User.model');

const getAll = async (req, res, next) => {
    try {
        const { latDriver, lngDriver, maxDistance } = req.query;
        // console.log('LATDRIVER', latDriver)
        // console.log('TYPEOF', typeof latDriver)
        // console.log(latDriver === 'undefined')
        if (latDriver === 'undefined' || lngDriver === 'undefined') throw new Error('Location invalid, please enable geolocation')
        const trips = await tripModel
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
                                coordinates: [lngDriver, latDriver],
                            }
                        }
                    }
                }, { isFinished: false }, { driver: { $size: 0 } }]
            })
            .populate("client")
        res.status(200).json(trips);
        // TODO: Sort by distance
    } catch (err) {
        // console.log(err.message)
        // res.json(err)

        res.status(401).json({ errorMessage: err.message })

    }

};

const create = async (req, res, next) => {
    try {
        // console.log('ROLE', req.user.role)
        if (req.user.role !== 'CLIENT') throw new Error(' Only clients can create new trips ')
        if (req.user.inProcess) throw new Error('Cant request a new trip if you are already in one')
        if (req.user.credit < 0) throw new Error('Cant book a trip if you have negative credit')


        const {
            from_lat,
            from_lng,
            to_lat,
            to_lng,
            price,
            client,
        } = req.body;

        // console.log(client)

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
            passengers: [req.user._id]
        })
        const clients = await Promise.all(
            trip.client.map(client => {
                return userModel.findByIdAndUpdate(client, { currentTrip: trip._id, inProcess: true })
            })
        )
        // await userModel.findByIdAndUpdate(req.user._id, { currentTrip: trip._id, inProcess: true })
        // separate between one client  trips and multiple passengers trips
        if (clients.length === 1) {
            // req.io.emit('confirmTrip', { confirmTrip: 'New trip has been confirmed' })
            console.log('Emit newTrips')
            req.io.emit('newTrips', { newTrip: { _id: trip._id, client: trip.client } })
            console.log('Emit newTrips')
            res.status(201).json(trip);
        } else {
            console.log('pendingTrips')
            req.io.emit('pendingTrips', { newTrip: { _id: trip._id, client: trip.client } })
            res.status(201).json(trip);
        }

        // DRIVERS LISTEN TO CONFIRM TRIPS CLIENTS LISTEN TO NEW TRIPS


    } catch (err) {
        // console.log(err.message)
        // res.json(err)

        res.status(401).json({ errorMessage: err.message })

    }

};

const acceptTrip = async (req, res, next) => {
    try {
        const { id } = req.params
        const trip = await tripModel.findByIdAndUpdate(id, { $addToSet: { passengers: req.user._id } }, { new: true })
            .populate({ path: 'client', select: 'username rating avatar ' })
        req.io.to(trip._id.toString()).emit('RefreshTrip', { trip })
        if (trip.client.length === trip.passengers.length) {
            console.log(req.io)
            req.io.local.emit('newTrips', { newTrip: { _id: trip._id, client: trip.client } })
        }
        console.log(trip)
        res.status(203).json({ trip })
    } catch (err) {
        next(err)
    }

}

const confirmTrip = (req, res, next) => {
    req.io.emit('confirmTrip', { confirmTrip: 'New trip has been confirmed' })

}

const cancelTrip = async (req, res, next) => {
    try {
        const { id } = req.params
        const trip = await tripModel.findByIdAndDelete(id)
        const clients = await Promise.all(
            trip.client.map(client => {
                return userModel.findByIdAndUpdate(client, { inProcess: false, currentTrip: null }, { new: true })
            })
        )
        // const client = await userModel.findByIdAndUpdate(trip.client[0], { $addToSet: { oldtrips: id }, $inc: { credit: -trip.price }, $push: { rating: rating }, inProcess: false, currentTrip: null }, { new: true })
        const driver = await userModel.findByIdAndUpdate(trip.driver[0], { inProcess: false, currentTrip: null }, { new: true })
        // console.log('Client', clients)
        // console.log('Driver', driver)
        // TODO cambiar a === 0

        console.log('ROOM-------------->', trip._id.toString())
        if (trip.client.length !== trip.passengers.length) {
            console.log('LIO')
            req.io.to(trip._id.toString()).emit('RefreshTrip', { message: 'This trip has been cancelled' })
        } else {
            req.io.emit('newTrips', { message: 'A trip has been cancelled' })
            req.io.to(trip._id.toString()).emit('RefreshTrip', { message: 'This trip has been cancelled' })
            console.log('A trip has been cancelled')
        }

        res.sendStatus(204)

    }
    catch (err) {
        next(err)
    }
}

const setDriver = async (req, res, next) => {
    // console.log('ROLE', req.user.role)
    try {
        const { driverId } = req.query
        const { id } = req.params;
        const currentTrip = await tripModel.findById(id)
        // console.log('CURRENT TRIP', currentTrip)
        if (currentTrip.driver.length !== 0) throw new Error('This trip has already been requested by another driver')
        if (req.user.role !== 'DRIVER') throw new Error('Only driver can accept trips')
        if (req.user.inProcess) throw new Error('Cant accept a new trip if your already in one')
        else {
            // console.log('ID', id)
            // console.log('DRIVERID', driverId)
            if (!isValidObjectId(id)) {
                throw new Error('Error: Invalid mongo ID');
            }

            const trip = await tripModel
                .findByIdAndUpdate(id, { $addToSet: { driver: driverId } }, { new: true })
                .populate({ path: 'client', select: 'username rating avatar ' })
                .populate({ path: 'driver', select: 'username rating avatar carModel numberPlate' })
            // console.log('TRIP', trip)
            // TODO updateMany
            // console.log('IO: ', req.io)

            req.io.to(trip._id.toString()).emit('RefreshTrip', { trip })
            await userModel.findByIdAndUpdate(trip.driver[0], { inProcess: true, currentTrip: trip._id })
            res.status(200).json({ trip });

        }
    } catch (err) {
        // console.log(err.message)
        // res.json(err)

        res.status(401).json({ errorMessage: err.message })

    }
}

const finishTrip = async (req, res, next) => {
    try {
        const { id } = req.params
        const { rating } = req.query
        const trip = await tripModel.findById(id)
        if (req.user._id === trip.driver[0]._id.toString()) {
            const updatedTrip = await tripModel.findByIdAndUpdate(id, { isFinished: true }, { new: true })
            // console.log('TRIP', trip)
            // console.log(updatedTrip.client[0])
            const clients = await Promise.all(
                updatedTrip.client.map(client => {
                    return userModel.findByIdAndUpdate(client, { $addToSet: { oldtrips: id }, $inc: { credit: -updatedTrip.price / updatedTrip.client.length }, $push: { rating: rating }, inProcess: false, currentTrip: null }, { new: true })
                })
            )
            // const client = await userModel.findByIdAndUpdate(updatedTrip.client[0], { $addToSet: { oldtrips: id }, $inc: { credit: -updatedTrip.price }, $push: { rating: rating }, inProcess: false, currentTrip: null }, { new: true })
            const driver = await userModel.findByIdAndUpdate(updatedTrip.driver[0], { $addToSet: { oldtrips: id }, $inc: { credit: updatedTrip.price }, inProcess: false, currentTrip: null }, { new: true })
            console.log('Client', clients)
            console.log('Driver', driver)
            req.io.to(trip._id.toString()).emit('RefreshTrip', { trip: updatedTrip })
            res.status(201).json(updatedTrip)
        } else {
            res.status(401).json({ errorMessage: 'Only the driver of the trip can finished it' })
        }
    } catch (err) {
        // console.log('Error: ', err)
        next(err)
    }


}

const getTrip = (req, res, next) => {
    const { tripId } = req.params
    tripModel.findById(tripId)
        .populate({ path: 'client', select: 'username rating avatar ' })
        .populate({ path: 'driver', select: 'username rating avatar carModel numberPlate' })
        .then((trip) => {
            // console.log(trip.client)
            // console.log(req.user._id)
            // console.log(trip.client.includes(req.user._id.toString()))
            const ids = trip.client.map(c => c._id.toString())
            console.log(ids)
            console.log(ids.includes(req.user._id.toString()))
            console.log(req.user._id)
            // ids.includes(req.user._id.toString())
            if (trip.driver[0]?._id.toString() === req.user._id || ids.includes(req.user._id)) {
                res.status(200).json(trip)
            } else {
                res.status(401).json({ errorMessage: 'Only the driver or the client can see the trip' })
            }
        })
        .catch((err) => {
            // console.log(err)
            next(err)
        })
}

const rateDriver = async (req, res, next) => {
    try {
        const { id } = req.params
        const { rating } = req.query
        // console.log(id, rating)
        const trip = await tripModel.findById(id)
        // console.log(trip)
        console.log(trip.client)
        console.log(req.user._id)
        console.log((trip.client.includes(req.user._id)))
        if (trip.client.includes(req.user._id)) {
            const driver = await userModel.findByIdAndUpdate(trip.driver[0], { $push: { rating: rating } }, { new: true })
            // console.log('DRIVER', driver)
            res.sendStatus(200)
        } else {
            res.status(401).json({ errorMessage: 'No authorizatinon' })
        }
    } catch (err) {
        // console.log(err)
        next(err)
    }

}


module.exports = {
    getAll,
    create,
    setDriver,
    finishTrip,
    getTrip,
    rateDriver,
    cancelTrip,
    acceptTrip
}