const UserModel = require("../models/User.model");
const router = require("express").Router();
const bcrypt = require("bcrypt");

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.post('/login', (req, res, next) => {
  const { username, password } = req.body

  UserModel.findOne({ username })
    .then((user) => {
      console.log('Trying to log in with ', user)
      if (!user) {
        return res.status(400).json({ errorMessage: "Wrong credentials." });
      }
      bcrypt.compare(password, user.password).then((isSamePassword) => {
        if (!isSamePassword) {
          return res.status(400).json({ errorMessage: "Wrong credentials." });
        }
        req.session.user = user; // ??????
        // req.session.user = user._id; // ! better and safer but in this case we saving the entire user object
        console.log('Logged correctly ', user.username)
        return res.status(200).json(user);
      });
    })
    .catch(err => {
      console.log('Error while logging in: ', err)
      res.sendStatus(500)
    })

})

router.delete('/delete/:id', (req, res, next) => {
  const userId = req.params('id')
  UserModel.findByIdAndRemove(userId)
    .then(() => {
      console.log('User with id ', userId, ' deleted')
      res.sendStatus(200)
    })
    .catch(err => {
      console.log('Error while deleting user: ', err)
      res.sendStatus(500)
    })
})




module.exports = router;
