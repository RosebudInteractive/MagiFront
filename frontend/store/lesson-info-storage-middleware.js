import {
    PLAYER_SET_CURRENT_TIME,
    PLAYER_SET_VOLUME,
    PLAYER_SET_MUTE_STATE,
    PLAYER_START_INIT,
    PLAYER_SET_RATE, PLAYER_PAUSED, PLAYER_STOPPED, PLAYER_ENDED, PLAYER_START_PLAY,
} from '../constants/player'

import {SIGN_IN_SUCCESS, LOGOUT_SUCCESS} from "../constants/user";

import {LESSON_INFO_STORAGE_LOAD_FROM_DB_SUCCESS} from "../constants/lesson-info-storage";

import LessonInfoStorage from '../tools/player/lesson-info-storage'

import * as storageActions from '../actions/lesson-info-storage-actions';

const LessonInfoStorageMiddleware = store => next => action => {

    switch (action.type) {
        case PLAYER_START_INIT:
        case SIGN_IN_SUCCESS:
        case LOGOUT_SUCCESS: {
            let result = next(action)
            LessonInfoStorage.init()
            return result
        }

        case PLAYER_SET_CURRENT_TIME: {
            let _state = store.getState();

            let _isPlayingLessonExists = !!_state.player.playingLesson;
            if (_isPlayingLessonExists) {
                let _id = _state.player.playingLesson.lessonId,
                    _totalDuration = _state.player.totalDuration,
                    _lessonsMap = _state.lessonInfoStorage.lessons,
                    _currentPosition = _lessonsMap.has(_id) ? _lessonsMap.get(_id).currentTime : 0,
                    _newPosition = action.payload;

                if (Math.abs(_newPosition - _currentPosition) > 1) {
                    LessonInfoStorage.saveChanges()
                    LessonInfoStorage.setDeltaStart(_newPosition)
                } else {
                    LessonInfoStorage.setDeltaStart(_currentPosition)
                    LessonInfoStorage.hasChangedPosition();
                }

                store.dispatch(storageActions.setCurrentTimeForLesson({
                    id: _state.player.playingLesson.lessonId,
                    currentTime: _newPosition,
                    isFinished: Math.round(_newPosition) === _totalDuration
                }))
            }

            return next(action)
        }

        case PLAYER_SET_VOLUME: {
            store.dispatch(storageActions.setVolume(action.payload));
            return next(action)
        }

        case PLAYER_SET_MUTE_STATE: {
            store.dispatch(storageActions.setMuteState(action.payload));
            return next(action)
        }

        case PLAYER_SET_RATE:
        case PLAYER_PAUSED:
        case PLAYER_STOPPED: {
            LessonInfoStorage.saveChanges();
            return next(action)
        }

        case PLAYER_ENDED: {
            let _state = store.getState();

            let _isPlayingLessonExists = !!_state.player.playingLesson;
            if (_isPlayingLessonExists) {
                let _id = _state.player.playingLesson.lessonId;

                store.dispatch(storageActions.setLessonEnded({id: _id}))
                LessonInfoStorage.saveChanges()
            }

            return next(action)
        }

        case LESSON_INFO_STORAGE_LOAD_FROM_DB_SUCCESS: {
            LessonInfoStorage.applyLoadedPosition(action.payload)
            return next(action)
        }

        default:
            return next(action)
    }
}

export default LessonInfoStorageMiddleware;