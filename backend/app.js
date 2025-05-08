require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').createServer(app)
const cors = require('cors');
const authSocket = require('./middlewares/socketAuth');
const errorHandler = require('./middlewares/errorHandler');
const db_connection = require("./models/db");
const connection = require('./models/connectionSocket');
app.use(cors())
const io = require('socket.io')(server,{cors:{origin:'*'}});
const PORT = process.env.PORT || 5000
io.use(authSocket)
io.on('connection', connection(io))
app.use(express.json());


//requiring Routers
const userRouter = require('./routes/users');
const messageRouter = require('./routes/messages');
//use Routers
app.use("/user", userRouter)
app.use("/messages", messageRouter)

app.use(errorHandler)
server.listen(5000, () => {
    console.log(`server listening on http://localhost:${PORT}`);
})