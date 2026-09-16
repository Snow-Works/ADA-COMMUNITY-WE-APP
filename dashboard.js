/* =========================================
   ADA COMMUNITY — DASHBOARD LOGIC
   Handles:
     · Auth guard (redirects if not logged in)
     · Welcome heading (personalised)
     · Worldwide analytics chart (mock data)
     · My Usage Statistics (real chat count)
     · Recently Used (from chat history)
     · Drawer niche list (from user's roadmap picks)
     · Profile view (avatar, details, tools, paths)
     · Drawer open/close (button, X, overlay, Escape)
     · View swap (list ↔ profile)
     · Edit My Paths → roadmap.html?mode=edit
     · Log Out → landing page
     · ADA AI → chatbox.html
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* ========== GUARDS ========== */

    if (!window.adaAuth) {
        console.error("ADA: auth.js must load before dashboard.js.");
        return;
    }

    const currentUser = window.adaAuth.getCurrentUser();

    if (!currentUser) {
        window.location.href = "signin.html";
        return;
    }


    /* ========== DOM REFERENCES ========== */

    const welcomeHeading  = document.getElementById("welcomeHeading");
    const welcomeSubtext  = document.getElementById("welcomeSubtext");
    const worldwideChart  = document.getElementById("worldwideChart");
    const usageMessages   = document.getElementById("usageMessages");
    const usageSparkline  = document.getElementById("usageSparkline");
    const recentList      = document.getElementById("recentList");
    const footerYear      = document.getElementById("footerYear");

    const hamburgerBtn    = document.getElementById("hamburgerBtn");
    const drawer          = document.getElementById("mobileDrawer");
    const overlay         = document.getElementById("navOverlay");
    const drawerClose     = document.getElementById("drawerClose");

    const drawerNicheList = document.getElementById("drawerNicheList");
    const drawerProfileRow= document.getElementById("drawerProfileRow");
    const drawerAvatarSm  = document.getElementById("drawerAvatarSm");
    const drawerProfileLabel = document.getElementById("drawerProfileLabel");
    const drawerAdaButton = document.getElementById("drawerAdaButton");

    const drawerViewList  = document.getElementById("drawerViewList");
    const drawerViewProfile = document.getElementById("drawerViewProfile");
    const profileBack     = document.getElementById("profileBack");

    const profileAvatarLg = document.getElementById("profileAvatarLg");
    const profileUsername = document.getElementById("profileUsername");

    const detailName      = document.getElementById("detailName");
    const detailUsername  = document.getElementById("detailUsername");
    const detailEmail     = document.getElementById("detailEmail");
    const detailPhone     = document.getElementById("detailPhone");
    const detailPassword  = document.getElementById("detailPassword");

    const profileTools    = document.getElementById("profileTools");
    const profilePaths    = document.getElementById("profilePaths");

    const editPathsBtn    = document.getElementById("editPathsBtn");
    const logoutBtn       = document.getElementById("logoutBtn");


    /* =========================================
       HELPERS
       ========================================= */

    function getInitials(user) {
        const first = (user.firstName || "").trim();
        const last  = (user.surname   || "").trim();

        const f = first ? first.charAt(0) : "";
        const l = last  ? last.charAt(0)  : "";

        const initials = (f + l).toUpperCase();
        return initials || "··";
    }

    function getDisplayName(user) {
        const first = (user.firstName || "").trim();
        const last  = (user.surname   || "").trim();
        const full  = `${first} ${last}`.trim();
        return full || user.username || "User";
    }

    /* Safely read the chat history that chatbox.js uses */
    function getChatHistory() {
        try {
            const raw = localStorage.getItem("adaCommunityConversations");
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    /* Count every message across every conversation */
    function countTotalMessages(conversations) {
        return conversations.reduce((total, c) => {
            const messages = Array.isArray(c.messages) ? c.messages.length : 0;
            return total + messages;
        }, 0);
    }


    /* =========================================
       WELCOME
       ========================================= */

    function renderWelcome() {
        if (!welcomeHeading) return;

        const first = (currentUser.firstName || "").trim();
        welcomeHeading.textContent = first
            ? `Welcome back, ${first}`
            : `Welcome back`;

        if (welcomeSubtext) {
            const niches = (currentUser.roadmap && currentUser.roadmap.niches) || [];
            welcomeSubtext.textContent = niches.length > 0
                ? "Here's what's happening on your dashboard today."
                : "Set your paths to unlock personalised content.";
        }
    }


    /* =========================================
       WORLDWIDE ANALYTICS (mock)
       Placeholder until a real backend feeds this.
       ========================================= */
    const WORLDWIDE_DAYS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const WORLDWIDE_DATA  = [42, 58, 45, 72, 63, 55, 68];

    /* One color per weekday — cool sweep from brand green to warm amber */
    const WORLDWIDE_COLORS = [
        "37, 211, 102",   // Mon — brand emerald
        "20, 184, 166",   // Tue — teal
        "6, 182, 212",    // Wed — cyan
        "59, 130, 246",   // Thu — blue
        "139, 92, 246",   // Fri — violet
        "236, 72, 153",   // Sat — pink
        "245, 158, 11"    // Sun — amber
    ];

    function renderWorldwideChart() {
        if (!worldwideChart) return;

        worldwideChart.innerHTML = "";

        const max = Math.max(...WORLDWIDE_DATA);

        WORLDWIDE_DATA.forEach((value, i) => {
            const wrap = document.createElement("div");
            wrap.className = "chart-bar-wrap";

            const bar = document.createElement("div");
            bar.className = "chart-bar";
            /* Height as % of the tallest value */
            bar.style.height = `${Math.round((value / max) * 100)}%`;
            /* Per-bar color passed into CSS via a variable */
            bar.style.setProperty(
                "--bar-rgb",
                WORLDWIDE_COLORS[i % WORLDWIDE_COLORS.length]
            );

            const label = document.createElement("span");
            label.className = "chart-label";
            label.textContent = WORLDWIDE_DAYS[i];

            wrap.appendChild(bar);
            wrap.appendChild(label);
            worldwideChart.appendChild(wrap);
        });
    }


    /* =========================================
       MY USAGE STATISTICS
       Reads the real chat count from localStorage,
       shows a fixed sparkline for visual interest.
       ========================================= */

    const USAGE_SPARKLINE_POINTS = [20, 35, 30, 50, 45, 65, 55];

    function renderUsageStats() {
        const conversations = getChatHistory();
        const totalMessages = countTotalMessages(conversations);

        if (usageMessages) {
            usageMessages.textContent = totalMessages.toLocaleString();
        }

        if (usageSparkline) {
            usageSparkline.innerHTML = buildSparklineSVG(USAGE_SPARKLINE_POINTS);
        }
    }



        function buildSparklineSVG(data) {
        const W = 120, H = 44, PAD = 4;
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;

        const stepX = (W - PAD * 2) / (data.length - 1);

        const points = data.map((value, i) => {
            const x = PAD + i * stepX;
            const y = H - PAD - ((value - min) / range) * (H - PAD * 2);
            return { x, y };
        });

        const linePath = points
            .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
            .join(" ");

        const areaPath =
            `${linePath} L ${points[points.length - 1].x} ${H - PAD} L ${points[0].x} ${H - PAD} Z`;

        return `
            <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                    <linearGradient id="sparkLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%"   stop-color="#25D366"/>
                        <stop offset="45%"  stop-color="#06b6d4"/>
                        <stop offset="100%" stop-color="#8b5cf6"/>
                    </linearGradient>
                    <linearGradient id="sparkArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stop-color="#06b6d4" stop-opacity="0.28"/>
                        <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
                    </linearGradient>
                </defs>
                <path d="${areaPath}" fill="url(#sparkArea)"/>
                <path d="${linePath}" fill="none" stroke="url(#sparkLine)" stroke-width="2.2"
                      stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    }



   

    /* =========================================
       RECENTLY USED
       Pulls the 3 most recent conversations.
       Placeholder if none exist.
       ========================================= */


           /* Deterministic color picker — same title always gets same color */
    function colorForTitle(title) {
        const palette = [
            { bg: "rgba(37, 211, 102, 0.16)", fg: "#25D366" }, // green
            { bg: "rgba(6, 182, 212, 0.16)",  fg: "#06b6d4" }, // cyan
            { bg: "rgba(59, 130, 246, 0.16)", fg: "#3b82f6" }, // blue
            { bg: "rgba(139, 92, 246, 0.16)", fg: "#8b5cf6" }, // violet
            { bg: "rgba(236, 72, 153, 0.16)", fg: "#ec4899" }, // pink
            { bg: "rgba(245, 158, 11, 0.16)", fg: "#f59e0b" }, // amber
            { bg: "rgba(20, 184, 166, 0.16)", fg: "#14b8a6" }  // teal
        ];

        const clean = String(title || "?").trim();
        let hash = 0;
        for (let i = 0; i < clean.length; i++) {
            hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
        }
        return palette[hash % palette.length];
    }

    function initialFromTitle(title) {
        const clean = String(title || "").trim();
        if (!clean) return "?";

        /* Skip leading punctuation / quotes so "hello.." gives "H" not "." */
        const match = clean.match(/[A-Za-z0-9\u00C0-\u024F]/);
        return match ? match[0].toUpperCase() : "?";
    }

    function renderRecentlyUsed() {
        if (!recentList) return;

        recentList.innerHTML = "";

        const conversations = getChatHistory();

        /* Sort by createdAt descending, newest first */
        const sorted = [...conversations].sort((a, b) => {
            const ta = new Date(a.createdAt || 0).getTime();
            const tb = new Date(b.createdAt || 0).getTime();
            return tb - ta;
        });

        const topThree = sorted.slice(0, 3);

        if (topThree.length === 0) {
            const empty = document.createElement("li");
            empty.className = "recent-empty";
            empty.textContent = "Nothing yet — start a chat with ADA AI.";
            recentList.appendChild(empty);
            return;
        }

        topThree.forEach((c) => {
            const title = c.title || "Untitled conversation";
            const color = colorForTitle(title);
            const initial = initialFromTitle(title);

            const li = document.createElement("li");
            li.className = "recent-item";

            const avatar = document.createElement("span");
            avatar.className = "recent-avatar";
            avatar.textContent = initial;
            avatar.style.background = color.bg;
            avatar.style.color = color.fg;
            avatar.style.boxShadow = `0 0 0 1px ${color.fg}33`;

            const text = document.createElement("span");
            text.className = "recent-text";
            text.textContent = title;

            li.appendChild(avatar);
            li.appendChild(text);

            li.addEventListener("click", () => {
                window.location.href = "chatbox.html";
            });

            recentList.appendChild(li);
        });
    }


    

    /* =========================================
       DRAWER — NICHE LIST
       One row per picked niche. Empty state if none.
       ========================================= */

    function renderDrawerNicheList() {
        if (!drawerNicheList) return;

        drawerNicheList.innerHTML = "";

        const niches = (currentUser.roadmap && currentUser.roadmap.niches) || [];

        if (niches.length === 0) {
            const empty = document.createElement("div");
            empty.className = "drawer-niche-empty";
            empty.textContent = "You haven't picked a path yet. Open your profile to set one.";
            drawerNicheList.appendChild(empty);
            return;
        }

        niches.forEach((niche) => {
            const link = document.createElement("a");
            link.className = "drawer-niche-item";
            link.href = `course.html?niche=${encodeURIComponent(niche)}`;

            const icon = document.createElement("span");
            icon.className = "niche-icon";
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = "✦";

            const text = document.createElement("span");
            text.className = "niche-text";
            text.textContent = "Learn how to use AI as ";

            const name = document.createElement("strong");
            name.className = "niche-name";
            name.textContent = niche;

            text.appendChild(name);

            link.appendChild(icon);
            link.appendChild(text);

            /* Close the drawer when the user navigates */
            link.addEventListener("click", () => closeMenu());

            drawerNicheList.appendChild(link);
        });
    }


    /* =========================================
       PROFILE VIEW — CONTENT
       ========================================= */

    function renderProfile() {
        const initials   = getInitials(currentUser);
        const displayName = getDisplayName(currentUser);

        /* Small avatar in the drawer list */
        if (drawerAvatarSm)     drawerAvatarSm.textContent = initials;
        if (drawerProfileLabel) drawerProfileLabel.textContent = displayName;

        /* Large avatar in the profile hero */
        if (profileAvatarLg)    profileAvatarLg.textContent = initials;
        if (profileUsername)    profileUsername.textContent = `@${currentUser.username || "user"}`;

        /* Detail rows */
        if (detailName)     detailName.textContent     = displayName;
        if (detailUsername) detailUsername.textContent = currentUser.username || "—";
        if (detailEmail)    detailEmail.textContent    = currentUser.email    || "—";
        if (detailPhone)    detailPhone.textContent    = currentUser.phone    || "—";

        /* Password is masked — always */
        if (detailPassword) detailPassword.textContent = "••••••••";

        /* Tool + path chips */
        renderChipRow(profileTools, (currentUser.roadmap && currentUser.roadmap.tools) || [], "No tools picked yet");
        renderChipRow(profilePaths, (currentUser.roadmap && currentUser.roadmap.niches) || [], "No paths picked yet");
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


    /* =========================================
       DRAWER — OPEN / CLOSE
       ========================================= */

    function openMenu() {
        if (!drawer) return;
        drawer.classList.add("open");
        overlay.classList.add("active");
        document.body.classList.add("menu-lock");
        hamburgerBtn.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
        if (!drawer) return;
        drawer.classList.remove("open");
        overlay.classList.remove("active");
        document.body.classList.remove("menu-lock");
        hamburgerBtn.setAttribute("aria-expanded", "false");

        /* Reset to list view so next open starts from the top */
        showListView();
    }

    function toggleMenu() {
        if (drawer.classList.contains("open")) {
            closeMenu();
        } else {
            openMenu();
        }
    }


    /* =========================================
       DRAWER — VIEW SWAP
       ========================================= */

    function showListView() {
        if (!drawerViewList || !drawerViewProfile) return;
        drawerViewList.hidden = false;
        drawerViewProfile.hidden = true;
        drawerViewProfile.scrollTop = 0;
    }

    function showProfileView() {
        if (!drawerViewList || !drawerViewProfile) return;
        drawerViewList.hidden = true;
        drawerViewProfile.hidden = false;
        drawerViewProfile.scrollTop = 0;
    }


    /* =========================================
       WIRING
       ========================================= */

    /* Hamburger toggle */
    if (hamburgerBtn) hamburgerBtn.addEventListener("click", toggleMenu);

    /* Close button inside drawer */
    if (drawerClose) drawerClose.addEventListener("click", closeMenu);

    /* Tap the blurred backdrop */
    if (overlay) overlay.addEventListener("click", closeMenu);

    /* Escape closes */
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && drawer.classList.contains("open")) {
            closeMenu();
        }
    });

    /* Profile row → open profile view */
    if (drawerProfileRow) {
        drawerProfileRow.addEventListener("click", showProfileView);
    }

    /* Back → return to list view */
    if (profileBack) {
        profileBack.addEventListener("click", showListView);
    }

    /* ADA AI button → chatbox */
    if (drawerAdaButton) {
        drawerAdaButton.addEventListener("click", () => {
            window.location.href = "chatbox.html";
        });
    }

    /* Edit My Paths → roadmap in edit mode */
    if (editPathsBtn) {
        editPathsBtn.addEventListener("click", () => {
            window.location.href = "roadmap.html?mode=edit";
        });
    }

    /* Log Out → clear session and go home */
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            window.adaAuth.logout();
        });
    }

    /* Footer year */
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }


    /* =========================================
       INITIAL RENDER
       ========================================= */

    renderWelcome();
    renderWorldwideChart();
    renderUsageStats();
    renderRecentlyUsed();
    renderDrawerNicheList();
    renderProfile();

    /* Ensure we always start on the list view */
    showListView();

});