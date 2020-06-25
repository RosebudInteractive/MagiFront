import {
    PLAYER_SET_CURRENT_TIME,
    PLAYER_SET_VOLUME,
    PLAYER_SET_MUTE_STATE,
    PLAYER_START_INIT,
    PLAYER_SET_RATE,
    PLAYER_PAUSED,
    PLAYER_STOPPED,
    PLAYER_ENDED,
    FINISH_DELTA_TIME,
} from '../constants/player'

import {SIGN_IN_SUCCESS, LOGOUT_SUCCESS, WHO_AM_I_SUCCESS} from "../constants/user";

import {
    LESSON_INFO_STORAGE_LOAD_FROM_DB_SUCCESS,
    LESSON_INFO_STORAGE_REFRESH_DB_SUCCESS,
    LESSON_INFO_STORAGE_UPDATE_DB_SUCCESS,
    LESSON_INFO_STORAGE_RESTORE_LESSON,
    // LESSON_INFO_STORAGE_SET_LESSON_ENDED,
} from "../constants/lesson-info-storage";

import LessonInfoStorage from '../tools/player/lesson-info-storage'

import * as storageActions from '../actions/lesson-info-storage-actions';
import {GET_LESSON_PLAY_INFO_REQUEST} from "../constants/lesson";
import CourseDiscounts from "tools/course-discount";

const LessonInfoStorageMiddleware = store => next => action => {

    switch (action.type) {
        case PLAYER_START_INIT:{
            let result = next(action)
            LessonInfoStorage.init()
            return result
        }

        case GET_LESSON_PLAY_INFO_REQUEST: {
            LessonInfoStorage.clearDeltaStart(action.payload)
            return next(action)
        }


        case SIGN_IN_SUCCESS:
        case LOGOUT_SUCCESS: {
            LessonInfoStorage.clear();
            let result = next(action)
            LessonInfoStorage.init()
            return result
        }

        case WHO_AM_I_SUCCESS: {
            let _state = store.getState();
            let _oldUser = _state.user.user;
            let result = next(action)
            _state = store.getState();
            let _newUser = _state.user.user;

            if ((!_oldUser && _newUser) || (_oldUser.Id !== _newUser.Id)) {
                LessonInfoStorage.clear();
                LessonInfoStorage.init()
            }
            return result
        }

        case PLAYER_SET_CURRENT_TIME: {
            let _state = store.getState();

            const _isPlayingLessonExists = !!_state.player.playingLesson,
                _authorized = !!_state.user.user

            if (_isPlayingLessonExists) {
                let _id = _state.player.playingLesson.lessonId,
                    _lessonsMap = _state.lessonInfoStorage.lessons,
                    _currentPosition = _lessonsMap.has(_id) ? _lessonsMap.get(_id).currentTime : 0,
                    _newPosition = action.payload

                store.dispatch(storageActions.setCurrentTimeForLesson({
                    id: _id,
                    currentTime: _newPosition,
                    needSetTS: !_authorized,
                }))

                if (Math.abs(_newPosition - _currentPosition) > 1) {
                    LessonInfoStorage.calcDelta(_currentPosition, _newPosition, _id)
                    LessonInfoStorage.saveChanges()
                } else {
                    LessonInfoStorage.setDeltaStart(_currentPosition, _id)
                    LessonInfoStorage.hasChangedPosition();
                }
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

        case PLAYER_SET_RATE: {
            let _state = store.getState()

            let _currentRate = _state.player.rate,
                _isInitSet = _currentRate === 0,
                _rateHasChanged = _currentRate !== action.payload

            if (!_isInitSet && _rateHasChanged) {
                LessonInfoStorage.saveChanges();
            }

            return next(action)
        }


        case PLAYER_STOPPED: {
            LessonInfoStorage.saveChanges();
            return next(action)
        }

        case PLAYER_PAUSED: {
            let _state = store.getState();

            let _isPlayingLessonExists = !!_state.player.playingLesson;
            if (_isPlayingLessonExists) {
                let _id = _state.player.playingLesson.lessonId,
                    _totalDuration = _state.player.totalDuration,
                    _lessonsMap = _state.lessonInfoStorage.lessons,
                    _currentPosition = _lessonsMap.has(_id) ? _lessonsMap.get(_id).currentTime : 0,
                    _isFinished = _lessonsMap.has(_id) ? _lessonsMap.get(_id).isFinished : false,
                    _willBeFinished = Math.round(_totalDuration - _currentPosition) <= FINISH_DELTA_TIME;

                if (_willBeFinished && !_isFinished) {
                    store.dispatch(storageActions.setLessonEnded({id: _id}))
                    LessonInfoStorage.saveChanges()
                    LessonInfoStorage.clearDeltaStart(_id)
                }
            }

            return next(action)
        }

        case PLAYER_ENDED: {
            let _state = store.getState();

            let _isPlayingLessonExists = !!_state.player.playingLesson;
            if (_isPlayingLessonExists) {
                let _id = _state.player.playingLesson.lessonId,
                    _lessonsMap = _state.lessonInfoStorage.lessons,
                    _isFinished = _lessonsMap.has(_id) ? _lessonsMap.get(_id).isFinished : false

                if (!_isFinished) {
                    store.dispatch(storageActions.setLessonEnded({id: _id}))
                    LessonInfoStorage.saveChanges()
                    LessonInfoStorage.clearDeltaStart(_id)
                }
            }

            return next(action)
        }

        case LESSON_INFO_STORAGE_LOAD_FROM_DB_SUCCESS:
        case LESSON_INFO_STORAGE_UPDATE_DB_SUCCESS:
        case LESSON_INFO_STORAGE_REFRESH_DB_SUCCESS: {
            LessonInfoStorage.applyLoadedPosition(action.payload)
            return next(action)
        }

        case LESSON_INFO_STORAGE_RESTORE_LESSON: {
            let _state = store.getState();

            const _isPlayingLessonExists = !!_state.player.playingLesson,
                _authorized = !!_state.user.user

            if (_isPlayingLessonExists) {
                let _id = _state.player.playingLesson.lessonId

                store.dispatch(storageActions.setCurrentTimeForLesson({
                    id: _id,
                    currentTime: 0,
                    needSetTS: !_authorized,
                }))
                LessonInfoStorage.saveChanges()

            }

            return next(action)
        }

        default:
            return next(action)
    }
}

export default LessonInfoStorageMiddleware;
