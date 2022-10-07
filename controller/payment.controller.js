const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


const coins = {
    getPrice: (coinsToBuy) => {
        return { priceInCents: coinsToBuy * 100, name: `${coinsToBuy} coins` }
    }
};

const createCheckoutSession = async (req, res) => {
    // console.log(coins);

    console.log("body->", req.body);
    const { coinsToBuy } = req.body;
    console.log('====================================');
    console.log(coinsToBuy);
    console.log('====================================');
    const { priceInCents, name } = coins.getPrice(+coinsToBuy);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name,
                    },
                    unit_amount: priceInCents,
                },
                quantity: 1,
            },
        ],
        metadata: {
            coinsToBuy,
            userEmail: req.user.email,
            userId: req.user._id
        },
        mode: 'payment',
        success_url: `${process.env.ORIGIN}/success`,
        cancel_url: `${process.env.ORIGIN}/cancel`,
    });
    res.status(200).json({ url: session.url });
}

module.exports = {
    createCheckoutSession,
};