BLOG = {
    initCodeClasses: function(){
        document.querySelectorAll('code').forEach(item => {
            titleElem = document.createElement("div");
            titleElem.classList.add("code-title");
            
            let lang = [...item.parentNode.classList].filter(item => item.indexOf("language-") >= 0)[0];
            if (lang.length > 0){
                langElem = document.createElement("small");
                langElem.classList.add("code-lang");
                langElem.innerHTML = lang.slice(lang.indexOf("-") + 1, lang.length);
                titleElem.append(langElem)
            };
            
            if (item.innerHTML.match(/\|\|\|(.*)\|\|\|/g)){
                match = item.innerHTML.match(/\|\|\|(.*)\|\|\|/g)[0];
                if (match.startsWith('|||') && match.endsWith('|||')){
                    titleJson = JSON.parse(match.slice(3, -3));
                    
                    if (titleJson.file.length > 0){
                        fileElem = document.createElement("small");
                        fileElem.classList.add("code-file-name");
                        fileElem.innerHTML = titleJson.file;
                        titleElem.prepend(fileElem)
                    };
                }else{               
                    console.log('incomplete code title:' + match);
                }
                item.innerHTML = item.innerHTML.slice(match.length + 1)
            }
            item.parentNode.insertBefore(titleElem, item);
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