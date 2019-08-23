import Loader from '../components/player/play-info-loader'

import {
    PLAYER_START_PLAY_LESSON,
} from '../constants/player'

import {
    GET_LESSON_PLAY_INFO_SUCCESS,
} from '../constants/lesson'

import * as playerActions from '../actions/player-actions'

const loaderMiddleware = store => next => action => {

    switch (action.type) {
        case PLAYER_START_PLAY_LESSON: {
            let _state = store.getState();

            let _loadRequiredLesson = (_state.lessonPlayInfo.requestId === action.payload.Id) && (_state.lessonPlayInfo.fetching);
            if (!_loadRequiredLesson) {
                let _needLoadEmptyPlayer = !_state.lessonPlayInfo.playInfo && action.payload,
                    _needLoadOtherLesson =  _state.lessonPlayInfo.playInfo && action.payload && (_state.lessonPlayInfo.playInfo.id !== action.payload.Id);

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
                let _id = _state.lessonPlayInfo.playInfo.id,
                    _lessonInfo = _state.lessonInfoStorage.lessons.get(_id),
                    _currentTime = _lessonInfo ? _lessonInfo.currentTime : 0,
                    _initState = {
                        currentTime : _currentTime,
                        muted: _state.lessonInfoStorage.muted,
                        volume: _state.lessonInfoStorage.volume,
                    };

                store.dispatch(playerActions.setVolume(_state.lessonInfoStorage.volume));
                store.dispatch(playerActions.setMuteState(_state.lessonInfoStorage.muted));

                Loader.notifyPlayInfoLoaded({
                    lessonId : _id,
                    courseUrl : _state.lessonPlayInfo.playInfo.courseUrl,
                    lessonUrl : _state.lessonPlayInfo.playInfo.lessonUrl,
                    Number : _state.lessonPlayInfo.playInfo.Number,
                    Name : _state.lessonPlayInfo.playInfo.Name,
                    initState : _initState,
                })
            }

            return result
        }

        default:
            return next(action)
    }
}

export default loaderMiddleware;