class Imageit{
    constructor(element){
        this.fileTypes = ['svg', 'jpg', 'jpeg', 'png'];
        this.field = element;
        this.fileInput = element.querySelector('.imageit-selector')
        this.fileInputName = this.fileInput.name;
        this.fileInputMultiple = this.fileInput.multiple;
        this.initialFiles = []
        this.files = [];
        this.errors = [];
        
        // If input field is a child of a 'cropit' container, set crop to true
        if (this.field.closest('.imageit-cropit-container')){
            let inputPrefix = this.fileInputName.slice(0, -1);

            this.crop = true;
            this.cropValInputs = [];
            
            // Find inputs for crop coordinates and add them to this.cropValInputs
            for(var i = 1; i <= 4; i++){
                this.cropValInputs.push(this.field.parentNode.querySelector('input[name="' + inputPrefix + i + '"]'));
            }
        }else{
            this.crop = false;
        }
        
        //Hide traditional selector. This ensures usual functionality on no JS browsers
        element.querySelector('.imageit-pseudo-selector').style.display = 'block';
        this.fileInput.hidden = true;

        //Retreive initial values to allow management of their state
        this.retreiveInitial();
        this.addListeners();
    }

    //Retreive any initial files
    retreiveInitial(){
        //Retrieve any initial value from a field
        this.field.querySelectorAll('.imageit-preview-general.imageit-initial').forEach(item =>{
            //Instantiate image class for each of the initials
            let initialElem = item.querySelector('.imageit-preview-image');
            this.initialFiles.push(new ImageitImg(initialElem.src, initialElem.closest('.imageit-preview-general'), true));
        });
    }

    //Add all required listeners to the field
    addListeners(){        
        //Listeners for change of file select
        this.fileInput.addEventListener('change', this.selectFile.bind(this), false);
        
        //Add listeners for clearing initial previews, triggering cropper ui's etc.
        this.addPreviewListeners();
    }
    
    //Add listeners for clearing intial images or cancelling selected imgs
    //Executed every render
    addPreviewListeners(){     
        this.field.querySelectorAll('.imageit-clear-image').forEach(item =>{
            item.addEventListener('click', this.togglePreview.bind(this), false);
        });
        this.field.querySelectorAll('.imageit-undo-button').forEach(item =>{
            item.addEventListener('click', this.togglePreview.bind(this), false);
        });
        if(this.crop){
            this.field.querySelectorAll('.imageit-cropper-image').forEach(item =>{
                let cropper = new Cropper(item, {viewMode: 2});
                item.addEventListener('crop', this.setCropVals.bind(this), false);
            });
        }
    }

