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



function p(p) {
    return path.join(`${__dirname}/Page web/${p}.html`)
}

// http://localhost:3000/
app.get('/', function(req, res) {

    if (req.cookies.home == "nohome") {
        // Render login template
        res.redirect("/login")

    } else {
        res.cookie(`home`, `nohome`);
        res.sendFile(p('Elisplay'));
    }


});



app.get('/login', function(req, res) {

    if (req.session.loggedin) {

        res.redirect("/play")

    } else {
        // Render login template
        res.sendFile(path.join(__dirname + '/Page web/login.html'));
    }
});




app.get('/play', function(req, res) {
    // Render login template
    if (req.session.loggedin) {
        res.sendFile(p('pagePlay2'));
    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});


app.get('/tetris', function(req, res) {
    // Render login template
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname + '/Page web/tetris.html'));

    } else {
        // Pas connectée.
        res.redirect("/login")
    }
});

app.get('/court', function(req, res) {
    // Render login template
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname + '/Page web/court.html'));

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
    /*
    connection.query(`SELECT * FROM users WHERE email = '${req.params.email}'`, (err, rows) => {
        if (err) throw err;
        if (rows.length > 0) {
            if (rows[0].code == req.params.code) {
                connection.query(`UPDATE users SET confirm = 1 WHERE email = '${req.params.email}'`, (err, rows) => {
                    if (err) throw err;
                    res.redirect("/login")
                })
            } else {
                res.redirect("/login")
            }
        } else {
            res.redirect("/login")
        }
    })*/

    let s = 0

    for (var i = 0; i < list.length; i++) {
        if (list[i].code == req.params.code && list[i].email == req.params.email) {
            // we found it

            if (s == 0) {
                connection.query(`INSERT INTO \`accounts\` (\`email\`, \`password\`, \`snake\`, \`tetris\`, \`td\`, \`court\`, \`brick\`, \`flappy\`, \`highscore1\`) VALUES ('${req.params.email}', '${hash3(list[i].pass)}', 0,0,0,0,0,0,0);`, (err, rows) => {
                    if (err) throw err;
                    res.redirect("/login")
                })
                list.pop();
                list = [];
            }
            s++
        }
    }


    if (s == 0) {
        res.send(`Email: ${req.params.email}\nCode: ${req.params.code}\n`);
        res.end();
    }


});

app.get('/disco', function(req, res) {

    req.session.destroy();

    res.redirect("login")
    
})

let list = [];
let myJson;

app.post('/create', function(req, res) {

    if (req.body.username == " " || !req.body.username) {
        let code = makeid(5);
        let email = validate(req.body.email);
        emailfunc(email, "Confirmation de votre email", `Veuillez confirmer votre email en cliquant sur le lien suivant : https://elisplay.herokuapp.com/confirm/${email}/${code}`);
        myJson = { email: `${email}`, code: `${code}`, pass: `${req.body.password}` };
        list.push(myJson);

        console.log(list)
        res.send("Veuillez vérifier votre email");

    } else if (req.body.email == " " || !req.body.email) {

        // Capture the input fields
        let username = validate(req.body.username);
        let password = hash3(req.body.password);
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

    if (req.body.username == " " || !req.body.username) {

        let email = validate(req.body.email);

        console.log("pass " + password);
        console.log("email " + email);

        if (email && password || email != undefined || password != undefined) {
            connection.query(`SELECT * FROM accounts WHERE email = '${email}' AND password = '${password}'`, function(error, results, fields) {
                if (error) {
                    console.log(error);
                    return res.redirect("/login");
                }
                if (results.length > 0) {
                    req.session.loggedin = true;
                    req.session.username = email;
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

    } else if (req.body.email == " " || !req.body.email) {


        let username = validate(req.body.username);

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

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: "contactelisplay@gmail.com",
          pass: 'rc4mv4isCJ98@RstCE!9',
          clientId: "953985924764-79k6tbmhrafnie0j5q2ivij27nl6dhd4.apps.googleusercontent.com",
          clientSecret: "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",
          refreshToken: "1//04pf26YxnMbcaCgYIARAAGAQSNwF-L9IrjK_fhwjASzLcCIJwPLtG09ZEyl6X8IBsOqZfrystdNwqj2YTlfajXHITOcM48BRf7GU"
        }
      });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'contactelisplay@gmail.com', // sender address
        to: email, // list of receivers
        subject: sujet, // Subject line
        html: `${msg}`, // plain text body
    });

    if(info.err){
        console.log("error:"+err);
    }
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

}


app.get('/snake', function(req, res) {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname + '/Page web/snake.html'));
    } else {
        // Pas connectée.
        res.redirect("/login")
    }
});


