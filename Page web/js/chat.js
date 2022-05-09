window.onload = function() {
    document.addEventListener('keydown', function(event) {
        if (event.code == 'Enter' || event.keyCode == 'Enter') {
            emitmsg()
        }
    });


    function pageScroll() {
        var height = 0;
        $('section p').each(function(i, value) {
            height += parseInt($(this).height());
        });

        height += '';

        $('section').animate({
            scrollTop: height
        });
    }

    var message = $("#message");
    var chatroom = $("#chatroom")
    var feedback = $("#feedback")

    var username = "Anonymous"
    console.log(document.location.origin)

    fetch(`${document.location.origin}/username`, {
            method: "GET",
        })
        .then((response) => response.json())
        .then((result) => {
            console.log(JSON.parse(result).user)
            username = JSON.parse(result).user
        })
        .catch((error) => {
            console.error(error);
        });


    const socket = io({
        auth: (cb) => {
            cb(localStorage.getItem("token"));
        }
    });

    socket.on("connect_error", () => {
        setTimeout(() => {
            socket.connect();
        }, 1000);
    });

    // client-side
    socket.on("connect", () => {
        const engine = socket.io.engine;

        engine.on("upgrade", () => {
            const upgradedTransport = socket.io.engine.transport.name; // in most cases, "websocket"
            console.log(upgradedTransport)
            socket.emit("nvplayerserv", socket.id, username)
        });
    });


    // receive a message from the server
    socket.on("nvplayer", (arg, username) => {
        if (socket.id != arg) {
            chatroom.append(`<p class='message'>Dite tous bonjour à ${username}</p>`)
        }
    });

    // receive a message from the server
    socket.on("helloserv", (username, msg) => {
        chatroom.append(`<p class='message'>${username} : ${msg}</p>`)
        feedback.html('');
    });

    let spamhahalol = 0;
    let timeout;
    let maxspam = 7;

    function timer(time) {
        timeout = setTimeout(remettreazero, time);
    }

    function myStopFunction() {
        clearTimeout(timeout);
    }

    function remettreazero() {
        if (spamhahalol > maxspam) {
            alert("Vous pouvez maintenant récrire")
        }
        enableBtn("send_message")
        spamhahalol = 0;
    }

    function emitmsg() {
        clearTimeout(timeout);
        timer(10000)
        spamhahalol++
        if (message.val() != "" && spamhahalol <= maxspam) {
            if (socket.connected) {
                socket.emit("msg", username, message.val());
                feedback.html('');
                message.val('');
                pageScroll()
            } else {
                socket.connect();
                alert("Vous êtes déconnecté, nous allons vous reconnectez !")
            }
        } else if (spamhahalol > maxspam) {
            disableBtn("send_message")
            alert("Trop de spam veuillez patientez")
            myStopFunction()
            timer(5000)
        }
    }

    //Emit typing
    message.bind("keypress", () => {
        socket.emit('typingserv', socket.id, username)

    })


    //Listen on typing
    socket.on('typing', (data, username) => {
        if (socket.id != data) {
            feedback.html(`<p><i>${username} écrit un message... </i></p>`)
        }
    })

    function disableBtn(idbtn) {
        document.getElementById(idbtn).disabled = true;
    }

    function enableBtn(idbtn) {
        document.getElementById(idbtn).disabled = false;
    }

}