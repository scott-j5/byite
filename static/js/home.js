FORMVALIDATION = {
    init: function(selector = null){
        if(selector == null){
            selector = 'form';
        }
        document.querySelectorAll(selector).forEach(item => {
            item.addEventListener("change", this.validate);
        });
    },
    validate: function(e){
        error = "";
        result = e.currentTarget.querySelector('#' + e.currentTarget.id + '-' + e.target.name + '-error') || document.createElement('div');
        if (e.target.name.toLowerCase() == 'email'){
            if (! /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(e.target.value)){
                error = "Please enter a valid email address";
            }
        }
        if (e.target.name.toLowerCase() == 'phone'){
            if(! /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(e.target.value)){
                error = "Please enter a valid phone number";
            }
        }
        if (error.length >= 1){
            result.classList.add('form-alert', 'form-error');
            result.id = e.currentTarget.id + '-' + e.target.name + '-error';
            result.innerHTML = error;
            e.currentTarget.insertBefore(result, e.target.parentNode.nextSibling);
        }else if (result.classList.contains('form-error')){
            e.currentTarget.removeChild(result)
        }
    },
}

$(document).ready(function(){
    var slider = SLIDER;
    slider.timer(10000);

    var validate = FORMVALIDATION;
    validate.init();
});