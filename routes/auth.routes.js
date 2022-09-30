const router = require('express').Router();
const { SignUpController, LoginController } = require('../controller/auth.controller');
const multerMiddleware = require('../middleware/multer.middleware');

//EL 'avatar' se refiere al name del input del formulario
router.post('/signup', multerMiddleware.single('avatar'), SignUpController)
router.post('/login', LoginController)

module.exports = router;