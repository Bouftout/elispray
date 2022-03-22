const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');

const connection = mysql.createConnection({
    host: 'mysql-bellone.alwaysdata.net',
    user: 'bellone',
    password: 'nerfakshan',
    database: 'bellone_login'
});

const app = express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'Page web')));

// http://localhost:3000/
app.get('/', function(request, res) {
    // Render login template
    res.sendFile(path.join(__dirname + '/Page web/Elisplay.html'));
});

app.get('/play', function(request, res) {
    // Render login template
    if (request.session.loggedin) {
        res.sendFile(path.join(__dirname + '/Page web/pagePlay2.html'));

    } else {
        // Pas connectée.
        res.redirect("/login")
    }
});


app.get('/tetris', function(request, res) {
    // Render login template
    if (request.session.loggedin) {
        res.sendFile(path.join(__dirname + '/Page web/tetris.html'));

    } else {
        // Pas connectée.
        res.redirect("/login")
    }
});

app.get('/court', function(request, res) {
    // Render login template
    if (request.session.loggedin) {
        res.sendFile(path.join(__dirname + '/Page web/court.html'));

    } else {
        // Pas connectée.
        res.redirect("/login")
    }
});



app.get('/login', function(request, res) {

    if (request.session.loggedin) {

        res.redirect("/play")

    } else {
        // Render login template
        res.sendFile(path.join(__dirname + '/Page web/login.html'));
    }
});


app.get('/create', function(request, res) {
    // Render login template
    res.sendFile(path.join(__dirname + '/Page web/create.html'));
});

async function idfunct() {
    await connection.query('SELECT id FROM accounts', function(error, results, fields) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        countcreate = Object.keys(results).length;
    });
}


var countcreate = 0;

function usernamee(usernameinput) {
    connection.query('SELECT username FROM accounts', function(error, results, fields) {
        // If there is an issue with the query, output the error
        if (error) throw error;

        for (i = 0; i < Object.keys(results).length; i++) {

            console.log(results[i].username)
            if (results[i].username == usernameinput) {
                return true
            } else {
                return false
            }
        }
    });
}



app.post('/create', function(request, res) {
    idfunct() // nombre d'id

    // Capture the input fields
    let username = request.body.username;
    let password = request.body.password;
    // Ensure the input fields exists and are not empty
    if (username && password) {
        // Execute SQL query that'll select the account from the database based on the specified username and password

        //INSERT INTO `accounts` (`id`, `username`, `password`, `highscore1`) VALUES (1, 'test', 'test', 0);
        if (usernamee() == false) {
            connection.query(`INSERT INTO \`accounts\` (\`id\`, \`username\`, \`password\`, \`snake\`, \`tetris\`, \`td\`, \`court\`, \`brick\`, \`flappy\`, \`highscore1\`) VALUES (${countcreate + 1}, '${username}', '${password}', 0,0,0,0,0,0,0);`, [username, password], function(error, results, fields) {
                // If there is an issue with the query, output the error
                if (error) throw error;
                // If the account exists

                if (results.protocol41 == true) {
                    res.redirect("/login")
                } else {
                    res.redirect("/create")
                }
                res.end();
            });
        } else {
            res.send('Il a déjà un utilisateur avec ce nom là !');
            res.end();
        }



    } else {
        res.send('Veuillez entrer un Username et un Password!');
        res.end();
    }

});


// http://localhost:3000/auth
app.post('/auth', function(request, res) {

    let username = request.body.username;
    let password = request.body.password;
    if (username && password) {
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;
                // rediction page play.
                res.redirect('/play');
            } else {
                res.send("Mauvais Nom d'utlisateur et/ou mauvais mot de passe<br><a href=javascript:history.go(-1)>Retour</a>");
            }
            res.end();
        });
    } else {
        res.send("Veuillez rentrer un Nom d'utlisateur et mot de passe<br><a href=javascript:history.go(-1)>Retour</a>");
        res.end();
    }
});


