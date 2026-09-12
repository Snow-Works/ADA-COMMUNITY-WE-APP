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



