module.exports = (app) => {
    const authRoutes = require('./auth.routes')
    app.use('/api/auth', authRoutes);

    const userRoutes = require('./user.routes')
    app.use('/api/user', userRoutes);

    // const tripRoutes = require('./trip.routes')
    // app.use('/api/trip', tripRoutes);
}