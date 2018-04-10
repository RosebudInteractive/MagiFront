import {
    PLAYER_SET_CURRENT_TIME,
} from '../constants/player'

import * as storageActions from '../actions/lesson-info-storage-actions';

const LessonInfoStorageMiddleware = store => next => action => {

    switch (action.type) {
        case PLAYER_SET_CURRENT_TIME: {
            let _state = store.getState();

            let _isPlayingLessonExists = !!_state.player.playingLesson;
            if (_isPlayingLessonExists) {
                store.dispatch(storageActions.setCurrentTimeForLesson({id : _state.player.playingLesson.lessonId, currentTime: action.payload}))
            }

            return next(action)
        }

        default:
            return next(action)
    }
}

export default LessonInfoStorageMiddleware;