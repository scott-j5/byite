class Imageit{
    constructor(element){
        this.fileTypes = ['svg', 'jpg', 'jpeg', 'png'];
        this.field = element;
        this.fileInput = element.querySelector('.imageit-selector');
        this.fileInputName = this.fileInput.name;
        this.fileInputMultiple = this.fileInput.multiple;
        this.crop = false;
        this.cropValInputs = [];
        this.files = [];
        this.errors = [];
        
        // If input field is a child of a 'cropit' container, set crop to true
        if (this.field.closest('.imageit-cropit-container')){
            this.crop = true;
            this.retrieveCropInputs();
        }
        
        //Hide traditional selector. This ensures usual file select functionality on no JS browsers
        this.field.querySelector('.imageit-pseudo-selector').style.display = 'block';
        this.fileInput.hidden = true;

        //Retreive initial values to allow management of their state
        this.retrieveInitial();
        this.render();
        this.addListeners();
    }


    // Retrieve any initial files from the form
    retrieveInitial(){
        //Retrieve any initial value from a field
        this.field.querySelectorAll('.imageit-initial').forEach(item =>{
            //Instantiate image class for each of the initials
            let initialImg = item.querySelector('.imageit-preview-image');
            let imgData = {
                "file": initialImg.src,
                "fileName": item.querySelector('.imageit-preview-filename').textContent || initialImg.src,
                "descriptor": item.querySelector('.imageit-preview-help-text').textContent || "Current",
                "clearCheckbox": item.querySelector('.imageit-clear-image-checkbox'),
                "crop": this.crop,
            };
            let imgObj = new ImageitImg(imgData, this.field, item, true);
            this.files.push(imgObj);
        });
    }

    // Retrieve inputs for crop coordinates and add them to this.cropValInputs
    retrieveCropInputs(){
        let inputPrefix = this.fileInputName.slice(0, -1);
        for(var i = 1; i <= 4; i++){
            this.cropValInputs.push(this.field.parentNode.querySelector('input[name="' + inputPrefix + i + '"]'));
        }
    }

    //Add listener for any changes on the file select input
    addListeners(){        
        this.fileInput.addEventListener('change', this.selectFile.bind(this), false);
    }

    //Triggered on change of file select input
    selectFile(e){
        let files = Array.from(e.target.files);
        let initialFiles = this.files.filter(obj => obj.initial);
        this.clearNewImages();

        //Raise error if multiple files are selected without multiple flag on input
        //Else instantiate selected file as ImageitImg obj.
        if (! this.fileInputMultiple && (files.length - initialFiles.length) + this.files.length > 1){
            this.errors.push({'code': 1001, 'file': '', 'message': 'Only one file is accepted!'});
        }else{
            (files).forEach(file =>{
                let imgData = {
                    "file": file,
                    "fileName": file.name,
                    "crop": this.crop,
                    "cropValInputs": this.cropValInputs,
                };
                let imgObj = new ImageitImg(imgData, this.field);
                this.files.push(imgObj);
            });
        }
        this.render();
    }

    //Remove file
    removeFile(e){
        let clearButton = e.currentTarget.closest('');
        for(var i=this.files.length - 1; i > 0; i--){
            let image = this.files[i];
            image.hidden = true;
            this.render();
            if (image.initial == false) this.files.splice(i, 1);
        }

        let newFiles = this.files.filter(obj => ! obj.initial);
        if (newFiles.length > 0){
            for(var i=this.files.length - 1; i > 0; i--){
                let image = this.files[i];
                if (image.initial){
                    image.hidden = false;
                }
            }
        }
        this.render();
    }
    
    //Removes any new (user selected) images from files
    clearNewImages(){
        for(var i=this.files.length - 1; i > 0; i--){
            let image = this.files[i];
            image.hidden = true;
            image.render();
            if (image.initial == false) this.files.splice(i, 1);
        }
    }

    //Apply coordinates of crop to the relevant input fields
    setCropVals(e){
        let vals = [
            e.detail.x,
            e.detail.y,
            e.detail.x + e.detail.width,
            e.detail.y + e.detail.height
        ];

        for(var i = 0; i < this.cropValInputs.length; i++){
            this.cropValInputs[i].value = vals[i];
        }
    }

    //Render any previews in this field
    render(){
        let renderContainer = this.field.querySelector('.imageit-preview-container');

        //Render any errors for the field
        if(this.errors.length > 0){
            for(let i = 0; i < this.errors.length; i++){
                let error = this.errors[i];
                let errorElem = document.createElement('div');
                errorElem.classList.add('imageit-error');
                errorElem.innerHTML = error.message;
                renderContainer.append(errorElem);
            }
        }

        //Render out previews for each of the elements
        for(let i = 0; i < this.files.length; i++){
            let item = this.files[i];
            item.render(renderContainer);
        }
    }
}


