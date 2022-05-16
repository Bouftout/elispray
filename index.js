const mysql = require('mysql'),
    express = require('express'),
    session = require('express-session'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    port = (process.env.PORT || 3000),
    portws = (process.env.PORT || 8080),
    validator = require('validator'),
    helmet = require("helmet"),
    { XXHash32, XXHash64, XXHash3 } = require('xxhash-addon'),
    hasher3 = new XXHash3(require('fs').readFileSync('package-lock.json')),
    fs = require('fs');
app = express();

server = app.listen(port, err => {
    err ?
        console.log("Error in server setup") :
        console.log(`Worker ${process.pid} started\nServeur lancer sur: http://localhost:${port}`);
});

const connection = mysql.createConnection({ //connection bdd
    host: 'mysql-bellone.alwaysdata.net',
    user: 'bellone',
    password: 'nerfakshan',
    database: 'bellone_login'
});


//SECURITER QUI BLOQUE TOUT:
/*
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            "style-src": null,
            "img-src": ["'self'", "data: blob:"],
        },
    })
);*/
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'Page web')));
app.disable('x-powered-by');
app.use(session({
    cookieName: 'session',
    secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',
    expires: new Date(Date.now() + (30 * 86400 * 1000)),
    httpOnly: true,
    secure: true,
    ephemeral: true,
    resave: true,
    saveUninitialized: true
}));


// Fonction qui permet de 
function p(res, req, p) {
    if (req.session.loggedin) {
        return res.sendFile(path.join(`${__dirname}/Page web/${p}.html`));
    } else {
        return res.redirect("/login")
    }
}

// http://localhost:3000/
app.get('/', function(req, res) {

    if (req.cookies.home == "nohome") {
        // Render login template
        res.redirect("/login")

    } else {
        res.cookie(`home`, `nohome`);
        res.sendFile(path.join(__dirname + '/Page web/ElisPlay.html'));
    }


});
app.get('/login', function(req, res) {
    if (req.session.loggedin) {
        res.redirect("/play")
    } else {
        res.sendFile(path.join(__dirname + '/Page web/login.html'));
    }
});




app.get('/play', function(req, res) {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname + '/Page web/pagePlay2.html'));

    } else {
        // Pas connectée.
        res.redirect("/login")
    }
});


app.get('/create', function(req, res) {
    // Render login template
    res.sendFile(path.join(__dirname + '/Page web/create.html'));
});

function hash3(password) {
    var buf_pass = Buffer.from(`${password}XHAMAC1guUCaI9jUu6E3s3SCORAfZQqAqt0ty8VGQL1yWfPnSoJuRiip5mmnlISkXFyxaLpQdNpqYZSDSxZ25IP1AUAncFOsbsMY11VfyeilrWiIjNPdQ3MAc2FSBjMVJbSrGj6`);
    var passwords = hasher3.hash(buf_pass);
    hasher3.reset();
    return passwords;
}


app.get('/confirm/:email/:code/', (req, res) => {
    for (var i = 0; i < list.length; i++) {
        if (list[i].code == req.params.code && list[i].email == req.params.email) {
            console.log("List :" + list)

            console.log("Create Account : " + req.params.email)
            connection.query(`INSERT INTO \`accounts\` (\`email\`, \`password\`, \`snake\`, \`tetris\`, \`td\`, \`court\`, \`brick\`, \`flappy\`, \`highscore1\`) VALUES ('${req.params.email}', '${list[i].pass}', 0,0,0,0,0,0,0);`, (err, rows) => {
                if (err) throw err;
                res.redirect("/login")
            })

        }

    }

});

app.get('/disco', function(req, res) {

    req.session.destroy();

    res.redirect("login")

})


const ve = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

var list = [];
let myJson;

