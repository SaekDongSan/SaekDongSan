var latitude;
var longtitude;

$(document).ready(function () {

    if ("geolocation" in navigator) {	/* geolocation 사용 가능 */
        navigator.geolocation.getCurrentPosition(function (data) {

            latitude = data.coords.latitude;
            longitude = data.coords.longitude;

            reverseGeo(longitude, latitude);
            setLocation(longitude, latitude);

        }, function (error) {
            alert(error);
        });
    } else {	/* geolocation 사용 불가능 */
        alert('geolocation 사용 불가능');
    }
});

function reverseGeo(lon, lat) {
    $
        .ajax({
            method: "GET",
            url: "https://apis.openapi.sk.com/tmap/geo/reversegeocoding?version=1&format=json&callback=result",
            async: false,
            data: {
                "appKey": "l7xxdb5dae09f39444cb9c87fd5289236e24",
                "coordType": "WGS84GEO",
                "addressType": "A10",
                "lon": lon,
                "lat": lat
            },
            success: function (response) {
                // 3. json에서 주소 파싱
                var arrResult = response.addressInfo;

                //법정동 마지막 문자 
                var lastLegal = arrResult.legalDong
                    .charAt(arrResult.legalDong.length - 1);

                // 새주소
                newRoadAddr = arrResult.city_do + ' '
                    + arrResult.gu_gun + ' ';

                if (arrResult.eup_myun == ''
                    && (lastLegal == "읍" || lastLegal == "면")) {//읍면
                    newRoadAddr += arrResult.legalDong;
                } else {
                    newRoadAddr += arrResult.eup_myun;
                }
                newRoadAddr += ' ' + arrResult.roadName + ' '
                    + arrResult.buildingIndex;

                // 새주소 법정동& 건물명 체크
                if (arrResult.legalDong != ''
                    && (lastLegal != "읍" && lastLegal != "면")) {//법정동과 읍면이 같은 경우

                    if (arrResult.buildingName != '') {//빌딩명 존재하는 경우
                        newRoadAddr += (' (' + arrResult.legalDong
                            + ', ' + arrResult.buildingName + ') ');
                    } else {
                        newRoadAddr += (' (' + arrResult.legalDong + ')');
                    }
                } else if (arrResult.buildingName != '') {//빌딩명만 존재하는 경우
                    newRoadAddr += (' (' + arrResult.buildingName + ') ');
                }

                $('#current-location').text(newRoadAddr);
            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n"
                    + "message:" + request.responseText + "\n"
                    + "error:" + error);
            }
        });
}

// 포스팅 모달 부분
$(function () {
    //이미지 전체 감쌀곳
    const multipleContainer = document.getElementById("multiple-container");

    // 파일 업로드 된 내용이 변화
    $("#photoInput").on('change', function () {
        while (multipleContainer.firstChild) {
            multipleContainer.removeChild(multipleContainer.firstChild);
        }
        readURL(this);
    });

    function readURL(input) {
        // 인풋 태그에 파일들이 있는 경우
        if (input.files) {
            // 이미지 파일 검사 (생략)
            console.log(input.files);
            if (input.files.length > 5) {
                alert("파일 개수가 초과되었습니다.");
                document.getElementById("photoInput").value = "";
                return;
            }
            // 유사배열을 배열로 변환 (forEach문으로 처리하기 위해)
            const fileArr = Array.from(input.files);

            //파일마다 img태그만들어서 multicontainer에 넣기
            fileArr.forEach((file) => {
                // 파일 읽기
                const reader = new FileReader();
                // 이미지 태그 만들기
                const $img = document.createElement("img");

                //파일을 읽으면 - callback함수
                reader.onload = e => {
                    console.log(file.name);
                    $img.src = e.target.result;
                    $img.arc = file.name;
                    $img.style.width = "40%";
                }

                //container에 넣고, 이미지 로드
                multipleContainer.appendChild($img);
                reader.readAsDataURL(file);
            });
        }
    }
});

function openChild() {
    // window.name = "부모창 이름"; 
    window.name = "parentForm";
    // window.open("open할 window", "자식창 이름", "팝업창 옵션");
    var win = window.open("./newlocation.html", "newLocation", "width=400, height=450");
}
function setChildValue(name) {
    console.log('새로운 위치 정보 저장');
    document.querySelector('#current-location').innerHTML = name;
}
function setLocation(lat, lng) {
    console.log(lng, lat);
    latitude = lat;
    longtitude = lng;
}

var userInfo;
var url = 'http://localhost:3000';
// 로그인 해서 user 정보 얻기 => userInfo에 object 형식으로 저장됨({ID: "108261111142396297688", name: "박서정", email: "dgymjol@gmail.com"})
function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    let userName = profile.getName();
    let userInfo_it = googleUser.getAuthResponse().id_token;
    let userInfo_at = googleUser.getAuthResponse(true).access_token;
    $.post(url + '/login', { it: userInfo_it, at: userInfo_at }, function (data, status) {
        userInfo = data;
        console.log(userInfo);
    })
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        userInfo = undefined;
    });
}

$(document).ready(function () {
    var editForm = $("#review");

    $('#posting_submit').click(function (event) {
        console.log("이제 보낼꺼");
        event.preventDefault();

        var formData = new FormData(editForm[0]);
        var inputfiles = $('input[name="img[]"]');
        var files = inputfiles[0].files;
        formData.append('time', new Date().toLocaleDateString());
        formData.append('id', userInfo.ID.toString());
        formData.append('user', userInfo.name.toString());
        formData.append('latitude', latitude);
        formData.append('longtitude', longtitude);
        formData.delete('img[]');
        formData.append('add_comments', []);
        formData.append('like', 0);
        for (var i = 0; i < files.length; i++) {
            formData.append(i, files[i]);
        }
        formData.append('fileNumber', files.length);

        $.ajax({
            method: "POST",
            contentType: false,
            processData: false,
            data: formData,
            enctype: 'multipart/form-data',
            url: "/upload",
            success: function (data) {
                $('form').each(function () {
                    this.reset();
                });
                const multipleContainer = document.getElementById("multiple-container");
                while (multipleContainer.firstChild) {
                    multipleContainer.removeChild(multipleContainer.firstChild);
                }
                console.log(data);
                // // alert('리뷰가 작성되었습니다');
            },
            error: function (error) {
                alert('ajax error' + error);
            }
        })
    });
});
