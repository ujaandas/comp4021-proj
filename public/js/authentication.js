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

        fetch("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: jsonData
        })
            .then((res) => {
                if (!res.ok) throw new Error("Network response was not ok");
                console.log("Login response:", res.json.toString());  // Check what's actually returned
                return res.json();
            })
            .then((json) => {
                if (json.success) {
                    user = json.user;  // Store the user object
                    if (onSuccess) onSuccess();
                }
            })
            .catch((error) => {
                if (onError) onError(error.message || "Sign-in failed");
            });
    };


    // This function sends a sign-out request to the server
    const signout = function(onSuccess, onError) {
        fetch("/auth/logout", {
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

    return { getUser, signin, signout };
})();