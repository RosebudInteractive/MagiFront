import AppPlayer from "./wrapper";

import 'script-lib/../widgets/work-shop/work-shop-custom.css'
import 'script-lib/../widgets/work-shop/player.css'
import './player-app-test.css'
import 'script-lib/../widgets/work-shop/player-for-native-app.css'
import '../../css/font-awesome.css'
import '../../css/general-player.css'
import 'jquery-ui/jquery-ui.min.css';
import 'jquery-ui/jquery-ui.structure.min.css';

let listener = (event) => {
    let _data = event.data;
    if (_data) {
        try {
            _data = JSON.parse(_data);
            $('.debug_console').append("<div class='debug_message'>" + _data.playerId + ' : ' + _data.eventName + "</div>")
        } catch (e) {
            console.error(e.message);
        }

    }
}

(function ($) {
    $(document).ready(function () {

        window.addEventListener("message", listener);

        new AppPlayer({debug: true})

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
                    window.magisteriaPlayer.setData({data, playerId: 'test-1234', position: 10})
                })
                .catch((err) => {
                    console.error(err);
                })
        })

        $('.play_btn').on('click', () => {
            window.magisteriaPlayer.play({playerId: window.magisteriaPlayer._id})
        })

        $('.play_from_pos_btn').on('click', () => {
            let _position = $('#init_position').val();
            window.magisteriaPlayer.play({position: _position, playerId: window.magisteriaPlayer._id})
        })

        $('.set_position_btn').on('click', () => {
            let _position = $('#position').val();
            window.magisteriaPlayer.seek({position:_position, playerId: window.magisteriaPlayer._id})
        })

        $('.pause_btn').on('click', () => {
            window.magisteriaPlayer.pause({playerId: window.magisteriaPlayer._id})
        })

        $('.set_rate_btn').on('click', () => {
            let _rate = $('#rate').val();
            window.magisteriaPlayer.setPlaybackSpeed({rate: _rate, playerId: window.magisteriaPlayer._id})
        })

        $('.test_start_btn').on('click', () => {
            setTimeout(() => {
                window.magisteriaPlayer.play({position: 5, playerId: window.magisteriaPlayer._id})
            }, 1000)
        })


    });
})(jQuery)
