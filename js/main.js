var mapId = "";
var lettoryItem;
window.lettoryValid = true;
openLoginPopup = () => {
    var imgValidCodeInit = function () {
        if (!document.querySelector('div[data-key="imgValidCode"]')) {
            setTimeout(function () { 
                imgValidCodeInit();
            }, 100);
        }
        else { 
            mapId = getRandomNumber();
            document.querySelector('div[data-key="imgValidCode"]').style.backgroundImage = "url(" + window.HI.captchaBaseUrl + mapId + ")";
            document.querySelector('div[data-key="imgValidCode"]').removeEventListener('click', function () { });
            document.querySelector('div[data-key="imgValidCode"]').addEventListener('click', function () { 
                mapId = getRandomNumber();
                document.querySelector('div[data-key="imgValidCode"]').style.backgroundImage = "url(" + window.HI.captchaBaseUrl + mapId + ")";
            });
        }
    };
    imgValidCodeInit();
};

getRandomNumber = () => {
    var array1 = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z");
    var Str = "";
    for (var i = 1; i <= 10; i++) {
        var index = Math.floor(Math.random() * array1.length);
        Str = Str + array1[index];
    }
    return Str;
}

statusCheck = () => {
    if(document.cookie.split("token=Y").length >= 2) {
      loginAction();
    } else {
      logoutAction();
    }
}

loginClick = () => {
  var account = $("#Inputidcard").val();
  var password = $("#InputPassword").val();
  var captcha = $("#ValidCode").val();
  onUserLogin(account ,password ,captcha);
}

loginAction = () => {
  var user = JSON.parse(localStorage.getItem("localUser"));
  $("#greetings").html(`${user.MEMNAME}` + "您好，感謝您的推薦，");
  $("#lotcount").html(`${user.LOTCOUNT}` + "次");
  $("#userLogin").hide();
  $("#loginPrompt").hide();
  $("#lotteryIntroduc").show();
  $("#recordSearch").show();
  $("#userLogout").show();
  $(".KinerLotteryBtn").removeAttr("data-toggle");
  $(".KinerLotteryBtn").removeAttr("data-target");
}

logoutAction = () => {
  $("#userLogin").show();
  $("#loginPrompt").show();
  $("#lotteryIntroduc").hide();
  $("#recordSearch").hide();
  $("#userLogout").hide();
  $(".KinerLotteryBtn").attr("data-toggle", "modal");
  $(".KinerLotteryBtn").attr("data-target", "#exampleModalA");
}

onUserLogin = (account, password, captcha) => {
  // API TODO: 整合登入 API
  window.fetch(window.HI.baseUrl + "api/Exec/LotteryMemLogin",{
    method: 'POST',
    body: JSON.stringify({
      MEMIDNO: account,
      MEMPWD: password,
      Captcha: captcha,
      MapID: mapId
    }), 
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }).then(function(response) {
    response.json().then(function(data){
      if(data.RESULT === true) {
        if(data.DATA.Table1[0].RESULT === "Y") { 
          window.user =  
          { account, 
            'MEMNAME': data.DATA.Table1[0].MEMNAME,
            'LOTCOUNT': data.DATA.Table1[0].LOTCOUNT,
            'Token': data.Token
          }
          localStorage.setItem('localUser', JSON.stringify(window.user));
          function setcookie(name, value, daysTolive) {
            let cookie = name + "=" + encodeURIComponent(value);
            if (typeof daysTolive === "number") {
              cookie += "; max-age =" + (daysTolive * 60 *60 * 24);
            }
            document.cookie = cookie;
          };
          setcookie("token", "Y", 1);
          loginAction();
          $(".close").click();
        } else {
          alert(data.DATA.Table1[0].MSG);
        }
      } else {
        alert(data.MESSAGE);
      }
    });               
  }).catch(error => alert(error)); 
}
  
onUserLogout = () => {
  localStorage.removeItem("localUser");
  window.user = null;
  document.cookie = "token" + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";;
  logoutAction();
};

HIHomePagePopUp = () => {
  window.open("https://www.easyrent.com.tw/irent/web/signup.shtml");
}

