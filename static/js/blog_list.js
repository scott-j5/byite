BLOGLIST = {
    searchQuery: "",
    init: function(selector = null){
        BLOGLIST.getQuery();
        document.querySelector('input[name="search"]').addEventListener("keyup", BLOGLIST.searchDelay(function(e){BLOGLIST.search(e)}, 500));
        document.querySelectorAll('.tag-list').forEach(item => {
            item.querySelectorAll('li').forEach(listItem => {
                listItem.addEventListener("click", BLOGLIST.updateTags);
            });
        });
    },
    getQuery: function(){
        params = new URLSearchParams(window.location.search);
        if(Array.from(params).length >= 1 ){
            tags = []
            params.get('tags').split(',').forEach(tag =>{
                if(tag.length >= 1 && !isNaN(tag)){
                    tags.push(tag);
                }
            });
            this.searchQuery = {"search":(params.get('search') || ""), "tags": tags};
        }else{
            this.searchQuery = {"search":"", "tags": []}
        }
        this.load();
        this.renderSearch();
        this.renderTags();
    },
    search: function(e){
        BLOGLIST.searchQuery.search = e.target.value;
        BLOGLIST.load(true);
    },
    renderSearch: function(){
        document.querySelector('input[name="search"]').value = BLOGLIST.searchQuery.search;
    },
    searchDelay: function(callback, ms){
        var timer = 0;
        return function() {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                callback.apply(context, args);
            }, ms || 0);
        };
    },
    updateTags: function(e){
        //If clicked tag is not in list, add it and add its css flag. else deactivate it
        if(! BLOGLIST.searchQuery.tags.includes(e.currentTarget.dataset.identifier)){
            BLOGLIST.searchQuery.tags.push(e.currentTarget.dataset.identifier);
        }else{
            BLOGLIST.searchQuery.tags = BLOGLIST.searchQuery.tags.filter(function(f){ return f !== e.currentTarget.dataset.identifier});
        }
        BLOGLIST.renderTags();
        BLOGLIST.load(true);
    },
    renderTags: function(){
        //If there is active tags add active flag to ul element
        if(BLOGLIST.searchQuery.tags.length >= 1){
            document.querySelectorAll('.tag-list').forEach(item => {
                item.classList.add('tag-list-active');
            });
        }else{
            document.querySelectorAll('.tag-list').forEach(item => {
                item.classList.remove('tag-list-active');
            });
        }
        document.querySelectorAll('.tag-list li').forEach(item => {
            if(BLOGLIST.searchQuery.tags.includes(item.dataset.identifier)){
                item.classList.add("active");
            }else{
                item.classList.remove("active");
            }
        });
    },
    load: function(pushState=null){
        var load = LOAD;
        var args = Object.keys(BLOGLIST.searchQuery).map(function(key) {
            return key + '=' + encodeURIComponent(BLOGLIST.searchQuery[key]);
          }).join('&');
        if(pushState){
            history.pushState(null, "", "?" + args)
        }
        var url = window.location.protocol + "//" + window.location.host + "/blogs/get/?" + args
        var element = document.querySelector('#blog-card-list');
        load.loadToElement(element, url);
    },
}

$(document).ready(function(){
    var blogList = BLOGLIST;
    blogList.init();

    window.onpopstate = function(e){
        blogList.getQuery();
    };
});


