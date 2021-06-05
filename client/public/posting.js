var port = 3000;
var userInfo;

// 로그인 해서 user 정보 얻기 => userInfo에 object 형식으로 저장됨({ID: "108261111142396297688", name: "박서정", email: "dgymjol@gmail.com"})
function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    let userName = profile.getName();
    let userInfo_it = googleUser.getAuthResponse().id_token;
    let userInfo_at = googleUser.getAuthResponse(true).access_token;
    var url = 'http://localhost:'+port+'/login';

    $.post(url, {it : userInfo_it, at : userInfo_at}, function(data, status){
        
        userInfo = data;
        console.log(userInfo);
    })
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
}


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
            console.log("jsonObj "+ jsonObj);
        }, // success

        error: function (xhr, status) {
            alert(xhr + " : " + status);
        }
    }); // $.ajax */    }


}