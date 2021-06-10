//선택한 카테고리 포스팅 전부 가져오기 (data 함수에 배열로 포스팅 정보 담겨 있음!!!)

$(document).ready(function () {
    console.log("제제바라랄");

    $("#btn_select").click(function () {
        var selected = $("#selectedcategory option:selected").attr('value');;
        console.log("click " + selected);
        $.post(url + '/category', { category: selected }, function (data, status) {
            console.log(data);
        })
    })
})

// data[i].latitude

// -------지도 관련

// 마커 사이즈
var image_width = 30;
var image_height = 50;

var map;
var markerLayer;
var markerInfo;
var route_marker = [];
//리뷰 마커
var markers = [];
//경로그림정보
var marker;
var marker_s, marker_e, marker_p1, marker_p2, marker_p3;
var totalMarkerArr = [];
var drawInfoArr = [];
var resultdrawArr = [];

var chktraffic = [];
var resultdrawArr = [];
var resultMarkerArr = [];


var lati;
var longi;
var positionofend;
/*var endinglat;
var endinglongi;*/

function getLocation() {
    console.log("start map");
    if (navigator.geolocation) {
        /* 지도 사용 방법! 아래 initTmap 주석 처리 지우고, index.html api script 주석 지우기 */
        navigator.geolocation.getCurrentPosition(initTmap);
    } else {
        loc.innerHTML = "이 문장은 사용자의 웹 브라우저가 Geolocation API를 지원하지 않을 때 나타납니다!";
    }
}

