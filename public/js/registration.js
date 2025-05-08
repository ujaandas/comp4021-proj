const Registration = (function() {
    // This function sends a register request to the server
    // * `username`  - The username for the sign-in
    // * `avatar`    - The avatar of the user
    // * `name`      - The name of the user
    // * `password`  - The password of the user
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const register = function(username, avatar, name, password, onSuccess, onError) {
        //
        // A. Preparing the user data
        //
        const jsonData = JSON.stringify({
            username: username,
            avatar: avatar,
            name: name,
            password: password
        });

        //
        // B. Sending the AJAX request to the server
        //
        fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: jsonData
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json();
            })
            .then((json) => {
                //
                // F. Processing any error returned by the server
                //
                if (json.status === "error") {
                    if (onError) onError(json.error);
                    return;
                }

                //
                // J. Handling the success response from the server
                //
                if (onSuccess) onSuccess();
            })
            .catch((error) => {
                //
                // Handle network errors or other exceptions
                //
                if (onError) onError(error.message || "Registration failed");
            });
    };

    return { register };
})();