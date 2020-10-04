BLOG = {
    initCodeClasses: function(){
        document.querySelectorAll('code').forEach(item => {
            if (item.innerHTML.match(/\|\|\|(.*)\|\|\|/g)){
                match = item.innerHTML.match(/\|\|\|(.*)\|\|\|/g)[0];
                if (match.startsWith('|||') && match.endsWith('|||')){
                    titleJson = JSON.parse(match.slice(3, -3));
                    titleElem = document.createElement("div");
                    titleElem.classList.add("code-title");
                    item.classList.add(titleJson.lang.toLowerCase());
                    if (titleJson.file.length > 0){
                        fileElem = document.createElement("small");
                        fileElem.classList.add("code-file-name");
                        fileElem.innerHTML = titleJson.file;
                        titleElem.append(fileElem)
                    };
                    if (titleJson.lang.length > 0){
                        langElem = document.createElement("small");
                        langElem.classList.add("code-lang");
                        langElem.innerHTML = titleJson.lang;
                        titleElem.append(langElem)
                    };
                    item.parentNode.insertBefore(titleElem, item);
                }else{               
                    console.log('incomplete code title:' + match);
                }
                item.innerHTML = item.innerHTML.slice(match.length + 1)
            }
            if (item.innerHTML.startsWith('$ ')){
                item.classList.add('shell');
            }
        })
    },
}


window.addEventListener("DOMContentLoaded", function(){
    var blog = BLOG;
    blog.initCodeClasses();
});