function initTmap(position) {


    console.log(position.coords.latitude + "    " + position.coords.longitude);
    // 1. 지도 띄우기
    map = new Tmapv2.Map("map_div", {
        center: new Tmapv2.LatLng(position.coords.latitude, position.coords.longitude),
        width: "100%",
        height: "700px",
        zoom: 15,
        zoomControl: true,
        scrollwheel: true
    });
    marker_s = new Tmapv2.Marker(
        {
            position: new Tmapv2.LatLng(position.coords.latitude, position.coords.longitude),
            icon: "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_s.png",
            iconSize: new Tmapv2.Size(24, 38),
            map: map
        });
    console.log("기본 마커 추가");
    marker_s.addListener("click", function (evt) {
        console.log("기본 마커 클릭")
        positionofend = marker_s.getPosition();
        console.log("position:" + positionofend)
        real_latitude = positionofend._lat;
        real_longitude = positionofend._lng;
        $("#markerid").trigger("click");


    });


    // 2. 리뷰 마커 찍기

    // 적용하기 눌렀을 때
    // 카테고리 클릭 시
    var selected;
    $("#category_select").click(function () {
        console.log('카테고리 선택');

        selected = $("#selectedcategory option:selected").attr('value');
        console.log('카테고리 값 선언');


        remove_all();

        if (selected != undefined && selected != "") {
            console.log('카테고리가 선택되어 있는 상태이다');
            $.post(url + '/category', { category: selected }, function (data, status) {

                var old_place = new Array(data.length + 1);

                for (var i = 0; i < old_place.length; i++) {
                    old_place[i] = new Array(3);
                }
                console.log(data);

                for (var i = 0; i < data.length; i++) {
                    old_place[i][0] = data[i].latitude;
                    old_place[i][1] = data[i].longtitude;
                    console.log(data);
                    old_place[i][2] = "http://localhost:3000/uploads/" + data[i].image0;
                    console.log(old_place[i][2]);
                    console.log(old_place[i][0]);
                    console.log(old_place[i][1]);

                }

                // 마커 생성
                old_place.forEach(async function (item, i) {
                    marker = new Tmapv2.Marker(
                        {
                            position: new Tmapv2.LatLng(old_place[i][0], old_place[i][1]),
                            icon: old_place[i][2],
                            iconSize: new Tmapv2.Size(image_width, image_height),
                            map: map
                        });
                    let m = await save(resultMarkerArr, marker);
                    m.getElement().setAttribute('class', 'markerimg');
                })

                //애드리스너 추가
                for (let i = 0; i < resultMarkerArr.length; i++) {
                    resultMarkerArr[i].addListener('click', function (evt) {
                        console.log('resultMarkerArr', resultMarkerArr);
                        console.log("marker 클릭");
                        positionofend = resultMarkerArr[i].getPosition();
                        console.log("position:" + positionofend)
                        real_latitude = positionofend._lat;
                        real_longitude = positionofend._lng;
                        $("#markerid").trigger("click");
                    });
                }
            });
        }
    });

    //산책 코스 클릭 시 
    $("#want_select").click(function () {

        console.log('산책 코스 버튼 누름');
        selected = $("#selectedcategory option:selected").attr('value');

        if (resultMarkerArr.length > 0) {
            for (var i in resultMarkerArr) {
                resultMarkerArr[i]
                    .setMap(null);
            }
            resultMarkerArr = [];
            if (resultdrawArr.length > 0) {
                for (var i in resultdrawArr) {
                    resultdrawArr[i]
                        .setMap(null);
                }
                resultdrawArr = [];
            }

        }

        // 임의로 장소 배열

        var old_place = new Array(5);

        for (var i = 0; i < old_place.length; i++) {
            old_place[i] = new Array(3);
        }
        console.log('장소 배열 이상 무');


        if (selected != undefined && selected != "") {
            console.log('카테고리가 선택되어 있는 상태이다');
            $.post(url + '/category', { category: selected }, function (data, status) {
                console.log(data);

                var likes_order = Array.prototype.slice.call(data);
                console.log(likes_order);

                likes_order.sort(function (a, b) {
                    if (a.likes > b.likes) {
                        return -1;
                    } else return 1;
                })
                console.log('소트 후 likes_order', likes_order);

                var can_use = [];

                var nono = false;
                for (var i = 0; i < likes_order.length; i++) {
                    for (var j = 0; j < likes_order.length; j++) {
                        if (likes_order[i].latitude == likes_order[j].latitude &&
                            likes_order[i].longtitude == likes_order[j].longtitude &&
                            i != j) {

                            console.log('같은 장소 발견, 제외해야지');
                            nono = true;
                            break;
                        }
                        console.log('if문 이후');
                    }
                    if (!nono) {
                        can_use.push(likes_order[i]);
                        console.log(can_use);
                        nono = false;
                    }
                }


                for (var i = 0; i < 5; i++) {
                    old_place[i][0] = likes_order[i].latitude;
                    old_place[i][1] = likes_order[i].longtitude;
                    old_place[i][2] = "http://localhost:3000/uploads/" + likes_order[i].image0;
                    console.log(String(i), '번째');
                    console.log(old_place[i][0]);
                    console.log(old_place[i][1]);
                    console.log(old_place[i][2]);

                }

                // 장소 배열 정렬
                old_place.sort(function (a, b) {
                    if (a[1] > b[1]) {
                        return -1;
                    } else return 1;
                })

                var place = [];

                place.push(old_place[0]);

                var push;
                var isPush = false;
                var distance = 0;
                var next = old_place[0];
                for (var i = 1; i < old_place.length; i++) {


                    for (var j = 1; j < old_place.length; j++) {
                        // 지금 비교하려는 위치가 새 배열 place에 없을 때
                        if (place.includes(old_place[j]) == false) {

                            // 직선거리 구하기
                            var dis_0 = old_place[j][0] - next[0];
                            var dis_1 = old_place[j][1] - next[1];
                            var new_distance = Math.sqrt(Math.abs(dis_0 * dis_0) + Math.abs(dis_1 * dis_1));

                            // 새로 시작하거나 직선거리가 기존 거리보다 더 작을 때
                            if ((distance == 0) || (new_distance < distance)) {
                                distance = new_distance;
                                push = old_place[j];
                                isPush = true;
                            }
                        }
                    }

                    // push를 place에 넣어주자
                    if (isPush && (place.includes(push) == false)) { place.push(push); }
                    else if (i == 5) { place.push(old_place[j]); }
                    distance = 0;
                    isPush = false;
                    next = push
                }

                for (var i = 0; i < place.length; i++) {
                    console.log(place[i][0]);
                    console.log(place[i][1]);
                    console.log(place[i][2]);
                }

                // 2. 시작, 도착 심볼찍기
                // 시작하기 전 초기화

                // 시작
                place.forEach(async function (item, i) {
                    marker = new Tmapv2.Marker(
                        {
                            position: new Tmapv2.LatLng(place[i][0], place[i][1]),
                            icon: place[i][2],
                            iconSize: new Tmapv2.Size(image_width, image_height),
                            map: map
                        });
                    let m = await save(resultMarkerArr, marker);
                    m.getElement().setAttribute('class', 'markerimg');
                })

                for (let i = 0; i < resultMarkerArr.length; i++) {
                    resultMarkerArr[i].addListener('click', function (evt) {
                        console.log('resultMarkerArr', resultMarkerArr);
                        console.log("marker 클릭");
                        positionofend = resultMarkerArr[i].getPosition();
                        console.log("position:" + positionofend)
                        real_latitude = positionofend._lat;
                        real_longitude = positionofend._lng;
                        $("#markerid").trigger("click");
                    });
                }
                // 중심좌표로 지도 이동..
                /*
                var lat = (place[4][0] + place[0][0])/2;
                var lon = (place[4][1] + place[0][1])/2;
                tMapView.setCenterPoint(lon, lat);
                */

                var routeLayer;
                // 최단~~ 적용 클릭 시 
                $("#course_select").click(function () {


                    var searchOption = $("#selectLevel").val();

                    $.ajax({
                        method: "POST",
                        url: "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json&callback=result",
                        async: false,
                        data: {

                            "appKey": "l7xxdb5dae09f39444cb9c87fd5289236e24",
                            "startX": String(place[0][1]),
                            "startY": String(place[0][0]),
                            "endX": String(place[4][1]),
                            "endY": String(place[4][0]),

                            // 경유지
                            "passList":
                                String(place[1][1]) + "," + String(place[1][0])
                                + "_" + String(place[2][1]) + "," + String(place[2][0])
                                + "_" + String(place[3][1]) + "," + String(place[3][0]),

                            "reqCoordType": "WGS84GEO",
                            "resCoordType": "EPSG3857",

                            "startName": "출발지",
                            "endName": "도착지",
                            "searchOption": searchOption

                        },
                        success: function (response) {
                            var resultData = response.features;

                            //결과 출력
                            var tDistance = "총 거리 : "
                                + ((resultData[0].properties.totalDistance) / 1000)
                                    .toFixed(1) + "km,";
                            var tTime = " 총 시간 : "
                                + ((resultData[0].properties.totalTime) / 60)
                                    .toFixed(0) + "분";

                            $("#result").text(tDistance + tTime);

                            //기존 그려진 라인 & 마커가 있다면 초기화
                            if (resultdrawArr.length > 0) {
                                for (var i in resultdrawArr) {
                                    resultdrawArr[i]
                                        .setMap(null);
                                }
                                resultdrawArr = [];
                            }

                            drawInfoArr = [];

                            for (var i in resultData) { //for문 [S]
                                var geometry = resultData[i].geometry;
                                var properties = resultData[i].properties;
                                var polyline_;


                                if (geometry.type == "LineString") {
                                    for (var j in geometry.coordinates) {
                                        // 경로들의 결과값(구간)들을 포인트 객체로 변환 
                                        var latlng = new Tmapv2.Point(
                                            geometry.coordinates[j][0],
                                            geometry.coordinates[j][1]);
                                        // 포인트 객체를 받아 좌표값으로 변환
                                        var convertPoint = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(
                                            latlng);
                                        // 포인트객체의 정보로 좌표값 변환 객체로 저장
                                        var convertChange = new Tmapv2.LatLng(
                                            convertPoint._lat,
                                            convertPoint._lng);
                                        // 배열에 담기
                                        drawInfoArr.push(convertChange);
                                    }
                                } else {
                                    var markerImg = "";
                                    var pType = "";
                                    var size = "";

                                    if (properties.pointType == "S") { //출발지 마커
                                        markerImg = "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_s.png";
                                        pType = "S";
                                        size = new Tmapv2.Size(24, 38);
                                    } else if (properties.pointType == "E") { //도착지 마커
                                        markerImg = "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png";
                                        pType = "E";
                                        size = new Tmapv2.Size(24, 38);
                                    } else if (properties.pointType == "P") { //경유지 마커
                                        markerImg = "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_p.png";
                                        pType = "P";
                                        size = new Tmapv2.Size(24, 38);
                                    } else { //각 포인트 마커
                                        markerImg = "http://topopen.tmap.co.kr/imgs/point.png";
                                        pType = "P";
                                        size = new Tmapv2.Size(8, 8);
                                    }

                                    // 경로들의 결과값들을 포인트 객체로 변환 
                                    var latlon = new Tmapv2.Point(
                                        geometry.coordinates[0],
                                        geometry.coordinates[1]);

                                    // 포인트 객체를 받아 좌표값으로 다시 변환
                                    var convertPoint = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(
                                        latlon);

                                    var routeInfoObj = {
                                        markerImage: markerImg,
                                        lng: convertPoint._lng,
                                        lat: convertPoint._lat,
                                        pointType: pType

                                    };


                                }
                            }//for문 [E]
                            drawLine(drawInfoArr);
                        },
                        error: function (request, status, error) {
                            console.log("code:" + request.status + "\n"
                                + "message:" + request.responseText + "\n"
                                + "error:" + error);
                        }
                    });


                });

                function addComma(num) {
                    var regexp = /\B(?=(\d{3})+(?!\d))/g;
                    return num.toString().replace(regexp, ',');
                }

                function drawLine(arrPoint) {
                    var polyline_;

                    polyline_ = new Tmapv2.Polyline({
                        path: arrPoint,
                        strokeColor: "#DD0000",
                        strokeWeight: 6,
                        map: map
                    });
                    resultdrawArr.push(polyline_);
                }
            });
        }
    });



    // 선택한 곳으로 길찾기

    var startingpoint_lat;
    var startingpoint_lon;

    $("#getpathfromnew").click(function () {
        //새로 위치 클릭하면 거기서부터 길 출력
        console.log("새로운 위치 길 출력~!")
        alert("지도 위에 새로운 시작점을 선택하세요!");

        marker1 = new Tmapv2.Marker({
            icon: "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_a.png",
            iconSize: new Tmapv2.Size(24, 38),
            map: map
        });

        map
            .addListener(
                "click",
                function onClick(evt) {
                    var mapLatLng = evt.latLng;

                    //기존 마커 삭제
                    if (resultMarkerArr.length > 0) {
                        for (var i in resultMarkerArr) {
                            resultMarkerArr[i]
                                .setMap(null);

                        }
                        resultMarkerArr = [];

                    }
                    console.log("삭제함")

                    var markerPosition = new Tmapv2.LatLng(
                        mapLatLng._lat, mapLatLng._lng);
                    //마커 올리기
                    marker1 = new Tmapv2.Marker(
                        {
                            position: markerPosition,
                            icon: "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_a.png",
                            iconSize: new Tmapv2.Size(24, 38),
                            map: map
                        });
                    resultMarkerArr.push(marker1);
                    console.log("엔딩 마커 찍음!")

                    startingpoint_lat = mapLatLng._lat;
                    startingpoint_lon = mapLatLng._lng;

                    marker_e = new Tmapv2.Marker(
                        {
                            position: new Tmapv2.LatLng(positionofend._lat, positionofend._lng),
                            icon: "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png",
                            iconSize: new Tmapv2.Size(24, 38),
                            map: map
                        });
                    resultMarkerArr.push(marker_e);
                    console.log("엔딩 마커 찍음!")

                    $
                        .ajax({
                            method: "POST",
                            url: "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json&callback=result",
                            async: false,
                            data: {
                                "appKey": "l7xxdb5dae09f39444cb9c87fd5289236e24",
                                "startX": startingpoint_lon,
                                "startY": startingpoint_lat,
                                "endX": positionofend._lng,
                                "endY": positionofend._lat,
                                "reqCoordType": "WGS84GEO",
                                "resCoordType": "EPSG3857",
                                "startName": "출발지",
                                "endName": "도착지"
                            },
                            success: function (response) {
                                var resultData = response.features;

                                //결과 출력
                                var tDistance = "총 거리 : "
                                    + ((resultData[0].properties.totalDistance) / 1000)
                                        .toFixed(1) + "km,";
                                var tTime = " 총 시간 : "
                                    + ((resultData[0].properties.totalTime) / 60)
                                        .toFixed(0) + "분";

                                $("#result").text(tDistance + tTime);

                                //기존 그려진 라인 & 마커가 있다면 초기화
                                if (resultdrawArr.length > 0) {
                                    for (var i in resultdrawArr) {
                                        resultdrawArr[i]
                                            .setMap(null);
                                    }
                                    resultdrawArr = [];
                                }

                                drawInfoArr = [];

                                for (var i in resultData) { //for문 [S]
                                    var geometry = resultData[i].geometry;
                                    var properties = resultData[i].properties;
                                    var polyline_;


                                    if (geometry.type == "LineString") {
                                        for (var j in geometry.coordinates) {
                                            // 경로들의 결과값(구간)들을 포인트 객체로 변환 
                                            var latlng = new Tmapv2.Point(
                                                geometry.coordinates[j][0],
                                                geometry.coordinates[j][1]);
                                            // 포인트 객체를 받아 좌표값으로 변환
                                            var convertPoint = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(
                                                latlng);
                                            // 포인트객체의 정보로 좌표값 변환 객체로 저장
                                            var convertChange = new Tmapv2.LatLng(
                                                convertPoint._lat,
                                                convertPoint._lng);
                                            // 배열에 담기
                                            drawInfoArr.push(convertChange);
                                        }
                                    } else {
                                        var markerImg = "";
                                        var pType = "";
                                        var size;

                                        if (properties.pointType == "S") { //출발지 마커
                                            markerImg = "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_s.png";
                                            pType = "S";
                                            size = new Tmapv2.Size(24, 38);
                                        } else if (properties.pointType == "E") { //도착지 마커
                                            markerImg = "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png";
                                            pType = "E";
                                            size = new Tmapv2.Size(24, 38);
                                        } else { //각 포인트 마커
                                            markerImg = "http://topopen.tmap.co.kr/imgs/point.png";
                                            pType = "P";
                                            size = new Tmapv2.Size(8, 8);
                                        }

                                        // 경로들의 결과값들을 포인트 객체로 변환 
                                        var latlon = new Tmapv2.Point(
                                            geometry.coordinates[0],
                                            geometry.coordinates[1]);

                                        // 포인트 객체를 받아 좌표값으로 다시 변환
                                        var convertPoint = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(
                                            latlon);

                                        var routeInfoObj = {
                                            markerImage: markerImg,
                                            lng: convertPoint._lng,
                                            lat: convertPoint._lat,
                                            pointType: pType
                                        };


                                    }
                                }//for문 [E]
                                drawLine(drawInfoArr);
                            },
                            error: function (request, status, error) {
                                console.log("code:" + request.status + "\n"
                                    + "message:" + request.responseText + "\n"
                                    + "error:" + error);
                            }
                        });
                    function addComma(num) {
                        var regexp = /\B(?=(\d{3})+(?!\d))/g;
                        return num.toString().replace(regexp, ',');
                    }

                    function drawLine(arrPoint) {
                        var polyline_;

                        polyline_ = new Tmapv2.Polyline({
                            path: arrPoint,
                            strokeColor: "#DD0000",
                            strokeWeight: 6,
                            map: map
                        });
                        resultdrawArr.push(polyline_);
                    }
                }
            );
    })
    $("#getpathfromcurr").click(function () {
        console.log("그냥 바로 길 출력~!")

        if (resultMarkerArr.length > 0) {
            for (var i in resultMarkerArr) {
                resultMarkerArr[i]
                    .setMap(null);

            }
            resultMarkerArr = [];

        }
        console.log("삭제함")

        marker_s = new Tmapv2.Marker(
            {
                //position : new Tmapv2.LatLng(lati, longi),
                position: new Tmapv2.LatLng(position.coords.latitude, position.coords.longitude),
                icon: "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_s.png",
                iconSize: new Tmapv2.Size(24, 38),
                map: map
            });
        resultMarkerArr.push(marker_s);
        console.log("시작 마커는 만듦")

        // 도착

        if (resultMarkerArr.length > 0) {
            for (var i in resultMarkerArr) {
                resultMarkerArr[i]
                    .setMap(null);
            }
            resultMarkerArr = [];

        }

        marker_e = new Tmapv2.Marker(
            {
                position: new Tmapv2.LatLng(positionofend._lat, positionofend._lng),
                icon: "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png",
                iconSize: new Tmapv2.Size(24, 38),
                map: map
            });
        resultMarkerArr.push(marker_e);
        console.log("엔딩 마커도!")


        console.log(marker_e.getPosition())
        console.log(positionofend)

        $
            .ajax({
                method: "POST",
                url: "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json&callback=result",
                async: false,
                data: {
                    "appKey": "l7xxdb5dae09f39444cb9c87fd5289236e24",
                    "startX": longitude,
                    "startY": latitude,
                    "endX": positionofend._lng,
                    "endY": positionofend._lat,
                    "reqCoordType": "WGS84GEO",
                    "resCoordType": "EPSG3857",
                    "startName": "출발지",
                    "endName": "도착지"
                },
                success: function (response) {
                    var resultData = response.features;

                    //결과 출력
                    var tDistance = "총 거리 : "
                        + ((resultData[0].properties.totalDistance) / 1000)
                            .toFixed(1) + "km,";
                    var tTime = " 총 시간 : "
                        + ((resultData[0].properties.totalTime) / 60)
                            .toFixed(0) + "분";

                    $("#result").text(tDistance + tTime);

                    //기존 그려진 라인 & 마커가 있다면 초기화
                    if (resultdrawArr.length > 0) {
                        for (var i in resultdrawArr) {
                            resultdrawArr[i]
                                .setMap(null);
                        }
                        resultdrawArr = [];
                    }

                    drawInfoArr = [];

                    for (var i in resultData) { //for문 [S]
                        var geometry = resultData[i].geometry;
                        var properties = resultData[i].properties;
                        var polyline_;


                        if (geometry.type == "LineString") {
                            for (var j in geometry.coordinates) {
                                // 경로들의 결과값(구간)들을 포인트 객체로 변환 
                                var latlng = new Tmapv2.Point(
                                    geometry.coordinates[j][0],
                                    geometry.coordinates[j][1]);
                                // 포인트 객체를 받아 좌표값으로 변환
                                var convertPoint = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(
                                    latlng);
                                // 포인트객체의 정보로 좌표값 변환 객체로 저장
                                var convertChange = new Tmapv2.LatLng(
                                    convertPoint._lat,
                                    convertPoint._lng);
                                // 배열에 담기
                                drawInfoArr.push(convertChange);
                            }
                        } else {
                            var markerImg = "";
                            var pType = "";
                            var size;

                            if (properties.pointType == "S") { //출발지 마커
                                markerImg = "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_s.png";
                                pType = "S";
                                size = new Tmapv2.Size(24, 38);
                            } else if (properties.pointType == "E") { //도착지 마커
                                markerImg = "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png";
                                pType = "E";
                                size = new Tmapv2.Size(24, 38);
                            } else { //각 포인트 마커
                                markerImg = "http://topopen.tmap.co.kr/imgs/point.png";
                                pType = "P";
                                size = new Tmapv2.Size(8, 8);
                            }

                            // 경로들의 결과값들을 포인트 객체로 변환 
                            var latlon = new Tmapv2.Point(
                                geometry.coordinates[0],
                                geometry.coordinates[1]);

                            // 포인트 객체를 받아 좌표값으로 다시 변환
                            var convertPoint = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(
                                latlon);

                            var routeInfoObj = {
                                markerImage: markerImg,
                                lng: convertPoint._lng,
                                lat: convertPoint._lat,
                                pointType: pType
                            };


                        }
                    }//for문 [E]
                    drawLine(drawInfoArr);
                },
                error: function (request, status, error) {
                    console.log("code:" + request.status + "\n"
                        + "message:" + request.responseText + "\n"
                        + "error:" + error);
                }
            });
        function addComma(num) {
            var regexp = /\B(?=(\d{3})+(?!\d))/g;
            return num.toString().replace(regexp, ',');
        }

        function drawLine(arrPoint) {
            var polyline_;

            polyline_ = new Tmapv2.Polyline({
                path: arrPoint,
                strokeColor: "#DD0000",
                strokeWeight: 6,
                map: map
            });
            resultdrawArr.push(polyline_);
        }
    })
}



