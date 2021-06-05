var url = "http://localhost:3000";
// https://elena90.tistory.com/entry/Java-Script-%EC%9E%85%EB%A0%A5%EA%B0%92-%EB%B0%9B%EC%95%84%EC%99%80-get%EB%B0%A9%EC%8B%9D-URL-%ED%8C%8C%EB%9D%BC%EB%AF%B8%ED%84%B0%EB%A1%9C-%EB%84%98%EA%B2%A8%EC%A3%BC%EA%B8%B0
$(document).ready(function(){
    // document.getElementById("nav_category").click(function(){

    //     var category = $('input[name=printDayStart]').val();
    //     getCategoryPath(category);
    // })

    category = 'hip';
    getCategoryPath(category);
})
function getCategoryPath(selected){
    
    $.post(url + '/category',{category:selected}, function (data, status) {
        console.log(data);
    })
}
