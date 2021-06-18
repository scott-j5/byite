
MENU = {
    init: function(){
        document.querySelector('#hamburger').addEventListener('click', this.toggleMenu);
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function(e){
                //Toggle menu away if link is clicked that doesnt redirect page
                if (document.querySelector(".nav-wrapper").classList.contains("nav-wrapper-open")){
                    MENU.toggleMenu();
                }
            });
        })
    },
    toggleMenu: function(e){
        //Stop scroll - change focus
        document.querySelector('body').classList.toggle('no-scroll');

        //Show - Hide menu on mobile
        document.querySelector('#hamburger').classList.toggle('on');
        document.querySelector(".nav-wrapper").classList.toggle('nav-wrapper-open');

        //Make sure logo is shown on open nav
        document.getElementById('header-wrapper').classList.toggle('header-wrapper-nav-open');
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
    loadToElement: async function(element, url){
        var loader = document.createElement("div");
        loader.classList.add("loader");
        element.append(loader);
        element.classList.add('loading');
        
        var response = null;
        try{
            response = await this._load(url, 'text/html');
            LOAD.updateContent(response, element);
        }catch{
            LOAD.showError(response, element);
        }
        element.classList.remove('loading');
    },
    loadJson: async function(url){
        return json.parse(await this._load(url, 'application/json', false));
    },
    _load(url, contentType, data=false){
        return new Promise((resolve, reject) => {
            //Ajax function to get files
            const xhr = new XMLHttpRequest();
            
            if (data){
                xhr.open('POST', url, true);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                xhr.send(data); 
            }else{
                xhr.open('GET', url, true);
                xhr.setRequestHeader('Content-Type', contentType);
                xhr.send(null); 
            };

            xhr.onload = function(){
                if(xhr.status == 200){
                    if (contentType = 'application/JSON'){
                        resolve(xhr.responseText);
                    }else{
                        resolve(xhr.response);
                    }
                }else{
                    reject(xhr);
                }
            }
        });
    },
    showError: function(xhr, element=false){
        if(element){
            if (xhr.status == 200 ){
                element.innerHTML = xhr.response;
            }else{
                element.innerHTML = '<div class="form-alert form-error"> Error ' + xhr.status + ': ' + xhr.statusText + '</div>';
            }
        }else{
            console.log('Error ' + xhr.status + ': ' + xhr.statusText);
        }
    },
    updateContent: function(response, element){
        element.innerHTML = response;
    }
}

window.addEventListener("DOMContentLoaded", function(){
    var formSubmit = FORMSUBMIT;
    var menu = MENU;
    var validate = FORMVALIDATION;
    formSubmit.init('#footer-subscribe');
    menu.init();
    validate.init();
});