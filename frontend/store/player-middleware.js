import * as Player from '../components/player/nested-player';
import Loader from '../components/player/play-info-loader'

import {
    PLAYER_START_PLAY_LESSON,
    PLAYER_START_PLAY,
    PLAYER_START_PAUSE,
    PLAYER_START_STOP,
    PLAYER_START_SET_CURRENT_TIME,
    PLAYER_TOGGLE_MUTE,
    PLAYER_START_SET_VOLUME,
    PLAYER_START_SET_RATE,
} from '../constants/player'

import {
    GET_LESSON_PLAY_INFO_SUCCESS,
} from '../constants/lesson'

const playerMiddleware = store => next => action => {
    switch (action.type) {
        case PLAYER_START_PLAY_LESSON: {
            let _needLoadEmptyPlayer = !store.player.playingLesson && action.payload,
                _needLoadOtherLesson =  store.player.playingLesson && action.payload && (store.player.playingLesson.Id !== action.payload.Id);

            if (_needLoadEmptyPlayer || _needLoadOtherLesson) {
                Loader.startLoadLesson(action.payload)
            }

            return next(action)
        }

        case GET_LESSON_PLAY_INFO_SUCCESS: {
            return next(action)
        }

        case PLAYER_START_PLAY: {
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