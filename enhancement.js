
document.addEventListener("DOMContentLoaded", () => {

    /* STICKY MOBILE CTA
    Shows the fixed "Build With US" button once the user has scrolled past the hero section's own CTA button, hides it again if they scroll back up above it. */
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



    /* HERO "READ MORE" TOGGLE (small phones only: the  button is hidden, above 480px through CSS media queries, so this is harmless no-op weight on larger screens) */
    const readMoreBtn = document.getElementById("heroReadMoreBtn");
    const extraCopy = document.getElementById("heroExtraCopy");

    if (readMoreBtn && extraCopy) {
        readMoreBtn.addEventListener("click", () => {
            const isExpanded = extraCopy.classList.toggle("expanded");
            readMoreBtn.textContent = isExpanded ? "Read less" : "Read more";
            readMoreBtn.setAttribute("aria-expanded", String(isExpanded));
        });
    }

    /* SWIPE GESTURES ON THE HERO SLIDER: Uses the small public API script.js exposes (window.adaHeroSlider), instead of re-implementing slide logic here, so there's only ever one source of truth for "which image is active. */
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
