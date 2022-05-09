window.onload = function() {

document.getElementById('change').addEventListener('click', function (event) {
var emaildiv = document.getElementById('emaildiv');
var usernamediv = document.getElementById('usernamediv');

    if(emaildiv.style.display == 'none'){

        usernamediv.style.display = 'none';
        emaildiv.style.display = null;

    }else{

        emaildiv.style.display = 'none';
        usernamediv.style.display = null;

    }

});

const createbtn = document.getElementById('createbtn');

if(createbtn){
    createbtn.addEventListener('click', function (event) {

        window.location.href='/create'
    
    });
}




}

