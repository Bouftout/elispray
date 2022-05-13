window.onload = function() {

    document.getElementById('change').addEventListener('click', function(event) {
        var emaildiv = document.getElementById('emaildiv');
        var usernamediv = document.getElementById('usernamediv');

        if (emaildiv.style.display == 'none') {

            usernamediv.style.display = 'none';
            emaildiv.style.display = null;

            document.getElementById('username').value = "";

        } else {

            emaildiv.style.display = 'none';
            usernamediv.style.display = null;

            document.getElementById('email').value = "";
        }

    });

    const createbtn = document.getElementById('createbtn');

    if (createbtn) {
        createbtn.addEventListener('click', function(event) {

            window.location.href = '/create'

        });
    }

    (document.getElementById("btnlog")).addEventListener('click', function(event) {

        submit();

    });




}


function submit() {




    fetch(`${document.location.origin}/auth`, {

            method: "POST",

            body: JSON.stringify({
                email: (document.getElementById('email').value),
                username: (document.getElementById('username').value),
                password: (document.getElementById('password').value),
            }),

            // Adding headers to the request
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        .then(response => response.json())
        .then(result => {
            window.location.href = '/play';
        }).catch(error => console.log(error));
}