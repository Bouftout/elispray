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

    (document.getElementById("btnlog")).addEventListener('click', function(e) {
        /*
        e.preventDefault();
        submit();
*/
    });
}

/*
async function submit() {
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    console.log(email, username, password);
    console.log("submit");
    const data = await fetch(`${document.location.origin}/auth`, {

        method: "POST",

        body: JSON.stringify({
            email: email,
            username: username,
            password: password
        }),

        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })

    if (data.status == 200) {
        //  setTimeout(window.location.href = '/play', 500);
    }


}*/