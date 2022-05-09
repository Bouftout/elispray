fetch(`${document.location.origin}/disco`, {

    // Adding method type
    method: "POST",
    // Adding headers to the request
    headers: {
        "Content-type": "application/json; charset=UTF-8"
    }
})