
//Initialise the fields in the template so that widget attributes can
//Specify allowed file types
class DropZoneIt{

    //Add options??
    constructor(element){
        this.field = element;
        this.instanceId = this.field.dataset.dzit_instance;
        this.cType = this.field.dataset.dzit_ctype;
        this.files = [];
        this.errors = [];

        this.addListeners();
        this.getInitial();
    };

    //Add all listeners to the field and dz
    addListeners(){
        let dzElem = this.field.querySelector('.dropzoneit');
        let dzSelect = dzElem.querySelector('.dropzoneit-file-selector');

        //Listeners for dropping or uploading a file
        dzElem.addEventListener('dragenter', this.dzActive.bind(this), false);
        dzElem.addEventListener('dragover', this.dzActive.bind(this), false);
        dzElem.addEventListener('dragleave', this.dzInactive.bind(this), false);
        dzElem.addEventListener('drop', this.processDrop.bind(this), false);
        dzSelect.addEventListener('change', this.selectFile.bind(this), false);
    }


    //Retreive any initial files
    getInitial(){
        let url = '/dropzoneit/list/' + this.cType + '/' + this.instanceId + '/';
        this.field.classList.add('dropzoneit-loading');

        //Ajax function to get files
        const xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        
        // Add listener for change of request ready state
        xhr.addEventListener('readystatechange', function(e) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let data = JSON.parse(xhr.response).data;
                let files = [];
                for (var i=0; i < data.length; i ++){
                    files.push(new DropZoneItFile(JSON.stringify(data[i]), this.field));
                }
                this.files = files;
                this.field.classList.remove('dropzoneit-loading');
                this.render();
            }
            else if (xhr.readyState == 4 && xhr.status != 200) {
                // Error. Inform the user
                this.errors.push(xhr.statusText);
                this.field.classList.remove('dropzoneit-loading');
                this.render();
            }
        }.bind(this));
        
        xhr.send(null);
    }


    //Process files from select window
    selectFile(e){
        e.preventDefault();

        let files = e.target.files;
        this.processFiles(files);
    }

    //Process a drop event in the field
    processDrop(e){
        e.preventDefault();
        this.dzInactive();

        let files = e.dataTransfer.files;    
        this.processFiles(files);
    }

    processFiles(files){
        ([...files]).forEach(file =>{
            let fileProps = {
                "file": file,
                "name": file.name,
                "content_type": this.cType,
                "instance_id": this.instanceId,
            }
            let newFile = new DropZoneItFile(fileProps, this.field, true);
            newFile.post();
            this.files.push(newFile);
        });
        this.render();
    }

    //Render any previews in this drop zone field
    render(){
        for (var i=0; i < this.files.length; i++){
            this.files[i].render();
        }
    }


    load(url, data=false){
        return new Promise((resolve) => {
            let dzField = this.field;
            dzField.classList.add('dropzoneit-loading');
            //Ajax function to get files
            const xhr = new XMLHttpRequest();
            
            if (data){
                xhr.open('POST', url, true);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                xhr.send(data); 
            }else{
                xhr.open('GET', url, true);
                xhr.send(null); 
            };

            xhr.onload = function(){
                dzField.classList.remove('dropzoneit-loading');
                resolve(xhr.response);
            }
        });
    }

    // Trigger ui interaction when mouse dragged over dz
    dzActive(){
        this.field.querySelector('.dropzoneit').classList.add('dropzoneit-active');
    }
    dzInactive(){
        this.field.querySelector('.dropzoneit').classList.remove('dropzoneit-active');
    }
}


class DropZoneItFile{
    constructor(data, parentContainer, isNew=false){
        this.parentContainer = parentContainer;
        this.new = isNew;
        this.errors = [];

        try{
            if(typeof data === 'object'){
                var obj = data;
            }else{
                var obj = JSON.parse(data);
            }
            this.id = obj.id || false;
            this.content_type = obj.content_type || false;
            this.object_id = obj.object_id || false;
            this.file = obj.file || false;
            this.fileName = obj.name || false;
            this.url = obj.url || false;
            this.hidden = false;
            this.removable = obj.removable || false;

            (this.file) ? this.loading = true : this.loading = false;
        }catch (e){
            this.errors.push(e);
        }
    }

