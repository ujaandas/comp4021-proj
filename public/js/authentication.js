const Authentication = (function() {
    // This stores the current signed-in user
    let user = null;

    // This function gets the signed-in user
    const getUser = function() {
        return user;
    }

    // This function sends a sign-in request to the server
    const signin = function(username, password, onSuccess, onError) {
        fetch("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        })
            .then(async (response) => {
                const data = await response.json();

                // First check the JSON status field
                if (data.status === "error") {
                    throw new Error(data.error || "Invalid credentials");
                }

                // Then check HTTP status
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }

                // Finally check for success flag if present
                if (data.success === false) {
                    throw new Error(data.message || "Authentication failed");
                }

                // Store authentication data
                localStorage.setItem('token', data.token || '');
                localStorage.setItem('username', username);

                if (onSuccess) onSuccess({ username });
            })
            .catch((error) => {
                // Clear any authentication data on failure
                localStorage.removeItem('token');
                localStorage.removeItem('username');

                if (onError) onError(error.message || "Login failed");
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