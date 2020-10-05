
MENU = {
    init: function(){
        document.querySelector('#hamburger').addEventListener('click', this.toggleMenu);
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', this.toggleMenu);
        })
    },
    toggleMenu: function(e){
        document.querySelector('#hamburger').classList.toggle('on');
        document.querySelector(".nav-wrapper").classList.toggle('nav-wrapper--open');
    },
}


FORMSUBMIT = {
    init: function(selector = null){
        if(selector == null){
            selector = 'form';
        }
        document.querySelectorAll(selector).forEach(item => {
            item.addEventListener("submit", this.submit);
        });
    },
    submit: function(e){
        var result = e.target.querySelector('.form-alert') || document.createElement("div");
        var loader = document.createElement("div");
        loader.classList.add("loader");
        var xhr = new XMLHttpRequest();

        e.preventDefault();
        result.className = '';
        result.innerHTML = '';
        e.target.classList.toggle('loading');
        e.target.append(loader);

        // Send the form data via an AJAX call using the form’s defined action and method
        $.ajax({
            url: e.target.action,
            type: e.target.method,
            data: new FormData(e.target),
            dataType: 'JSON',
            cache: false,
            contentType: false,
            processData: false,
            xhr: function() {
                return xhr;
            },
            success: function(ajaxOptions, thrownError) {
                resultJson = JSON.parse(xhr.response);
                if(resultJson.error){
                    result.classList.add('form-alert', 'form-error');
                    resultText = resultJson.error;
                }else if(resultJson.success){
                    result.classList.add('form-alert', 'form-success');
                    resultText = resultJson.success;
                }else if(resultJson.message){
                    result.classList.add('form-alert', 'form-info');
                    resultText = resultJson.message;
                }else{
                    result.classList.add('form-alert', 'form-warn');
                    resultText = "Something unexpected has happened...";
                }
                result.innerHTML = resultText;
                e.target.append(result);
            },
            error: function(xhr, ajaxOptions, thrownError) {
                result.classList.add('form-alert', 'form-error');
                result.innerHTML = 'Error ' + xhr.status + ': ' + xhr.statusText;
                e.target.append(result);
            },
            complete: function() {
                e.target.classList.toggle('loading');
                e.target.removeChild(loader);
            }
        });  
    },
}

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
        FORMVALIDATION.checkErrors(e);
    },
    checkErrors: function(e){
        if(e.currentTarget.querySelectorAll('.form-error').length >= 1){
            FORMVALIDATION.disable(e);
        }else{
            FORMVALIDATION.enable(e);
        }
    },
    disable: function(e){
        e.currentTarget.querySelector('[type="submit"]').disabled = true;
    },
    enable: function(e){
        e.currentTarget.querySelector('[type="submit"]').disabled = false;
    }
}

LOAD = {
    request : null,
    loadToElement: function(element, url){
        var loader = element.querySelector('.loader') || document.createElement("div");
        if(! loader.classList.contains('loader')){
            element.append(loader);
            loader.classList.add("loader");
        }
        element.classList.add('loading');
        
        this.loadUrl(url, function(e){LOAD.updateContent(e, element)});
    },
    loadUrl: function(url, onComplete){
        var xhr = new XMLHttpRequest();
        if(LOAD.request){
            LOAD.request.abort();
        }
        // Make an AJAX call using the specified url
        LOAD.request = $.ajax({
            url: url,
            type: 'GET',
            cache: false,
            contentType: false,
            processData: false,
            xhr: function() {
                return xhr;
            },
            success: function(ajaxOptions, thrownError) {
                return xhr.response;
            },
            error: function(xhr, ajaxOptions, thrownError) {
                return xhr.status + ': ' + xhr.statusText;
            },
            complete: function() {
                if(! xhr.getAllResponseHeaders()){
                    return
                }
                onComplete(xhr);
            }
        }).done(function(){
            LOAD.request = null;
        });
    },
    updateContent: function(e, element){
        if (e.status == 200 ){
            element.innerHTML = e.response;
        }else{
            element.innerHTML = '<div class="form-alert form-error"> Error ' + e.status + ': ' + e.statusText + '</div>';
        }
        element.classList.remove('loading');
    },
    loadJson: function(url){
        var result = {}
        var xhr = new XMLHttpRequest();

        // Make an AJAX call using the specified url
        $.ajax({
            url: e.target.action,
            type: e.target.method,
            data: new FormData(e.target),
            dataType: 'JSON',
            cache: false,
            contentType: false,
            processData: false,
            xhr: function() {
                return xhr;
            },
            success: function(ajaxOptions, thrownError) {
                result.classList.add('form-alert', 'form-success');
                result.innerHTML = JSON.parse(xhr.response).message;
                e.target.append(result);
            },
            error: function(xhr, ajaxOptions, thrownError) {
                result.classList.add('form-alert', 'form-error');
                result.innerHTML = xhr.status + ': ' + xhr.statusText;
                e.target.append(result);
            },
            complete: function() {
                e.target.classList.toggle('loading');
                e.target.removeChild(loader);
            }
        });  
    },
}

window.addEventListener("DOMContentLoaded", function(){
    var formSubmit = FORMSUBMIT;
    var menu = MENU;
    var validate = FORMVALIDATION;
    formSubmit.init('#footer-subscribe');
    menu.init();
    validate.init();
});