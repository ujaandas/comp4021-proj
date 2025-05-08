const Authentication = (function() {
    // This stores the current signed-in user
    let user = null;

    // This function gets the signed-in user
    const getUser = function() {
        return user;
    }

    // This function sends a sign-in request to the server
    const signin = function(username, password, onSuccess, onError) {
        const jsonData = JSON.stringify({
            username: username,
            password: password
        });

        fetch("/signin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: jsonData
        })
            .then((res) => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then((json) => {
                if (json.status === "error") {
                    if (onError) onError(json.error);
                    return;
                }

                if (json.status === "success") {
                    user = json.user;  // Store the user object
                    if (onSuccess) onSuccess();
                }
            })
            .catch((error) => {
                if (onError) onError(error.message || "Sign-in failed");
            });
    };

    // This function sends a validate request to the server
    const validate = function(onSuccess, onError) {
        //
        // A. Sending the AJAX request to the server
        //
        fetch("/validate", {
            method: "GET",
            credentials: "include"  // Important for session cookies
        })
            .then((res) => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then((json) => {
                //
                // C. Processing any error returned by the server
                //
                if (json.status === "error") {
                    user = null;  // Clear any existing user
                    if (onError) onError(json.error);
                    return;
                }

                //
                // E. Handling the success response from the server
                //
                if (json.status === "success") {
                    user = json.user;  // Update with validated user
                    if (onSuccess) onSuccess();
                }
            })
            .catch((error) => {
                user = null;
                if (onError) onError(error.message || "Validation failed");
            });
    };

    // This function sends a sign-out request to the server
    const signout = function(onSuccess, onError) {
        fetch("/signout", {
            method: "GET",
            credentials: "include"  // Important for session cookies
        })
            .then((res) => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then((json) => {
                user = null;  // Clear the local user
                if (onSuccess) onSuccess();
            })
            .catch((error) => {
                if (onError) onError(error.message || "Sign-out failed");
            });
    };

    return { getUser, signin, validate, signout };
})();