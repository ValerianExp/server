const router = require('express').Router();

const {
    getAll,
    create,
    setDriver,
    finishTrip,
    getTrip
} = require('../controller/trip.controller');
/**
 * GET
 */
router.get('/all', getAll);
router.get('/:tripId', getTrip)


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