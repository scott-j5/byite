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
        currentElems = {
            "text": document.querySelector("#project-" + (this.i) + "-text"),
            "image": document.querySelector("#project-" + (this.i) + "-image")
        }
        prevElems = {
            "text": document.querySelector("#project-" + (this.iPrev) + "-text"),
            "image": document.querySelector("#project-" + (this.iPrev) + "-image")
        }
        if(this.initial == 1){
            this.initial = 0;
            for(var key in currentElems){
                if(currentElems[key]){
                    currentElems[key].classList.toggle("project-"+ key +"-active");
                }
            }
        }else{
            for(var key in currentElems){
                if(currentElems[key]){
                    currentElems[key].classList.toggle("project-"+ key +"-active");
                }
            }
            for(var key in prevElems){
                if(prevElems[key]){
                    prevElems[key].classList.toggle("project-"+ key +"-active");
                    prevElems[key].classList.toggle("project-"+ key +"-out");
                }
            }
        };
        setTimeout(function(){
            document.querySelector("#project-text-out").classList.remove("project-text-out");
            document.querySelector("#project-image-out").classList.remove("project-image-out");
        }, 2000);
    }
}

window.addEventListener("DOMContentLoaded", function(){
    var slider = SLIDER;
    slider.timer(10000);

    var formSubmit = FORMSUBMIT;
    formSubmit.init('#contact-us-form');
});