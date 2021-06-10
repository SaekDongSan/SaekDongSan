// var latitude;
// var longitude;
var url = 'http://localhost:3000';
var first;
$(document).ready(function () {

    if ("geolocation" in navigator) {	/* geolocation 사용 가능 */
        navigator.geolocation.getCurrentPosition(function (data) {

            latitude = data.coords.latitude;
            longitude = data.coords.longitude;

            reverseGeo(longitude, latitude);
            setLocation(latitude, longitude);

        }, function (error) {
            alert(error);
        });
    } else {	/* geolocation 사용 불가능 */
        alert('geolocation 사용 불가능');
    }
});

function reverseGeo(lon, lat) {
    $.ajax({
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
    // let mobileheight = window.innerHeight;
    // window.name = "부모창 이름"; 
    window.name = "parentForm";
    // window.open("open할 window", "자식창 이름", "팝업창 옵션");
    var win = window.open("./newlocation.html", "newLocation", "width=100%, height=100%");
}
function setChildValue(name) {
    console.log('새로운 위치 정보 저장');
    document.querySelector('#current-location').innerHTML = name;
}
function setLocation(lat, lng) {
    console.log(lng, lat);
    latitude = lat;
    longitude = lng;
}

var userInfo;
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
    postLiked = [];
    first = true;
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        userInfo = undefined;
    });
}


// ------------------------------------
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
        formData.append('longtitude', longitude);
        formData.delete('img[]');
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
                $("#reset").trigger("click");
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

//예시
var post;
var postLiked;
var real_latitude;
var real_longitude;

$(document).ready(function () {
    //현재 위치에 맞는 포스팅 불러오기
    //나중에 onclick으로 받아올거

    $('#markerid').click(function () {
        if (userInfo == undefined) {
            document.location.href = url;
            alert('로그인 후 이용해 주세요');
            return
        }

        console.log("click " + real_latitude + " " + real_longitude);
        $.post('/showpost', { lat: real_latitude, lng: real_longitude }, function (data, status) {
            console.log(data);
            if (status == 'success') post = data;
            else console.log(status);
        })
            .done(function () {
                if (first) {
                    $.post(url + '/user', { user_id: userInfo.ID }, function (data, status) {
                        userInfo = data;
                        console.log("새로 연 유저 정보 ");
                        console.log(userInfo);
                    }).done(function () {
                        console.log("fisrt");
                        // postLiked = [];
                        for (var i = 0; i < userInfo.liked.length; i++) {
                            var likedinDB = userInfo.liked[i]["posting_id"];
                            console.log("db에 저장된 좋아요 포스팅 id : " + likedinDB);
                            if (likedinDB !== undefined) postLiked.push(likedinDB);
                        }
                        first = false;
                        console.log("postLiked : " + postLiked);
                        display(post);
                    })
                }
                else {
                    console.log("postLiked : " + postLiked);
                    display(post);
                }
            })
            .fail(function () {
                console.log("fail");
            })
    })

    function display(post) {
        if (post.length != 0) {
            console.log("총 내보낼 포스트의 길이는 " + post.length);

            var html = "";
            var url1 = "http://localhost:3000/uploads/";

            for (var i = 0; i < post.length; i++) {
                var imgs = '';
                var middle;
                for (var j = 0; j < post[i].filenumber; j++) {
                    var img = url1 + post[i][`image${j}`];
                    imgs += `<img src="${img}" width="40%">`;
                }

                var record = "true";
                var bgcolor = "white";

                console.log("postLiked.indexOf(`${post[i]._id}`) : " + postLiked.indexOf(`${post[i]._id}`));
                if (postLiked.indexOf(`${post[i]._id}`) < 0) {
                    record = "false";
                }

                if (record == "true") {
                    bgcolor = "green";
                }

                middle = `<article>
                    <header class="header" style="border: 5px solid black;"> 
                     <div class="title"> ${post[i].location} </div> <div class="writer"> ${post[i].writer}</div>
                    </header>
                    <div class="posting_photo" style="border: 5px solid black;">
                        <section id="imgs${i}">` + imgs + `</section>
                    </div>
                    <div class="posting_add" style="border: 5px solid black;">
                        <button type="buttondd" id ="comment${post[i]._id}" style="background-color: ${bgcolor}" onclick="likes(${i})"> 좋아요 </button> <span id="likes${post[i]._id}" data-id = ${record} >${post[i].likes}</span>
                        <button type="button" onclick="shows(${i})"> 댓글보기 및 달기 </button>
                    </div>
                    <div class="information" style="border: 5px solid black;">
                        <div class="ptime">${post[i].time}</div>
                        <div class="pcategory">${post[i].category}</div>
                    </div>
                    <div class="posting_comment" style="border: 5px solid black;">
                        <div class="pcomment">${post[i].posting_content}</div>
                    </div>
                    <div id="open${i}" style="display:none">
                        <div id="show_comment${i}" style="border: 5px solid black;"></div>
                        <div id="add_comment${i}" style="border: 5px solid black;"></div>
                    </div>
                    </article> <hr>`;

                html += middle;
            }
            document.getElementById("new").innerHTML = html;
        } else {
            document.getElementById("new").innerText = "해당 지역에 대한 포스트가 아무것도 없습니다. 새로운 포스트를 작성해 주세요!"
        }
    }
})

