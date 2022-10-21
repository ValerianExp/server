const router = require("express").Router();

const {
    getUser,
    editUser,
    deleteUser,
    getAllUsers,
    updateFriend
} = require('../controller/user.controller');
const multerMiddleware = require("../middleware/multer.middleware");

router.get('/me', getUser);
router.get('/all', getAllUsers)
router.put('/:id', multerMiddleware.single('avatar'), editUser);
router.put('/:id/friend', updateFriend)
router.delete('/:id', deleteUser);

module.exports = router
