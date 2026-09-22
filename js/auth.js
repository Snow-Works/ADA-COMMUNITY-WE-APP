/* =========================================
   ADA COMMUNITY — AUTHENTICATION (PROTOTYPE)
   
   ⚠️  Uses localStorage as a stand-in database.
   ⚠️  Passwords are stored as plaintext.
   ⚠️  This is NOT secure. It is a prototype.
       Swap for a real backend before shipping.
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* ========== STORAGE KEYS ========== */
    const USERS_KEY        = "adaUsers";
    const CURRENT_USER_KEY = "adaCurrentUser";


    /* ========== STORAGE HELPERS ========== */

    function getUsers() {
        try {
            const raw = localStorage.getItem(USERS_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function findUserByEmail(email) {
        const target = email.toLowerCase();
        return getUsers().find(u => u.email.toLowerCase() === target) || null;
    }

    function findUserByUsername(username) {
        const target = username.toLowerCase();
        return getUsers().find(u => u.username.toLowerCase() === target) || null;
    }

    function setCurrentUser(username) {
        localStorage.setItem(CURRENT_USER_KEY, username);
    }

    function clearCurrentUser() {
        localStorage.removeItem(CURRENT_USER_KEY);
    }

    /* Public helper — other scripts (dashboard, roadmap) will use this */
    window.adaAuth = {
        getCurrentUser: function () {
            const username = localStorage.getItem(CURRENT_USER_KEY);
            if (!username) return null;
            return findUserByUsername(username);
        },
        logout: function () {
            clearCurrentUser();
            window.location.href = "index.html";
        }
    };





        /* =========================================
       PASSWORD VISIBILITY TOGGLE
       ========================================= */

    const toggleButtons = document.querySelectorAll(".toggle-password");

    toggleButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const targetId = button.getAttribute("data-target");
            const input = document.getElementById(targetId);

            if (!input) return;

            const isCurrentlyVisible = input.type === "text";

            input.type = isCurrentlyVisible ? "password" : "text";
            button.classList.toggle("visible", !isCurrentlyVisible);
            button.setAttribute(
                "aria-label",
                isCurrentlyVisible ? "Show password" : "Hide password"
            );

            /* Keep the cursor inside the input so the user can keep typing */
            input.focus();
        });

    });









    /* ========== USERNAME GENERATOR ========== */

    function generateUsername(firstName, surname) {
        const clean = (s) =>
            s.trim().toLowerCase()
             .replace(/\s+/g, "")
             .replace(/[^a-z0-9]/g, "");

        const base = `${clean(firstName)}_${clean(surname)}`;

        let candidate = base;
        let n = 1;
        while (findUserByUsername(candidate)) {
            candidate = `${base}${n}`;
            n++;
        }
        return candidate;
    }


    /* ========== VALIDATION HELPERS ========== */

    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function showError(el, message) {
        if (!el) { alert(message); return; }
        el.textContent = message;
        el.style.display = "block";
        clearTimeout(el._t);
        el._t = setTimeout(() => { el.style.display = "none"; }, 4000);
    }


    /* =========================================
       SIGNUP PAGE
       ========================================= */

    const signupForm   = document.getElementById("signupForm");
    const signupButton = document.getElementById("signupButton");
    const signupError  = document.getElementById("signupError");

    if (signupForm && signupButton) {

        function handleSignup(event) {
            if (event) event.preventDefault();

            const firstName = document.getElementById("signupFirstname").value.trim();
            const surname   = document.getElementById("signupSurname").value.trim();
            const phone     = document.getElementById("signupPhone").value.trim();
            const email     = document.getElementById("signupEmail").value.trim();
            const password  = document.getElementById("signupPassword").value;
            const confirm   = document.getElementById("signupConfirmPassword").value;
            const agreed    = document.getElementById("signupAgree")?.checked;

            if (!firstName || !surname || !phone || !email || !password || !confirm) {
                return showError(signupError, "Please fill in all fields.");
            }
            if (!EMAIL_PATTERN.test(email)) {
                return showError(signupError, "Please enter a valid email address.");
            }
            if (password.length < 6) {
                return showError(signupError, "Password must be at least 6 characters.");
            }
            if (password !== confirm) {
                return showError(signupError, "Passwords do not match.");
            }
            if (!agreed) {
                return showError(signupError, "Please agree to the Terms & Conditions.");
            }
            if (findUserByEmail(email)) {
                return showError(signupError, "An account with that email already exists.");
            }

            const username = generateUsername(firstName, surname);

            const newUser = {
                firstName,
                surname,
                username,
                email,
                phone,
                password,          // ⚠️ prototype only
                roadmapCompleted: false,
                roadmap: { tools: [], niches: [] },
                createdAt: new Date().toISOString()
            };

            const users = getUsers();
            users.push(newUser);
            saveUsers(users);

            setCurrentUser(username);

            /* New users always go through the roadmap first */
            window.location.href = "roadmap.html";
        }

        signupForm.addEventListener("submit", handleSignup);
        signupButton.addEventListener("click", handleSignup);
    }


    /* =========================================
       LOGIN PAGE
       ========================================= */

    const loginForm   = document.getElementById("loginForm");
    const loginButton = document.getElementById("loginButton");
    const loginError  = document.getElementById("loginError");

    if (loginForm && loginButton) {

        function handleLogin(event) {
            if (event) event.preventDefault();

            const email    = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value;

            if (!email || !password) {
                return showError(loginError, "Please fill in all fields.");
            }

            const user = findUserByEmail(email);
            if (!user) {
                return showError(loginError, "No account found with that email.");
            }
            if (user.password !== password) {
                return showError(loginError, "Incorrect password.");
            }

            setCurrentUser(user.username);

            /* Returning users skip roadmap if they already finished it */
            if (user.roadmapCompleted) {
                window.location.href = "dashboard.html";
            } else {
                window.location.href = "roadmap.html";
            }
        }

        loginForm.addEventListener("submit", handleLogin);
        loginButton.addEventListener("click", handleLogin);
    }

});








