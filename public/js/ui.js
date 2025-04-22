const SignInForm = (function() {
    // This function initializes the UI
    const initialize = function() {
        console.log("Initializing form event listeners"); // Debug log

        // Submit event for the signin form
        $("#login-form").on("submit", (e) => {
            e.preventDefault();
            console.log("Login form submitted"); // Debug log

            const username = $("#login-username").val().trim();
            const password = $("#login-password").val().trim();

            Authentication.signin(username, password,
                () => {
                    console.log("Login successful, connecting socket"); // Debug log
                    Socket.connect();
                },
                (error) => {
                    console.error("Login error:", error); // Debug log
                    $("#login-message").text(error);
                }
            );
        });

        // Submit event for the register form
        $("#register-form").on("submit", (e) => {
            e.preventDefault();
            console.log("Register form submitted"); // Debug log

            const username = $("#register-username").val().trim();
            const password = $("#register-password").val().trim();

            Registration.register(username, password,
                () => {
                    console.log("Registration successful"); // Debug log
                    $("#register-form").get(0).reset();
                    $("#register-message").text("You can sign in now.").removeClass("error");
                },
                (error) => {
                    console.error("Registration error:", error); // Debug log
                    $("#register-message").text(error).addClass("error");
                }
            );
        });
    };

    return { initialize };
})();

const UI = (function() {

    const components = [SignInForm];

    const initialize = function() {
        for (const component of components) {
            component.initialize();
        }
    };

    return { initialize };
})();