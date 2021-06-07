//선택한 카테고리 포스팅 전부 가져오기 (data 함수에 배열로 포스팅 정보 담겨 있음!!!)

$(document).ready(function(){
    console.log("제제바라랄");
    
    $("#btn_select").click(function(){
        var selected = $("#selectedcategory option:selected").attr('value');;
        console.log("click "+ selected);
        $.post(url + '/category',{category:selected}, function (data, status) {
            console.log(data);
        }) 
    })
})

// data[i].latitude

// -------지도 관련

// 마커 사이즈
var image_width = 50;
var image_height = 80;

var map;
var markerLayer;
var markerInfo;
//리뷰 마커
var markers = [];
//경로그림정보
var marker_s, marker_e, marker_p1, marker_p2, marker_p3;
var totalMarkerArr = [];
var drawInfoArr = [];
var resultdrawArr = [];

var chktraffic = [];
var resultdrawArr = [];
var resultMarkerArr = [];
var resultMarkerArr_2 = [];

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
    resultMarkerArr.push(marker_s);
    console.log("기본 마커 추가");
    marker_s.addListener("click", function (evt){
        console.log("기본 마커 클릭")
        positionofend = marker_s.getPosition();
        console.log("position:"+positionofend)
        real_latitude = positionofend._lat;
        real_longitude = positionofend._lng;
        alert("리뷰보기 : 선택한 위치의 리뷰 보기 클릭")
    });

    // 2. 리뷰 마커 찍기

    // 산책 코스 안내
    // 카테고리 클릭 시
    var selected;
    $("#category_select").click(function(){
        console.log('카테고리 선택');

        selected = $("#selectedcategory option:selected").attr('value');
        console.log('카테고리 값 선언');

        
        if (resultMarkerArr.length > 0) {
            for ( var i in resultMarkerArr) {
                resultMarkerArr[i]
                        .setMap(null);
            }
            resultMarkerArr = []; 
            if (resultdrawArr.length > 0){
                for ( var i in resultdrawArr) {
                    resultdrawArr[i]
                            .setMap(null);
                }
                resultdrawArr = []; 
            } 
        }
        
    });
    //산책 코스 클릭 시 
    $("#want_select").click(function(){
        
        console.log('산책 코스 버튼 누름');
        selected = $("#selectedcategory option:selected").attr('value');

        if (resultMarkerArr.length > 0) {
            for ( var i in resultMarkerArr) {
                resultMarkerArr[i]
                        .setMap(null);
            }
            resultMarkerArr = []; 
            if (resultdrawArr.length > 0){
                for ( var i in resultdrawArr) {
                    resultdrawArr[i]
                            .setMap(null);
                }
                resultdrawArr = []; 
            }  
                               
        }

        // 임의로 장소 배열
        
        var old_place = new Array(5);

        for (var i = 0; i < old_place.length; i++) {
            old_place[i] = new Array(2);
        }
        console.log('장소 배열 이상 무');   
        
        var images = [];

        if (selected != undefined && selected != ""){            
            console.log('카테고리가 선택되어 있는 상태이다');
            $.post(url + '/category',{category:selected}, function (data, status) {
                console.log(data);
                
                for (var i = 0; i < 5; i++){
                    old_place[i][0] = Math.round(data[i].latitude * 1e8) / 1e8;
                    old_place[i][1] = Math.round(data[i].longtitude * 1e8) / 1e8;
                    console.log(data);
                    images[i] = "http://localhost:3000/uploads/" + data[i].image0;
                    console.log(images[i])
                    console.log(old_place[i][0]);
                    console.log(old_place[i][1]);

                }

                // 장소 배열 정렬
                old_place.sort(function(a, b){
                    if (a[1] > b[1]) {
                    return 1;
                    } else return -1;
                })
                
                var place = [];
                
                place.push(old_place[0]);
                
                var push;
                var isPush = false;
                var distance = 0;
                var next = old_place[0];
                for(var i=1; i<old_place.length; i++){
                    
                    
                    for(var j=1; j<old_place.length; j++){
                        // 지금 비교하려는 위치가 새 배열 place에 없을 때
                        if (place.includes(old_place[j]) == false){

                            // 직선거리 구하기
                            var dis_0 = old_place[j][0] - next[0];
                            var dis_1 = old_place[j][1] - next[1];
                            var new_distance = Math.sqrt(Math.abs(dis_0*dis_0) + Math.abs(dis_1*dis_1));

                            // 새로 시작하거나 직선거리가 기존 거리보다 더 작을 때
                            if ((distance == 0) || (new_distance < distance)) {
                                distance = new_distance;
                                push = old_place[j];
                                isPush = true;
                            }
                        }
                    }
                    
                    // push를 place에 넣어주자
                    if (isPush && (place.includes(push) == false)) {place.push(push);}
                    else if (i==5) {place.push(old_place[j]);}
                    distance = 0;
                    isPush = false;
                    next = push                              
                }

                for (var i=0; i<old_place.length; i++){
                    console.log(old_place[i][0]);
                    console.log(old_place[i][1]);
                }

                
                var l = old_place[0][0];
                
                // 2. 시작, 도착 심볼찍기
                // 시작하기 전 초기화
                
                // 시작
                marker_s = new Tmapv2.Marker(
                        {
                            position : new Tmapv2.LatLng(old_place[0][0],old_place[0][1]),
                            icon : images[0],
                            iconSize : new Tmapv2.Size(image_width, image_height),
                            map : map
                        });
                resultMarkerArr.push(marker_s);
                marker_s.addListener("click", function (evt){
                    console.log("marker_s 클릭")
                    positionofend = marker_s.getPosition();
                    console.log("position:"+positionofend)
                    real_latitude = positionofend._lat;
                    real_longitude = positionofend._lng;
                    alert("리뷰보기 : 선택한 위치의 리뷰 보기 클릭, 바로 길 찾기 : 선택한 곳으로 길찾기 클릭")
                });

                // 도착
                marker_e = new Tmapv2.Marker(
                        {
                            position : new Tmapv2.LatLng(place[4][0], place[4][1]),
                            icon : images[4],
                            iconSize : new Tmapv2.Size(image_width, image_height),
                            map : map
                        });
                resultMarkerArr.push(marker_e);
                marker_e.addListener("click", function (evt){
                    console.log("marker_e 클릭")
                    positionofend = marker_e.getPosition();
                    console.log("position:"+positionofend)
                    real_latitude = positionofend._lat;
                    real_longitude = positionofend._lng;
                    alert("리뷰보기 : 선택한 위치의 리뷰 보기 클릭, 바로 길 찾기 : 선택한 곳으로 길찾기 클릭")
                });        

                
                // 경유지
                marker_p1 = new Tmapv2.Marker(
                        {
                            position : new Tmapv2.LatLng(place[1][0], place[1][1]),
                            icon : images[1],
                            iconSize : new Tmapv2.Size(image_width, image_height),
                            map:map
                        });
                resultMarkerArr.push(marker_p1);
                marker_p1.addListener("click", function (evt){
                    console.log("marker_p1 클릭")
                    positionofend = marker_p1.getPosition();
                    console.log("position:"+positionofend)
                    real_latitude = positionofend._lat;
                    real_longitude = positionofend._lng;
                    alert("리뷰보기 : 선택한 위치의 리뷰 보기 클릭, 바로 길 찾기 : 선택한 곳으로 길찾기 클릭")
                });
                
                marker_p2 = new Tmapv2.Marker(
                        {
                            position : new Tmapv2.LatLng(place[2][0], place[2][1]),
                            icon : images[2],
                            iconSize : new Tmapv2.Size(image_width, image_height),
                            map:map
                        });
                resultMarkerArr.push(marker_p2);
                marker_p2.addListener("click", function (evt){
                    console.log("marker_p2 클릭")
                    positionofend = marker_p2.getPosition();
                    console.log("position:"+positionofend)
                    real_latitude = positionofend._lat;
                    real_longitude = positionofend._lng;
                    alert("리뷰보기 : 선택한 위치의 리뷰 보기 클릭, 바로 길 찾기 : 선택한 곳으로 길찾기 클릭")
                });

                marker_p3 = new Tmapv2.Marker(
                        {
                            position : new Tmapv2.LatLng(place[3][0], place[3][1]),
                            icon : images[3],
                            iconSize : new Tmapv2.Size(image_width, image_height),
                            map:map
                        });
                resultMarkerArr.push(marker_p3);
                marker_p3.addListener("click", function (evt){
                    console.log("marker_p3 클릭")
                    positionofend = marker_p3.getPosition();
                    console.log("position:"+positionofend)
                    real_latitude = positionofend._lat;
                    real_longitude = positionofend._lng;
                    alert("리뷰보기 : 선택한 위치의 리뷰 보기 클릭, 바로 길 찾기 : 선택한 곳으로 길찾기 클릭")
                });
                
                // 중심좌표로 지도 이동..
                /*
                var lat = (place[4][0] + place[0][0])/2;
                var lon = (place[4][1] + place[0][1])/2;
                tMapView.setCenterPoint(lon, lat);
                */

                var routeLayer;
                // 최단~~ 적용 클릭 시 
                $("#course_select").click(function(){
                    
                    
                        var searchOption = $("#selectLevel").val();
                
                        $.ajax({
                            method : "POST",
                            url : "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json&callback=result",
                            async : false,
                            data : {

                                "appKey" : "l7xxdb5dae09f39444cb9c87fd5289236e24",
                                "startX" : String(place[0][1]),
                                "startY" : String(place[0][0]),
                                "endX" : String(place[4][1]),
                                "endY" : String(place[4][0]),
                                
                                // 경유지
                                "passList" : 
                                String(place[1][1]) + "," + String(place[1][0])
                                + "_" + String(place[2][1]) + "," + String(place[2][0])
                                + "_" + String(place[3][1]) + "," + String(place[3][0]),
                                
                                "reqCoordType" : "WGS84GEO",
                                "resCoordType" : "EPSG3857",
                                
                                "startName" : "출발지",
                                "endName" : "도착지",
                                "searchOption" : searchOption

                            },
                            success : function(response) {
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
                                    for ( var i in resultdrawArr) {
                                        resultdrawArr[i]
                                                .setMap(null);
                                    }
                                    resultdrawArr = [];
                                }
                                
                                drawInfoArr = [];

                                for ( var i in resultData) { //for문 [S]
                                    var geometry = resultData[i].geometry;
                                    var properties = resultData[i].properties;
                                    var polyline_;


                                    if (geometry.type == "LineString") {
                                        for ( var j in geometry.coordinates) {
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
                                            markerImage : markerImg,
                                            lng : convertPoint._lng,
                                            lat : convertPoint._lat,
                                            pointType : pType
                                            
                                        };

    
                                    }
                                }//for문 [E]
                                drawLine(drawInfoArr);
                            },
                            error : function(request, status, error) {
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
                        path : arrPoint,
                        strokeColor : "#DD0000",
                        strokeWeight : 6,
                        map : map
                    });
                    resultdrawArr.push(polyline_);
                }
            });
        }
    });

    $("#path_present").click(function(){
        console.log("선택한 곳으로 길찾기")
        console.log("안되남??")

        if (resultMarkerArr_2.length > 0) {
            for ( var i in resultMarkerArr_2) {
                    resultMarkerArr_2[i]
                        .setMap(null);

            }
            resultMarkerArr_2 = []; 
            
        }
        console.log("삭제함")

        marker_s = new Tmapv2.Marker(
            {
                //position : new Tmapv2.LatLng(lati, longi),
                position : new Tmapv2.LatLng(position.coords.latitude, position.coords.longitude),
                icon : "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_s.png",
                iconSize : new Tmapv2.Size(24, 38),
                map : map
            });
            resultMarkerArr_2.push(marker_s);
        console.log("시작 마커는 만듦")

        // 도착

        if (resultMarkerArr.length > 0) {
            for ( var i in resultMarkerArr) {
                    resultMarkerArr[i]
                        .setMap(null);
            }
            resultMarkerArr = []; 
            
        }

        marker_e = new Tmapv2.Marker(
            {
                position : new Tmapv2.LatLng(positionofend._lat, positionofend._lng),
                icon : "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png",
                iconSize : new Tmapv2.Size(24, 38),
                map : map
            });
            resultMarkerArr_2.push(marker_e);
            console.log("엔딩 마커도!")

        
        console.log(marker_e.getPosition())
        console.log(positionofend)
        
        $
            .ajax({
                method : "POST",
                url : "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json&callback=result",
                async : false,
                data : {
                    "appKey" : "l7xxdb5dae09f39444cb9c87fd5289236e24",
                    "startX" : longitude,
                    "startY" : latitude,
                    "endX" : positionofend._lng,
                    "endY" : positionofend._lat,
                    "reqCoordType" : "WGS84GEO",
                    "resCoordType" : "EPSG3857",
                    "startName" : "출발지",
                    "endName" : "도착지"
                },
                success : function(response) {
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
                        for ( var i in resultdrawArr) {
                            resultdrawArr[i]
                                    .setMap(null);
                        }
                        resultdrawArr = [];
                    }
                    
                    drawInfoArr = [];

                    for ( var i in resultData) { //for문 [S]
                        var geometry = resultData[i].geometry;
                        var properties = resultData[i].properties;
                        var polyline_;


                        if (geometry.type == "LineString") {
                            for ( var j in geometry.coordinates) {
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
                                markerImage : markerImg,
                                lng : convertPoint._lng,
                                lat : convertPoint._lat,
                                pointType : pType
                            };

                            // Marker 추가
                            marker_p = new Tmapv2.Marker(
                                    {
                                        position : new Tmapv2.LatLng(
                                                routeInfoObj.lat,
                                                routeInfoObj.lng),
                                        icon : routeInfoObj.markerImage,
                                        iconSize : size,
                                        map : map
                                    });
                        }
                    }//for문 [E]
                    drawLine(drawInfoArr);
                },
                error : function(request, status, error) {
                    console.log("code:" + request.status + "\n"
                            + "message:" + request.responseText + "\n"
                            + "error:" + error);
                }
            });

    })
}

function addComma(num) {
    var regexp = /\B(?=(\d{3})+(?!\d))/g;
    return num.toString().replace(regexp, ',');
}

function drawLine(arrPoint) {
    var polyline_;

    polyline_ = new Tmapv2.Polyline({
        path : arrPoint,
        strokeColor : "#DD0000",
        strokeWeight : 6,
        map : map
    });
    resultdrawArr.push(polyline_);
}
function checkcurrentplace(){
    openChild_2();
}

function setlatilongi(latitude, longitude){
    lati = latitude;
    longi = longitude;
    console.log(lati+" "+longi)
}

function getshortpath(latitude, longitude){
    getLocation();
}
