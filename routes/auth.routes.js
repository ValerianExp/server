const router = require("express").Router();
const SALT = Number(process.env.SALT);
const bcrypt = require('bcryptjs');
const UserModel = require('../models/User.model');
const { DRIVER, CLIENT } = require("../const");


// You put the next routes here 👇
// example: router.use("/auth", authRoutes)

//GET ROUTE SIGNUP
router.get("/signup", (req, res, next) => {
  // res.json("");
  res.json("auth/signup");
});


//POST ROUTE SIGNUP
router.post("/signup", (req, res, next) => {
  const { email, username, password, avatar, credit, oldTrips, role, rating, carModel, carImg } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: "All fields are mandatory" });
    return;
  }
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res.status(400).json({
      message:
        "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }
  const salt = bcrypt.genSaltSync(SALT);
  const hashPass = bcrypt.hashSync(password, salt);
  if (user === "driver") {
    UserModel.create({ email, username, password: hashPass, avatar, credit, oldTrips, role: DRIVER, rating, carModel, carImg })
      .then((user) => {
        user.password = "*";
        res.status(200).json(user);
      })
      .catch((err) => {
        if (err.code === 11000) {
          res.status(400).json({
            message: "Username needs to be unique. Username is already in use.",
          });
        } else {
          res.status(500).json({ message: "Something went wrong" });
        }
      });
  }
  if (user === "client") {
    UserModel.create({ email, username, password: hashPass, avatar, credit, oldTrips, role: CLIENT })
      .then((user) => {
        user.password = "*";
        res.status(200).json(user);
      })
      .catch((err) => {
        if (err.code === 11000) {
          res.status(400).json({
            message: "Username needs to be unique. Username is already in use.",
          });
        } else {
          res.status(500).json({ message: "Something went wrong" });
        }
      });
  }
});

// CLOSE SESSION
router.post("/logout", (req, res, next) => {
  // req.session.destroy();
  //TODO: tokens
  res.status(204).send({ message: "Logged out" });
});



module.exports = router;

