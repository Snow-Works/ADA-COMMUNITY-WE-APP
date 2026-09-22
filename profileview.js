/* 
   ADA COMMUNITY — SHARED PROFILE VIEW
   Mounts the user's profile content into any container.
   Used by: dashboard.html (inside drawer), course.html (inside modal)

   Usage:
     window.adaProfileView.mount(containerElement);

   The container should be an empty element with [data-profile-view].
   The component injects markup, fills in the current user's data,
   and wires the Edit Paths + Log Out buttons.
   */

(function () {

    /*  Helpers  */

    function getInitials(user) {
        const first = (user.firstName || "").trim();
        const last = (user.surname || "").trim();
        const f = first ? first.charAt(0) : "";
        const l = last ? last.charAt(0) : "";
        return (f + l).toUpperCase() || "··";
    }

    function getDisplayName(user) {
        const first = (user.firstName || "").trim();
        const last = (user.surname || "").trim();
        const full = `${first} ${last}`.trim();
        return full || user.username || "User";
    }

    function renderChipRow(container, values, emptyText) {
        if (!container) return;
        container.innerHTML = "";

        if (!values || values.length === 0) {
            const empty = document.createElement("span");
            empty.className = "chip-empty";
            empty.textContent = emptyText;
            container.appendChild(empty);
            return;
        }

        values.forEach((value) => {
            const chip = document.createElement("span");
            chip.className = "chip";
            chip.textContent = value;
            container.appendChild(chip);
        });
    }


    /*  Markup template  */

    function buildMarkup() {
        return `
            <div class="profile-hero">
                <div class="profile-avatar-lg" data-profile="avatar">··</div>
                <h3 class="profile-username" data-profile="username">@username</h3>
            </div>

            <div class="profile-card">
                <h4 class="profile-card-title">User Details</h4>

                <div class="detail-row">
                    <span class="detail-label">Name</span>
                    <span class="detail-value" data-profile="name">—</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Username</span>
                    <span class="detail-value" data-profile="detailUsername">—</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email</span>
                    <span class="detail-value" data-profile="email">—</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone</span>
                    <span class="detail-value" data-profile="phone">—</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Password</span>
                    <span class="detail-value" data-profile="password">••••••••</span>
                </div>
            </div>

            <div class="profile-card">
                <h4 class="profile-card-title">Your Tools</h4>
                <div class="chip-row" data-profile="tools"></div>
            </div>

            <div class="profile-card">
                <h4 class="profile-card-title">Your Paths</h4>
                <div class="chip-row" data-profile="paths"></div>
            </div>

            <div class="profile-actions">
                <button class="btn-edit-paths" type="button" data-profile="editPaths">
                    Edit My Paths
                </button>
                <button class="btn-logout" type="button" data-profile="logout">
                    Log Out
                </button>
            </div>

            <footer class="drawer-view-footer">
                <p>ADA COMMUNITY</p>
            </footer>
        `;
    }


    /*  Fill the injected markup with real user data  */

    function fill(container, user) {
        const initials = getInitials(user);
        const displayName = getDisplayName(user);

        container.querySelector('[data-profile="avatar"]').textContent = initials;
        container.querySelector('[data-profile="username"]').textContent = `@${user.username || "user"}`;
        container.querySelector('[data-profile="name"]').textContent = displayName;
        container.querySelector('[data-profile="detailUsername"]').textContent = user.username || "—";
        container.querySelector('[data-profile="email"]').textContent = user.email || "—";
        container.querySelector('[data-profile="phone"]').textContent = user.phone || "—";

        const tools = (user.roadmap && user.roadmap.tools) || [];
        const niches = (user.roadmap && user.roadmap.niches) || [];

        renderChipRow(
            container.querySelector('[data-profile="tools"]'),
            tools,
            "No tools picked yet"
        );
        renderChipRow(
            container.querySelector('[data-profile="paths"]'),
            niches,
            "No paths picked yet"
        );
    }


    /*  Public mount API  */

    function mount(container) {
        if (!container) {
            console.warn("adaProfileView.mount: container not provided.");
            return null;
        }

        if (!window.adaAuth) {
            console.error("adaProfileView: auth.js must load first.");
            return null;
        }

        const user = window.adaAuth.getCurrentUser();
        if (!user) {
            console.warn("adaProfileView: no current user.");
            return null;
        }

        /* Inject the markup */
        container.innerHTML = buildMarkup();

        /* Fill with user data */
        fill(container, user);

        /* Wire Edit Paths */
        const editBtn = container.querySelector('[data-profile="editPaths"]');
        if (editBtn) {
            editBtn.addEventListener("click", () => {
                window.location.href = "roadmap.html?mode=edit";
            });
        }

        /* Wire Log Out */
        const logoutBtn = container.querySelector('[data-profile="logout"]');
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                window.adaAuth.logout();
            });
        }

        /* Return a small refresh API for future use */
        return {
            refresh: function () {
                const fresh = window.adaAuth.getCurrentUser();
                if (!fresh) return;
                fill(container, fresh);
            }
        };
    }

    window.adaProfileView = { mount };

})();