const router = require('express').Router();
const { SignUpController, LoginController } = require('../controller/auth.controller')

router.post('/signup', SignUpController)
router.post('/login', LoginController)

module.exports = router;
