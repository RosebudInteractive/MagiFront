import {
    PLAYER_SET_CURRENT_TIME,
    PLAYER_SET_VOLUME,
    PLAYER_SET_MUTE_STATE,
    PLAYER_START_INIT,
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
                LessonInfoStorage.hasChangedPosition();
                store.dispatch(storageActions.setCurrentTimeForLesson({id : _state.player.playingLesson.lessonId, currentTime: action.payload}))
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

        case LESSON_INFO_STORAGE_LOAD_FROM_DB_SUCCESS: {
            LessonInfoStorage.applyLoadedPosition(action.payload)
            return next(action)
        }

        default:
            return next(action)
    }
}

export default LessonInfoStorageMiddleware;