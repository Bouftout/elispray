window.onload = function () {
    const discobtn = document.getElementById('discobtn');

    discobtn.addEventListener('click', function (event) {

        if (confirm("Disconnect ?") == true) {
            window.location.href = '/disco'
        }

    })

}