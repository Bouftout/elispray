window.onload = function() {
    document.getElementById('ggbtn').addEventListener('click', function(event) {
        submit()
            .then(() => {

            })
            .catch(err => console.error("Something failed:", err))

    })

    async function submit() {
        await fetch(`${document.location.origin}/gg`, {
            method: 'POST',
        });
    }




}