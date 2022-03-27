const mysql = require('mysql'),
    express = require('express'),
    session = require('express-session'),
    path = require('path'),
    cluster = require('cluster'),
    cookieParser = require('cookie-parser'),
    numCPUs = require('os').cpus().length,
    portws = (process.env.PORT || 8080),
    port = (process.env.PORT || 3000),
    { XXHash32, XXHash64, XXHash3 } = require('xxhash-addon'),
    hasher3 = new XXHash3(require('fs').readFileSync('package-lock.json')),
    app = express();

// For Master process
if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);


    if (port != 3000) {
        cluster.fork();
    } else {
        // Fork workers.
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
    }


    // This event is firs when worker died
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else { // For Worker
    // Workers can share any TCP connection
    // In this case it is an HTTP server

    server = app.listen(port, err => {
        err ?
            console.log("Error in server setup") :
            console.log(`Worker ${process.pid} started`);
    });




    const connection = mysql.createConnection({ //connection bdd
        host: 'mysql-bellone.alwaysdata.net',
        user: 'bellone',
        password: 'nerfakshan',
        database: 'bellone_login'
    });

    app.use(session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    }));

    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, 'Page web')));

    // http://localhost:3000/
    app.get('/', function(request, res) {

        if (request.cookies.home == "nohome") {
            // Render login template
            res.redirect("/login")

        } else {
            res.cookie(`home`, `nohome`);
            res.sendFile(path.join(__dirname + '/Page web/Elisplay.html'));
        }


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


    function hash3(password) {
        const pass = `${password}XHAMAC1guUCaI9jUu6E3s3SCORAfZQqAqt0ty8VGQL1yWfPnSoJuRiip5mmnlISkXFyxaLpQdNpqYZSDSxZ25IP1AUAncFOsbsMY11VfyeilrWiIjNPdQ3MAc2FSBjMVJbSrGj6`;
        const buf_pass = Buffer.from(pass);

        return password = hasher3.hash(buf_pass);
    }


    app.post('/create', function(request, res) {

        // Capture the input fields
        let username = request.body.username;
        let anvanthast = request.body.password;
        let password = hash3(anvanthast);
        console.log(`HASH3 create ${password}`)

        // Ensure the input fields exists and are not empty
        if (username && password) {
            // Execute SQL query that'll select the account from the database based on the specified username and password

            //INSERT INTO `accounts` (`id`, `username`, `password`, `highscore1`) VALUES (1, 'test', 'test', 0);

            connection.query('SELECT username FROM accounts', function(error, resultaccount, fields) {
                // If there is an issue with the query, output the error
                if (error) throw error;
                var verifusername = false;
                for (i = 0; i < Object.keys(resultaccount).length; i++) {
                    if (resultaccount[i].username == username) {
                        verifusername = true;
                    }
                }

                if (verifusername == false) {
                    connection.query(`INSERT INTO \`accounts\` (\`username\`, \`password\`, \`snake\`, \`tetris\`, \`td\`, \`court\`, \`brick\`, \`flappy\`, \`highscore1\`) VALUES ('${username}', '${password}', 0,0,0,0,0,0,0);`, [username, password], function(error, results, fields) {
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
            });




        } else {
            res.send('Veuillez entrer un Username et un Password!');
            res.end();
        }

    });

    app.post('/updatepass', function(request, res) {

        let username = request.body.username;
        let password = request.body.password;

        connection.query(`UPDATE accounts SET password=\'${hash3(password)}\' WHERE username =\'${username}\';`, function(error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;
            // If the account exists

            if (results.protocol41 == true) {

            } else {
                res.redirect("/manage")
            }
            res.end();
        });

    });

    app.get('/updatepass', function(request, res) {

        if (request.session.loggedin) {

            res.sendFile(path.join(__dirname + '/Page web/manage.html'));

        } else {
            // Render login template
            res.redirect('/login')
        }
    });



    // http://localhost:3000/auth
    app.post('/auth', function(request, res) {

        let username = request.body.username;
        let anvanthast = request.body.password;
        let password = hash3(anvanthast);
        console.log(`HASH3 AUTH: ${password}`)

        if (username && password) {
            connection.query(`SELECT * FROM accounts WHERE username = '${username}' AND password = '${password}'`, function(error, results, fields) {
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
            $('table').append(`<tr><td>${highscoretableaucomplet.username[i]}</td><td>${highscoretableaucomplet.snake[i]}</td></tr>`);
        }

        //	$('h2.title').text(`Votre Score : ${result[0].highscore1}`);

        console.log(highscoretableaucomplet)

        res.send($.html());

        res.end();


    });

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

    app.get('/snake2', function(request, res) {

        res.sendFile(path.join(__dirname + '/Page web/snake2.html'));

    });

    app.get('/brick', function(request, res) {

        res.sendFile(path.join(__dirname + '/Page web/brick/index.html'));

    });

    app.get('/undertale', function(request, res) {

        res.sendFile(path.join(__dirname + '/Page web/undertale/index.html'));

    });


}