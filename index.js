const { createServer } = require("http");
const { Server } = require("socket.io");
const socket = require("./modules/socket");
const express = require("./modules/express");


const httpServer = createServer(express);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

socket(io);

httpServer.listen(process.env.PORT, () => {
  console.log(`Express server started ${process.env.PORT}`);
});
