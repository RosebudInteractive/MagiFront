import * as Player from '../tools/player/nested-player';
import NoSleep from 'nosleep.js';

import {
    PLAYER_START_PLAY,
    PLAYER_START_REPLAY,
    PLAYER_START_PAUSE,
    PLAYER_START_STOP,
    PLAYER_START_SET_CURRENT_TIME,
    PLAYER_TOGGLE_MUTE,
    PLAYER_START_SET_VOLUME,
    PLAYER_START_SET_RATE,
    PLAYER_SET_SMALL_VIEWPORT,
    PLAYER_SET_FULL_VIEWPORT,
    PLAYER_CLEAR_FULL_VIEWPORT, PLAYER_CANCEL_START,
} from '../constants/player'

import {
    CLEAR_LESSON_PLAY_INFO,
    GET_LESSON_PLAY_INFO_REQUEST,
    SET_LESSON_PLAY_INFO_LOADED,
} from '../constants/lesson'

import {
    SWITCH_TO_SMALL_PLAYER,
    SWITCH_TO_FULL_PLAYER,
    DUMMY_SWITCH_TO_SMALL_PLAYER,
} from '../constants/app'

import * as storageActions from "../actions/lesson-info-storage-actions";

const noSleep = new NoSleep();

const playerMiddleware = store => next => action => {
    switch (action.type) {

        case SET_LESSON_PLAY_INFO_LOADED: {
            let _state = store.getState();

            Player.loadPlayInfo(_state.lessonPlayInfo.playInfo, action.payload.initState)

            return next(action)
        }

        case GET_LESSON_PLAY_INFO_REQUEST: {
            let _state = store.getState();

            Player.clearPlayInfo(_state.lessonPlayInfo.playInfo)

            _noSleepEnable();

            return next(action)
        }

        case PLAYER_START_PLAY: {
            let _state = store.getState(),
                _isFinished = false,
                _id = null,
                _lessonsMap = _state.lessonInfoStorage.lessons;

            _isFinished = _lessonsMap.has(action.payload.lessonId) ? _lessonsMap.get(action.payload.lessonId).isFinished : false;
            if (_isFinished) {
                store.dispatch(storageActions.restoreLesson(action.payload.lessonId));
            }

            let _isPlayingLessonExists = !!_state.player.playingLesson;
            if (_isPlayingLessonExists) {
                _id = _state.player.playingLesson.lessonId;
            }

            if ((_id === action.payload.lessonId) && Player.getInstance()) {
                if (_isFinished) {
                    Player.getInstance().replay()
                } else {
                    // Player.getInstance().play({force: !!action.payload.force})
                    Player.getInstance().play({force: false})
                }
            }

            _noSleepEnable();

            return next(action)
        }

        case PLAYER_START_REPLAY: {
            if (Player.getInstance()) {
                Player.getInstance().replay()
            }

            _noSleepEnable();

            return next(action)
        }

        case PLAYER_START_PAUSE: {
            if (Player.getInstance()) {
                Player.getInstance().pause()
            }

            _noSleepDisable();

            return next(action)
        }

        case PLAYER_START_STOP: {
            if (Player.getInstance()) {
                Player.getInstance().stop()
            }

            _noSleepDisable();

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

        case PLAYER_CLEAR_FULL_VIEWPORT: {
            Player.clearFullViewPort(action.payload);
            return next(action)
        }

        case SWITCH_TO_SMALL_PLAYER: {
            let _player = Player.getInstance();

            if (_player) {
                _player.switchToSmall()
            }

            _noSleepDisable();

            return next(action)
        }

        case PLAYER_CANCEL_START: {
            let _playerState = store.getState().player,
                _isStarting = _playerState ? _playerState.starting : false;

            if (_isStarting) {
                Player.cancelStarting(action.payload)
                store.dispatch({
                    type: CLEAR_LESSON_PLAY_INFO,
                    payload: null,
                })
            }

            _noSleepDisable();

            return next(action)
        }

        case DUMMY_SWITCH_TO_SMALL_PLAYER: {
            let _player = Player.getInstance();
            if (_player) {
                _player.switchToSmall()
            }

            _noSleepDisable();

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

const _noSleepEnable = () => {
    noSleep.enable()
}

const _noSleepDisable = () => {
    if (noSleep._wakeLock || (noSleep.noSleepVideo && !noSleep.noSleepVideo.paused)) {
        noSleep.disable()
    }
}