lotteryRecord = () => {
  window.fetch(window.HI.baseUrl + "api/Exec/LotterySearch",{
    method: 'POST',
    body: JSON.stringify({
      MEMIDNO: JSON.parse(localStorage.getItem("localUser")).account,
      Token: JSON.parse(localStorage.getItem("localUser")).Token
    }), 
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }).then(function(response) {
    response.json().then(function(data){
      if(data.RESULT === true) {
        var items = data.DATA.Table1;
        const prizeList = document.querySelector('#prizeList');
        if(prizeList.children.length === items.length) return;
        $("#prizeList").empty();
        for(var i = 0; i < items.length; i++) {
          let date = new Date(items[i].U_SYSDT);
          items[i].U_SYSDT = date.getFullYear() + "/" + ((date.getMonth() >= 9) ? (date.getMonth() + 1).toString() : "0" + (date.getMonth() + 1)) + "/" + (date.getDate() >= 10 ? date.getDate() : "0" + date.getDate());
          prizeList.insertAdjacentHTML('beforeend', getColumn(items[i]));
        }
      } else {
        alert(data.MESSAGE);
      }
    });               
  }).catch(error => alert(error));
}

lotteryAction = () => {
  if(window.lettoryValid) {
    if(document.cookie.split("token=Y").length === 1) {
      alert("請先登入再進行抽獎！");
      openLoginPopup();
      return;
    }
    if(JSON.parse(localStorage.getItem("localUser")).LOTCOUNT === 0) {
      alert("您已無抽獎次數！");
      return;
    }
    window.lettoryValid = false;
    window.fetch(window.HI.baseUrl + "api/Exec/lotteryAction",{
      method: 'POST',
      body: JSON.stringify({
        MEMIDNO: JSON.parse(localStorage.getItem("localUser")).account,
        Token: JSON.parse(localStorage.getItem("localUser")).Token
      }), 
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    }).then(function(response) {
      response.json().then(function(data){
        if(data.DATA.Table2[0].RESULT !== "Y") {
          alert(data.DATA.Table2[0].RESULTMSG);
          return;
        };
        var user = JSON.parse(localStorage.getItem("localUser"));
        user.LOTCOUNT = data.DATA.Table1[0].LOTCOUNT;
        $("#lotcount").html(`${user.LOTCOUNT}` + "次");
        localStorage.setItem('localUser', JSON.stringify(user));
  
        switch(data.DATA.Table1[0].GIFTID) {
          case "IPHONE":
            lettoryItem = 6;
            break;
          case "CAR30":
            lettoryItem = 5;
            break;
          case "MOTO20":
            lettoryItem = 4;
            break;
          case "AIRPODS":
            lettoryItem = 3;
            break;
          case "MOTO10":
            lettoryItem = 2;
            break;
          case "CAR60":
            lettoryItem = 1;
            break;
          default:
            lettoryItem = 7;
            break;
        }
  
        var KinerLotteryOBJ = new window.KinerLottery({
          rotateNum: 8, //转盘转动圈数
          body: "#box", //大转盘整体的选择符或zepto对象
          direction: 0, //0为顺时针转动,1为逆时针转动
          disabledHandler: function(key) {
            switch (key) {
              case "noStart":
                alert("活動尚未開始");
                break;
              case "completed":
                alert("活動已結束");
                break;
            }
          }, //禁止抽奖时回调
          clickCallback: function() {
            //此处访问接口获取奖品
            function random() {
              return Math.floor(Math.random() * 50);
            }
            if(lettoryItem === 7) {
              alert("獎項輸出錯誤！");
              window.lettoryValid = true;
              return;
            } else if(lettoryItem === 6){
              this.goKinerLottery(15);
            } else {
              this.goKinerLottery(lettoryItem*60 - 25 + random());
            }
          }, //点击抽奖按钮,再次回调中实现访问后台获取抽奖结果,拿到抽奖结果后显示抽奖画面
          KinerLotteryHandler: function(deg) {
              alert("恭喜您獲得:" + whichAward(deg));
      
            } //抽奖结束回调
        });
        KinerLotteryOBJ.LotteryAnimate();
      });            
    }).catch(error => alert(error));
  }
}

let getColumn = (item) => {
  return `
    <tr>
      <th scope="row">${item.U_SYSDT}</th>
      <td>${item.GIFTNAME}</td>
      <td>${item.GIFTNO}</td>
    </tr>
    `
}

statusCheck();
