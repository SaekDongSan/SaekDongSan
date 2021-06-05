var port = 3000;

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    let userName = profile.getName();
    let userInfo_it = googleUser.getAuthResponse().id_token;
    let userInfo_at = googleUser.getAuthResponse(true).access_token;
    var url = 'http://localhost:'+port+'/login';

    $.post(url, {it : userInfo_it, at : userInfo_at}, function(data, status){
        console.log(data);
    })
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
}




