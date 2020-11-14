
//Initialise the fields in the template so that widget attributes can
//Specify allowed file types
class Imageit{

    //Add options??
    constructor(element){
        this.fileTypes = ['svg', 'jpg', 'png'];
        this.field = element;
        this.fieldName = element.querySelector('.imageit-upload').dataset.name;
        this.initialFiles = []
        this.files = [];
        this.errors = [];
        
        let multipleVal = element.querySelector('.imageit-upload').dataset.multiple
        if (multipleVal) this.multiple = (multipleVal.toLowerCase() == 'multiple') ? true : false;

        this.addListeners();
        this.retreiveInitial();
    };

    //Add all listeners to the field and dz
    addListeners(){
        let uploadElem = this.field.querySelector('.imageit-upload');
        
        //Listeners for dropping or uploading a file
        uploadElem.addEventListener('dragenter', this.dzActive.bind(this), false);
        uploadElem.addEventListener('dragover', this.dzActive.bind(this), false);
        uploadElem.addEventListener('dragleave', this.dzInactive.bind(this), false);
        uploadElem.addEventListener('drop', this.processDrop.bind(this), false);
        uploadElem.addEventListener('click', this.selectFile.bind(this), false);
        
        this.addPreviewListeners(uploadElem);
    }

    addPreviewListeners(){
        //Listener for cancelling intial images
        this.field.querySelectorAll('.imageit-clear-image').forEach(item =>{
            item.addEventListener('click', this.togglePreview.bind(this), false);
        });
        this.field.querySelectorAll('.imageit-undo-button').forEach(item =>{
            item.addEventListener('click', this.togglePreview.bind(this), false);
        });
    }

    //Retreive any initial files
    retreiveInitial(){
        //Retrieve any initial value from a field
        this.field.querySelectorAll('.imageit-preview.imageit-initial').forEach(item =>{
            //Instantiate image class for each of the initials
            let initialElem = item.querySelector('.imageit-preview-image');
            this.initialFiles.push(new ImageitImg(initialElem.src, initialElem.closest('.imageit-preview'), true));
        });
    }

    //Trigger file selection window
    selectFile(){

    }

    //Process a drop event in the field
    processDrop(e){
        e.preventDefault();

        this.dzInactive();
        this.loadingActive();

        //Raise error if multiple files are selected when not allowed
        let fileTypes = this.fileTypes;
        let files = e.dataTransfer.files;
        this.errors = [];
        if (! this.multiple && [...files].length + this.files.length > 1){
            this.errors.push({'code': 1001, 'file': '', 'message': 'Only one file is accepted!'});
        }else{
            ([...files]).forEach(file =>{
                let newImg = new ImageitImg(file);

                if (fileTypes.indexOf(newImg.fileExtension) == -1){
                    this.errors.push({
                        'code': 1002, 
                        'file': file.name, 
                        'message': 'Only ' + fileTypes.join(", ") + ' files are accepted!',
                    });
                }else{
                    this.files.push(newImg);
                }
            });
        }
        this.render();
    }

    // Toggle image previews
    togglePreview(e){
        //If initial toggle hidden field
        //If not initial remove it
        let allFiles = this.files.concat(this.initialFiles);
        let file = allFiles.find(item => item.elem == e.currentTarget.closest('.imageit-preview'));
        
        if (file.initial){
            file.hidden = !file.hidden;
        }else{
            let fileIndex = this.files.find(item => item.elem == e.currentTarget.closest('.imageit-preview'));
            console.log(this.files);
            delete this.files.splice(fileIndex, 1);
            console.log(this.files);
        }
        this.render();
    }

    prepRender(){
        if (this.files.length > 0){
            return this.files;
        }else if (this.initialFiles.length > 0){
            return this.initialFiles;
        }
        return [];
    }

