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
app.get('/', function(request, response) {
    // Render login template
    response.sendFile(path.join(__dirname + '/Page web/Elisplay.html'));
});

app.get('/play', function(request, response) {
    // Render login template
    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/Page web/pagePlay2.html'));

    } else {
        // Pas connectée.
        response.redirect("/login")
    }
});


app.get('/tetris', function(request, response) {
    // Render login template
    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/Page web/tetris.html'));

    } else {
        // Pas connectée.
        response.redirect("/login")
    }
});

app.get('/court', function(request, response) {
    // Render login template
    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/Page web/court.html'));

    } else {
        // Pas connectée.
        response.redirect("/login")
    }
});



app.get('/login', function(request, response) {

    if (request.session.loggedin) {

        response.redirect("/play")

    } else {
        // Render login template
        response.sendFile(path.join(__dirname + '/Page web/login.html'));
    }
});


app.get('/create', function(request, response) {
    // Render login template
    response.sendFile(path.join(__dirname + '/Page web/create.html'));
});


var countcreate = 0;

app.post('/create', function(request, response) {
    // Capture the input fields
    let username = request.body.username;
    let password = request.body.password;
    // Ensure the input fields exists and are not empty
    if (username && password) {
        // Execute SQL query that'll select the account from the database based on the specified username and password

        //INSERT INTO `accounts` (`id`, `username`, `password`, `highscore1`) VALUES (1, 'test', 'test', 0);



        connection.query('SELECT id FROM accounts', function(error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;
            countcreate = Object.keys(results).length;


            connection.query(`INSERT INTO \`accounts\` (\`id\`, \`username\`, \`password\`, \`highscore1\`) VALUES (${countcreate + 1}, '${username}', '${password}', 0);`, [username, password], function(error, results, fields) {
                // If there is an issue with the query, output the error
                if (error) throw error;
                // If the account exists

                if (results.protocol41 == true) {
                    response.redirect("/login")
                } else {
                    response.redirect("/create")
                }
                response.end();
            });

        });
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }

});


// http://localhost:3000/auth
app.post('/auth', function(request, response) {

    let username = request.body.username;
    let password = request.body.password;
    if (username && password) {
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;
                // rediction page play.
                response.redirect('/play');
            } else {
                response.send("Mauvais Nom d'utlisateur et/ou mauvais mot de passe<br><a href=javascript:history.go(-1)>Retour</a>");
            }
            response.end();
        });
    } else {
        response.send("Veuillez rentrer un Nom d'utlisateur et mot de passe<br><a href=javascript:history.go(-1)>Retour</a>");
        response.end();
    }
});

// http://localhost:3000/home
app.get('/home', function(request, response, next) {
    // Si l'utilisateur est connecté
    if (request.session.loggedin) {
        // Output username
        response.send('<a href="/Snake">Snake</a> Re, ' + request.session.username + '!');

    } else {
        // Pas connectée.
        response.redirect("/login")
    }
    response.end();
});


app.get('/snake', function(request, response) {

    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/Page web/snake.html'));
    } else {
        // Pas connectée.
        response.redirect("/login")
    }
});

app.post('/highscore', function(request, response) {
    // Capture the input fields
    let highscore = request.body.highscore;
    let username = request.session.username;

    connection.query(`SELECT highscore1 FROM accounts WHERE username = "${username}"`, function(error, results, fields) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        console.log(results[0].highscore1)
        if (results[0].highscore1 < highscore) {
            connection.query(`UPDATE accounts SET highscore1 = ${highscore} WHERE username = "${username}";`, function(error, results, fields) {
                // If there is an issue with the query, output the error"
                if (error) throw error;
                response.end();
            });
        } else {
            console.log("Non nécessaire de faire une demande a la bdd car il a un meilleur score sur la bdd")
        }


    });

});

const cheerio = require('cheerio');
var tableauchiffre = ["", ""];
var tableauvraichiffre = [0, 0];
var count = 0;

app.post('/gg', function(request, response) {

    if (request.session.loggedin) {

        connection.query(`SELECT highscore1,username FROM accounts`, function(error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;
            count = Object.keys(results).length;
            for (i = 0; i <= count - 1; i++) {
                tableauchiffre[i] = results[i].highscore1;
                tableauvraichiffre[i] = results[i].username;
            }

            response.redirect("/gg");

        })

    } else {
        // Pas connectée.
        response.redirect("/login")
    }

});

app.get('/gg', function(request, response) {

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
				<tr><th>Username</th><th>HighscoreSnake</th></tr>  
				<tr><td>Tableau</td><td>0</td></tr>  
				</table>
	</body>
	
	</html>`;

    const $ = cheerio.load(document);

    if (!tableauchiffre || tableauchiffre[0] == "") {

    } else {

        for (i = 0; i < count; i++) {
            $('table').append(`<tr><td>${tableauvraichiffre[i]}</td><td>${tableauchiffre[i]}</td></tr>`);
        }

        //	$('h2.title').text(`Votre Score : ${result[0].highscore1}`);
    }
    response.send($.html());

    response.end();

});


port = process.env.PORT || 3000;

app.listen(port);
