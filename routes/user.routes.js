const router = require("express").Router();

const {
    getUser,
    editUser,
    deleteUser
} = require('../controller/user.controller');

router.get('/:id', getUser);
router.put('/:id', editUser);
router.delete('/:id', deleteUser);

module.exports = router
