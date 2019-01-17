import AppPlayer from "./wrapper";

import 'script-lib/../widgets/work-shop/work-shop-custom.css'
import 'script-lib/../widgets/work-shop/player.css'
import './player-app-test.css'
import 'script-lib/../widgets/work-shop/player-for-native-app.css'
import '../../css/font-awesome.css'
import '../../css/general-player.css'
import 'jquery-ui/jquery-ui.min.css';
import 'jquery-ui/jquery-ui.structure.min.css';
import PlayerEmulator from "./ext-player-emulator";

let _externalPlayer = true;
let _currentType = 'external';
let _currentTime = 0;

let listener = (event) => {
    let _data = event.data;
    if (_data) {
        _data = JSON.parse(_data);
        $('.debug_console').append("<div class='debug_message'>" + _data.playerId + ' : ' + _data.eventName + "</div>")
    }
}

(function ($) {
    $(document).ready(function () {

        window.addEventListener("message", listener);

        new AppPlayer({debug: true, externalPlayer: _externalPlayer});

        let _extPlayer = null;

        if (_externalPlayer) {
            _extPlayer = new PlayerEmulator({view: window.magisteriaPlayer})
        }

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

        $('#player-type input').change((e) => {
            if (e.target.value !== _currentType) {
                _currentTime = e.target.value;

                _externalPlayer = _currentTime === 'external'
                new AppPlayer({debug: true, externalPlayer: _externalPlayer});

                if (_externalPlayer) {
                    _extPlayer = new PlayerEmulator({view: window.magisteriaPlayer})
                } else  {
                    _extPlayer = null
                }
            }
        });

        $('.set_data_btn').on('click', () => {
            let _id = $('#lecture-id').val();
            getData(_id)
                .then((data) => {
                    if (_externalPlayer) {
                        _extPlayer.setData(data)
                    } else {
                        window.magisteriaPlayer.setData(data)
                    }
                })
                .catch((err) => {
                    console.error(err);
                })
        })

        $('.play_btn').on('click', () => {
            if (_externalPlayer) {
                _extPlayer.play({})
            } else {
                window.magisteriaPlayer.play({playerId: window.magisteriaPlayer._id})
            }
        })

        $('.play_from_pos_btn').on('click', () => {
            let _position = $('#init_position').val();
            if (_externalPlayer) {
                _extPlayer.play({position: +_position})
            } else {
                window.magisteriaPlayer.play({position: +_position, playerId: window.magisteriaPlayer._id})
            }
        })

        $('.set_position_btn').on('click', () => {
            let _position = $('#position').val();
            if (_externalPlayer) {
                _extPlayer.seek({position: +_position})
            } else {
                window.magisteriaPlayer.seek({position: +_position, playerId: window.magisteriaPlayer._id})
            }
        })

        $('.pause_btn').on('click', () => {
            if (_externalPlayer) {
                _extPlayer.pause()
            } else {
                window.magisteriaPlayer.pause({playerId: window.magisteriaPlayer._id})
            }
        })

        $('.set_rate_btn').on('click', () => {
            let _rate = $('#rate').val();

            if (_externalPlayer) {
                _extPlayer.setPlaybackSpeed(+_rate)
            } else {
                window.magisteriaPlayer.setPlaybackSpeed({rate: _rate, playerId: window.magisteriaPlayer._id})
            }
        })

        $('.test_start_btn').on('click', () => {
            setTimeout(() => {
                window.magisteriaPlayer.play({position: 5, playerId: window.magisteriaPlayer._id})
            }, 1000)
        })


    });
})(jQuery)