    render(renderContainer=false){
        var container = renderContainer || this.parentContainer.querySelector('.dropzoneit-preview-container');
        var elem = document.createElement('div');
        elem.classList.add('dropzoneit-preview');

        //Render preview if this.hidden == false
        if (! this.hidden){
            var html = '<div class="dropzoneit-preview-content">';
            if (this.loading){
                html = html + '<div class="dropzoneit-loading-container"><div class="dropzoneit-loading-bar"></div></div>'
            }else{
                html = html + '<a class="dropzoneit-preview-link" href="' + this.url + '" target="_blank">' +
                                '<img class="dropzoneit-preview-image" alt="File preview" src="' + this.url + '" />' +
                            '</a>' +
                            '<div class="dropzoneit-preview-text">';
                if(this.new) html = html +
                                '<p><strong class="dropzoneit-preview-help-text">New</strong></p>' +
                                '<hr>';
                html = html + 
                                '<a href="' + this.url + '"><p class="dropzoneit-preview-filename">' + this.fileName + '</p></a>' +
                            '</div>';
                if (this.removable) html = html + 
                            '<div class="dropzoneit-delete-file" data-delete-id=' + this.id + '><img src="/static/dropzoneit/img/trash.svg"/></div>';
            }
            html = html + '</div>';

            //Render any field errors
            if (this.errors.length > 0 ){
                for (var i=0; i < this.errors.length; i++){
                    let error = this.errors[i];
                    html = html + '<div class="dropzoneit-error">' + error + '</div>';
                }
            }
            elem.innerHTML = html;
        }else{
            elem = false;
        }

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

    // Add listener for deleting files
    addListeners(){
        let deleteButton = this.elem.querySelector('.dropzoneit-delete-file');
        if (deleteButton) deleteButton.addEventListener('click', this.delete.bind(this), false);
    }

    // Add loading bar dom elements to preview
    startLoad(){
        this.loading = true;
        this.render();
    }

    // Update loading bar percentage
    updateLoad(percentage){
        let loadBar = this.elem.querySelector('.dropzoneit-loading-bar');
        
        if (loadBar){
            loadBar.style.width = percentage + '%';
            if (percentage >= 100) loadBar.innerHTML = 'Processing...';
        }
    }

    // Remove loading bar element from preview
    endLoad(){
        this.loading = false;
        this.render();
    }

    // Send this file to the server
    post(){
        this.startLoad();

        var url = '/dropzoneit/post/';
        var xhr = new XMLHttpRequest()
        var formData = new FormData()
        var csrfToken = this.parentContainer.querySelector('[name=csrfmiddlewaretoken]').value;
        
        xhr.open('POST', url, true)

        // Add listener for upload progress
        xhr.upload.addEventListener("progress", function(e){
            let percentage = (e.loaded * 100.0 / e.total) || 100;
            this.updateLoad(percentage);
        }.bind(this));

        // Add listener for change of request ready state
        xhr.addEventListener('readystatechange', function(e) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                //Update props
                //Update props trigger end load
                let obj = JSON.parse(xhr.response).data;
                this.id = obj.id || false;
                this.content_type = obj.content_type || false;
                this.fileName = obj.name || false;
                this.url = obj.url || false;
                this.hidden = false;
                this.removable = obj.removable || false;
                this.endLoad();
            }
            else if (xhr.readyState == 4 && xhr.status != 200) {
                // Render errors
                this.errors.push(xhr.statusText);
                this.render();
            }
        }.bind(this));
        formData.append('file', this.file);
        formData.append('content_type', 2);
        formData.append('object_id', 1);
        xhr.setRequestHeader("X-CSRFToken", csrfToken);
        xhr.send(formData);
    }

    // Retreive a file from server. requires this.id to be set
    load(){
        let url = '/dropzoneit/post/blogs/blog/1/';
        //do something
    }

    // Delete a file from the server
    delete(){
        let id = this.id;
        var url = '/dropzoneit/delete/' + id + '/';
        var xhr = new XMLHttpRequest()

        xhr.open('GET', url, true)

        // Add listener for change of request ready state
        xhr.addEventListener('readystatechange', function(e) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                //Update props
                //Update props trigger end load
                this.hidden = true;
                this.render();
            }
            else if (xhr.readyState == 4 && xhr.status != 200) {
                // Error. Inform the user
                this.errors.push(xhr.statusText);
                this.render();
            }
        }.bind(this));

        xhr.send(null)
    }
}


window.addEventListener("DOMContentLoaded", function(){
    var fields = []
    document.querySelectorAll('.dropzoneit-container').forEach(item => {
        fields.push(new DropZoneIt(item));
    });
});