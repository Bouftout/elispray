function sug(){
    var value = document.getElementById("textenvoie").value;
console.log(value);
    fetch(`${document.location.origin}/envoie`, {

        // Adding method type
        method: "POST",

        // Adding body or contents to send
        body: JSON.stringify({
            info: value
        }),

        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })

    const request = new XMLHttpRequest();
    request.open("POST", "https://discord.com/api/webhooks/971331272435720212/uDx0FUOcbL5eSJkZ7pInfEuAH6jZmog_sMA_Srn98lSvlIpLjC4UUphc2BIM_bk5AcaU");

    request.setRequestHeader('Content-type', 'application/json');

    const params = {
      username: "So-6",
      avatar_url: "",
      content: value
    }

    request.send(JSON.stringify(params));
}