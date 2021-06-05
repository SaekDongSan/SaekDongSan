
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
                document.querySelector('#current-location').value = newRoadAddr;
                console.log(document.querySelector('#current-location').value)
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

document.getElementById('time').value = new Date().toISOString().slice(0, 10);

function openChild() {
    // window.name = "부모창 이름"; 
    window.name = "parentForm";
    // window.open("open할 window", "자식창 이름", "팝업창 옵션");
    var win = window.open("./newlocation.html", "newLocation", "width=400, height=450");
}
function setChildValue(name) {
    document.querySelector('#current-location').value = name;
    var text = document.querySelector('#current-location').value;
    document.querySelector('#current-location').innerHTML = text;
}
function setLocation(lat, lng) {
    latitude = lat;
    longtitude = lng;
}
