import * as Player from '../components/player/nested-player';
import {
    PLAYER_START_PLAY,
    PLAYER_START_PAUSE,
    PLAYER_START_STOP,
    PLAYER_START_SET_CURRENT_TIME,
    PLAYER_TOGGLE_MUTE,
    PLAYER_START_SET_VOLUME, PLAYER_START_SET_RATE,
} from '../constants/player'

const playerMiddleware = store => next => action => {
    switch (action.type) {
        case PLAYER_START_PLAY: {
            console.log(store)
            if (Player.getInstance()) {
                Player.getInstance().play()
            }
            return next(action)
        }

        case PLAYER_START_PAUSE: {
            if (Player.getInstance()) {
                Player.getInstance().pause()
            }
            return next(action)
        }

        case PLAYER_START_STOP: {
            if (Player.getInstance()) {
                Player.getInstance().stop()
            }
            return next(action)
        }

        case PLAYER_START_SET_CURRENT_TIME: {
            if (Player.getInstance()) {
                Player.getInstance().setPosition(action.payload)
            }
            return next(action)
        }

        case PLAYER_START_SET_RATE: {
            if (Player.getInstance()) {
                Player.getInstance().setRate(action.payload)
            }
            return next(action)
        }

        case PLAYER_TOGGLE_MUTE: {
            let _player = Player.getInstance();
            if (_player) {
                if (_player.audioState.muted) {
                    _player.unmute()
                } else {
                    _player.mute()
                }
            }
            return next(action)
        }

        case PLAYER_START_SET_VOLUME: {
            let _player = Player.getInstance();
            if (_player) {
                if (_player.audioState.muted) {
                    _player.unmute()
                }
                _player.setVolume(action.payload)
            }
            return next(action)
        }

        default:
            return next(action)
    }
}

export default playerMiddleware;