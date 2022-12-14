const UserModel = require('../models/User.model');
const { signJwt } = require('../utils/jwt.util');
const bcrypt = require('bcryptjs');
const SALT = 10;

const SignUpController = (req, res, next) => {
    const { email, password, username, role, carModel, numberPlate } = req.body;
    const avatar = req.file ? req.file.path : undefined;
    console.log('el avatar-->', avatar)
    console.log(password)
    if (!email || !password || !username) throw new Error('Email, username and password are required')
    UserModel.findOne({ email })
        .then((user) => {
            if (user) {
                throw new Error('Email ya en uso');
            }
            const saltBcrypt = bcrypt.genSaltSync(SALT);
            const hashBcrypt = bcrypt.hashSync(password, saltBcrypt);

            return UserModel.create({ email, password: hashBcrypt, username, role, carModel, avatar, numberPlate });
        })
        .then(() => {
            res.sendStatus(201);
        })
        .catch((err) => {
            if (err.message === 'Email ya en uso') {
                res.status(400).json({ errorMessage: err.message });
                return;
            }
            next(err);
        });
};

const LoginController = (req, res, next) => {
    const { email, password } = req.body;

    UserModel.findOne({ email })
        .then((user) => {
            if (user && bcrypt.compareSync(password, user.password)) {
                res.status(200).json({ token: signJwt(user._id.toString(), user.email, user.role, user.friends) });
            } else {
                res.status(400).json({ errorMessage: 'Invalid email or password' });
            }
        })
        .catch(next);
};

module.exports = {
    SignUpController,
    LoginController,
};