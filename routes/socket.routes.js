const ioRoutes = (io) => {
    io.on('connection', (socket) => {
        socket.on('ConnectRequest', ({ room }) => {
            console.log('New Room Connection')
            // El cliente se ha conectado a la sala
            // join

            socket.join(room)
            socket.emit('ConnectResponse', { message: `Te has conectado a la sala ${room}` })
        })

        socket.on('ConnectGeneral', () => {
            console.log('General Connection')
        })

        socket.on('Disconnect', ({ message }) => {
            console.log(message)
        })

        socket.on('tripCancel', (payload) => {
            console.log('NEW TRIPS SOCKET ROUTES ', payload)
            socket.broadcast.emit('newTrips', { message: 'A trip has been cancelled' })
        })

    })

    // TODO en la ruta de setdriver hacer un emit al cliente
    // TODO en la ruta de finishtrip hacer un emit al cliente

}

module.exports = ioRoutes