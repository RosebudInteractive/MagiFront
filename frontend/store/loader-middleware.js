import Loader from '../components/player/play-info-loader'

import {
    PLAYER_START_PLAY_LESSON,
} from '../constants/player'

import {
    GET_LESSON_PLAY_INFO_SUCCESS,
} from '../constants/lesson'

const loaderMiddleware = store => next => action => {

    switch (action.type) {
        case PLAYER_START_PLAY_LESSON: {
            let _state = store.getState();

            let _loadRequiredLesson = (_state.lessonPlayInfo.requestId === action.payload.Id) && (_state.lessonPlayInfo.fetching);
            if (!_loadRequiredLesson) {
                let _needLoadEmptyPlayer = !_state.lessonPlayInfo.playInfo && action.payload,
                    _needLoadOtherLesson =  _state.lessonPlayInfo.playInfo && action.payload && (_state.lessonPlayInfo.playInfo.Id !== action.payload.Id);

                if (_needLoadEmptyPlayer || _needLoadOtherLesson) {
                    Loader.startLoadLesson(action.payload)
                }
            }

            return next(action)
        }

        case GET_LESSON_PLAY_INFO_SUCCESS: {
            let result = next(action)
            let _state = store.getState();

            if (_state.lessonPlayInfo.playInfo && !_state.lessonPlayInfo.fetching) {
                Loader.notyfyPlayInfoLoaded({
                    lessonId : _state.lessonPlayInfo.playInfo.Id,
                    courseUrl : _state.lessonPlayInfo.playInfo.courseUrl,
                    lessonUrl : _state.lessonPlayInfo.playInfo.lessonUrl,
                })
            }

            return result
        }

        default:
            return next(action)
    }
}

export default loaderMiddleware;