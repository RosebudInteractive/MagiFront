import AppPlayer from "./player-app-class";

import 'script-lib/../widgets/work-shop/work-shop-custom.css'
import 'script-lib/../widgets/work-shop/player.css'
import '../css/font-awesome.css'
import '../css/general-player.css'
import 'jquery-ui/jquery-ui.min.css';
import 'jquery-ui/jquery-ui.structure.min.css';

(function ($) {
    $(document).ready(function () {
        new AppPlayer();

        function getData(id) {
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: "/api/lessons/play/" + id,
                    type: "GET",
                    dataType: "json",
                    responseType: 'json',
                    success: function (result) {
                        resolve(result);
                    },
                    fail: function (err) {
                        reject(err);
                    }
                });
            })
        }

        $(".ctl-buttons").find("button").click(function () {
            var role = $(this).attr("role");

            if (role == "play") pl.play();
            else if (role == "pause") pl.pause();
            else {
                var curr = pl.getCurrent();
                console.log(curr);
            }
        })

        $(".ctl-buttons").find("select[role='rate']").change(function () {
            var rate = $(this).find("option:selected").val();
            pl.setRate(rate);
        });

        $(".ctl-buttons").find("select[role='volume']").change(function () {
            var v = $(this).find("option:selected").val();
            pl.setVolume(v);
        });

        $(".ctl-buttons").find("input[role='mute']").change(function () {
            var v = $(this).prop("checked");
            pl.setMute(!v);
        });

        $(".ctl-buttons").find("input[role='position-btn']").click(function () {
            var v = $(".ctl-buttons").find("input[role='position']").val();
            pl.setPosition(+v || 0);
        });

        $(".ctl-buttons").find("select[role='player']").change(function () {
            var plNum = $(this).find("option:selected").val();
            var oldPl = null;
            if (+plNum == 1) {
                pl = pl1;
                oldPl = pl2;
            }
            else {
                pl = pl2;
                oldPl = pl1;
            }

            pl.setPosition(oldPl.getPosition());
            if (!oldPl.getStopped()) {
                oldPl.pause();
                pl.play();
            }
        });

        $(".ctl-buttons").find("input[role='video']").change(function () {
            var v = $(this).prop("checked");
            if (!!v) pl.setVideoOn();
            else pl.setVideoOff()
        });

        $(".ctl-buttons").find("input[role='lecture-id-btn']").click(function () {
            var v = $(".ctl-buttons").find("input[role='lecture-id']").val();
            getData(v)
                .then((result) => {
                    pl1.setData(result);
                    pl2.setData(result);
                    var content = pl.getLectureContent();
                    renderContent(content);

                })
                .catch((err) => {
                    console.error(err);
                })
        });

        // });
    });
})(jQuery)
