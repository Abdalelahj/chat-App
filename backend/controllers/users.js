const userModel = require("../models/userSchema");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {
    const { username, password } = req.body
    console.log(username, password);

    try {
        const new_User = new userModel({
            username, password
        })
        await new_User.save()
        res.status(201).json({success:true,message:"user created successfully"})
    } catch (error) {
        console.log(error);
        
        next(error)
    }
}


const login = async (req, res, next) => {
    const { username, password } = req.body
    try {
        const foundUser = await userModel.findOne({ username })
        if (foundUser) {
            const valid = await bcrypt.compare(password, foundUser.password)
            if (!valid) {
                return res.status(403).json({
                    success: false,
                    message: `The email doesn't exist or The password you’ve entered is incorrect`,
                });
            } else {
                const opt = {
                    expiresIn: '1h'
                }
                const payload = {
                    userId: foundUser._id,
                    username: foundUser.username
                }
                const token = jwt.sign(payload, process.env.SECRET, opt)
                res.status(200).json({
                    message: "login successfully",
                    token
                })

            }
        } else {
            return res.status(403).json({
                success: false,
                message: `The email doesn't exist or The password you’ve entered is incorrect`,
            });
        }
    } catch (error) {
        next(error)
    }
}

const getUsers = async (req, res, next) => {
    try {
        const users = await userModel.find({})
        res.status(200).json(users)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    register,
    login,
    getUsers
};
