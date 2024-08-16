// Creamos una instancia de Socket.io desde el Front

const socket = io();

// Creamos una variable para guardar el usuario.
let user;

document.addEventListener('DOMContentLoaded', function() {
    socket.emit("init", {});

})

const chatBox = document.getElementById("chatBox");

user = document.getElementById('user').getAttribute('username');

chatBox.addEventListener("keyup", (event) => {
    if(event.key === "Enter") {
        if(chatBox.value.trim().length > 0) {
            socket.emit("message", {user: user, message: chatBox.value});
            chatBox.value="";
        }
    }
})


var dateFromObjectId = function (oid) {
    var timestamp = parseInt(oid.substring(0, 8), 16) * 1000;
    var dateObj = new Date(timestamp);

    // Obtener componentes de fecha y hora
    var year = dateObj.getFullYear();
    var month = ('0' + (dateObj.getMonth() + 1)).slice(-2); // Agregar 1 a getMonth() porque enero es 0
    var day = ('0' + dateObj.getDate()).slice(-2);
    var hours = ('0' + dateObj.getHours()).slice(-2);
    var minutes = ('0' + dateObj.getMinutes()).slice(-2);
    var seconds = ('0' + dateObj.getSeconds()).slice(-2);

    // Formatear la fecha y la hora
    var formattedDateTime = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;

    return formattedDateTime;
};

// Listener de mensajes
socket.on("messagesLogs", (data) => {
    const log = document.getElementById("messagesLogs");
    let messages = "";
    data.forEach( message => {
        timeStamp = dateFromObjectId(message._id);
        messages = messages + `[${timeStamp}] ${message.user}: ${message.message} <br>`;
    })
    log.innerHTML = messages;
    log.scrollTop = log.scrollHeight;
})