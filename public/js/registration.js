const Registration = (function() {
    const register = function(username, password, name, avatar, onSuccess, onError) {
        console.log('Starting registration for username:', username); // Log attempt

        const jsonData = JSON.stringify({
            username: username,
            password: password,
            name: name,
            avatar: avatar
        });

        console.log('Sending registration request with data:', jsonData); // Log request data

        fetch("/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: jsonData
        })
            .then(async (res) => {
                const json = await res.json();
                if (!res.ok) {
                    throw new Error(json.error || "Registration failed");
                }
                return json;
            })
            .then((json) => {
                if (json.status === "error") {
                    if (onError) onError(json.error);
                    return;
                }
                if (onSuccess) onSuccess();
            })
            .catch((error) => {
                if (onError) onError(error.message || "Registration failed");
            });
    };

    return { register };
})();