class ImageitImg{
    //Include errors
    constructor(data, formField, elem=false, initial=false){
        this._processedFile = false;
        this.formField = formField;
        this.elem = elem;
        this.initial = initial;
        this.hidden = false;
        this.removed = false;
        this.cropVals = [];
        this.cropValInputs = [];
        this.errors = [];

        try{
            let obj = false;
            if(typeof data === 'object'){
                obj = data;
            }else{
                obj = JSON.parse(data);
            }
            this._file = obj.file || false;
            this.fileName = obj.fileName || this._file.name || false;
            this.fileExtension = this.fileName.split('.').pop().toLowerCase() || false;
            this.descriptor = obj.descriptor || 'New';
            this.clearCheckbox = obj.clearCheckbox || false;
            this.crop = obj.crop || false;
            this.cropValInputs = obj.cropValInputs || false;
            
            // Derive if img is removable
            (this.clearCheckbox || !this.initial) ? this.removable = true : this.removable = false;          
        }catch (e){
            this.errors.push(e);
        }
    }

    //Reads selected file and returns it
    //Returns Promise, resolves to img
    processFile(){
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
    }

    async render(renderContainer=false){
        var container = renderContainer || this.elem.parentNode || this.formField.querySelector('.imageit-preview-contianer');
        var elem = document.createElement('div');
        elem.classList.add('imageit-preview');

        //Render preview if this.hidden == false
        if (! this.hidden){
            let html = '';
            //Show loading while image is being processed
            if (! this._processedFile){
                this.formField.classList.add('imageit-loading');
                this._processedFile = await this.processFile();
                this.formField.classList.remove('imageit-loading');
            }

            if(this.crop && ! this.initial){
                elem.classList.add('imageit-cropper');
                html = '<div class="imageit-cropper-content">';
                if (this.clearable) html = html + '<div class="imageit-clear-image imageit-cancel-crop"><span>Cancel</span></div>';
                
                html = html + '<div class="imageit-cropper-image-container">' +
                            '<img class="imageit-cropper-image" alt="Image crop preview" src="' + this._processedFile + '" />' + 
                        '</div>' +
                    '</div>';
            }else{
                html = 
                    '<div class="imageit-preview-content">' +
                        '<a class="imageit-preview-link" href="' + this._processedFile + '" target="_blank">' +
                            '<img class="imageit-preview-image" alt="File preview" src="' + this._processedFile + '" />' +
                        '</a>' +
                        '<div class="imageit-preview-text">' + 
                            '<p><strong class="imageit-preview-help-text">' + this.descriptor + '</strong></p>' +
                            '<hr>' +
                            '<a href="' + this._processedFile + '"><p class="imageit-preview-filename">' + this.fileName + '</p></a>' +
                        '</div>';
            }

            if (this.removable){ 
                html = html + 
                    '<div class="imageit-toggle-hide imageit-clear-button">X</div>';
            }
            
            html = html + 
                '</div>';

            //Render any field errors
            if (this.errors.length > 0 ){
                for (var i=0; i < this.errors.length; i++){
                    let error = this.errors[i];
                    html = html + '<div class="imageit-error">' + error + '</div>';
                }
            }
            elem.innerHTML = html;
        }else{
            // Render undo button
            if(this.removed){
                //Render undo button
                elem.innerHTML = '<div class="imageit-preview-content">' +
                                    '<div>' + this.fileName + ' Removed!' + '</div>' +
                                    '<div class="imageit-toggle-hide imageit-undo-button">Undo</div>' + 
                                '</div>';
            }else{
                elem = false;
            }
        }

        //Append clear checkbox to rendering element
        if(elem && this.clearCheckbox) elem.append(this.clearCheckbox.cloneNode(true));

        //Only render element if the generated dome element differs from current this.elem
        if(elem instanceof Element && (!this.elem || !this.elem.isEqualNode(elem))){
            if (this.elem){
                container.insertBefore(elem, this.elem)
                this.elem.remove();
            }else{
                container.append(elem);
            }
            this.elem = elem;
            console.log(this.elem);
            this.addListeners();
        }else if (! elem){
            if (this.elem) this.elem.remove();
            this.elem = false;
        }
    }

    toggleHide(){
        this.hidden = ! this.hidden;
        if(this.initial) this.removed = ! this.removed;
        if(this.clearCheckbox) this.clearCheckbox.checked = this.removed;
        this.render();
    }

    //Apply coordinates of crop to the relevant input fields
    setCropVals(e){
        this.cropVals = [
            e.detail.x,
            e.detail.y,
            e.detail.x + e.detail.width,
            e.detail.y + e.detail.height
        ];

        for( var i=0; i < this.cropValInputs.length; i++){
            let input = this.cropValInputs[i];
            input.value = this.cropVals[i];
        }
    }

    //Add listeners for removing images
    //Executed every render
    addListeners(){ 
        let button = this.elem.querySelector('.imageit-toggle-hide');
        let cropperElem = this.elem.querySelector('.imageit-cropper-image');
        
        if(cropperElem){
            let cropper = new Cropper(cropperElem, {viewMode: 2});
            cropperElem.addEventListener('crop', this.setCropVals.bind(this), false);
        }
        if (button) button.addEventListener('click', this.toggleHide.bind(this), false);
    }
}

window.addEventListener("DOMContentLoaded", function(){
    var fields = [];

    document.querySelectorAll('.imageit-container').forEach(item => {
        fields.push(new Imageit(item));
    });
});