app.post('/highscore', function(req, res) {
    // Capture the input fields
    var highscore = Number(req.body.highscore);
    var qui = validate(req.body.qui);
    var username = validate(req.session.username);


    connection.query(`SELECT ${qui} FROM \`accounts\` WHERE username = '${username}'`, function(error, results, fields) {
        // If there is an issue with the query, output the error
        if (error) {
            console.log(error);
            return res.redirect("/login");
        }
        // console.log(`UPDATE \`accounts\` SET ${qui} = ${highscore} WHERE username = '${username}';`)
        // console.log("highscore : " + highscore);
        // console.log("results : " + results[0].snake);
        if (results[0].snake < highscore) {
            //UPDATE `accounts` SET snake = 0 WHERE username = 'localhost';
            connection.query(`UPDATE \`accounts\` SET ${qui} = ${highscore} WHERE username = '${username}';`, function(error, results, fields) {
                // If there is an issue with the query, output the error"
                if (error) {
                    console.log(error);
                    return res.redirect("/login");
                }
            });
        } else {
            console.log("Non nécessaire de faire une demande a la bdd car il a un meilleur score sur la bdd");
            res.end();
        }


    });

});


const cheerio = require('cheerio');

var highscoretableaucomplet = {
    "username": ["", ""],
    "snake": [0, 0],
}

var count = 0;

app.post('/gg', function(req, res) {
console.log("postgg")
    if (req.session.loggedin) {

        connection.query(`SELECT username,snake FROM accounts`, function(error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) {
                console.log(error);
                return res.redirect("/login");
            }
            count = Object.keys(results).length;
            for (i = 0; i < count; i++) {
                highscoretableaucomplet.username[i] = results[i].username;

                highscoretableaucomplet.snake[i] = results[i].snake;

            }
        })

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

app.get('/gg', function(req, res) {

        fs.readFile(path.join(__dirname + '/Page web/gg.html'), 'utf8', function(err, data){ 

    const $ = cheerio.load(data);



    for (i = 0; i < count; i++) {
        $('table').append(`<tr><td>${highscoretableaucomplet.username[i]}</td><td>${highscoretableaucomplet.snake[i]}</td></tr>`);
    }
    
    res.send($.html());

    res.end();

});

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

app.get('/td', function(req, res) {
    if (req.session.loggedin) {

        res.sendFile(path.join(__dirname + '/Page web/td/index.html'));

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

app.get('/snake2', function(req, res) {
    if (req.session.loggedin) {

        res.sendFile(path.join(__dirname + '/Page web/snake2.html'));

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

app.get('/brick', function(req, res) {
    if (req.session.loggedin) {

        res.sendFile(path.join(__dirname + '/Page web/brick/index.html'));

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

app.get('/undertale', function(req, res) {
    if (req.session.loggedin) {

        res.sendFile(path.join(__dirname + '/Page web/undertale/index.html'));

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

app.get('/pong', function(req, res) {
    if (req.session.loggedin) {

        res.sendFile(path.join(__dirname + '/Page web/pong/index.html'));

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

//Truc d'email
app.post('/envoie', function(req, res) {

    let info = req.body.info;

    if (req.session.loggedin) {

        console.log(info)
        emailfunc("contactelisplay@gmail.com",`Sugestion de ${req.session.username}`,info);

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

app.get('/envoie', function(req, res) {
    if (req.session.loggedin) {

        res.sendFile(path.join(__dirname + '/Page web/envoie.html'));

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

app.get('/game', function(req, res) {


    res.sendFile(path.join(__dirname + '/Page web/game.html'));

});


app.get('/world', function(req, res) {
    if (req.session.loggedin) {

        res.sendFile(path.join(__dirname + '/Page web/world/index.html'));

    } else {
        // Pas connectée.
        res.redirect("/login")
    }

});

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

app.use(function(err, req, res, next) {
    // we may use properties of the error object
    // here and next(err) appropriately, or if
    // we possibly recovered from the error, simply next().
    res.status(err.status || 500);
    res.render('500', { error: err });
});