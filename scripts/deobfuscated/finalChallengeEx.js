var _0x282972618_ = function(a) {
    for (var o = 32, e = window._cf_chl_opt.cRay + "_" + +(-~~~[] + [] + (!+ -[] + + -!![] + -[]) + (!+[] + !![] + !![] + !![] + !![] + !![] + !![]) + (!+[] + !![] + !![]) + (!+[] + !![] + !![])), e = e.replace(/./g, function(i, j) {
            o ^= e.charCodeAt(j);
        }), a = window._cf_atob(a), r = [], b = d = -1; !isNaN(d = a.charCodeAt(++b)); r.push(String.fromCharCode(((d & 255) - o - b + 65535) % 255)));
    return r.join("");
};
window._ = function() {};
for (var i = 0; i < 32; _[i] = _0x282972618_(["eIyFf4l9jFc=", "UA==", "Tg==", "ToR2in9VSA==", "UE81Y3iQRluCgVpLWFlaW1xdXl9i", "dnp0eX+EeIqNi4Q=", "iw==", "fYd4foNFj30=", "fYd4foNFeoiOk4KQ", "dnx2goN9h4GASYONkY0=", "fIKFi4s=", "h42Few==", "e315enyG", "gXWCew==", "dnp0eX93j3+NhYOX", "iXWBi3w=", "g4B2ig==", "dnpCiYeBh4iAjkqQhISKlIiHmY+Vjw==", "fXdCiYeBh4iAjkqQhISKlIiHmY+Vjw==", "jH6IQ4qIgoiJgY9LkYWFi5WJiJqQlpA=", "dYCEeYI=", "dnpCiYeBh4iAjkqOi4WClYhRnIeQnA==", "fXdCiYeBh4iAjkqOi4WClYhRnIeQnA==", "jH6IQ4qIgoiJgY9Lj4yGg5aJUp2IkZ0=", "gYODew==", "dnpCiYeBh4iAjkp/i4yQmVBZUpmMi5w=", "fXdCiYeBh4iAjkp/i4yQmVBZUpmMi5w=", "jH6IQ4qIgoiJgY9LgIyNkZpRV1OajYyd", "d3d5enl8THxPTFaChFKFh4aFVllei41iXV1kXmJpYpc=", "i4SIaYyRg2uUhWh/TFlOWFaIWFpaYGJikV1ekJGSYw==", "cnd7dXqAhXl/i4uDfpKCkA==", "cnd7dXqAhXl/i4uD"][i++]));

function setCookie(cname, cvalue, hours) {
    var d = new window.Date;
    d.setTime(d.getTime() + hours * 1 * 60 * 60 * 1e3);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function eraseCookie(name) {
    document.cookie = name + "=; Max-Age=-99999999;";
}
window._cf_chl_done = function() {
    setCookie("cf_chl_prog", "x" + window._cf_chl_ctx.chLog.c, 1);
    var vcEl = document.getElementById(_[_["expires="], 7]);
    var answerEl = document.getElementById("jschl-answer");
    var formEl = document.getElementById("challenge-form");
    var inputEl = document.createElement("input");
    inputEl.setAttribute("type", "hidden");
    inputEl.setAttribute("name", "cf_ch_verify");
    inputEl.setAttribute("value", "plat");
    document.getElementById("challenge-form").appendChild(inputEl);
    var redirecting = document.getElementById("cf-spinner-redirecting");
    if (!redirecting) {
        redirecting = document.getElementById("jc-spinner-redirecting");
    }
    if (!redirecting) {
        redirecting = document.getElementById("yjs-spinner-redirecting");
    }
    if (redirecting) {
        redirecting.style.display = "block";
    }
    var pleaseWait = document.getElementById("cf-spinner-please-wait");
    if (!pleaseWait) {
        pleaseWait = document.getElementById("jc-spinner-please-wait");
    }
    if (!pleaseWait) {
        pleaseWait = document.getElementById("yjs-spinner-please-wait");
    }
    if (pleaseWait) {
        pleaseWait.style.display = "none";
    }
    var allowSecs = document.getElementById("cf-spinner-allow-5-secs");
    if (!allowSecs) {
        allowSecs = document.getElementById("jc-spinner-allow-5-secs");
    }
    if (!allowSecs) {
        allowSecs = document.getElementById("yjs-spinner-allow-2-secs");
    }
    if (allowSecs) {
        allowSecs.style.display = "none";
    }
    vcEl.setAttribute("value", "dcddbd3b409de2deca137cd82170391e");
    answerEl.setAttribute("value", "xpsSuyjQyiKa-9-63d343898f11bbb2");
    formEl.action += location.hash;
    eraseCookie("cf_chl_prog");
    formEl.submit();
    window._cf_chl_done_ran = true;
};
if (window["_cf_chl_done_ran"]) {
    window["_cf_chl_done"]();
}