    //Render any previews in this field
    render(){
        let renderContainer = this.field.querySelector('.imageit-preview-container');
        let renderElems = this.prepRender();
        renderContainer.innerHTML = '';
        //Make sure to render errors of imgs
        //Add dom element to each img
        if(this.errors.length > 0){
            for(var i = 0; i < this.errors.length; i++){
                let error = this.errors[i];
                let errorElem = document.createElement('div');
                errorElem.classList.add('imageit-error');
                errorElem.innerHTML = error.message;
                renderContainer.append(errorElem);
            }
        }
        for(var i = 0; i < renderElems.length; i++){
            let item = renderElems[i];
            item.preview().then((result) => {
                console.log('rendered');
                renderContainer.append(result);
                this.addPreviewListeners();
            });
        }
    }

    // Trigger ui interaction when mouse dragged over dz
    dzActive(){
        this.field.querySelector('.imageit-upload').classList.add('imageit-active');
    }
    dzInactive(){
        this.field.querySelector('.imageit-upload').classList.remove('imageit-active');
    }

    // Toggle loading ui elements on dz
    loadingActive(){
        console.log(this.field);
        this.field.classList.add('imageit-loading');
    }
    loadingInactive(){
        this.field.classList.remove('imageit-loading');
    }
}

class ImageitImg{
    //Include errors

    constructor(file, elem=false, initial=false){
        this._file = file;
        this._processedFile = false;
        this.initial = initial;
        this.hidden = false;
        if (this.initial){
            if(elem){
                this.descriptor = elem.querySelector('.imageit-preview-help-text').textContent;
                this.fileName = elem.querySelector('.imageit-preview-filename').textContent;
            }else{
                this.descriptor = 'Current';
                this.fileName = file;
            }
            this.fileExtension = this.fileName.split('.').pop().toLowerCase();
        }else{
            this.fileName = file.name;
            this.fileExtension = file.name.split('.').pop().toLowerCase();
            this.descriptor = 'New';
        }
        if (elem){
            this.elem = elem;
        }else{
            this.elem = false;
        }

        //Might have to move this outside constructor
        this.processedFile = function(){
            return new Promise((resolve) => {
                if (this._processedFile == false && !this.initial){
                    let reader = new FileReader();
                    reader.readAsDataURL(this._file);
                    reader.onloadend = function(){
                        this._processedFile = reader.result;
                        resolve(this._processedFile);
                    };
                }else if (this.initial){
                    this._processedFile = this._file;
                    resolve(this._processedFile);
                }
            });
        };

        this.preview = function(){
            return new Promise((resolve) => {
                let preview = document.createElement('div');
                preview.dataset.target = this.fileName;
                preview.classList.add('imageit-preview');
                if (this.initial) preview.classList.add('imageit-initial');
    
                if (this.hidden){
                    //Render undo button
                    let undo = document.createElement('a');
                    undo.innerHTML = this.fileName + ' removed! Undo';
                    undo.classList.add('imageit-undo-button');
                    preview.append(undo);
                    this.elem = preview;
                    resolve(preview);
                }else{
                    this.processedFile().then((response) => {
                        preview.innerHTML = 
                            '<div class="imageit-preview-content">' +
                                '<a class="imageit-preview-link" href="' + response + '" target="_blank">' +
                                    '<img class="imageit-preview-image" alt="Image preview" src="' + response + '" />' +
                                '</a>' +
                                '<div class="imageit-preview-text">' +
                                    '<p><strong class="imageit-preview-help-text">' + this.descriptor + '</strong></p>' +
                                    '<hr>' +
                                    '<p class="imageit-preview-filename">' + this.fileName + '</p>' +
                                '</div>' +
                                '<div>' +
                                    '<div class="imageit-clear-image"><span>x</span></div>' +
                                '</div>' +
                            '</div>';
                        this.elem = preview;
                        resolve(preview);
                    });
                }
            });
        }
    }
}


window.addEventListener("DOMContentLoaded", function(){
    var fields = []
    document.querySelectorAll('.imageit-container').forEach(item => {
        fields.push(new Imageit(item));
    });
});







