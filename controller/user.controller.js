const { isValidObjectId } = require('mongoose');
const TripModel = require('../models/Trip.model');
const UserModel = require('../models/User.model');

//TODO: Create a new user, or it is done in the auth controller?

const getUser = (req, res, next) => {
    if (req.user) {
        UserModel.findById(req.user._id).select('-password').then((user) => {
            if (user) {
                res.status(200).json(user)
            } else {
                res.sendStatus(404);
            }
        })
    } else {
        res.sendStatus(401);
    }
}

const editUser = (req, res, next) => {
    try {
        console.log(req.user)
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            throw new Error('Invalid id');
        }

        const {
            email,
            username,
            password,
            avatar,
            credit,
            oldtrips,
            role,
            rating,
            carModel,
            carImg
        } = req.body;

        UserModel.findByIdAndUpdate(id, {
            email,
            username,
            password,
            avatar,
            credit,
            oldtrips,
            role,
            rating,
            carModel,
            carImg
        }, { new: true })
            .then(user => {
                if (!user) {
                    throw new Error('User not found');
                }
                res.status(200).json(user);
            })
            .catch(next);
    } catch (error) {
        res.status(400).json({ errorMessage: err.message });
    }
}

const deleteUser = (req, res, next) => {
    try {
        const { id } = req.params;
        console.log(req.user)
        if (!isValidObjectId(id)) {
            throw new Error('Invalid id');
        }
        UserModel.findByIdAndDelete(id)
            .then(user => {
                if (!user) {
                    throw new Error('User not found');
                }
                // return TripModel.findOneAndUpdate({ driver: { $in: [id] } }, { $pull: { driver: id } })
                // sacamos el driver del trip, al pintar si no tiene nada puesto: 'Usuario no encontrado'
            })
            .then(() => {
                // return TripModel.findOneAndUpdate({ client: { $in: [id] } }, { $pull: { client: id } })
                // sacamos el client del trip, al pintar si no tiene nada puesto: 'Usuario no encontrado'
            })
            .then(() => res.sendStatus(204))
            .catch(next);
    } catch (error) {
        res.status(400).json({ errorMessage: err.message });
    }
}

module.exports = {
    getUser,
    editUser,
    deleteUser
};