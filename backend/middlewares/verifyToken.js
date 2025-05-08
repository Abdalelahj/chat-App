const jwt = require('jsonwebtoken');


const verify = async (token) => {
    return jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            throw new Error("invalid token")
        }
        
        
       return decoded
    })

}


module.exports = verify;

