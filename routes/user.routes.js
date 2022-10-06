const router = require("express").Router();

const {
    getUser,
    editUser,
    deleteUser,
} = require('../controller/user.controller');
const multerMiddleware = require("../middleware/multer.middleware");

router.get('/me', getUser);
router.put('/:id', multerMiddleware.single('avatar'), editUser);
router.delete('/:id', deleteUser);

module.exports = router
