const SignInForm = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Toggle between forms
        $("#show-register").on("click", function(e) {
            e.preventDefault();
            $("#signin-section").removeClass("active");
            $("#register-section").addClass("active");
            $("#signin-message").text(""); // Clear messages
        });

        $("#show-signin").on("click", function(e) {
            e.preventDefault();
            $("#register-section").removeClass("active");
            $("#signin-section").addClass("active");
            $("#register-message").text(""); // Clear messages
        });
        // Populate the avatar selection
        Avatar.populate($("#register-avatar"));

        // Hide it
        $("#signin-overlay").hide();

        // Submit event for the signin form
        $("#signin-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#signin-username").val().trim();
            const password = $("#signin-password").val().trim();

            // Send a signin request
            Authentication.signin(username, password,
                () => {
                    hide();
                    UserPanel.update(Authentication.getUser());
                    UserPanel.show();

                    Socket.connect();
                },
                (error) => { $("#signin-message").text(error); }
            );
        });

        // Submit event for the register form
        $("#register-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#register-username").val().trim();
            const avatar   = $("#register-avatar").val();
            const name     = $("#register-name").val().trim();
            const password = $("#register-password").val().trim();
            const confirmPassword = $("#register-confirm").val().trim();

            // Password and confirmation does not match
            if (password !== confirmPassword) {
                $("#register-message").text("Passwords do not match.");
                return;
            }

            // Send a register request
            Registration.register(username, avatar, name, password,
                () => {
                    $("#register-form").get(0).reset();
                    $("#register-message").text("You can sign in now.");
                    // Switch to sign-in form
                    $("#register-section").removeClass("active");
                    $("#signin-section").addClass("active");
                },
                (error) => { $("#register-message").text(error); }
            );
        });
    };

    const show = function() {
        $("#signin-section").addClass("active");
        $("#register-section").removeClass("active");
        $("#signin-overlay").fadeIn(500);
    };

    // This function hides the form
    const hide = function() {
        $("#signin-form").get(0).reset();
        $("#signin-message").text("");
        $("#register-message").text("");
        $("#signin-overlay").fadeOut(500);
    };

    return { initialize, show, hide };
})();

const UserPanel = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#user-panel").hide();

        // Click event for the signout button
        $("#signout-button").on("click", () => {
            // Send a signout request
            Authentication.signout(
                () => {
                    Socket.disconnect();

                    hide();
                    SignInForm.show();
                }
            );
        });
    };

    // This function shows the form with the user
    const show = function(user) {
        $("#user-panel").show();
    };

    // This function hides the form
    const hide = function() {
        $("#user-panel").hide();
    };

    // This function updates the user panel
    const update = function(user) {
        if (user) {
            $("#user-panel .user-avatar").html(Avatar.getCode(user.avatar));
            $("#user-panel .user-name").text(user.name);
        }
        else {
            $("#user-panel .user-avatar").html("");
            $("#user-panel .user-name").text("");
        }
    };

    return { initialize, show, hide, update };
})();

const OnlineUsersPanel = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Add click handler for game invitations
        $("#online-users-area").on("click", ".invite-button", function() {
            const username = $(this).data("username");
            Socket.sendGameInvite(username);
        });
    };

    // This function updates the online users panel
    // This function updates the online users panel
    const update = function(onlineUsers) {
        const onlineUsersArea = $("#online-users-area");

        // Clear the online users area
        onlineUsersArea.empty();

        // Get the current user
        const currentUser = Authentication.getUser();

        // Add the user one-by-one
        for (const username in onlineUsers) {
            if (username !== currentUser.username) {
                const user = onlineUsers[username];

                const userDiv = $("<div id='username-" + username + "' class='online-user'></div>")
                    .append(UI.getUserDisplay(user))
                    .append($("<button class='invite-button' data-username='" + username + "'>Invite to Game</button>"));

                onlineUsersArea.append(userDiv);
            }
        }

        // Add a debug message if the area is empty
        if (Object.keys(onlineUsers).length <= 1) {  // Only the current user
            onlineUsersArea.append("<p class='info-message'>No other users online right now.</p>");
        }
    };

    // This function adds a user in the panel
    const addUser = function(user) {
        const onlineUsersArea = $("#online-users-area");

        // Find the user
        const userDiv = onlineUsersArea.find("#username-" + user.username);

        // Add the user if not already present
        if (userDiv.length === 0) {
            const newUserDiv = $("<div id='username-" + user.username + "' class='online-user'></div>")
                .append(UI.getUserDisplay(user))
                .append($("<button class='invite-button' data-username='" + user.username + "'>Invite to Game</button>"));

            onlineUsersArea.append(newUserDiv);
        }
    };

// Add it to the return statement

    // This function removes a user from the panel
    const removeUser = function(user) {
        const onlineUsersArea = $("#online-users-area");

        // Find the user
        const userDiv = onlineUsersArea.find("#username-" + user.username);

        // Remove the user
        if (userDiv.length > 0) userDiv.remove();
    };

    return { initialize, update, addUser, removeUser };
})();

const UI = (function() {
    // This function gets the user display
    const getUserDisplay = function(user) {
        return $("<div class='field-content row shadow'></div>")
            .append($("<span class='user-avatar'>" +
                Avatar.getCode(user.avatar) + "</span>"))
            .append($("<span class='user-name'>" + user.name + "</span>"));
    };

    // The components of the UI are put here
    const components = [SignInForm, UserPanel, OnlineUsersPanel];

    // This function initializes the UI
    const initialize = function() {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    // In UI.js, add this to the UI object
    const showNotification = function(message, duration = 3000) {
        const toast = document.getElementById('notification-toast');
        toast.textContent = message;
        toast.classList.add('show');
        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hidden');
        }, duration);
    };

    return { getUserDisplay, initialize, showNotification };
})();