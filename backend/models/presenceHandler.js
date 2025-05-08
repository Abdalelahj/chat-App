const onlineUsers = new Map();

module.exports = {
    updateUserStatus: (userId, isOnline) => {
        if (isOnline) {
            onlineUsers.set(userId, {
                lastSeen: new Date(),
                status: "online",
            });
        } else {
            if (onlineUsers.has(userId)) {
                onlineUsers.set(userId, {
                    ...onlineUsers.get(userId),
                    status: "offline",
                    lastSeen: new Date(),
                });
            }
        }
    },

    getUserStatus: (userId) => {
        return onlineUsers.get(userId)?.status || "offline";
    },

    handleDisconnect: (userId) => {
        if (onlineUsers.has(userId)) {
            onlineUsers.set(userId, {
                status: "offline",
                lastSeen: new Date(),
            });
        }
    },

    getOnlineUsers: () => {
        return Array.from(onlineUsers.entries()).map(([userId, data]) => ({
            userId,
            ...data,
        }));
    },
};
