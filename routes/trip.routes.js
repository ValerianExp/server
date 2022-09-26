const router = require('express').Router();

const {
    getAll,
    create,
    setDriver,
    finishTrip,
} = require('../controller/trip.controller');
/**
 * GET
 */
router.get('/all', getAll);


/**
 * POST
 */
router.post('/new', create);

/**
 * PUT
 */
router.put('/:id/driver', setDriver);
router.put('/:id/finish', finishTrip)

module.exports = router;