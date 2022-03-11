const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const { nextTick } = require('process');

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
app.get('/', function (request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/Page web/login.html'));
});

app.post('/create', function (request, response) {
	// Capture the input fields
	let username = request.body.username;
	let password = request.body.password;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.username = username;
				// Redirect to home page
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}

});


// http://localhost:3000/auth
app.post('/auth', function (request, response) {
	// Capture the input fields
	let username = request.body.username;
	let password = request.body.password;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.username = username;
				// Redirect to home page
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

// http://localhost:3000/home
app.get('/home', function (request, response, next) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		response.send('<a href="/Snake">Snake</a> Re, ' + request.session.username + '!');
	
	} else {
		// Not logged in
		response.redirect("/")
	}
	response.end();
});


app.get('/snake', function (request, response) {

	if (request.session.loggedin) {
		response.sendFile(path.join(__dirname + '/Page web/snake.html'));
	} else {
		// Not logged in
		response.redirect("/")
	}
});

app.post('/highscore', function (request, response) {
	// Capture the input fields
	let highscore = request.body.highscore;
	connection.query(`UPDATE accounts SET highscore1 = ${highscore};`, function (error, results, fields) {
		// If there is an issue with the query, output the error
		if (error) throw error;
		response.redirect("/gg");

	});

});

const cheerio = require('cheerio');
var tableauchiffre = ["", ""];
var count = 0;

app.post('/gg', function (request, response) {

	if (request.session.loggedin) {

		connection.query(`SELECT highscore1 FROM accounts`, function (error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			count = Object.keys(results).length;
			for (i = 0; i <= count - 1; i++) {
				tableauchiffre[i] = results[i].highscore1;
			}

			response.redirect("/gg");

		})

	} else {
		// Not logged in
		response.redirect("/")
	}

});

app.get('/gg', function (request, response) {

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
			$('table').append(`<tr><td>${request.session.username}</td><td>${tableauchiffre}</td></tr>`);
		}

		//	$('h2.title').text(`Votre Score : ${result[0].highscore1}`);
	}
	response.send($.html());

	response.end();

});



app.listen(3000);