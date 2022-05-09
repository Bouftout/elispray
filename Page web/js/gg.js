
window.onload = function () {
    document.getElementById('ggbtn').addEventListener('click', function (event) {
        console.log("gg")
        fetch(`${document.location.origin}/gg`, {

            // Adding method type
            method: "POST",
            // Adding headers to the request
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
    })
}