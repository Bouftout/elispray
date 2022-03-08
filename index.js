var compression = require('compression'),
    express = require('express'),
    app = express(),
    colors = require('colors'),
    moment = require('moment'),
    fs = require('fs'),
    helmet = require('helmet'),
    port = process.env.PORT || 3000;


app.listen(port)
var bodyParser = require("body-parser");

/*une fois que vous avez l'intention de traiter des fichiers texte d'une taille supérieure à environ 10 Mo
,je vous conseille de laisser tomber readFile et de commencer à utiliser les flux(fs.readfilestream).
*/

const path = require('path')
app.use('/', express.static(path.join(__dirname, 'Page web')))

app.use(bodyParser.urlencoded({ extended: true }));




app.post('/send', async function (request, res, next) {
    var youremail = request.body.youremail
    var yoursubject = request.body.yoursubject
    var yourmessage = request.body.yourmessage
    console.log(`${yoursubject} ${yourmessage}`);
    await main(youremail, yoursubject, yourmessage)
    next();
}, function (req, res) {
    res.redirect('/')
});


app.use(helmet())
app.use(compression())

// server-sent event stream
app.get('/events', function (req, res) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')

    // send a ping approx every 2 seconds
    var timer = setInterval(function () {
        res.write('data: ping\n\n')

        // !!! this is the important part
        res.flush()
    }, 2000)

    res.on('close', function () {
        clearInterval(timer)
    })
});

colors.setTheme({ //mettre des couleur sur le console.log
    silly: 'rainbow',
    input: 'grey', //contribution
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});
console.log('---------------------------------'.verbose)

console.log(('Langue:' + moment.locale('fr') + 'ançaise\n').silly + //Langue française
    '---------------------------------'.verbose +
    '\nDémarré le :\n'.info +
    moment().format('llll').prompt + `\nPort: ${port}`.info)


app.get('/cv', function (req, res) {
    var file = path.join(__dirname, './Page web/cv.pdf');
    res.download(file, function (err) {
        if (err) {
            console.log("Error");
            console.log(err);
        } else {
            console.log("Success");
        }
    });
});


var exec = require("child_process").exec;
app.get('/db', function (req, res) {
    exec("php ./php/db.php", function (error, stdout, stderr) {
        res.send(stdout);
        console.log(error)
    });
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

app.get('/notexist', function (req, res) {
    console.log('Le fichier ici: '.error + './Page web/notexist/index.html'.warn + ' n\'éxiste pas'.error)
    console.log('Chargement du message de '.info + '\"Erreur'.error + ' Foetal !\"'.silly)
    console.log('Cause de l\'erreur: le fichier html qui vous dit que le fichier n\'existe ben lui aussi il n\'hésite pas'.white)
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write('<!DOCTYPE html>' +
        '<html>' +
        '    <head>' +
        '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>' +
        '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0"/>' +
        '        <title>Erreur Fatal !</title>' +
        '    </head>' +
        '    <body> <div>' +
        '     	<H3>Vous avez été redirigée ici car le fichier html qui vous dit que le fichier n\'existe pas lui aussi' +
        '         il n\'existe pas !</H3><br><br> ' +
        '<a onclick="javascript:window.history.back()" class="btn-large waves-effect waves-light orange">Cliquer ici pour revenir en arrière</a><br><br>' +
        '<br><br><a href="/" class="btn-large waves-effect waves-light orange">Cliquer ici pour revenir sur l\'acceuil</a><br><br>' +
        '<H5>Si ce lien juste au dessue recharge la page ça veut dire que  l\'acceuil n\'existe pas,attendez que le dev regle le probléme</H5>' +
        '    <div> </body>' +
        '</html>');
    res.end();
}) // fin app get notexists





ms = require('mediaserver'); //ms require

//chargement pour toute les musique
app.get('/portal2end.mp3', function (req, res) {
    ms.pipe(req, res, "./Page web/audioplayer/Portal2end.mp3");
});


var morgan = require('morgan'); // Charge le middleware de logging
var favicon = require('serve-favicon'); // Charge le middleware de favicon


app.use(morgan('combined')) // Active le middleware de logging
    // Indique que le dossier /public contient des fichiers statiques (middleware chargé de base)
    .use(favicon(__dirname + '/public/favicon.ico'))
    .use(function (req, res) { // Répond enfin
        fs.readFile('./Page web/index.html', 'utf-8', function (error, content) {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(content);
        });
    });

var nodemailer = require('nodemailer');


async function main(email, sujet, msg) {



    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'tonipastrecontact@gmail.com',
            pass: 'totoni13'
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'tonipastrecontact@gmail.com', // sender address
        to: 'tonipastrecontact@gmail.com', // list of receivers
        subject: sujet, // Subject line
        html: `Email: ${email}<br>${msg}`, // plain text body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

}