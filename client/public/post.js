var url1 = "http://localhost:3000/uploads/";

$(document).ready(function(){
    console.log("제제바라랄");
    var selected = 'night';
    $.post('/night',{category:selected}, function (data, status) {
        console.log(data.length);
        var html = '';
        for(var j =0; j<data.length; j++){
            for(var i =0; i< data[j].filenumber; i++){
                var img = url1+ data[j][`image${i}`];
                // console.log(img);
                html += `<img src="${img}" width="100" height="200">`;
            }
        }
        document.getElementById("imagetestimg").innerHTML = html;
    }) 
})
