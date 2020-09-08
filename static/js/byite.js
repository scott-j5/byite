function setMenu(e) {
    e.classList.toggle('on');
    document.querySelector(".nav-wrapper").classList.toggle('nav-wrapper--open');
  };


SLIDER = {
    i: 0,
    maxNum: 2,
    iPrev: this.maxNum,
    initial: 1,
    next: function(){
        this.iPrev = this.i;
        if (this.i == this.maxNum){
            this.i = 0;
        }else{
            this.i += 1;
        };
        this.render();
    },
    previous: function(){
        if (this.i == 0){
            this.i = this.maxNum;
        }else{
            this.i -= 1;
        };
        if (this.i == 0){
            this.iPrev = this.maxNum;
        }else{
            this.iPrev = this.i -1;
        };
        this.render();
    },
    toIndex: function(i){
        this.i = i;
        if (i == 0){
            this.iPrev = maxNum;
        }else{
            this.iPrev = i - 1;
        }
        this.render();
    },
    timer: function(i){
        this.render();
        setInterval(() => {
            this.next();
        }, i);
    },
    render: function(){
        document.querySelector("#project-gears").style.transform = "rotate("+ (-this.i*90) + "deg)";
        if(this.initial == 1){
            this.initial = 0;
            $("#project-" + (this.i) + "-text").toggleClass("project-text-active");
            $("#project-" + (this.i) + "-image").toggleClass("project-image-active");
        }else{
            $("#project-" + (this.i) + "-text").toggleClass("project-text-active");
            $("#project-" + (this.i) + "-image").toggleClass("project-image-active");
            $("#project-" + (this.iPrev) + "-text").toggleClass("project-text-active");
            $("#project-" + (this.iPrev) + "-image").toggleClass("project-image-active");
            $("#project-" + (this.iPrev) + "-text").toggleClass("project-text-out");
            $("#project-" + (this.iPrev) + "-image").toggleClass("project-image-out");
        };
        setTimeout(function(){
            $(".project-text-out").removeClass("project-text-out");
            $(".project-image-out").removeClass("project-image-out");
        }, 2000);
    }
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
                result.classList.add('form-alert', 'form-success');
                result.innerHTML = JSON.parse(xhr.response).message;
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

LOAD = {
    loadToElement: function(element, url){
        var loader = document.createElement("div");
        loader.classList.add("loader");

        element.classList.toggle('loading');
        element.append(loader);
        
        content = this.loadUrl(url, function(e){LOAD.updateContent(e, element)});

        element.classList.toggle('loading');
        element.innerHTML = content;
    },
    loadUrl: function(url, onComplete){
        var result = {}
        var xhr = new XMLHttpRequest();

        // Make an AJAX call using the specified url
        $.ajax({
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
                onComplete(xhr);
            }
        });
    },
    updateContent: function(e, element){
        if (e.status == 200 ){
            element.innerHTML = e.response;
        }else{
            element.innerHTML = '<div class="form-alert form-error"> Error ' + e.status + ': ' + e.statusText + '</div>';
        }
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

$(document).ready(function(){
    var formSubmit = FORMSUBMIT;
    formSubmit.init();
});