
IMAGEIT = {
    addListeners: function(){
        //Listeners for dropping or uploading a file
        document.querySelectorAll('.imageit-upload').forEach(item =>{
            item.addEventListener('dragenter', IMAGEIT.uploadHover, false);
            item.addEventListener('dragleave', IMAGEIT.uploadHover, false);
            item.addEventListener('drop', IMAGEIT.processDrop, false);
            item.addEventListener('click', IMAGEIT.selectFile, false);
        });
        //Listener of cancelling intial image
        document.querySelectorAll('.imageit-clear-initial').forEach(item =>{
            item.addEventListener('click', IMAGEIT.toggleInitial, false);
        });
    },
    selectFile: function(e){
        console.log('select');
    },
    uploadHover: function(e){
        e.currentTarget.classList.toggle('active');
        console.log('hovered');
    },
    processDrop: function(e){
        e.preventDefault();
        IMAGEIT.uploadHover(e);
        //IF LENGTH OF FILES IS MORE THAN ONE, SHOW ERROR
        let files = e.dataTransfer.files;
        ([...files]).forEach(file =>{
            IMAGEIT.previewImage(e, file);
            IMAGEIT.processImage(e, file);
        });
    },
    processImage: function(e, file){
        console.log('dropped');
        //Set value of select to file
    },
    previewImage: function(e, file){
        // Hide initial if it exists
        // Add previewed
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function(){
            let img = document.createElement('img');
            img.src = reader.result;
            document.querySelector('.imageit-upload').appendChild(img);
        }
    },
    clearUpload: function(e){
        //Clear the upload select
        //Render initial if checked or not
    },
    toggleInitial: function(e){
        checkboxName = e.currentTarget.dataset.checkboxname;
        checkbox = document.querySelector('[name="'+checkboxName+'"]');
        checkbox.checked = !(checkbox.checked);

        IMAGEIT.renderInitial(e);
    },
    renderInitial: function(e){
        checkbox = e.currentTarget.closest('.imageit-container').querySelector('[name="'+checkboxName+'"]');
        if (hidden){
            //Hide initial
            //Find imageit-container - then use query selctor on that to make sure it always works
            e.currentTarget.closest('.imageit-initial').classList.toggle('imageit-inactive');
        }else{
            //Show undo button
        }
    },
}




/*
IMAGEIT = {
    //Add event listeners to all imageit form fields
    addListeners: function(e){
        document.querySelectorAll('.imageit-clear-image').forEach( item => {
            item.addEventListener('click', function(e){
                IMAGEIT.toggleClear(e);
            });
        });
        document.querySelectorAll('.imageit-initial-image-container').forEach( item => {
            item.addEventListener('mouseenter', function(e){
                IMAGEIT.toggleInitialText(e)
            });
            item.addEventListener('mouseleave', function(e){
                IMAGEIT.toggleInitialText(e);
            });
        });
    },
    //If a new image is selected, show it instead of initial image
    showSelected: function(e){
        //Hide existing image if it exists and show new one
    },
    //If a new file is selected, allow the user to clear their choice
    undoSelected: function(e){

    },
    //Toggle the clearing of initial image in the form
    toggleClear: function(e){
        checkboxName = e.currentTarget.dataset.checkboxname;
        checkbox = document.querySelector('[name="'+checkboxName+'"]');
        checkbox.checked = !(checkbox.checked);

        if (checkbox.checked){
            //Hide initial
            e.currentTarget.closest('.imageit-initial').classList.toggle('imageit-inactive');
        }else{
            //Show undo button, Copy dimensions
        }
        // Get name data attr and toggle checkbox by that name
        // Hide initial and replace with undo button
    },
    toggleInitialText: function(e){
        elem = e.currentTarget.querySelector('.imageit-initial-text');
        if (elem){
            elem.classList.toggle('imageit-inactive');
        }
    },
}
*/
window.addEventListener("DOMContentLoaded", function(){
    IMAGEIT.addListeners();
});