const insertCoins = (coins, lg) => {
    for (let i = 1; i <= lg; i++) {
        // const coin = coins[i];
        coins.set(i, { priceInCents: 100 * i, name: `${i} coin` });
    }
};

module.exports = {
    insertCoins
};