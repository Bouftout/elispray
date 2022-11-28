window.onload = function() {
    document.getElementById('ggbtn').addEventListener('click', function(event) {
        submit()

        setTimeout(function() {
            location.reload();
        }, 1000);


    })

    async function submit() {
        await fetch(`${document.location.origin}/gg`, {
            method: 'POST',
        });
    }




}