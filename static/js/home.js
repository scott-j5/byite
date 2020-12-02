
window.addEventListener("DOMContentLoaded", function(){
    const nav = document.getElementById('header-wrapper');
    const trigger = document.getElementById('header-bg-trigger');

    const navObserver = new IntersectionObserver(function(entries, navObserver){
        entries.forEach(entry => {
            if (!entry.isIntersecting){
                nav.classList.add('header-wrapper-bg-active');
                nav.classList.add('header-wrapper-logo-active');
            }else{
                nav.classList.remove('header-wrapper-bg-active');
                nav.classList.remove('header-wrapper-logo-active');
            }
        })
    });

    navObserver.observe(trigger);

    var formSubmit = FORMSUBMIT;
    formSubmit.init('#contact-us-form');
});