/* 
   MOBILE DRAWER NAVIGATION
   Handles: open / close / Escape / outside tap
   Auth buttons do NOT close the drawer —
   the browser navigates straight to their page.
  */

document.addEventListener("DOMContentLoaded", () => {

    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const drawer = document.getElementById("mobileDrawer");
    const overlay = document.getElementById("navOverlay");
    const closeBtn = document.getElementById("drawerClose");

    /* Bail silently if this page has no mobile nav */
    if (!hamburgerBtn || !drawer || !overlay) {
        return;
    }

    const drawerLinks = drawer.querySelectorAll(".drawer-link");

    /*  State helpers  */

    function openMenu() {
        drawer.classList.add("open");
        overlay.classList.add("active");
        document.body.classList.add("menu-lock");
        hamburgerBtn.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
        drawer.classList.remove("open");
        overlay.classList.remove("active");
        document.body.classList.remove("menu-lock");
        hamburgerBtn.setAttribute("aria-expanded", "false");
    }

    function toggleMenu() {
        if (drawer.classList.contains("open")) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    /* Event wiring  */

    /*  Hamburger button toggles */
    hamburgerBtn.addEventListener("click", toggleMenu);

    /*  Close (X) inside the drawer */
    if (closeBtn) {
        closeBtn.addEventListener("click", closeMenu);
    }

    /*  Tap the blurred area outside the drawer */
    overlay.addEventListener("click", closeMenu);

    /*  Escape key */
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && drawer.classList.contains("open")) {
            closeMenu();
        }
    });

    /*  Clicking any drawer nav link closes the drawer
          (so it doesn't linger after navigation) */
    drawerLinks.forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    /*  Resize above the mobile breakpoint closes the drawer
          (so it doesn't stay open invisibly on desktop) */
    window.addEventListener("resize", () => {
        if (window.innerWidth > 1080 && drawer.classList.contains("open")) {
            closeMenu();
        }
    });

    /* NOTE: The auth buttons (.drawer-btn) intentionally have NO
       close listener — the browser navigates straight to the page. */

});