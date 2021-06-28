import { createServer } from "http";
import { Server, Socket } from "socket.io";
import express, { Application, Request, Response } from "express";
import remove = require("lodash.remove");
import ip = require("ip");
import mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  },
});

let clients: Array<Socket> = [];
let device: Socket | null;

enum DeviceStatus {
  ON = "ON",
  OFF = "OFF",
}

const dataSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  createAt: { type: Date, default: Date.now }
});

const data = mongoose.model("Data", dataSchema);

mongoose.connect("mongodb+srv://Admin:01664983385TUan@iot.jvz5x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});
let mydb = mongoose.connection;
mydb.on("error", console.error.bind(console, 'connection error'));
mydb.on("open", function() {
  console.log('ok');
});


function sendDeviceStatus(socket: Socket) {
  let deviceStatus = device != null ? DeviceStatus.ON : DeviceStatus.OFF;
  socket.emit("device_status", {
    status: deviceStatus,
  });
}

io.on("connection", (socket: Socket) => {
  socket.on("device_sendData", (...args) => {
    data.create(JSON.parse(JSON.stringify(args[0]))).then(x => {

    }).catch(err => {
      console.log(err);
    });
    clients.forEach(s => {
      s.emit("clien_getData", args[0]);
    })
  });

  socket.on("client_connect", (...args) => {
    clients.push(socket);
    sendDeviceStatus(socket);
    console.log(`Client ${socket.id} connected`);
  });

  socket.on("device_connect", (...args) => {
    console.log("Device connected");
    device = socket;
  });

  socket.on("disconnecting", () => {
    if (device != null && device.id == socket.id) {
      device = null;
      sendDeviceStatus(socket);
      console.log("Device disconnected");
    } else {
      console.log(`${socket.id} disconnected`);
      remove(clients, (s => s.id == socket.id));
    }
  });
});

app.get('/getAll', async (req, res) => {
  let responseJson = await data.find({});
  res.json(responseJson);
});

httpServer.listen(PORT, () => {
  console.log("Server start at " + ip.address() + `:${PORT}`);
});