app.get('/snake', function(request, res) {

    if (request.session.loggedin) {
        res.sendFile(path.join(__dirname + '/Page web/snake.html'));
    } else {
        // Pas connectée.
        res.redirect("/login")
    }
});

app.post('/highscore', function(request, res) {
    // Capture the input fields
    let highscore = request.body.highscore;
    let username = request.session.username;

    connection.query(`SELECT snake FROM accounts WHERE username = "${username}"`, function(error, results, fields) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        console.log(results[0].snake)
        if (results[0].snake < highscore) {
            connection.query(`UPDATE accounts SET snake = ${highscore} WHERE username = "${username}";`, function(error, results, fields) {
                // If there is an issue with the query, output the error"
                if (error) throw error;
                res.redirect("/gg")
                res.end();
            });
        } else {
            console.log("Non nécessaire de faire une demande a la bdd car il a un meilleur score sur la bdd")
        }


    });

});


const cheerio = require('cheerio');

var highscoretableaucomplet = {
    "username": ["", ""],
    "snake": [0, 0],
}

var count = 0;

app.post('/gg', function(request, res) {

    if (request.session.loggedin) {

        connection.query(`SELECT username,snake FROM accounts`, function(error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;
            count = Object.keys(results).length;
            for (i = 0; i < count; i++) {
                highscoretableaucomplet.username[i] = results[i].username;

                highscoretableaucomplet.snake[i] = results[i].snake;

            }

            res.redirect("/gg");

        })

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

app.get('/gg', function(request, res) {


    const document = `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,minimum-scale=1">
        <title>GG</title>
    </head>
    
    <body>
        <form action="/gg" method="post"> <label for="gg">
                    <!-- font awesome icon --> <i class="fas fa-gg"></i>
                </label> <input type="submit" value="gg"> </form>
        <table>
            <tr>
                <th>Username</th>
                <th>Snake</th>
                <th>Tetris</th>
                <th>TD</th>
                <th>Speed</th>
                <th>Brick</th>
                <th>Flappy</th>
            </tr>
            <tr>
                <td>Name</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
            </tr>
        </table>
    </body>
    
    </html>`;

    const $ = cheerio.load(document);



    for (i = 0; i < count; i++) {
        $('table').append(`<tr><td>${highscoretableaucomplet.username[i] }</td><td>${highscoretableaucomplet.snake[i]}</td></tr>`);
    }

    //	$('h2.title').text(`Votre Score : ${result[0].highscore1}`);

    console.log(highscoretableaucomplet)

    res.send($.html());

    res.end();


});


let portws = process.env.PORT || 8080;
let port = process.env.PORT || 3000;
server = app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))



console.log(portws)
const io = require("socket.io")(server)

const { convert } = require('html-to-text');

// server-side
io.on("connection", (socket) => {
    // console.log("Connection:" + socket.id); // x8WIv7-mJelg7on_ALbx

    socket.conn.on("upgrade", () => {
        const upgradedTransport = socket.conn.transport.name; // in most cases, "websocket"
        console.log(upgradedTransport)
    });

    socket.on("msg", (username, msg) => {
        const textmsg = convert(msg, {
            wordwrap: 130
        });

        io.emit("helloserv", username, textmsg);

    });


    socket.on("typingserv", (arg, username) => {
        io.emit("typing", arg, username);
    });

    socket.on("nvplayerserv", (arg, username) => {
        io.emit("nvplayer", arg, username);
    });

});

// Render chat
app.set('view engine', 'ejs')

app.get('/chat', function(request, res) {
    if (request.session.loggedin) {

        res.render('chat');

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

app.get('/username', function(request, res) {

    if (request.session.loggedin) {

        let usernames = request.session.username;
        res.json(`{"user":"${usernames}"}`)

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

app.get('/game', function(request, res) {
    res.render('game')
});

app.get('/td', function(request, res) {

    res.sendFile(path.join(__dirname + '/Page web/td/index.html'));

});