import AppPlayer from "./wrapper";

import 'script-lib/../widgets/work-shop/work-shop-custom.css'
import 'script-lib/../widgets/work-shop/player.css'
import 'script-lib/../widgets/work-shop/player-app-test.css'
import 'script-lib/../widgets/work-shop/player-for-native-app.css'
import '../../css/font-awesome.css'
import '../../css/general-player.css'
import 'jquery-ui/jquery-ui.min.css';
import 'jquery-ui/jquery-ui.structure.min.css';

(function ($) {
    $(document).ready(function () {

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

        $('.set_data_btn').on('click', () => {
            let _id = $('#lecture-id').val();
            getData(_id)
                .then((data) => {
                    window.magisteriaPlayer.setData(data)

                })
                .catch((err) => {
                    console.error(err);
                })
        })

        $('.play_btn').on('click', () => {
            window.magisteriaPlayer.play()
        })

        $('.play_from_pos_btn').on('click', () => {
            let _position = $('#init_position').val();
            window.magisteriaPlayer.play({position: _position})
        })

        $('.set_position_btn').on('click', () => {
            let _position = $('#position').val();
            window.magisteriaPlayer.seek(_position)
        })

        $('.pause_btn').on('click', () => {
            window.magisteriaPlayer.pause()
        })

        $('.set_rate_btn').on('click', () => {
            let _rate = $('#rate').val();
            window.magisteriaPlayer.setPlaybackSpeed(_rate)
        })
    });
})(jQuery)