/*
IMAGEIT = {
    fileTypes: ['svg', 'jpg', 'png'],
    fields: {},
    init: function(){
        IMAGEIT.initialiseFields();
        console.log(IMAGEIT.fields);
    },
    img: function(file, initial=false){
        this._file = file;
        this._processedFile = false;
        this.initial = initial;
        if (this.initial){
            this.fileName = file;
            this.fileExtension = file.split('.').pop().toLowerCase();
        }else{
            this.fileName = file.name;
            this.fileExtension = file.name.split('.').pop().toLowerCase();
        }
        this.processedFile = function(){
            return new Promise((resolve, reject) => {
                if (this._processedFile == false && !this.initial){
                    let reader = new FileReader();
                    reader.readAsDataURL(this._file);
                    reader.onloadend = function(){
                        this._processedFile = reader.result;
                    };
                }else if (this.initial){
                    this._processedFile = this._file;
                }
                resolve(this._processedFile);
            });
        };
    },
    initialiseFields: function(){
        //Initialise each individual field
        document.querySelectorAll('.imageit-container').forEach( item => {
            let fieldName = item.querySelector('.imageit-upload').dataset.name;
            IMAGEIT.fields[fieldName] = [];
            IMAGEIT.addListeners(item);
            let initial = IMAGEIT.retreiveInitial(item);
            IMAGEIT.fields[fieldName].push(initial);
        });
    },
    retreiveInitial: function(imageitContainer){
        let initialImages = []
        //Retrieve any initial value from a field
        imageitContainer.querySelectorAll('.imageit-preview.imageit-initial').forEach(item =>{
            //Create images from each of the initials
            let initialSrc = item.querySelector('.imageit-preview-image').src;
            initialImages.push(new IMAGEIT.img(initialSrc, true));
        });
        return initialImages;
    },
    addListeners: function(imageitContainer){
        let uploadElem = imageitContainer.querySelector('.imageit-upload');
        
        //Listeners for dropping or uploading a file
        uploadElem.addEventListener('dragenter', IMAGEIT.dzActive, false);
        uploadElem.addEventListener('dragover', IMAGEIT.dzActive, false);
        uploadElem.addEventListener('dragleave', IMAGEIT.dzInactive, false);
        uploadElem.addEventListener('drop', IMAGEIT.processDrop, false);
        uploadElem.addEventListener('click', IMAGEIT.selectFile, false);
        
        //Listener for cancelling intial image
        uploadElem.querySelectorAll('.imageit-clear-image').forEach(item =>{
            item.addEventListener('click', IMAGEIT.togglePreview, false);
        });
    },
    render: function(){
    }
    selectFile: function(e){
        console.log('select');
    },
    dzActive: function(e){
        e.currentTarget.classList.add('active');
    },
    dzInactive: function(e){
        e.currentTarget.classList.remove('active');
    },
    processDrop: function(e){
        let imageitContainer = IMAGEIT.getImageitContainer(e);
        
        e.preventDefault();
        IMAGEIT.dzInactive(e);
        IMAGEIT.showLoading(imageitContainer);
        //Raise error if multiple files are selected when not allowed
        let uploadElem = imageitContainer.querySelector('.imageit-upload');
        let files = e.dataTransfer.files;
        if (uploadElem.dataset.multiple.toLowerCase() != 'multiple' && [...files].length > 1){
            IMAGEIT.renderError(imageitContainer, 'Only one file is accepted!');
        }else{
            ([...files]).forEach(file =>{
                let extension = file.name.split('.').pop().toLowerCase();
                if (IMAGEIT.fileTypes.indexOf(extension) == -1){
                    IMAGEIT.renderError(imageitContainer, 'Only ' + IMAGEIT.fileTypes.join(", ") + ' files are accepted!');
                }else{
                    IMAGEIT.previewFile(imageitContainer, file);
                    IMAGEIT.clearErrors(imageitContainer);
                }
                console.log('passed');
            });
        }
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
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function(){
            console.log('returned');
            //return reader.result;
            let temp = document.getElementById('imageit-preview').cloneNode(true);
            let img = reader.result;
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
            IMAGEIT.renderPreview(imageitContainer);
        };
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
                            undo.innerHTML = item.querySelector('.imageit-preview-filename').innerHTML + ' removed! Undo';
                            undo.classList.add('imageit-undo-button');
                            undo.addEventListener('click', IMAGEIT.togglePreview, false);
                            item.append(undo);
                            //Hide initial image preview
                            item.firstElementChild.classList.add('imageit-inactive');
                        }else{
                            let undoButton = item.querySelector('.imageit-undo-button');
                            if(undoButton){
                                undoButton.remove();
                            }
                            item.firstElementChild.classList.remove('imageit-inactive');
                        }
                    });   
                }
            }
            IMAGEIT.hideLoading(imageitContainer);
        }
    },
    showLoading: function(imageitContainer){
        imageitContainer.classList.add('imageit-loading');
    },
    hideLoading: function(imageitContainer){
        imageitContainer.classList.remove('imageit-loading');
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
};
window.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll('-imageit-container').forEach(item => {
        const field = new IMAGEIT.init();
    });
});
/*
IMAGEIT = {
    fileTypes: ['svg', 'jpg', 'png'],
    images: {},
    addListeners: function(){
        //Listeners for dropping or uploading a file
        document.querySelectorAll('.imageit-upload').forEach(item =>{
            item.addEventListener('dragenter', IMAGEIT.dzActive, false);
            item.addEventListener('dragover', IMAGEIT.dzActive, false);
            item.addEventListener('dragleave', IMAGEIT.dzInactive, false);
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
    dzActive: function(e){
        e.currentTarget.classList.add('active');
    },
    dzInactive: function(e){
        e.currentTarget.classList.remove('active');
    },
    processDrop: function(e){
        let imageitContainer = IMAGEIT.getImageitContainer(e);
        
        e.preventDefault();
        IMAGEIT.dzInactive(e);
        IMAGEIT.showLoading(imageitContainer);
        //Raise error if multiple files are selected when not allowed
        let uploadElem = imageitContainer.querySelector('.imageit-upload');
        let files = e.dataTransfer.files;
        if (uploadElem.dataset.multiple.toLowerCase() != 'multiple' && [...files].length > 1){
            IMAGEIT.renderError(imageitContainer, 'Only one file is accepted!');
        }else{
            ([...files]).forEach(file =>{
                let extension = file.name.split('.').pop().toLowerCase();
                if (IMAGEIT.fileTypes.indexOf(extension) == -1){
                    IMAGEIT.renderError(imageitContainer, 'Only ' + IMAGEIT.fileTypes.join(", ") + ' files are accepted!');
                }else{
                    IMAGEIT.previewFile(imageitContainer, file);
                    IMAGEIT.clearErrors(imageitContainer);
                }
                console.log('passed');
            });
        }
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
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function(){
            console.log('returned');
            //return reader.result;
            let temp = document.getElementById('imageit-preview').cloneNode(true);
            let img = reader.result;
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
            IMAGEIT.renderPreview(imageitContainer);
        };
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
                            undo.innerHTML = item.querySelector('.imageit-preview-filename').innerHTML + ' removed! Undo';
                            undo.classList.add('imageit-undo-button');
                            undo.addEventListener('click', IMAGEIT.togglePreview, false);
                            item.append(undo);
                            //Hide initial image preview
                            item.firstElementChild.classList.add('imageit-inactive');
                        }else{
                            let undoButton = item.querySelector('.imageit-undo-button');
                            if(undoButton){
                                undoButton.remove();
                            }
                            item.firstElementChild.classList.remove('imageit-inactive');
                        }
                    });   
                }
            }
            IMAGEIT.hideLoading(imageitContainer);
        }
    },
    showLoading: function(imageitContainer){
        imageitContainer.classList.add('imageit-loading');
    },
    hideLoading: function(imageitContainer){
        imageitContainer.classList.remove('imageit-loading');
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
};
window.addEventListener("DOMContentLoaded", function(){
    IMAGEIT.addListeners();
});*/