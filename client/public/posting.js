
//recommend 여부
$('.recommend').on('click', (e) => {
    console.log(e.target.value);
});

function send() {

    var form = $("review")[0];
    var formData = new FormData(form);

    $.ajax({
        cache: false,
        url: "${pageContext.request.contextPath}/upload", // 요기에
        processData: false,
        contentType: false,
        type: 'POST',
        data: formData,
        success: function (data) {
            var jsonObj = JSON.parse(data);
        }, // success

        error: function (xhr, status) {
            alert(xhr + " : " + status);
        }
    }); // $.ajax */    }


}