"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const express_1 = __importDefault(require("express"));
const remove = require("lodash.remove");
const app = express_1.default();
const httpServer = http_1.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    },
});
let clients = [];
let device;
var DeviceStatus;
(function (DeviceStatus) {
    DeviceStatus["ON"] = "ON";
    DeviceStatus["OFF"] = "OFF";
})(DeviceStatus || (DeviceStatus = {}));
function sendDeviceStatus(socket) {
    let deviceStatus = device != null ? DeviceStatus.ON : DeviceStatus.OFF;
    socket.emit("device_status", {
        status: deviceStatus,
    });
}
io.on("connection", (socket) => {
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
        }
        else {
            console.log(`Client ${socket.id} disconnected`);
            remove(clients, (s => s.id == socket.id));
        }
    });
});
httpServer.listen(3000, () => {
    console.log("Server start at port 3000");
});
