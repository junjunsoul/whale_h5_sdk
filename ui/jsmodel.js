var globalLayerIndex;
var globalPageIndex;

function openDialog(objd, classname) {
    var html = objd.innerHTML;
    globalLayerIndex = layer.open({
        type: 1,
        content: html,
        shadeClose: false,
        className: classname
    });
}

function ajaxRequestData(url, params, callback) {
    var rebackObj = new Object();
    rebackObj.status = false;
    rebackObj.data = '';
    rebackObj.message = "";
    if (!url) {
        rebackObj.msg = "请求接口地址为空";
        return callback(rebackObj);
    }

    $.ajax({
        type: "POST",
        url: url,
        data: params,
        dataType: "json",
        success: function(respData) {
            if (!respData.hasOwnProperty('status') || respData.status == false) {
                if (!respData.message || !respData.hasOwnProperty('message')) {
                    rebackObj.message = '请求接口失败';
                } else {
                    rebackObj.message = respData.message;
                }
                return callback(rebackObj);
            }
            rebackObj.data = respData;
            rebackObj.status = true;
            return callback(rebackObj);
        },
        error: function() {
            rebackObj.message = "接口请求失败";
            return callback(rebackObj);
        }

    });
}
//用户名检测
function checkUname(uname) {
    var rebackResult = new Object();
    rebackResult.status = false;
    rebackResult.msg = "";
    if (uname.length < 4 || uname.length > 12) {
        rebackResult.msg = "用户名长度为4-12位";
        return rebackResult;
    }
    var reg = /^[0-9a-zA-Z]*$/;
    if ((!reg.test(uname))) {
        rebackResult.msg = "用户名只能由字母或数字组成";
        return rebackResult;
    }
    rebackResult.status = true;
    return rebackResult;
}
//手机号码检测
function checkPhone(phone) {
    var reg = /^1[3|4|5|7|8][0-9]\d{4,8}$/;
    var rebackResult = new Object();
    rebackResult.status = false;
    rebackResult.msg = "";
    if ((!reg.test(phone)) || phone.length != 11) {
        rebackResult.msg = "手机号码格式错误";
        return rebackResult;
    }
    rebackResult.status = true;
    return rebackResult;
}

//错误日志 level 1为错误 0为警告
function setLog(str, level) {
    if (level == 1) {
        console.log('%cUI层致命错误:' + str, 'color:red');
    } else if (level == 0) {
        console.log('%cUI层警告错误:' + str, 'color:org');
    } else if (level == 3) {
        console.log('%cUI层运行日志:' + str, 'color:gray');
    } else {
        console.log('%cUI层运行日志:' + str, 'color:gray');
    }
}



$(function(){
    
    //浮标悬浮球
    var assistiveLeft, assistiveRight, timerid;

    function stickEdge(el) {
        var left = parseInt($(el).css("left")) || 0,
            width = parseInt(el.offsetWidth) || 0,
            windowWith = (document.documentElement || document.body).offsetWidth;
        if (left > (windowWith - width) / 2) {
            left = windowWith - width - 2;
        } else {
            left = 1;
        }
        var ltop = parseInt($(el).css("top")) || 0,
            windowHeight = $(window).height();
        //var ptop=windowHeight*0.2 || 0;
        var ptop = 0;
        if (ltop + ptop <= 0) {
            el.style.top = (0 - ptop) + "px";
        } else if (ltop + ptop + 40 >= windowHeight) {
            el.style.top = (windowHeight - ptop - 40) + "px";
        }

        el.style.transition = 'all .2s';
        el.style['-webkit-transition'] = 'all .2s';
        el.style.left = left + 'px';
        timerid = setTimeout(function() {
            el.style.transition = 'all .5s';
            el.style['-webkit-transition'] = 'all .5s';
            el.style.opacity = '.3';
        }, 2000);
    }
    mTouch('.assistive-wrap').on('swipestart', function() {
        clearTimeout(timerid);

        this.style.transition = 'none';
        this.style['-webkit-transition'] = 'none';
        this.style.opacity = '1';
        assistiveLeft = parseInt($(this).css("left")) || 0;
        assistiveTop = parseInt($(this).css("top")) || 0;
        return false;
    }).on('swiping', function(e) {
        this.style.left = assistiveLeft + e.mTouchEvent.moveX + 'px';
        this.style.top = assistiveTop + e.mTouchEvent.moveY + 'px';
        $(".menuList.assistive-menu").hide();
    }).on('swipeend', function() {
        stickEdge(this);
        var assisL = parseInt($(this).css("left")) || 0;
        var assisT = parseInt($(this).css("top")) || 0;
        var docW = $(document).width();
        var menuW = $(".menuList.assistive-menu .menulist-item").length;
        if (assisL > docW / 2) {
            menuListLeft = assisL - 70 - 40 * menuW + 40;
            $(".menuList.assistive-menu").addClass("right").css({
                left: menuListLeft + "px",
                top: assisT + "px"
            });
        } else {
            $(".menuList.assistive-menu").removeClass("right").css({
                left: assisL + "px",
                top: assisT + "px"
            });
        }
    }).on("tap", function(e) {
        $(".menuList.assistive-menu").toggle();
    });

    window.addEventListener('message', function(e) {
        var messageData = e.data;
        try {
            var messageObject = JSON.parse(messageData);
        } catch (e) {
            var messageObject = null;
        }
        if (!messageObject || typeof(messageObject) != 'object' || !messageObject.hasOwnProperty('func')) {
            return;
        }

        var funcName = messageObject.func;
        switch (funcName) {

            case 'Event_Channel_Login':
                showLoginViews(function(res) {
                    var returnObject = new Object();
                    returnObject.func = 'Callback_Channel_Login';
                    returnObject.params = res;
                    document.getElementById('gameFrame').contentWindow.postMessage(JSON.stringify(returnObject), '*');
                });
                break;

            case 'Event_Channel_Pay':
                var params = JSON.parse(messageObject.params);
                showPayViews(params, function(payRetrun) {
                    var returnObject = new Object();
                    returnObject.func = 'Callback_Channel_Pay';
                    returnObject.params = payRetrun;
                    document.getElementById('gameFrame').contentWindow.postMessage(JSON.stringify(returnObject), '*');
                });
                break;

            case 'Event_Channel_LogOut':
                showLogOutViews();
                break;

            case 'Event_Channel_toggleModalMenu':
                showToggleModalMenu(messageObject.params);
                break;

            case 'Event_SaveRole':
                triggerAd_updateRole(messageObject.params);
                break;

            case 'Event_OpenService':
                openOnlineServiceCallback(messageObject.params);
                break;
        }
    }, false);

    $(document).on("click", ".box-close", function() {
        layer.close(globalLayerIndex);
    });

    $(document).on("click", ".page-close", function() {
        layer.close(globalPageIndex);
    });    
})