const { isValidObjectId } = require('mongoose');
const { CLIENT } = require('../const');
const TripModel = require('../models/Trip.model');
const UserModel = require('../models/User.model');

//TODO: Create a new user, or it is done in the auth controller?

const getUser = (req, res) => {
    if (req.user) {
        UserModel.findById(req.user._id)
            .select('-password')
            .populate({ path: 'friends', select: 'username rating avatar' })
            .then((user) => {
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
// TODO manejo de errores de getAllusers y updateFriend

const getAllUsers = async (req, res) => {
    try {
        console.log(req.user)
        if (req.user) {
            const users = await UserModel.find({ $and: [{ role: CLIENT }, { _id: { $ne: req.user._id } }] })
            res.status(200).json(users)
        } else {
            throw new Error('You need to be logged in to access this part')
        }
    } catch (err) {
        res.status(401).json({ errorMessage: err.message })
    }
}

const updateFriend = async (req, res) => {
    const { id } = req.params
    const user = await UserModel.findById(req.user._id)
    const action = user.friends.includes(id) ? '$pull' : '$addToSet'
    // true if its already a friend / false if its not a friend yet

    const updatedUser = await UserModel.findByIdAndUpdate(req.user._id, { [action]: { friends: id } })


    // console.log(updatedUser)
    res.status(201).json(updatedUser)
}

const editUser = async (req, res, next) => {
    try {
        console.log(req.user)
        const { id } = req.params;
        const { existingImage } = req.body;
        const avatar = req.file ? req.file.path : existingImage;
        console.log('el avatar-->', avatar);
        if (id !== req.user._id) {
            throw new Error('Cannot edit another user')
        } else {
            if (!isValidObjectId(id)) {
                throw new Error('Invalid id');
            }

            const {
                email,
                username,
                // password,
                credit,
                oldtrips,
                role,
                rating,
                carModel,
                carImg
            } = req.body;

            console.log('====================================');
            console.log('req.user.email', req.user.email);
            console.log('email', email);
            console.log('====================================');

            if (req.user.email !== email) {
                console.log("ENTRA?");
                const emailRepe = await UserModel.findOne({ email }).select('email');
                if (emailRepe) {
                    throw new Error('Email already in use');
                }
            }

            await UserModel.findByIdAndUpdate(id, {
                email,
                username,
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
        }
    } catch (error) {
        res.status(400).json({ errorMessage: error.message });
    }
}

const deleteUser = (req, res, next) => {
    try {
        const { id } = req.params;
        if (id !== req.user._id) {
            throw new Error('Cannot delete another user')
        } else {
            if (!isValidObjectId(id)) {
                throw new Error('Invalid id');
            }
            UserModel.findByIdAndDelete(id)
                .then(user => {
                    if (!user) {
                        throw new Error('User not found');
                    }
                    return TripModel.findOneAndUpdate({ driver: { $in: [id] } }, { $pull: { driver: id } })
                    // sacamos el driver del trip, al pintar si length 0: 'Usuario no encontrado'
                })
                .then(() => {
                    return TripModel.findOneAndUpdate({ client: { $in: [id] } }, { $pull: { client: id } })
                    // sacamos el client del trip, al pintar si length 0: 'Usuario no encontrado'
                })
                .then(() => res.sendStatus(204))
                .catch(next);
        }
    } catch (error) {
        res.status(400).json({ errorMessage: err.message });
    }
}



module.exports = {
    getUser,
    editUser,
    deleteUser,
    getAllUsers,
    updateFriend
};