app.post('/create', function(req, res) {

    let password = hash3(req.body.password);
    let email = validate(req.body.email);
    let username = validate(req.body.username);

    if (username == " " || !username || username == "" || email != "") {


        if (ve(email)) {
            let code = makeid(5);
            emailfunc(email, "Confirmation de votre email", `Veuillez confirmer votre email en cliquant sur le button suivant : <br><a href="https://elisplay.herokuapp.com/confirm/${email}/${code}">Elisplay</button>`);
            console.log(`http://localhost:3000/confirm/${email}/${code}`)
            myJson = { email: `${email}`, code: `${code}`, pass: `${password}` };
            list.push(myJson);

            res.send("Veuillez vérifier votre email");
        } else {
            console.log("Email invalide")
            res.send("Veuillez marquer un email valide");
        }



    } else if (email == " " || !email || email == "" || username != "") {

        // Capture the input fields

        // Ensure the input fields exists and are not empty
        if (username && password) {
            // Execute SQL query that'll select the account from the database based on the specified username and password

            //INSERT INTO `accounts` (`id`, `username`, `password`, `highscore1`) VALUES (1, 'test', 'test', 0);

            connection.query('SELECT username FROM accounts', function(error, resultaccount, fields) {
                // If there is an issue with the query, output the error
                if (error) {
                    console.log(error);
                    return res.redirect("/login");
                }
                var verifusername = false;
                for (i = 0; i < Object.keys(resultaccount).length; i++) {
                    if (resultaccount[i].username == username) {
                        verifusername = true;
                    }
                }

                if (verifusername == false) {
                    connection.query(`INSERT INTO \`accounts\` (\`username\`, \`password\`, \`snake\`, \`tetris\`, \`td\`, \`court\`, \`brick\`, \`flappy\`, \`highscore1\`) VALUES ('${username}', '${password}', 0,0,0,0,0,0,0);`, [username, password], function(error, results, fields) {
                        // If there is an issue with the query, output the error
                        if (error) {
                            console.log(error);
                            return res.redirect("/login");
                        }
                        // If the account exists, redirect to the login page
                        if (results.protocol41 == true) {
                            req.session.loggedin = true;
                            req.session.username = username;
                            // rediction page play.
                            res.redirect('/play');
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
    } else {
        res.redirect("/503")
    }
});

app.post('/updatepass', function(req, res) {

    let username = validate(req.body.username);
    let password = hash3(req.body.password);

    if (typeof username != "string" || (password).lastIndexOf("DROP") != -1) {
        res.send("Paramètre invalide");
        res.end();
        return;
    }

    connection.query(`UPDATE accounts SET password=\'${password}\' WHERE username =\'${username}\';`, function(error, results, fields) {
        // If there is an issue with the query, output the error
        if (error) {
            console.log(error);
            return res.redirect("/login");
        }
        // If the account exists

        if (results.protocol41 == true) {

        } else {
            res.redirect("/manage")
        }
        res.end();
    });

});

app.get('/updatepass', function(req, res) {

    if (req.session.loggedin) {

        res.sendFile(path.join(__dirname + '/Page web/manage.html'));

    } else {
        // Render login template
        res.redirect('/login')
    }
});

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function validate(string) {
    return validator.escape(string);
}


app.post('/auth', function(req, res) {
    let password = hash3(req.body.password);
    let username = validate(req.body.username);
    let email = validate(req.body.email);

    if (username == " " || !username || username == "" || email != "") {


        console.log("pass " + password);
        console.log("email " + email);

        if (email && password || email != undefined || password != undefined) {
            connection.query(`SELECT email,password FROM accounts WHERE email = '${email}' AND password = '${password}'`, function(error, results, fields) {
                if (error) {
                    console.log(error);
                    return res.redirect("/login");
                }
                if (results.length > 0) {
                    req.session.loggedin = true;
                    req.session.username = email.slice(0, email.indexOf("@"));
                    // rediction page play.
                    res.redirect('/play');
                } else {
                    res.send("Mauvais Nom d'utlisateur et/ou mauvais mot de passe<br>");
                }
                res.end();
            });
        } else {
            res.send("Veuillez rentrer un Nom d'utlisateur et mot de passe<br>");
            res.end();
        }

    } else if (email == " " || !email || email == "" || username != "") {

        console.log("pass " + password);
        console.log("user " + username);

        if (username && password || username != undefined || password != undefined) {
            connection.query(`SELECT * FROM accounts WHERE username = '${username}' AND password = '${password}'`, function(error, results, fields) {
                if (error) {
                    console.log(error);
                    return res.redirect("/login");
                }
                if (results.length > 0) {
                    req.session.loggedin = true;
                    req.session.username = username;
                    // rediction page play.
                    res.redirect('/play');
                } else {
                    console.log("tome")
                    res.send("Mauvais Nom d'utlisateur et/ou mauvais mot de passe<br>");
                }
                res.end();
            });
        } else {
            res.send("Veuillez rentrer un Nom d'utlisateur et mot de passe<br>");
            res.end();
        }

    }

});



var nodemailer = require('nodemailer');




async function emailfunc(email, sujet, msg) {

    const htmlemail = `<!DOCTYPE html>
<html>

<head>
    <title>Confirmation Email</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style type="text/css">
    body {
        color: white;
        position: fixed;
        top: 20%;
        left: 20%;
        margin-right: -50%;
        transform: translate(-50%, -50%)
    }
    
        
        a {
            background-color: #0004ff;
            border: none;
            color: white;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
        }
        
        table td {
            border-collapse: collapse !important;
            background-color: #0b1016;
        }
        
        .frame {
            padding: 58px 50px 29px;
        }
        
        .flexible {
            width: 600;
            margin: 0 auto;
        }
        
        .box {
            border-radius: 3px;
            padding: 24px;
            border: 1px solid #fff;
        }
        
        .title {
            padding: 0 0 10px;
            font: bold 24px/26px Arial, Helvetica, sans-serif;
            color: #7ea0b7;
            text-transform: uppercase;
        }
        
        .text {
            font: normal 16px/26px Arial, Helvetica, sans-serif;
            color: #ffffff;
        }
    </style>
</head>

<body align="center">
    <td class="wrapper" style="padding:0 10px;" data-bgcolor="bg module">
        <table class="flexible">
            <td class="frame">
                <table>
                    <td class="box">
                        <table>
                            <tr>
                                <td class="title">
                                    Confirmation d'email !</td>
                            </tr>
                            <tr>
                                <td class="text">
                                    <p>${msg}</p>
                                </td>
                            </tr>
                        </table>

</html>`;

    // Generate test confirmation from gmail
    console.log("email " + email);
    try {

        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: "contactelisplay@gmail.com",
                clientId: "953985924764-79k6tbmhrafnie0j5q2ivij27nl6dhd4.apps.googleusercontent.com",
                clientSecret: "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",
                refreshToken: "1//04N-hVLZsembjCgYIARAAGAQSNwF-L9Irz95A-tTHP2VYij9DjWJ2gc9nifLcUd9sLtoeWtMnsmuOIbBDcA-DDI5Zs9xvdL39WPw",
                accessToken: "ya29.A0ARrdaM-TzD58LtKsbzIeUP1MDq_21p4wvq5lcT4Qn2qFAhJG8NS0l2s3U97RZbKlpflLRCKCpgMUCo2ldqaSibndITNDH95jW-gG4IYmiF6nsRmDfr851-W8_laXOVVYSfJBMnHkkCcxSbwj3sk9FIQd-7jr",
                expires: 1484314697598,
            },
        });

        transporter.on("token", (token) => {
            console.log("Un token a été généré");
            console.log("Utilisateur: %s", token.user);
            console.log("Access Token: %s", token.accessToken);
            console.log("Expire : %s", new Date(token.expires));
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: 'contactelisplay@gmail.com', // sender address
            to: email, // list of receivers
            subject: sujet, // Subject line
            html: htmlemail, // html body
        });

        if (info.err) {
            console.log("error:" + err);
        }
        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    } catch (err) {
        console.log(err);
    }
}





app.post('/highscore', function(req, res) {
    // Capture the input fields
    var highscore = Number(req.body.highscore);
    var qui = validate(req.body.qui);
    var username = validate(req.session.username);

    console.log("highscore " + highscore + " qui " + qui + " username " + username);

    connection.query(`SELECT ${qui} FROM \`accounts\` WHERE username = '${username}'`, function(error, results, fields) {
        // If there is an issue with the query, output the error
        if (error) {
            console.log(error);
            return res.redirect("/login");
        }
        // console.log(`UPDATE \`accounts\` SET ${qui} = ${highscore} WHERE username = '${username}';`)
        // console.log("highscore : " + highscore);
        // console.log("results : " + results[0].snake);
        var iffe;

        if (results[0].brick == "" || results[0].brick == undefined) {
            console.log("notbrick");
            iffe = results[0][qui] < highscore;
        } else {
            console.log("brick");
            iffe = highscore < results[0].brick;
        }


        if (iffe) {
            //UPDATE `accounts` SET snake = 0 WHERE username = 'localhost';
            connection.query(`UPDATE \`accounts\` SET ${qui} = ${highscore} WHERE username = '${username}';`, function(error, results, fields) {
                // If there is an issue with the query, output the error"
                if (error) {
                    console.log(error);
                    return res.redirect("/login");
                }
            });
            console.log("highscore : " + highscore);
        } else {
            console.log("Non nécessaire de faire une demande a la bdd car il a un meilleur score sur la bdd\nRes: " + results[0][qui] + " highscore : " + highscore);
            res.end();
        }


    });

});


const cheerio = require('cheerio');

var highscoretableaucomplet = {
    "username": ["", ""],
    "snake": [0, 0],
    "tetris": [0, 0],
    "brick": [0, 0],
}

var count = 0;

app.post('/gg', function(req, res) {
    console.log("postgg")

    connection.query(`SELECT username,snake,tetris FROM accounts`, function(error, results, fields) {
        // If there is an issue with the query, output the error
        if (error) {
            console.log(error);
            return res.redirect("/login");
        }
        count = Object.keys(results).length;
        for (i = 0; i < count; i++) {
            highscoretableaucomplet.username[i] = results[i].username;

            highscoretableaucomplet.snake[i] = results[i].snake;

            highscoretableaucomplet.tetris[i] = results[i].tetris;

            highscoretableaucomplet.brick[i] = results[i].brick;
        }
    })



});

app.get('/gg', function(req, res) {

    const data = `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>GG</title>
        <script src="./js/gg.js"></script>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    
    </head>
    
    <body style="background-color: darkblue;">
        <br>
        <div class="d-grid gap-2">
            <button class="btn btn-primary" type="button" id="ggbtn">Récuper les données</button>
        </div>
        <br>
        <table class="table table-bordered table-dark table-sm">
            <tr>
                <th>Username</th>
                <th>Snake</th>
                <th>Tetris</th>
                <th>.</th>
                <th>.</th>
                <th>.</th>
                <th>.</th>
            </tr>
            <tr>

            </tr>
        </table>
    </body>
    
    </html>`;

    const $ = cheerio.load(data);

    for (i = -1; i < count; i++) {
        if (i == -1) {
            console.log("I")
            highscoretableaucomplet.snake = (highscoretableaucomplet.snake).sort()
        }
        if (highscoretableaucomplet.snake[i] !== 0 && i !== -1) {
            $('table').append(`<tr><td>${highscoretableaucomplet.username[i]}</td><td>${highscoretableaucomplet.snake[i]}</td></tr>`);
        }
    }

    res.send($.html());

    res.end();



});

const io = require("socket.io")(server)
    // server-side
io.on("connection", (socket) => {
    // console.log("Connection:" + socket.id); // x8WIv7-mJelg7on_ALbx

    socket.conn.on("upgrade", () => {
        const upgradedTransport = socket.conn.transport.name; // in most cases, "websocket"
        console.log(upgradedTransport)
    });

    socket.on("msg", (username, msg) => {
        io.to("chat").emit("helloserv", username, validate(msg));
    });

    socket.on("typingserv", (arg, username) => {
        io.to("chat").emit("typing", arg, username);
    });

    socket.on("nvplayerserv", (arg, username) => {
        socket.join("chat");

        io.to("chat").emit("nvplayer", arg, username);
    });

    socket.on("typingserv", (arg, username) => {
        io.to("chat").emit("typing", arg, username);
    });




    //Serv court
    socket.on("courtconnectserv", (id, nbroom) => {
        console.log(`nbchambre: ${nbroom}`)
        socket.join(nbroom);
        io.to(nbroom).emit("nvplayercourt", id, nbroom);
    });

    socket.on("ggtoucheserv", (id, nbroom) => {
        console.log("ggtoucheserv" + nbroom)
        io.to(nbroom).emit("perdue", id);
    });

    socket.on("perduetoucheserv", (id, nbroom) => {
        io.to(nbroom).emit("gg", id);
    });


    socket.on("perduetoucheserv", (id, nbroom) => {
        io.to(nbroom).emit("gg", id, nbroom);
    });

});

// Render chat
app.set('view engine', 'ejs')


app.post('/updatepass', function(req, res) {

    let username = validate(req.body.username);
    let password = hash3(req.body.password);



    if (typeof username != "string" || (password).lastIndexOf("DROP") != -1) {
        res.send("Paramètre invalide");
        res.end();
        return;
    }


    connection.query(`UPDATE accounts SET password=\'${password}\' WHERE username =\'${username}\';`, function(error, results, fields) {
        // If there is an issue with the query, output the error
        if (error) {
            console.log(error);
            return res.status(500).json(error);
        }
        // If the account exists

        if (results.protocol41 == true) {

        } else {
            res.redirect("/manage")
        }
        res.end();
    });

});

app.delete('/deleteaccount', function(req, res) {

    let username = validate(req.body.username);
    let password = hash3(req.body.password);
    console.log("deleteaccount : " + username + "   " + password)
    if (username && password || username != undefined || password != undefined) {
        connection.query(`SELECT * FROM accounts WHERE username = '${username}' AND password = '${password}'`, function(error, results, fields) {
            if (error) {
                console.log(error);
                return res.status(500).json(error);
            }
            if (results.length > 0) {
                connection.query(`DELETE FROM accounts WHERE username = '${username}'`, function(error, results, fields) {
                    if (error) {
                        console.log(error);
                        return res.status(500).json(error);
                    }
                    res.send("Account deleted");
                    res.end();
                });
            } else {
                res.send("Mauvais Nom d'utlisateur et/ou mauvais mot de passe<br>");
                res.end();
            }

        });
    } else {
        res.send("Veuillez rentrer un Nom d'utlisateur et mot de passe<br>");
        res.end();
    }

});

app.get('/manage', function(req, res) {

    if (req.session.loggedin) {
        let usernames = req.session.username;

        res.render('manage', {
            username: usernames
        });

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});



app.get('/chat', function(req, res) {
    if (req.session.loggedin) {

        res.render('chat');

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

app.get('/username', function(req, res) {

    if (req.session.loggedin) {

        let usernames = req.session.username;
        res.json(`{"user":"${usernames}"}`)

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

app.get('/tetris', function(req, res) {

    p(res, req, "tetris");
});

app.get('/court', function(req, res) {
    p(res, req, "court");
});

app.get('/snake', function(req, res) {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname + '/Page web/snake.html'));
    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

//Tower Defense
app.get('/td', function(req, res) {
    if (req.session.loggedin) {

        res.sendFile(path.join(__dirname + '/Page web/td/index.html'));

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

//casse brick
app.get('/brick', function(req, res) {
    if (req.session.loggedin) {

        res.sendFile(path.join(__dirname + '/Page web/brick/index.html'));

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

//UNdertale game
app.get('/undertale', function(req, res) {
    if (req.session.loggedin) {

        res.sendFile(path.join(__dirname + '/Page web/undertale/index.html'));

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

//Game pong
app.get('/pong', function(req, res) {
    if (req.session.loggedin) {

        res.sendFile(path.join(__dirname + '/Page web/pong/index.html'));

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

//Page de suggestion
app.post('/envoie', function(req, res) {

    let info = req.body.info;

    if (req.session.loggedin) {

        console.log(info)
        emailfunc("contactelisplay@gmail.com", `Suggestion de ${req.session.username}`, info);

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

//Page de suggestion
app.get('/envoie', function(req, res) {
    if (req.session.loggedin) {

        res.sendFile(path.join(__dirname + '/Page web/envoie.html'));

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

//Les game ? (en dev)
app.get('/game', function(req, res) {

    res.sendFile(path.join(__dirname + '/Page web/game.html'));

});

// Une partie de Remastered SuperWorld Jojo
app.get('/world', function(req, res) {
    if (req.session.loggedin) {

        res.sendFile(path.join(__dirname + '/Page web/world/index.html'));

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

//Jeux en dev
app.get('/tour', function(req, res) {
    if (req.session.loggedin) {

        res.sendFile(path.join(__dirname + '/Page web/tourpartour/index.html'));

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

// Truc de jeu
app.get('/jeuto', function(req, res) {

    res.redirect("https://gamejolt.com/@ToniPortal/games")

});

app.get('/platf', function(req, res) {
    if (req.session.loggedin) {

        res.sendFile(path.join(__dirname + '/Page web/tourpartour/index.html'));

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});


app.get('/404', function(req, res, next) {
    // trigger a 404 since no other middleware
    // will match /404 after this one, and we're not
    // responding here
    next();
});

app.get('/403', function(req, res, next) {
    // trigger a 403 error
    var err = new Error('not allowed!');
    err.status = 403;
    next(err);
});

app.get('/500', function(req, res, next) {
    // trigger a generic (500) error
    next(new Error('keyboard cat!'));
});

app.use(function(req, res, next) {
    res.status(404);

    res.format({
        html: function() {
            res.render('404', { url: req.url })
        },
        json: function() {
            res.json({ error: 'Not found' })
        },
        default: function() {
            res.type('txt').send('Not found')
        }
    })
});

//500 error render
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('500', { error: err });
});