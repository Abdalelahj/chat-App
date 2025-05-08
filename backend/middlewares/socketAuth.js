const jwt = require('jsonwebtoken');
const authSocket = (socket, next) => {
    const headers = socket.handshake.headers

    if (!headers.token) {
        return next(new Error("invalid credential"))
    }

    jwt.verify(headers.token, process.env.SECRET, (err, decoded) => {
        if (err) {
            next(new Error("invalid token"))
        } else {
            socket.token = decoded
            socket.join(`room-${decoded.userId}`)
            console.log(`user id : ${decoded.userId} connected`);
            next()
        }
    })

}



module.exports = authSocket;
