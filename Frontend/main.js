var modal = document.getElementById("myModal");
var btn = document.getElementById("myBtn");
var span = document.getElementsByClassName("close")[0];

btn.onclick = function () {
    modal.style.display = "block";
}

span.onclick = function () {
    modal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

const socket = io("192.168.1.9:3000");
socket.emit("client_connect", "OK");
socket.on("device_status", (device) => {
    console.log(device);
});

socket.on("clien_getData", (data) => {
    document.getElementById('temp').innerHTML = data.temperature + "°C";
    document.getElementById('hum').innerHTML = data.humidity + " %";
    console.log(data);
});