function remove_all() {
    for (var i = 0; i < resultMarkerArr.length; i++) {
        resultMarkerArr[i].setMap(null);
    }
    resultMarkerArr = [];
    for (var i = 0; i < resultdrawArr.length; i++) {
        resultdrawArr[i].setMap(null);
    }
    resultdrawArr = [];

}

// 혹시나 하고 만들었음 -> 아직 사용x
function show_markers() {
    $.post(url + '/category', { category: All }, function (data, status) {

        var old_place = new Array(data.length + 1);

        for (var i = 0; i < old_place.length; i++) {
            old_place[i] = new Array(3);
        }
        console.log(data);

        for (var i = 0; i < data.length; i++) {
            old_place[i][0] = data[i].latitude;
            old_place[i][1] = data[i].longtitude;
            console.log(data);
            old_place[i][2] = "http://localhost:3000/uploads/" + data[i].image0;
            console.log(old_place[i][2]);
            console.log(old_place[i][0]);
            console.log(old_place[i][1]);

        }

        // 마커 생성
        old_place.forEach(async function (item, i) {
            marker = new Tmapv2.Marker(
                {
                    position: new Tmapv2.LatLng(old_place[i][0], old_place[i][1]),
                    icon: old_place[i][2],
                    iconSize: new Tmapv2.Size(image_width, image_height),
                    map: map
                });
            let m = await save(resultMarkerArr, marker);
            m.getElement().setAttribute('class', 'markerimg');
        })

        function save(resultMarkerArr, marker) {
            resultMarkerArr.push(marker);
            return marker;
        }


        //애드리스너 추가

        for (let i = 0; i < resultMarkerArr.length; i++) {
            resultMarkerArr[i].addListener('click', function (evt) {
                console.log('resultMarkerArr', resultMarkerArr);
                console.log("marker 클릭");
                positionofend = resultMarkerArr[i].getPosition();
                console.log("position:" + positionofend)
                real_latitude = positionofend._lat;
                real_longitude = positionofend._lng;
                $("#markerid").trigger("click");
            });
        }
    });
}

function save(resultMarkerArr, marker) {
    resultMarkerArr.push(marker);
    return marker;
}