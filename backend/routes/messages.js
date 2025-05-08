const express = require('express');
const { getMessages,deleteMessageById,updateMessageById } = require('../controllers/message');
const auth = require('../middlewares/authentication');
const messageRouter = express.Router();




messageRouter.get("/:senderId/:receiverId", getMessages)



module.exports = messageRouter;
