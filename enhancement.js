// ==========================================================================
// MOBILE-ENHANCEMENTS.JS
// Drives: sticky mobile CTA, tap-active testimonial cards, hero read-more
// toggle, and swipe gestures on the hero image slider.
// Kept separate from script.js / mobile-nav.js so each file has one job.
// ==========================================================================
 
document.addEventListener("DOMContentLoaded", () => {
 
    /* ----------------------------------------------------------------------
       1. STICKY MOBILE CTA
       Shows the fixed "Build With US" button once the user has scrolled
       past the hero section's own CTA button, hides it again if they
       scroll back up above it.
    ---------------------------------------------------------------------- */
    const heroBtn = document.getElementById("heroBtn");
    const stickyCta = document.getElementById("stickyMobileCta");
 
    if (heroBtn && stickyCta) {
        const ctaObserver = new IntersectionObserver(
            ([entry]) => {
                // Sticky CTA appears once the original button scrolls out of view
                stickyCta.classList.toggle("visible", !entry.isIntersecting);
            },
            { threshold: 0 }
        );
        ctaObserver.observe(heroBtn);
 
        stickyCta.addEventListener("click", () => {
            window.location.href = "https://whatsapp.com/channel/0029VbCHRyS7tkj20XKPUb3K";
        });
    }
 
 
    /* ----------------------------------------------------------------------
       2. TAP-ACTIVE TESTIMONIAL CARDS
       Touch devices have no real :hover, so tapping a card toggles the
       same "flame line" visual state the desktop hover effect uses.
       Tapping a second card closes the first one.
    ---------------------------------------------------------------------- */
    const testimonyCards = document.querySelectorAll(".testimony-card");
 
    testimonyCards.forEach((card) => {
        card.addEventListener("click", () => {
            const alreadyActive = card.classList.contains("tap-active");
            testimonyCards.forEach((c) => c.classList.remove("tap-active"));
            if (!alreadyActive) {
                card.classList.add("tap-active");
            }
        });
    });
 
 
    /* ----------------------------------------------------------------------
       3. HERO "READ MORE" TOGGLE (small phones only — button is hidden
       above 480px via CSS, so this is harmless no-op weight on larger
       screens)
    ---------------------------------------------------------------------- */
    const readMoreBtn = document.getElementById("heroReadMoreBtn");
    const extraCopy = document.getElementById("heroExtraCopy");
 
    if (readMoreBtn && extraCopy) {
        readMoreBtn.addEventListener("click", () => {
            const isExpanded = extraCopy.classList.toggle("expanded");
            readMoreBtn.textContent = isExpanded ? "Read less" : "Read more";
            readMoreBtn.setAttribute("aria-expanded", String(isExpanded));
        });
    }
 
 
    /* ----------------------------------------------------------------------
       4. SWIPE GESTURES ON THE HERO SLIDER
       Uses the small public API script.js exposes (window.adaHeroSlider)
       instead of re-implementing slide logic here, so there's only ever
       one source of truth for "which image is active."
    ---------------------------------------------------------------------- */
    const sliderSection = document.getElementById("heroimgSection");
 
    if (sliderSection) {
        let touchStartX = 0;
        let touchStartY = 0;
        const SWIPE_THRESHOLD = 40; // px — minimum horizontal drag to count as a swipe
 
        sliderSection.addEventListener("touchstart", (event) => {
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
            if (window.adaHeroSlider) window.adaHeroSlider.pause();
        }, { passive: true });
 
        sliderSection.addEventListener("touchend", (event) => {
            const touchEndX = event.changedTouches[0].clientX;
            const touchEndY = event.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
 
            // Only treat it as a slider swipe if the motion was mostly
            // horizontal (avoids hijacking vertical page scrolling)
            if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
                if (window.adaHeroSlider) {
                    if (deltaX < 0) {
                        window.adaHeroSlider.next(); // swiped left → next image
                    } else {
                        window.adaHeroSlider.prev(); // swiped right → previous image
                    }
                }
            }
 
            // Resume the automatic random rotation a couple seconds after
            // the user stops interacting, rather than instantly (which
            // would feel like the swipe was ignored)
            if (window.adaHeroSlider) {
                setTimeout(() => window.adaHeroSlider.resume(), 2500);
            }
        }, { passive: true });
    }
});
 