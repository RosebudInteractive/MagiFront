import * as Player from '../components/player/nested-player';

import {
    PLAYER_START_PLAY,
    PLAYER_START_PAUSE,
    PLAYER_START_STOP,
    PLAYER_START_SET_CURRENT_TIME,
    PLAYER_TOGGLE_MUTE,
    PLAYER_START_SET_VOLUME,
    PLAYER_START_SET_RATE,
    PLAYER_SET_SMALL_VIEWPORT,
    PLAYER_SET_FULL_VIEWPORT,
} from '../constants/player'

import {
    SET_LESSON_PLAY_INFO_LOADED,
} from '../constants/lesson'

import {
    SWITCH_TO_SMALL_PLAYER,
    SWITCH_TO_FULL_PLAYER,
    DUMMY_SWITCH_TO_SMALL_PLAYER,
} from '../constants/app'

const playerMiddleware = store => next => action => {
    switch (action.type) {

        case SET_LESSON_PLAY_INFO_LOADED: {
            let _state = store.getState();

            Player.loadPlayInfo(_state.lessonPlayInfo.playInfo)

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

        case PLAYER_SET_SMALL_VIEWPORT: {
            Player.setSmallViewPort(action.payload);
            return next(action)
        }

        case PLAYER_SET_FULL_VIEWPORT: {
            Player.setFullViewPort(action.payload);
            return next(action)
        }

        case SWITCH_TO_SMALL_PLAYER: {
            let _player = Player.getInstance();
            if (_player) {
                _player.switchToSmall()
            }
            return next(action)
        }

        case DUMMY_SWITCH_TO_SMALL_PLAYER: {
            let _player = Player.getInstance();
            if (_player) {
                _player.switchToSmall()
            }
            return next(action)
        }

        case SWITCH_TO_FULL_PLAYER: {
            let _player = Player.getInstance();
            if (_player) {
                _player.switchToFull()
            }
            return next(action)
        }

        default:
            return next(action)
    }
}

export default playerMiddleware;