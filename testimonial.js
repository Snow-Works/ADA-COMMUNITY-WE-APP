document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".testimony-card");

    cards.forEach(card => {
        // Track mouse movement to slightly shift the visual angle for a premium 3D interaction feel
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            
            const angleX = (yc - y) / 15;
            const angleY = (x - xc) / 15;
            
            card.style.transform = `translateY(-5px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
        });

        // Reset positions perfectly when the mouse leaves
        card.addEventListener("mouseleave", () => {
            card.style.transform = "translateY(0) rotateX(0) rotateY(0)";
        });

        // Click handler for modern app interactions
        card.addEventListener("click", () => {
            const name = card.querySelector(".user-name").textContent;
            console.log(`Testimonial clicked: Verified user ${name}`);
            // Add custom routing or popup transitions here if needed
        });
    });
});