
// Scroll Reveal Animation


// Select all elements that have the 'reveal-up' class
const revealElements = document.querySelectorAll('.reveal-up');


//  Create an IntersectionObserver
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Stop observing once animated
        }
    });
}, {
    threshold: 0.15 // Trigger when 15% of the element is visible
});



//  Tell the observer to watch each element
revealElements.forEach(el => observer.observe(el));