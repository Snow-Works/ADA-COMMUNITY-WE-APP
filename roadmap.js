const buttons = document.querySelectorAll('.tool-option');

buttons.forEach(button =>{
    button.addEventListener('click', () => {
        button.classList.toggle('active');
    });
});