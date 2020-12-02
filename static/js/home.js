
window.addEventListener("DOMContentLoaded", function(){
    const nav = document.getElementById('header-wrapper');
    const trigger = document.getElementById('nav-bg-trigger');

    const navObserver = new IntersectionObserver(function(entries, navObserver){
        entries.forEach(entry => {
            if (!entry.isIntersecting){
                nav.classList.add('header-wrapper-bg-active');
            }else{
                nav.classList.remove('header-wrapper-bg-active');
            }
        })
    });

    navObserver.observe(trigger);

    var formSubmit = FORMSUBMIT;
    formSubmit.init('#contact-us-form');
});