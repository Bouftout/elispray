window.onload = function () {

    ROT.RNG.setSeed(random(0, 9999));
    var W = 80;
    var H = 30;

    var display = new ROT.Display({ fontSize: 12, width: W, height: H });
    document.getElementById("canvas").append(display.getContainer());


    /* create a map */
    var data = [];
    new ROT.Map.Uniform(W, H).create(function (x, y, type) {
        data[x + "," + y] = type;
        display.DEBUG(x, y, type);
    });


    /* input callback */
    function lightPasses(x, y) {
        var key = x + "," + y;
        if (key in data) {
            return (data[key] == 0);
        }
        return false;
    }

    //Pour que le personnage n'avance pas(je verifie ou il va être puis après je lui enleve.)
    function nop(doing) {
        if (doing == "haut") {
            playery++;
        }
        if (doing == "bas") {
            playery--;
        }
        if (doing == "droite") {
            playerx--;
        }
        if (doing == "gauche") {
            playerx++;
        }
    }

    function player(doing) {
        console.log("Doing: " + doing)

        let xa = playerx;
        let xy = playery;

        if (doing == "haut") {
            playery--;
        }
        if (doing == "bas") {
            playery++;
        }
        if (doing == "droite") {
            playerx++;
        }
        if (doing == "gauche") {
            playerx--;
        }

        let stop = false;
        let fight = false;

        if (data[playerx + "," + playery] == 1) {
            stop = true;

            nop(doing)
        }

        if (playerx == mx && playery == my) {
            stop = true;
            fight = true
            nop(doing)
        }




        if (doing == "first") {

            findplacerand();

            playerx = lexy[0];
            playery = lexy[1];
            display.draw(Number(playerx), Number(playery), "@", "#fff");

        }

        monster();

        if (!stop) {
            var fov = new ROT.FOV.PreciseShadowcasting(lightPasses); //Couleur


            //Bouger le prsonnage
            fov.compute(playerx, playery, 5, function (x, y, r, visibility) {
                var ch = (r ? " " : "@");
                var color = (data[x + "," + y] ? "#aa0" : "#660");

                if (doing != "first") {
                    display.draw(x, y, ch, "#fff", color); // Joueurs
                    display.draw(xa, xy, " ", "#666600", "#666600"); //Bloc pour faire disparait celui d'avant
                    //Couleur de l'arrière du fov(lumière) : #666600 (en hex)

                }

            });
        }


    }

    var lexy; // valeur a garder pour placer le personnage a un endroit logique.
    function findplacerand() {

        let x = random(0, W)
        let y = random(0, H);
        if (data[x + "," + y] == 0 && x != playerx && y != playery) {
            lexy = [x, y];
        } else {
            findplacerand()
        }
    }


    function random(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }


    var playerx;
    var playery;
    // first == première fois(lancement du jeu);
    player("first")



    //Player bouger(input gestion key):
    var input = document.createElement("input");
    var out1 = document.createElement("div");
    var out2 = document.createElement("div");
    document.getElementById("dive").append(input, out1, out2);
    input.focus();

    input.addEventListener("keydown", function (e) {
        var code = e.keyCode;

        var vk = "?"; /* find the corresponding constant */
        for (var name in ROT.KEYS) {
            if (ROT.KEYS[name] == code && name.indexOf("VK_") == 0) { vk = name; }
        }

        out1.innerText = "Keydown: code is " + code + " (" + vk + ")";

        if (code == 38) {
            player("haut")
        }
        if (code == 40) {
            player("bas")
        }
        if (code == 37) {
            player("gauche")
        }
        if (code == 39) {
            player("droite")
        }
    });

    input.addEventListener("keypress", function (e) {
        var code = e.charCode;
        var ch = String.fromCharCode(code);
        out2.innerHTML = "Keypress: char is " + ch;
    });


    startmonster();

    var mx;
    var my;

    function startmonster() {

        findplacerand();
        mx = lexy[0];
        my = lexy[1];

        display.draw(Number(mx), Number(my), "r", "#501", "#666600");

    }

    function findplacemonster(){

        x = random(mx, mx+1)
        y = random(my, my+1);
            lexy = [x, y];
    
    }

    function monster() {

        // display.draw(Number(mx), Number(my), "r", "#501", "white");
        findplacemonster();
        console.log(lexy)
        mx = lexy[0];
        my = lexy[1];

        console.log(`Monster : ${mx} + ${my}\nPlayer : ${playerx} + ${playery}\n}`)
   
        display.draw(Number(mx), Number(my), "r", "#501", "#666600");
                
  
    }


}