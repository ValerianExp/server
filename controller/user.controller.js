const { isValidObjectId } = require('mongoose');
const User = require('../models/User.model');

//TODO: Create a new user, or it is done in the auth controller?

const getUser = (req, res, next) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            throw new Error('Invalid id');
        }
        User.findById(id)
            .then(user => {
                if (!user) {
                    throw new Error('User not found');
                }
                res.json(user);
            })
            .catch(next);
    } catch (error) {
        res.status(400).json({ errorMessage: err.message });
    }
}

const editUser = (req, res, next) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            throw new Error('Invalid id');
        }

        // const {
        //     email,
        //     username,
        //     password,
        //     avatar,
        //     credit,
        //     oldtrips,
        //     role,
        //     rating,
        //     carModel,
        //     carImg
        // } = req.body;

        User.findByIdAndUpdate(id, req.body, { new: true })
            .then(user => {
                if (!user) {
                    throw new Error('User not found');
                }
                res.json(user);
            })
            .catch(next);
    } catch (error) {
        res.status(400).json({ errorMessage: err.message });
    }
}

const deleteUser = (req, res, next) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            throw new Error('Invalid id');
        }
        User.findByIdAndDelete(id)
            .then(user => {
                if (!user) {
                    throw new Error('User not found');
                }
                res.json(user);
            })
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