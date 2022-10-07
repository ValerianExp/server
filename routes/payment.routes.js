const router = require('express').Router();

const {
    createCheckoutSession
} = require('../controller/payment.controller');
const validateToken = require('../middleware/validateToken.middleware');


router.post('/checkout', validateToken, createCheckoutSession);

module.exports = router;