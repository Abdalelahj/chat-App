const express = require('express');
const { register, login, getUsers } = require('../controllers/users');
const usersRouter = express.Router();



usersRouter.post("/create-users", register)
usersRouter.post("/login", login)
usersRouter.get("/getAll", getUsers)






module.exports = usersRouter;
