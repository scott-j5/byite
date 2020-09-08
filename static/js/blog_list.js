BLOGLIST = {
    searchQuery: "",
    init: function(){
        this.searchQuery = {"search":"", "tags": []},
        document.querySelector('input[name="search"]').addEventListener("keyup", this.search);
        document.querySelectorAll('.tag-list').forEach(item => {
            document.querySelectorAll('li').forEach(listItem => {
                listItem.addEventListener("click", BLOGLIST.updateTags);
            });
        });
    },
    search: function(e){
        BLOGLIST.searchQuery.search = e.target.value;
        BLOGLIST.load();
    },
    updateTags: function(e){
        if(! BLOGLIST.searchQuery.tags.includes(e.currentTarget.dataset.identifier)){
            BLOGLIST.searchQuery.tags.push(e.currentTarget.dataset.identifier);
            e.currentTarget.classList.add("active");
        }else{
            BLOGLIST.searchQuery.tags = BLOGLIST.searchQuery.tags.filter(function(f){return f!== e.currentTarget.dataset.identifier});
            e.currentTarget.classList.remove("active");
        }
        if(BLOGLIST.searchQuery.tags.length >= 1){
            e.currentTarget.parentNode.classList.add('tag-list-active');
        }else{
            e.currentTarget.parentNode.classList.remove('tag-list-active');
        }
        BLOGLIST.load();
    },
    load: function(){
        var load = LOAD;
        var args = Object.keys(BLOGLIST.searchQuery).map(function(key) {
            return key + '=' + encodeURIComponent(BLOGLIST.searchQuery[key]);
          }).join('&');
        var url = window.location.protocol + "//" + window.location.host + "/blogs/get/?" + args
        var element = document.querySelector('#blog-card-list');
        load.loadToElement(element, url);
    },
}

$(document).ready(function(){
    var blogList = BLOGLIST;
    blogList.init();
});


