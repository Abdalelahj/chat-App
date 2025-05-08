const jwt = require('jsonwebtoken');
const auth = (req, res, next) => {
    const headers = req.headers
    if (!headers.authorization) {
        return res.status(403).json("Forbidden")
    }
    const token = headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json("invalid token")
        }
        // req.token = decoded
        next()
    })

}


module.exports = auth;

