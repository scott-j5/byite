class Imageit{
    constructor(element){
        this.fileTypes = ['svg', 'jpg', 'jpeg', 'png'];
        this.field = element;
        this.fileInput = element.querySelector('.imageit-selector')
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
    
    //Removes any new (user selected) images from files
    clearNewImages(){
        for(var i=this.files.length - 1; i > 0; i--){
            let image = this.files[i];
            image.hidden = true;
            this.render();
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
        ]

        for(var i = 0; i < this.cropValInputs.length; i++){
            this.cropValInputs[i].value = vals[i];
        }
    }

    //Render any previews in this field
    render(){
        let renderContainer = this.field.querySelector('.imageit-preview-container');

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
        for(var i = 0; i < this.files.length; i++){
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
        this.cropVals = [];
        this.cropValInputs = [];
        this.errors = [];

        try{
            if(typeof data === 'object'){
                var obj = data;
            }else{
                var obj = JSON.parse(data);
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
    processFile = function(){
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
            if(this.initial){
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
        if(elem && this.clearCheckbox) elem.append(this.clearCheckbox);

        //Only render element if the generated dome element differs from current this.elem
        if(elem instanceof Element && (!this.elem || !this.elem.isEqualNode(elem))){
            if (this.elem) this.elem.remove();
            container.append(elem);
            this.elem = elem;
            this.addListeners();
        }else if (! elem){
            if (this.elem) this.elem.remove();
            this.elem = false;
        }
    }

    toggleHide(){
        this.hidden = ! this.hidden;
        if(this.clearCheckbox) this.clearCheckbox.checked = this.hidden;
        this.render();
    }

    //Apply coordinates of crop to the relevant input fields
    setCropVals(e){
        this.cropVals = [
            e.detail.x,
            e.detail.y,
            e.detail.x + e.detail.width,
            e.detail.y + e.detail.height
        ]

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
    var fields = []
    document.querySelectorAll('.imageit-container').forEach(item => {
        fields.push(new Imageit(item));
    });
});







/*

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


/*

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

*/