$(document).ready(function(){
    console.log("제제바라랄");
})

// -------지도 관련

var map;
var markerInfo;
var markerLayer;
var marker;
//리뷰 마커
var markers = [];

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
    createnewlayer(position.coords.latitude, position.coords.longitude, map) 
}
    // 시작
function createnewlayer(latitude, longitude, map){
    var selected = $("#selectedcategory option:selected").attr('value');
    console.log(selected);
    console.log("적용하기 선택함");
    console.log("click "+ selected);
    if (selected != undefined && selected != ""){
        console.log("들어와써");
        map.destroy();
        console.log("new map");
        map = new Tmapv2.Map("map_div", {
            center: new Tmapv2.LatLng(latitude, longitude),
            width: "100%",
            height: "700px",
            zoom: 15,
            zoomControl: true,
            scrollwheel: true
        });
        $.post(url + '/category',{category:selected}, function (data, status) {
            console.log(data);

            for (var i = 0; i < data.length; i++){
                var new_latitude = data[i].latitude;
                var new_longitude = data[i].longitude;
                var image = data[i].image;
                //Marker 객체 생성.
                var size = new Tmapv2.Size(50,50);
                console.log("마커 생성중" + i);
                marker_e = new Tmapv2.Marker({
                    position : new Tmapv2.LatLng(new_latitude,new_longitude), //Marker의 중심좌표 설정.
                    icon: "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png",
                    iconSize: size,
                    map : map, //Marker가 표시될 Map 설정.
                });
            }
        })
    }
} 


 
