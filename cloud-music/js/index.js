/**
 * 
 * 获取精品歌单
    说明 : 调用此接口 , 可获取精品歌单

    可选参数 : cat: tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为 "全部",可从精品歌单标签列表接口获取(/playlist/highquality/tags)

    limit: 取出歌单数量 , 默认为 20

    before: 分页参数,取上一页最后一个歌单的 updateTime 获取下一页数据

    接口地址 : /top/playlist/highquality

    调用例子 : /top/playlist/highquality?before=1503639064232&limit=3
 */

(function () {
    var baseURL = "https://netease-cloud-music-api-crete722p-hannah-bingo.vercel.app";
    initPage();
    // 初始化页面
    function initPage() {
        getCoverLsit();
        // 绑定事件
        bindEvent();
    }

    function showMore(flag) {
        if (flag) {
            $(".more").show();
        } else {
            $(".more").hide();
        }
    }

    // 获取歌单
    function getCoverLsit(before = "") {
        console.log("loading...");

        $.ajax({
            url: baseURL + "/top/playlist/highquality",
            type: "GET",
            data: {
                limit: 10,
                cat: "",
                before: before,
            },
            success: function (res) {
                // 请求成功，做数据处理
                console.log("success", res);
                if (res.code === 200) {
                    // 判断是否还有歌单，显示或隐藏更多按钮
                    showMore(res.more);
                    // 把返回的数据渲染到html上
                    var playlists = res.playlists;
                    if (playlists && playlists.length) {
                        var itemStr = "";
                        playlists.forEach(function (item) {
                            itemStr += `
                                <div class="item">
                                    <img class="cover" src="${item.coverImgUrl}" alt="" />
                                    <div class="count">
                                        <span class="icon"></span>
                                        <span>${item.playCount}</span>
                                    </div>
                                    <div class="name">${item.name}</div>
                                </div>
                            `;
                        });
                        // console.log(itemStr);

                        if (before) {
                            // 分页
                            $(".list").append(itemStr);
                        } else {
                            // 第一页
                            $(".list").html(itemStr);
                        }
                        lastUpdateTime = playlists[playlists.length - 1].updateTime;
                    }
                }
            },
            error: function (res) {
                console.log("error", res);
            },
            complete: function (res) {
                console.log("complete!");
                // console.log(res);
            },
        });
    }

    // 绑定事件
    var lastUpdateTime = "";
    function bindEvent() {
        $("#app .more").click(function (e) {
            console.log(this);
            $(this).hide();
            console.log(e);
            getCoverLsit(lastUpdateTime);
        });
    }
})();
