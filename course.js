/* =========================================
   ADA COMMUNITY — COURSE PAGE LOGIC
   Handles:
     · Auth guard
     · Reading ?niche= from URL
     · Filling avatar, niche tag, course title
     · Rendering 4 sequential path cards with sub-topics
     · Expand/collapse accordion for each path
     · Tab toggle: Ready-made Course ↔ Live Class
     · Profile modal (open / close / backdrop / Escape)
     · Home button → dashboard
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* ========== GUARDS ========== */

    if (!window.adaAuth) {
        console.error("ADA: auth.js must load before course.js.");
        return;
    }

    const currentUser = window.adaAuth.getCurrentUser();

    if (!currentUser) {
        window.location.href = "signin.html";
        return;
    }


    /* ========== DOM REFERENCES ========== */

    const homeBtn               = document.getElementById("courseHomeBtn");
    const avatarBtn             = document.getElementById("courseAvatar");
    const courseNicheTag        = document.getElementById("courseNicheTag");
    const courseTitle           = document.getElementById("courseTitle");
    const courseSubtitle        = document.getElementById("courseSubtitle");
    const coursePathsCounter    = document.getElementById("coursePathsCounter");
    const pathGrid              = document.getElementById("pathGrid");
    const courseFooterYear      = document.getElementById("courseFooterYear");

    const tabReady              = document.getElementById("tabReady");
    const tabLive               = document.getElementById("tabLive");

    const mediaFrame            = document.getElementById("mediaFrame");
    const mediaLivePlaceholder  = document.getElementById("mediaLivePlaceholder");
    const liveNextSession       = document.getElementById("liveNextSession");

    const modalBackdrop         = document.getElementById("profileModalBackdrop");
    const modalClose            = document.getElementById("profileModalClose");
    const modal                 = document.getElementById("profileModal");


    /* =========================================
       READ ?niche= FROM URL
       Falls back to "AI Engineer" if missing.
       ========================================= */

    function readNicheFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const raw = params.get("niche");
        if (!raw) return "AI Engineer";
        const trimmed = raw.trim();
        return trimmed || "AI Engineer";
    }

    const currentNiche = readNicheFromUrl();


    /* =========================================
       COURSE CONTENT DATA
       Hybrid model (locked decision C1):
       · Module titles are per-niche
       · Sub-topics are generic (work for any niche)
       ========================================= */

    const MODULE_TITLES = {
        "AI Engineer": [
            "Foundations of AI Engineering",
            "Prompt Patterns & Tooling",
            "Building Your First Agent",
            "Deployment & Scaling"
        ],
        "Cloud Engineer": [
            "Foundations of Cloud Architecture",
            "Core Services & Networking",
            "Building on the Cloud",
            "DevOps & Scaling"
        ],
        "UI/UX Engineer": [
            "Foundations of Design Thinking",
            "Design Systems & Tools",
            "Prototyping with AI",
            "Advanced Interaction Design"
        ],
        "Web Engineer": [
            "Foundations of Web Development",
            "Frontend Craft",
            "Backend & APIs",
            "Performance & Deployment"
        ],
        "Web-App Engineer": [
            "Foundations of Web Apps",
            "Data & State",
            "Building Full-Stack Features",
            "Testing & Shipping"
        ],
        "Network Engineer": [
            "Foundations of Networking",
            "Protocols & Routing",
            "Network Security",
            "Cloud Networking"
        ],
        "Cyber Security": [
            "Foundations of Security",
            "Threat Modelling",
            "Defensive Practices",
            "Incident Response"
        ],
        "Self Employed": [
            "Foundations of Solopreneurship",
            "Finding Your Niche",
            "Building Your Offer",
            "Scaling & Systems"
        ],
        "Community Manager": [
            "Foundations of Community",
            "Member Engagement",
            "Events & Programming",
            "Growth & Metrics"
        ],
        "Project Manager": [
            "Foundations of Project Management",
            "Planning & Scoping",
            "Team & Delivery",
            "Stakeholder Management"
        ],
        "Trader / Business Owner": [
            "Foundations of Business",
            "Market & Strategy",
            "Operations & Finance",
            "Scale & Systems"
        ],
        "Coach / Teacher": [
            "Foundations of Teaching",
            "Curriculum Design",
            "Engaging Learners",
            "Scaling Your Practice"
        ],
        "Musician": [
            "Foundations of Music",
            "Composition & Structure",
            "Production & Tools",
            "Releasing & Distribution"
        ]
    };

    /* Fallback if the niche isn't in the list */
    const DEFAULT_MODULES = [
        "Foundations",
        "Core Concepts",
        "Applied Practice",
        "Advanced Patterns"
    ];

    /* Sub-topics — same for every path, universal language */
    const SUBTOPICS_BY_PATH = [
        /* Path 1 */
        [
            { title: "Understanding the landscape",
              desc: "Get a clear picture of what this path involves and where it can lead." },
            { title: "Setting up your environment",
              desc: "Install the tools and configure your workspace so you're ready to build." },
            { title: "Your first hands-on exercise",
              desc: "Complete a small, concrete task to make the concepts stick." }
        ],
        /* Path 2 */
        [
            { title: "Core principles",
              desc: "Learn the mental models that separate beginners from practitioners." },
            { title: "Common patterns",
              desc: "Study the recurring structures that show up in real-world work." },
            { title: "Practice lab",
              desc: "Apply what you've learned to a self-contained challenge." }
        ],
        /* Path 3 */
        [
            { title: "Designing your approach",
              desc: "Plan before you build. Choose the right strategy for the problem." },
            { title: "Building the real thing",
              desc: "Take a project from idea to working prototype." },
            { title: "Getting feedback",
              desc: "Share your work and iterate based on real input." }
        ],
        /* Path 4 */
        [
            { title: "Advanced techniques",
              desc: "Push beyond the basics with patterns used by professionals." },
            { title: "Scaling your work",
              desc: "Make your skills repeatable, efficient, and reliable." },
            { title: "Next steps and specialisation",
              desc: "Decide where to go next and how to keep growing." }
        ]
    ];


    /* =========================================
       HELPERS
       ========================================= */

    function getInitials(user) {
        const first = (user.firstName || "").trim();
        const last  = (user.surname   || "").trim();
        const f = first ? first.charAt(0) : "";
        const l = last  ? last.charAt(0)  : "";
        return (f + l).toUpperCase() || "··";
    }

    function getModuleTitlesFor(niche) {
        return MODULE_TITLES[niche] || DEFAULT_MODULES;
    }

    function escapeHtml(s) {
        return String(s ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =========================================
       FILL HEADER AREA
       ========================================= */

    function renderHeader() {
        /* Avatar initials */
        if (avatarBtn) {
            avatarBtn.textContent = getInitials(currentUser);
        }

        /* Niche tag */
        if (courseNicheTag) {
            courseNicheTag.textContent = currentNiche;
        }

        /* Course title */
        if (courseTitle) {
            courseTitle.textContent = `How to use AI as an ${currentNiche}`;
        }

        /* Subtitle */
        if (courseSubtitle) {
            courseSubtitle.textContent =
                "A guided path from foundation to advanced practice. " +
                "Expand each path to see the topics inside.";
        }

        /* Footer year */
        if (courseFooterYear) {
            courseFooterYear.textContent = new Date().getFullYear();
        }
    }


    /* =========================================
       RENDER PATH CARDS
       ========================================= */

    function renderPathCard(index, title) {
        const number = index + 1;
        const subtopics = SUBTOPICS_BY_PATH[index] || [];

        const card = document.createElement("article");
        card.className = "path-card";
        card.dataset.pathIndex = String(index);

        card.innerHTML = `
            <button class="path-header" type="button"
                    aria-expanded="false"
                    aria-controls="path-body-${index}">
                <span class="path-number">${number}</span>
                <span class="path-heading">
                    <span class="path-title">${escapeHtml(title)}</span>
                    <span class="path-meta">Path ${number} · ${subtopics.length} topics</span>
                </span>
                <span class="path-arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18"
                         fill="none" stroke="currentColor"
                         stroke-width="2.2" stroke-linecap="round"
                         stroke-linejoin="round">
                        <path d="M9 6l6 6-6 6"/>
                    </svg>
                </span>
            </button>

            <div class="path-progress" aria-hidden="true">
                <div class="path-progress-fill" style="width: 0%"></div>
            </div>

            <div class="path-subtopics" id="path-body-${index}">
                <div class="path-subtopics-inner">
                    <div class="path-subtopics-list">
                        ${subtopics.map((s, i) => `
                            <div class="subtopic">
                                <span class="subtopic-icon" aria-hidden="true">${i + 1}</span>
                                <div class="subtopic-body">
                                    <p class="subtopic-title">${escapeHtml(s.title)}</p>
                                    <p class="subtopic-desc">${escapeHtml(s.desc)}</p>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            </div>
        `;

        /* Wire the header button as an accordion toggle */
        const header = card.querySelector(".path-header");
        header.addEventListener("click", () => {
            const isExpanded = card.classList.toggle("expanded");
            header.setAttribute("aria-expanded", isExpanded ? "true" : "false");
        });

        return card;
    }

    function renderAllPaths() {
        if (!pathGrid) return;

        pathGrid.innerHTML = "";

        const titles = getModuleTitlesFor(currentNiche);

        titles.forEach((title, i) => {
            pathGrid.appendChild(renderPathCard(i, title));
        });

        if (coursePathsCounter) {
            coursePathsCounter.textContent = `0 / ${titles.length} completed`;
        }
    }


    /* =========================================
       TAB TOGGLE — Ready-made ↔ Live Class
       ========================================= */

    function setActiveTab(mode) {
        if (!tabReady || !tabLive) return;

        const isReady = mode === "ready";

        tabReady.classList.toggle("active", isReady);
        tabLive.classList.toggle("active", !isReady);
        tabReady.setAttribute("aria-selected", isReady ? "true" : "false");
        tabLive.setAttribute("aria-selected", isReady ? "false" : "true");

        /* Swap media area */
        if (mediaFrame)            mediaFrame.hidden = !isReady;
        if (mediaLivePlaceholder)  mediaLivePlaceholder.hidden = isReady;
    }

    if (tabReady) tabReady.addEventListener("click", () => setActiveTab("ready"));
    if (tabLive)  tabLive.addEventListener("click",  () => setActiveTab("live"));

    /* Set a realistic next-session line */
    if (liveNextSession) {
        liveNextSession.textContent = "Saturdays · 8:00 PM WAT";
    }


    /* =========================================
       PROFILE MODAL
       ========================================= */

    let profileMounted = false;

    function openModal() {
        if (!modalBackdrop) return;

        modalBackdrop.hidden = false;
        document.body.classList.add("modal-lock");

        /* Mount the shared profile component once */
        if (!profileMounted) {
            const container = modalBackdrop.querySelector("[data-profile-view]");
            if (container && window.adaProfileView) {
                window.adaProfileView.mount(container);
                profileMounted = true;
            }
        }

        /* Focus the close button for accessibility */
        if (modalClose) modalClose.focus();
    }

    function closeModal() {
        if (!modalBackdrop) return;
        modalBackdrop.hidden = true;
        document.body.classList.remove("modal-lock");
    }

    if (avatarBtn)    avatarBtn.addEventListener("click", openModal);
    if (modalClose)   modalClose.addEventListener("click", closeModal);

    /* Click on backdrop (but not on the modal panel itself) */
    if (modalBackdrop) {
        modalBackdrop.addEventListener("click", (event) => {
            if (event.target === modalBackdrop) closeModal();
        });
    }

    /* Escape closes the modal */
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !modalBackdrop.hidden) {
            closeModal();
        }
    });


    /* =========================================
       HOME BUTTON
       ========================================= */

    if (homeBtn) {
        homeBtn.addEventListener("click", () => {
            window.location.href = "dashboard.html";
        });
    }


    /* =========================================
       INITIAL RENDER
       ========================================= */

    renderHeader();
    renderAllPaths();
    setActiveTab("ready");

});