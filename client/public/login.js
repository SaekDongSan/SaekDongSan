var port = 3000;

function onSignIn(googleUser) {
    // var profile = googleUser.getBasicProfile();
    // let userName = profile.getName();
    // let userInfo_it = googleUser.getAuthResponse().id_token;
    // let userInfo_at = googleUser.getAuthResponse(true).access_token;
    // console.log(userName + " "+userInfo_it)
    // var xhr = new XMLHttpRequest();
    // xhr.open('POST', 'http://localhost:'+port+'/login');
    // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    // xhr.onreadystatechange = function () {
    //     if (xhr.readyState === xhr.DONE) {
    //         if (xhr.status === 200 || xhr.status === 201) {
    //             let payload = JSON.parse(xhr.responseText);
    //             window.location.href = './next.html';
    //             localStorage.setItem('token', payload.token);
    //             localStorage.setItem('name', userName)
    //         } else {
    //             console.error(xhr.responseText);
    //         }
    //     }
    // };
    // var reqbody = "idToken : "+ userInfo_it;
    // console.log(typeof(reqbody));
    // xhr.send("idToken : ");
}
function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
}




var xhr = new XMLHttpRequest();
xhr.open('POST', 'http://localhost:'+port+'/login');
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
xhr.onreadystatechange = function() {
    if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200 || xhr.status === 201) {
            console.log(xhr.responseText);
        } else {
            console.error(xhr.responseText);
        }
    }
};
var a = "dfd";
xhr.send(a);
