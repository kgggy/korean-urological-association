
/*페이징, select_codeList 가져오기위해 테그변환*/
function tag_place(str) {
	return str.replace(/&lt;/gi, "<").replace(/&#39;/gi, "'").replace(/&gt;/gi,">");
}

// 쿠키 생성
function setCookie(cName, cValue, cDay) {
	var expire = new Date();
	expire.setDate(expire.getDate() + cDay);
	cookies = cName + '=' + escape(cValue) + '; path=/ '; // 한글 깨짐을 막기위해
	if (typeof cDay != 'undefined')
		cookies += ';expires=' + expire.toGMTString() + ';';
	document.cookie = cookies;
}

// 쿠키 가져오기
function getCookie(cName) {
	cName = cName + '=';
	var cookieData = document.cookie;
	var start = cookieData.indexOf(cName);
	var cValue = '';
	if (start != -1) {
		start += cName.length;
		var end = cookieData.indexOf(';', start);
		if (end == -1)
			end = cookieData.length;
		cValue = cookieData.substring(start, end);
	}
	return unescape(cValue);
}

/* TEXT박스 유효값체크 : 숫자만 가능 onkeyup="CheckOnlyNumber(this);" */
function CheckOnlyNumber(TextBoxControl) {
	inputValue = TextBoxControl.value.replace(/ /g, "");
	if (inputValue.replace(/\d/g, "").length != 0) {
		alert("숫자만 입력해주세요.");
		TextBoxControl.value = "";
		TextBoxControl.focus();
		return false;
	}
	return true;
}

function historyBack() {
	history.back(1);
}

function getDate() {

	var now = new Date();
	var year = now.getFullYear();
	var mon = (now.getMonth() + 1) > 9 ? '' + (now.getMonth() + 1) : '0'
			+ (now.getMonth() + 1);
	var day = now.getDate() > 9 ? '' + now.getDate() : '0' + now.getDate();
	var hour = now.getHours();
	var minute = now.getMinutes();
	var date = year + '.' + mon + '.' + day + " " + hour + ":" + minute;

	return date;
}

function scrollBottom() {
	var pos = $("#scroll_end").offset();
	$("html, body").scrollTop(pos.top);
}

/*
 * TextFiled 이메일 유효성 체크
 * 유효할시 return : true
 * 유효하지 않을시 retrun : false
 * */
function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/*
 * 모바일 접속여부 확인
 * 증가되는 모바일을 체크하지 않고 데스크탑인지 아닌지 체크한다.
 * 모바일(true), 테스크탑(false)
 * */
function isMobile() {
	var filter = "win16|win32|win64|mac|macintel";
	if( navigator.platform  ){
		if( filter.indexOf(navigator.platform.toLowerCase())<0 ){
			return true;
		}else{
			return false;
		}
	}
}