    //Triggered on change of file select input
    selectFile(e){
        let files = Array.from(e.target.files);
        
        //Clear files every time input is changed. (If submitting by ajax this can be changed to preserve state)
        this.files = [];
        this.errors = [];
        
        //Raise error if multiple files are selected without multiple flag on input
        //Else instantiate selected file as ImageitImg obj.
        if (! this.fileInputMultiple && files.length + this.files.length > 1){
            this.errors.push({'code': 1001, 'file': '', 'message': 'Only one file is accepted!'});
        }else{
            (files).forEach(file =>{
                let newImg = new ImageitImg(file);

                //Raise error if selected file is not in accepted file types
                if (this.fileTypes.indexOf(newImg.fileExtension) == -1){
                    this.errors.push({
                        'code': 1002, 
                        'file': file.name, 
                        'message': 'Only ' + this.fileTypes.join(", ") + ' files are accepted!',
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
        let allFiles = this.files.concat(this.initialFiles);
        //Using the target of the event, find target obj to be toggled
        let file = allFiles.find(item => item.elem == e.currentTarget.closest('.imageit-preview-general'));
        
        //If initial toggle hidden field on obj
        //If not initial, remove from files
        if (file.initial){
            file.hidden = !file.hidden;
            file.clearCheckbox.checked = ! file.clearCheckbox.checked;
        }else{
            let fileIndex = this.files.find(item => item.elem == e.currentTarget.closest('.imageit-preview-general'));
            this.fileInput.value = "";
            delete this.files.splice(fileIndex, 1);
            console.log(this.files);
        }
        this.render();
    }

    //Apply coordinates of crop to the relevant input fields
    setCropVals(e){
        let vals = [
            e.detail.x,
            e.detail.y,
            e.detail.x + e.detail.width,
            e.detail.y + e.detail.height
        ]

        for(var i = 0; i < this.cropValInputs.length; i++){
            this.cropValInputs[i].value = vals[i];
        }
    }

    //Prepares a list of img object to render, Based on new selected files/ or initial files
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

        //Render any errors for the field
        if(this.errors.length > 0){
            for(var i = 0; i < this.errors.length; i++){
                let error = this.errors[i];
                let errorElem = document.createElement('div');
                errorElem.classList.add('imageit-error');
                errorElem.innerHTML = error.message;
                renderContainer.append(errorElem);
            }
        }

        //Render out previews for each of the elements
        for(var i = 0; i < renderElems.length; i++){
            let item = renderElems[i];
            item.preview(this.crop).then((result) => {
                renderContainer.append(result);
                this.addPreviewListeners();
            });
        }
    }
}


class ImageitImg{
    //Include errors

    constructor(file, elem=false, initial=false){
        this._file = file;
        this._processedFile = false;
        this.elem = elem;
        this.initial = initial;
        this.hidden = false;

        //If initital image pull props from dom elements
        if (this.initial){
            if(elem){
                this.descriptor = elem.querySelector('.imageit-preview-help-text').textContent;
                this.fileName = elem.querySelector('.imageit-preview-filename').textContent;
                this.clearCheckbox = elem.querySelector('.imageit-clear-image-checkbox');
            }else{
                this.descriptor = 'Current';
                this.fileName = file;
            }
            (this.clearCheckbox) ? this.clearable = true : this.clearable = false;
            this.fileExtension = this.fileName.split('.').pop().toLowerCase();
        }else{
            this.fileName = file.name;
            this.fileExtension = file.name.split('.').pop().toLowerCase();
            this.descriptor = 'New';
            this.clearable = true;
        }

        //Reads selected file and returns it
        //Returns Promise, resolves to img
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

        //Generates a preview dom element and returns it
        //Returns promise, resolves to dom element
        this.preview = function(crop=false){
            return new Promise((resolve) => {
                let preview = document.createElement('div');
                preview.classList.add('imageit-preview-general');

                if (this.initial) preview.classList.add('imageit-initial');
                //Append clear checkbox to preview (used to tell django to remove an initial file)
                if (this.clearCheckbox) preview.append(this.clearCheckbox);
    
                if (this.hidden){
                    //Render undo button
                    let undo = document.createElement('a');
                    undo.innerHTML = this.fileName + ' Removed! Undo';
                    undo.classList.add('imageit-undo-button');
                    preview.append(undo);

                    
                    
                    this.elem = preview;
                    resolve(preview);
                }else{
                    this.processedFile().then((response) => {
                        let htmlStr = '';

                        if(crop && ! this.initial){
                            //Render cropper
                            preview.classList.add('imageit-cropper');
                            htmlStr = htmlStr + '<div class="imageit-cropper-content">';
                            if (this.clearable){
                                htmlStr = htmlStr + '<div class="imageit-clear-image imageit-cancel-crop"><span>Cancel</span></div>';
                            }
                            htmlStr = htmlStr +     '<div class="imageit-cropper-image-container">' +
                                                        '<img class="imageit-cropper-image" alt="Image crop preview" src="' + response + '" />' + 
                                                    '</div>' +
                                                '</div>';
                        }else{
                            //Render preview
                            preview.classList.add('imageit-preview');
                            htmlStr = htmlStr +
                                    '<a class="imageit-preview-link" href="' + response + '" target="_blank">' +
                                        '<img class="imageit-preview-image" alt="Image preview" src="' + response + '" />' +
                                    '</a>' +
                                    '<div class="imageit-preview-text">' +
                                        '<p><strong class="imageit-preview-help-text">' + this.descriptor + '</strong></p>' +
                                        '<hr>' +
                                        '<p class="imageit-preview-filename">' + this.fileName + '</p>' +
                                    '</div>';
                            if (this.clearable){
                                htmlStr = htmlStr +
                                    '<div>' +
                                        '<div class="imageit-clear-image"><span>x</span></div>' +
                                    '</div>';
                            }
                        }
                        
                        preview.innerHTML = htmlStr;
                        
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