var liked;
function likes(num) {
    console.log("실행")
    console.log("postLiked : " + postLiked);

    var idLiked = post[num]._id;

    var elem = $(`#likes${idLiked}`)
    liked = $(`#likes${idLiked}`).attr("data-id");
    var likess = post[num].likes;
    console.log(liked + likess);

    if (liked == "false") {
        elem.attr("data-id", "true");
        $(`#comment${idLiked}`).css("background-color", "green");
        likess++;
        post[num].likes = likess;
        $.post('/likes', { post_id: post[num]._id, likes: likess },
            function (data, status) {
                console.log(data);
            });
        document.getElementById(`likes${idLiked}`).innerHTML = `${likess}`;
        postLiked.push(idLiked);
        console.log(postLiked);
        console.log("---- 좋아요 누름 db로! " + idLiked);
        $.post('/liked', { userid: userInfo.ID, updateLike: "true", postid: idLiked }, function (data, status) {
            console.log("유저 좋아요 목록 추가 성공" + JSON.stringify(data));
        })
    }
    else {
        elem.attr("data-id", "false");
        $(`#comment${idLiked}`).css("background-color", "white");
        likess--;
        post[num].likes = likess;
        $.post('/likes', { post_id: post[num]._id, likes: likess },
            function (data, status) {
                console.log("좋아요 제거");
            });
        document.getElementById(`likes${idLiked}`).innerHTML = `${likess}`;
        const DeleteInd = postLiked.indexOf(idLiked);
        if (DeleteInd >= 0) {
            postLiked.splice(DeleteInd, 1);
        }
        console.log("postLiked" + postLiked);

        console.log("---- 좋아요 취소 db로! " + idLiked);
        $.post('/liked', { userid: userInfo.ID, updateLike: "false", postid: idLiked }, function (data, status) {
            console.log("유저 좋아요 목록 취소 성공" + JSON.stringify(data));
        })
    }
}

function shows(num) {
    console.log("댓글 보이기 버튼 누름");
    $.post('/showpost', { lat: real_latitude, lng: real_longitude }, function (data, status) {
        console.log(data);
        if (status == 'success') post = data;
        else console.log(status);
    })
        .done(function () {
            add_comment(num);
        })
}

let html1 = "";
let html2 = "";
function add_comment(num) {
    var open = document.getElementById(`open${num}`).style.display;
    html1 = "";
    let exist1 = "";
    let exist2 = "";

    if (open == "none") {
        if (post[num].comments !== undefined) {
            var length = post[num].comments.length;
            console.log(length);
            for (var i = 0; i < length; i++) {
                let euser = post[num].comments[i].comment_writer;
                let etime = post[num].comments[i].comment_time;
                let ecomment = post[num].comments[i].comment_content;
                console.log('댓글 ' + euser + etime + ecomment);

                exist1 += `<div id="euser">${euser}</div>
                                <div id="etime">${etime}</div> 
                                <div id="ecomment">${ecomment}</div>`
            }
            html1 += exist1;
            document.getElementById(`show_comment${num}`).innerHTML = html1;
        }

        exist2 += `<textarea id="add${num}" col="50" row="30" placeholder = "댓글을 입력해주세요" ></textarea>
                    <button class="done" onclick="add(${num})">comment</button>`
        document.getElementById(`add_comment${num}`).innerHTML = exist2;
        document.getElementById(`open${num}`).style.display = "block";
    } else {
        console.log("댓글 확인 창 닫습니다.");
        document.getElementById(`open${num}`).style.display = "none";
    }
}

function add(num) {
    console.log("댓글 저장");
    html2 = "";
    if ($(`#add${num}`).val() == "") {
        alert("내용을 입력하세요.");
        $(`#add${num}`).focus();
        return false;
    }
    let comment = document.getElementById(`add${num}`).value;
    console.log(comment);
    let time = new Date().toLocaleString();
    console.log(time);
    let writer = userInfo.name.toString();
    console.log(writer);
    $(`#add${num}`).val('');
    html2 += `<div id="euser">${writer}</div>
                        <div id="etime">${time}</div> 
                        <div id="ecomment">${comment}</div>`;

    html1 += html2
    document.getElementById(`show_comment${num}`).innerHTML = html1;

    //몽고디비에 추가하기 
    $.post('/addcomment', { post_id: post[num]._id, post_name: writer, post_time: time, post_comment: comment },
        function (data, status) {
            console.log("db에 전송완료" + data);
        }
    )
}
