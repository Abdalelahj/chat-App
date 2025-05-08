const socketHandler = require("../controllers/socket-handlers");
const { updateUserStatus, handleDisconnect } = require("./presenceHandler");
const verify = require("../middlewares/verifyToken");

module.exports = (io) => {
  const clients = new Map();

  return async (socket) => {
    try {
      const token = socket.handshake.headers.token;
      const user = await verify(token);

      if (!user) {
        return socket.disconnect(true);
      }

      // Store connection info
      socket.userId = user.userId;

      // Update presence
      updateUserStatus(user.userId, true);
      socket.join(`user-${user.userId}`);

      // Initialize other handlers
      socketHandler(socket, clients);

      // Cleanup on disconnect
      socket.on("disconnect", () => {
        handleDisconnect(user.userId);
      });
    } catch (error) {
      console.error("Connection error:", error);
      socket.disconnect(true);
    }
  };
};

