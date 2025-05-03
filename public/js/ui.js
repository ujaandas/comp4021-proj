const SignInForm = (function() {
    let isLoginMode = true; // Track current mode

    const initialize = function() {
        console.log("Initializing form event listeners");

        // Toggle between modes
        $("#toggle-auth-mode").on("click", function(e) {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            updateFormMode();
        });

        // Submit handler for the auth form
        $("#auth-submit-form").on("submit", function(e) {
            e.preventDefault();
            const username = $("#auth-username").val().trim();
            const password = $("#auth-password").val().trim();

            if (isLoginMode) {
                console.log("Login form submitted");
                Authentication.signin(username, password,
                    () => {
                        console.log("Login successful, connecting socket");
                        Socket.connect();
                        showLoggedInUI(username);
                    },
                    (error) => {
                        console.error("Login error:", error);
                        $("#auth-message").text(error).addClass("error").show();
                    }
                );
            } else {
                console.log("Register form submitted");
                const passwordConfirm = $("#auth-password-confirm").val().trim();
                const name = $("#auth-name").val().trim();
                const avatar = $("#auth-avatar").val();

                if (password !== passwordConfirm) {
                    $("#auth-message").text("Passwords do not match").addClass("error").show();
                    $("#auth-password").addClass("password-mismatch");
                    $("#auth-password-confirm").addClass("password-mismatch");
                    return;
                } else {
                    $("#auth-password").removeClass("password-mismatch").addClass("password-match");
                    $("#auth-password-confirm").removeClass("password-mismatch").addClass("password-match");
                }

                if (password.length < 6) {
                    $("#auth-message").text("Password should be at least 6 characters").addClass("error").show();
                    return;
                }

                // Check name is provided
                if (!name) {
                    $("#auth-message").text("Please enter your name").addClass("error").show();
                    return;
                }

                Registration.register(username, password, name, avatar,
                    () => {
                        console.log("Registration successful");
                        $("#auth-message").text("You can sign in now.")
                            .removeClass("error").addClass("success").show();
                        // Switch to login mode after registration
                        isLoginMode = true;
                        updateFormMode();
                    },
                    (error) => {
                        console.error("Registration error:", error);
                        $("#auth-message").text(error).addClass("error").show();
                    }
                );
            }
        });

        // Logout button handler
        $("#logout-btn").on("click", function(e) {
            e.preventDefault();
            logout();
        });

        // Initial setup
        updateFormMode();
    };

    const updateFormMode = function() {
        if (isLoginMode) {
            $("#auth-title").text("Login");
            $("#auth-submit-btn").text("Login");
            $("#toggle-auth-mode").text("Need to register?");
            $("#password-confirm-field").hide();
            $("#name-field").hide();
            $("#avatar-field").hide();
            $("#auth-password-confirm").removeAttr("required");
        } else {
            $("#auth-title").text("Register");
            $("#auth-submit-btn").text("Register");
            $("#toggle-auth-mode").text("Already have an account?");
            $("#password-confirm-field").show();
            $("#name-field").show();
            $("#avatar-field").show();
            $("#auth-password-confirm").attr("required", "true");
            $("#auth-name").attr("required", "true");
        }
        // Clear form and messages
        $("#auth-submit-form").trigger("reset");
        $("#auth-message").text("").removeClass("error success").hide();
    };

    const showLoggedInUI = function(username) {
        $("#auth-form").hide();
        $("#logout-section").show();
        $("#logged-in-user").text("Welcome, " + username);
    };

    const showLoggedOutUI = function() {
        $("#auth-form").show();
        $("#logout-section").hide();
        isLoginMode = true;
        updateFormMode();
    };

    const logout = function() {
        Socket.disconnect();
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        showLoggedOutUI();
        $('#logout-message').text('You have been logged out').show();
        setTimeout(() => $('#logout-message').fadeOut(), 3000);
    };

    return {
        initialize,
        showLoggedInUI,
        showLoggedOutUI
    };
})();

const UI = (function() {
    const initialize = function() {
        SignInForm.initialize();

        if (localStorage.getItem('token')) {
            SignInForm.showLoggedInUI(localStorage.getItem('username'));
        }
    };

    return { initialize };
})();