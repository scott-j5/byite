function setMenu(e) {
    e.classList.toggle('on');
    document.querySelector(".nav-wrapper").classList.toggle('nav-wrapper--open');
  };

//const hamburger = document.querySelector('.hamburger');

//hamburger.addEventListener('click', function(e){
//    document.querySelector(".nav-wrapper").classList.toggle('nav-wrapper--open');
//});

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

$(document).ready(function(){
    var slider = SLIDER;
    slider.timer(10000);
});