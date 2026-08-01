document.addEventListener("DOMContentLoaded", () => {
    const images = document.querySelectorAll(".hero-slider-img");
    
    // Safety check: skip logic if there's only one image
    if (images.length <= 1) return; 

    let currentIndex = 0;

    function changeImageRandomly() {
        // Remove active state from current image
        images[currentIndex].classList.remove("active");

        // Pick a completely new random index that is NOT the current index
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * images.length);
        } while (nextIndex === currentIndex);

        // Update tracking index and reveal the new image
        currentIndex = nextIndex;
        images[currentIndex].classList.add("active");
    }

    // Fire continuous changes infinitely every 3 seconds
    setInterval(changeImageRandomly, 3000);
});


//button functionalities and linkage.
//LOGIN BUTTON  ON THE NAV BAR
const btnI = document.querySelector('#navBtnA');
btnI.addEventListener('click', () =>{
    window.location.href = './login.html';

});

//SIGNIN BUTTON  ON THE NAV BAR
const btnI2 = document.querySelector('#navBtnB');
btnI2.addEventListener('click', () =>{
    window.location.href = './signin.html';
});

//BUILD WITH US BUTTON
const btnI3 = document.querySelector('#heroBtn');
btnI3.addEventListener('click', () => {
    window.location.href = 'https://whatsapp.com/channel/0029VbCHRyS7tkj20XKPUb3K';
})


//BUTTONS WITHIN THE FOOTER SIDE
//footer join the community button
const footerBtnI = document.querySelector('.footer-cta-button');
footerBtnI.addEventListener('click', () => {
    window.location.href = 'https://whatsapp.com/channel/0029VbCHRyS7tkj20XKPUb3K';

});

//back to top button
const footerBtnI1 = document.querySelector('#backTop');
footerBtnI1.addEventListener('click', () => {
    window.location.href = './index.html';
});








// ==========================================================================
// MOBILE-NAV.JS
// Drives the hamburger menu added for tablet & mobile screen sizes.
// Kept separate from script.js so the existing button wiring is untouched.
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const navContainer = document.getElementById("navContainer");
    const navOverlay = document.getElementById("navOverlay");
    const navMenu = document.getElementById("navMenu");
 
    // Guard: bail quietly if any required element is missing
    if (!hamburgerBtn || !navContainer || !navOverlay || !navMenu) return;
 
    const NAV_BREAKPOINT = 1080; // must match the media query in responsive.css
 
    function openMenu() {
        navContainer.classList.add("menu-open");
        navOverlay.classList.add("active");
        hamburgerBtn.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden"; // lock background scroll
    }
 
    function closeMenu() {
        navContainer.classList.remove("menu-open");
        navOverlay.classList.remove("active");
        hamburgerBtn.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
    }
 
    function toggleMenu() {
        if (navContainer.classList.contains("menu-open")) {
            closeMenu();
        } else {
            openMenu();
        }
    }
 
    // Toggle on hamburger tap/click
    hamburgerBtn.addEventListener("click", toggleMenu);
 
    // Tapping the dimmed backdrop closes the menu
    navOverlay.addEventListener("click", closeMenu);
 
    // Selecting any nav link closes the menu (so it doesn't stay open
    // after the page scrolls to a new section / navigates away)
    navMenu.querySelectorAll(".navlink").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });
 
    // Esc key closes the menu — keyboard accessibility
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && navContainer.classList.contains("menu-open")) {
            closeMenu();
        }
    });
 
    // If the viewport is resized past the tablet breakpoint (e.g. rotating
    // a tablet, or resizing a desktop browser window) while the menu is
    // open, reset state so it isn't stuck open behind the desktop nav.
    window.addEventListener("resize", () => {
        if (window.innerWidth > NAV_BREAKPOINT && navContainer.classList.contains("menu-open")) {
            closeMenu();
        }
    });
});
 