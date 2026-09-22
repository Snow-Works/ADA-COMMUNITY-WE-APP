/* ADA COMMUNITY — ROADMAP LOGIC is handling:

     · Edit mode detection (?mode=edit)
     · See More / See Less expansion
     · Option picking (max 2 per section)
     · Live counters
     · Toast on 3rd-pick refusal
     · Submit button enable/disable
     · Pre-fill in edit mode
     · Save + redirect  */

document.addEventListener("DOMContentLoaded", () => {

    /* CONSTANTS  */

    const MAX_PICKS = 2;

    /*  DOM REFERENCES  */

    const toolsGrid      = document.getElementById("toolsGrid");
    const nichesGrid     = document.getElementById("nichesGrid");
    const toolsCounter   = document.getElementById("toolsCounter");
    const nichesCounter  = document.getElementById("nichesCounter");
    const toolsSeeMore   = document.getElementById("toolsSeeMore");
    const nichesSeeMore  = document.getElementById("nichesSeeMore");
    const submitBtn      = document.getElementById("roadmapSubmit");
    const toast          = document.getElementById("roadmapToast");
    const titleEl        = document.getElementById("roadmapTitle");
    const subtitleEl     = document.getElementById("roadmapSubtitle");
    const hintEl         = document.getElementById("roadmapHint");

    /* Bail if we're not on the roadmap page */
    if (!toolsGrid || !nichesGrid || !submitBtn) {
        return;
    }


    /* GUARDS  */

    /* If auth.js didn't load, we can't read the current user */
    if (!window.adaAuth) {
        console.error("ADA: auth.js must load before roadmap.js.");
        return;
    }

    const currentUser = window.adaAuth.getCurrentUser();

    if (!currentUser) {
        /* No logged-in user → push back to signup */
        window.location.href = "signin.html";
        return;
    }


    /*  MODE DETECTION  */

    const params       = new URLSearchParams(window.location.search);
    const isEditMode   = params.get("mode") === "edit";


    /* STATE — what's currently picked */

    const state = {
        tools:  new Set(),
        niches: new Set()
    };


    /* PAGE TEXT — swap labels in edit mode */

    if (isEditMode) {
        if (titleEl)    titleEl.textContent    = "Update your paths";
        if (subtitleEl) subtitleEl.textContent = "Change your selections below. Changes apply immediately.";
        if (submitBtn)  submitBtn.textContent  = "Save Changes";
    }


    /* SEE MORE / SEE LESS  */

    function wireSeeMore(button, grid, sectionLabel) {

        if (!button || !grid) return;

        const extraCount = grid.querySelectorAll(".option-btn.extra").length;

        button.addEventListener("click", () => {

            const expanded = grid.classList.toggle("expanded");
            button.textContent = expanded
                ? "See Less"
                : `See ${extraCount} more ${sectionLabel}`;
        });
    }

    wireSeeMore(toolsSeeMore, toolsGrid, "tools");
    wireSeeMore(nichesSeeMore, nichesGrid, "niches");


    /* TOAST */

    let toastTimer = null;

    function showToast(message) {

        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2200);
    }


    /* COUNTER UPDATES */

    function updateCounter(counterEl, count) {

        if (!counterEl) return;

        counterEl.textContent = `${count} / ${MAX_PICKS} selected`;
        counterEl.classList.toggle("full", count >= MAX_PICKS);
    }


    /* SUBMIT BUTTON STATE */

    function refreshSubmitState() {

        const ready =
            state.tools.size  >= 1 &&
            state.niches.size >= 1;

        submitBtn.disabled = !ready;

        /* Update the hint text based on what's missing */
        if (!hintEl) return;

        if (ready) {
            hintEl.textContent = isEditMode
                ? "Save your changes when you're ready"
                : "All set — head to your dashboard";
            return;
        }

        const missing = [];
        if (state.tools.size  < 1) missing.push("1 tool");
        if (state.niches.size < 1) missing.push("1 niche");

        hintEl.textContent = `Pick at least ${missing.join(" and ")} to continue`;
    }


    /*  OPTION PICKING */

    function handleOptionClick(button, sectionKey) {

        const value  = button.dataset.value;
        const picked = state[sectionKey];

        /* Already picked → unpick it */
        if (picked.has(value)) {
            picked.delete(value);
            button.classList.remove("active");
        }

        /* Not picked yet → check the cap */
        else {
            if (picked.size >= MAX_PICKS) {
                showToast(`You can pick up to ${MAX_PICKS} ${sectionKey}`);
                return;
            }
            picked.add(value);
            button.classList.add("active");
        }

        /* Refresh the visible state */
        if (sectionKey === "tools") {
            updateCounter(toolsCounter, state.tools.size);
        } else {
            updateCounter(nichesCounter, state.niches.size);
        }
        refreshSubmitState();
    }


    function wireGrid(grid, sectionKey) {

        if (!grid) return;

        grid.querySelectorAll(".option-btn").forEach((button) => {
            button.addEventListener("click", () => {
                handleOptionClick(button, sectionKey);
            });
        });
    }

    wireGrid(toolsGrid, "tools");
    wireGrid(nichesGrid, "niches");


    /* PRE-FILL (edit mode only)  */

    function prefillSelections() {

        if (!isEditMode) return;

        const saved = currentUser.roadmap || { tools: [], niches: [] };

        /*  Tools  */
        (saved.tools || []).forEach((value) => {
            const btn = toolsGrid.querySelector(
                `.option-btn[data-value="${cssEscape(value)}"]`
            );
            if (btn) {
                btn.classList.add("active");
                state.tools.add(value);
            }
        });

        /*  Niches  */
        (saved.niches || []).forEach((value) => {
            const btn = nichesGrid.querySelector(
                `.option-btn[data-value="${cssEscape(value)}"]`
            );
            if (btn) {
                btn.classList.add("active");
                state.niches.add(value);
            }
        });

        /* Update counters + submit state */
        updateCounter(toolsCounter, state.tools.size);
        updateCounter(nichesCounter, state.niches.size);
        refreshSubmitState();

        /* Auto-expand any section whose picks live among the "extra" buttons */
        autoExpandIfNeeded(toolsGrid, toolsSeeMore, "tools");
        autoExpandIfNeeded(nichesGrid, nichesSeeMore, "niches");
    }


    /* Auto-expand if any active pick is on an .extra button */
    function autoExpandIfNeeded(grid, seeMoreBtn, sectionLabel) {

        const activeExtra = grid.querySelector(".option-btn.extra.active");
        if (!activeExtra) return;

        grid.classList.add("expanded");

        if (seeMoreBtn) {
            seeMoreBtn.textContent = "See Less";
        }
    }


    /* Safely escape a string for use in querySelector */
    function cssEscape(value) {
        if (window.CSS && typeof window.CSS.escape === "function") {
            return window.CSS.escape(value);
        }
        /* Fallback for older browsers */
        return String(value).replace(/["\\]/g, "\\$&");
    }


    /* SAVE + REDIRECT  */

    function saveAndContinue() {

        const users = (() => {
            try {
                const raw = localStorage.getItem("adaUsers");
                return raw ? JSON.parse(raw) : [];
            } catch { return []; }
        })();

        const idx = users.findIndex(
            (u) => u.username === currentUser.username
        );

        if (idx === -1) {
            /* User disappeared somehow — send back to signup */
            window.location.href = "signin.html";
            return;
        }

        users[idx].roadmap = {
            tools:  Array.from(state.tools),
            niches: Array.from(state.niches)
        };
        users[idx].roadmapCompleted = true;

        localStorage.setItem("adaUsers", JSON.stringify(users));

        window.location.href = "dashboard.html";
    }

    submitBtn.addEventListener("click", () => {
        if (submitBtn.disabled) return;
        saveAndContinue();
    });


    /* INITIAL RENDER */

    updateCounter(toolsCounter, 0);
    updateCounter(nichesCounter, 0);
    refreshSubmitState();
    prefillSelections();

});