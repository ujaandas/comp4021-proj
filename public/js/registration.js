const Registration = (function() {
    const register = function(username, password, onSuccess, onError) {
        console.log('Starting registration for username:', username); // Log attempt

        const jsonData = JSON.stringify({
            username: username,
            password: password
        });

        console.log('Sending registration request with data:', jsonData); // Log request data

        fetch("/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: jsonData
        })
            .then((res) => {
                console.log('Received response, status:', res.status); // Log response status
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json();
            })
            .then((json) => {
                console.log('Response JSON:', json); // Log full response
                if (json.status === "error") {
                    console.error('Registration error:', json.error); // Log error
                    if (onError) onError(json.error);
                    return;
                }
                console.log('Registration successful for user:', username); // Log success
                if (onSuccess) onSuccess();
            })
            .catch((error) => {
                console.error('Registration failed:', error); // Log failure
                if (onError) onError(error.message || "Registration failed");
            });
    };

    return { register };
})();