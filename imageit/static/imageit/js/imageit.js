
IMAGEIT = {
    fileTypes: ['svg', 'jpg', 'png'],
    addListeners: function(){
        //Listeners for dropping or uploading a file
        document.querySelectorAll('.imageit-upload').forEach(item =>{
            item.addEventListener('dragenter', IMAGEIT.uploadHover, false);
            item.addEventListener('dragleave', IMAGEIT.uploadHover, false);
            item.addEventListener('drop', IMAGEIT.processDrop, false);
            item.addEventListener('click', IMAGEIT.selectFile, false);
        });
        //Listener of cancelling intial image
        document.querySelectorAll('.imageit-clear-image').forEach(item =>{
            item.addEventListener('click', IMAGEIT.togglePreview, false);
        });
    },
    selectFile: function(e){
        console.log('select');
    },
    uploadHover: function(e){
        e.currentTarget.classList.toggle('active');
    },
    processDrop: function(e){
        e.preventDefault();
        IMAGEIT.uploadHover(e);
        //IF LENGTH OF FILES IS MORE THAN ONE, SHOW ERROR
        let files = e.dataTransfer.files;
        if ([...files].length > 1){
            IMAGEIT.renderError(IMAGEIT.getImageitContainer(e), 'Only one file is accepted!')
        }else{
            ([...files]).forEach(file =>{
                let extension = file.name.split('.').pop().toLowerCase()
                if (IMAGEIT.fileTypes.indexOf(extension) == -1){
                    IMAGEIT.renderError(IMAGEIT.getImageitContainer(e), 'Only ' + IMAGEIT.fileTypes.join(", ") + ' files are accepted!')
                }else{
                    IMAGEIT.previewFile(IMAGEIT.getImageitContainer(e), file);
                    IMAGEIT.clearErrors(IMAGEIT.getImageitContainer(e));
                }
                console.log('passed');
            });
        };
    },
    processImage: function(file){
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function(){
            console.log('returned');
            return reader.result;
        };
    },
    previewFile: function(imageitContainer, file){
        // Add preview to imageit-preview-container
        // JSX maybe?
        let temp = document.getElementById('imageit-preview').cloneNode(true);
        let img = IMAGEIT.processImage(file);

        temp.removeAttribute('id');
        temp.classList.add('imageit-preview');
        
        //Change img src
        temp.querySelector('.imageit-preview-image').src = img;
        temp.querySelector('.imageit-preview-link').href = img;
        //Change img name
        temp.querySelector('.imageit-preview-filename').innerHTML = file.name;
        //Change current -> new
        temp.querySelector('.imageit-preview-help-text').innerHTML = 'New';
        //Add event listeners
        temp.querySelector('.imageit-clear-image').addEventListener('click', IMAGEIT.togglePreview, false);
        
        imageitContainer.querySelector('.imageit-preview-container').prepend(temp);
        console.log(imageitContainer);
        IMAGEIT.renderPreview(imageitContainer);
    },
    togglePreview: function(e){
        e.stopPropagation();
        e.preventDefault();
        let preview = e.currentTarget.closest('.imageit-preview');
        let imageitContainer = IMAGEIT.getImageitContainer(e);

        if(preview.classList.contains('imageit-initial')){
            let checkbox = preview.querySelector('[type="checkbox"]');
            checkbox.checked = !(checkbox.checked);
        }else{
            preview.remove();
            //Maybe tell it to leave an undo button there??
        }
        IMAGEIT.renderPreview(imageitContainer);
    },
    renderPreview: function(imageitContainer){
        console.log(imageitContainer);
        let container = imageitContainer.querySelector('.imageit-preview-container');
        
        if(container){
            let initial = container.querySelectorAll('.imageit-preview.imageit-initial');
            let previews = container.querySelectorAll('.imageit-preview:not(.imageit-initial)');

            // If images have been dropped, show their previews
            // and hide initial previews
            if (previews.length > 0){
                //Remove inactive class from each
                //Add inactive to initial
                previews.forEach(item => {
                    console.log(item);
                    item.firstElementChild.classList.remove('imageit-inactive');
                });
                if(initial.length > 0){
                    initial.forEach(item => {
                        item.firstElementChild.classList.add('imageit-inactive');
                    });
                }
            }else{
                // If no dropped images, show initial
                // If initial is to be cleared, show undo button
                if(initial.length > 0){
                    initial.forEach(item => {
                        let checkbox = item.querySelector('input[type="checkbox"]');
                        if(checkbox.checked){
                            // Move this into seperate function
                            let undo = document.createElement('a');
                            undo.innerHTML = item.querySelector('.imageit-preview-filename').innerHTML + ' removed! Undo'
                            undo.classList.add('imageit-undo-button');
                            undo.addEventListener('click', IMAGEIT.togglePreview, false);
                            item.append(undo);
                            //Hide initial image preview
                            item.firstElementChild.classList.add('imageit-inactive');
                        }else{
                            let undoButton = item.querySelector('.imageit-undo-button')
                            if(undoButton){
                                undoButton.remove();
                            };
                            item.firstElementChild.classList.remove('imageit-inactive');
                        }
                    });   
                }
            }
        }
    },
    renderError: function(imageitContainer, error){
        let errorElem = document.createElement('div');
        errorElem.classList.add('imageit-error');
        errorElem.innerHTML = error;
        imageitContainer.querySelector('.imageit-upload').append(errorElem);
    },
    clearErrors: function(imageitContainer){
        imageitContainer.querySelectorAll('.imageit-error').forEach(item =>{
            item.remove();
        });
    },
    getImageitContainer: function(e){
        return e.currentTarget.closest('.imageit-container');
    },
}

window.addEventListener("DOMContentLoaded", function(){
    IMAGEIT.addListeners();
});