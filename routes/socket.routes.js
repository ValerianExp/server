const ioRoutes = (io) => {
    io.on('connection', (socket) => {
        console.log('New Connection')
        socket.on('ConnectRequest', (payload) => {
            // El cliente se ha conectado a la sala
            // join
            const { room } = payload
            socket.join(room)
            socket.emit('ConnectResponse', { message: 'Te has conectado a la sala' })
        })
        // socket.on('driverConnectRequest', (payload) => {
        //     // El driver se ha conectado a la sala
        //     // join
        //     const { room } = payload
        //     socket.join(room)
        //     socket.emit('driverConnectResponse', { message: 'Te has conectado a la sala' })
        // })

    })

    // TODO en la ruta de setdriver hacer un emit al cliente
    // TODO en la ruta de finishtrip hacer un emit al cliente



}

module.exports = ioRoutes