import AppPlayer from "./player-app-class";

import 'script-lib/../widgets/work-shop/work-shop-custom.css'
import 'script-lib/../widgets/work-shop/player.css'
import '../css/font-awesome.css'
import '../css/general-player.css'
import 'jquery-ui/jquery-ui.min.css';
import 'jquery-ui/jquery-ui.structure.min.css';

(function ($) {
    $(document).ready(function () {
        let _playerInited = false;

        new AppPlayer()

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
            let role = $(this).attr("role");

            if (role === "play") {
                if (!_playerInited) {
                    getData(1)
                        .then((data) => {
                            // window.magisteriaPlayer.render();
                            window.magisteriaPlayer.setData(data)
                            _playerInited = true;
                        })
                } else {
                    window.magisteriaPlayer.play()
                }


            }
            else if (role === "pause") window.magisteriaPlayer.pause();
        })
    });
})(jQuery)
