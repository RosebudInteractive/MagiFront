import {SIGN_UP_SUCCESS,} from "../constants/user";
import {PLAYER_PLAYED, PLAYER_SET_CURRENT_TIME, PLAYER_SET_PROGRESS_PERCENT} from '../constants/player'

import {setProgressPercent} from "../actions/player-actions";

const GoogleAnalyticsMiddleware = store => next => action => {

    switch (action.type) {

        case SIGN_UP_SUCCESS: {
            window.dataLayer.push({'event': 'reg'});
            return next(action)
        }

        case PLAYER_PLAYED: {
            window.dataLayer.push({'event': 'play'});
            return next(action)
        }

        case PLAYER_SET_CURRENT_TIME: {
            let _state = store.getState();

            let _isPlayingLessonExists = !!_state.player.playingLesson;
            if (_isPlayingLessonExists) {
                let _totalDuration = _state.player.totalDuration,
                    _newPosition = action.payload,
                    _percent = Math.round(_newPosition * 100/_totalDuration);

                if ((_percent >= 10) && (_percent < 25)) {
                    store.dispatch(setProgressPercent(10))
                } else if ((_percent >=25) && (_percent < 50)) {
                    store.dispatch(setProgressPercent(25))
                } else if ((_percent >=50) && (_percent < 75)) {
                    store.dispatch(setProgressPercent(50))
                } else if ((_percent >=75) && (_percent < 90)) {
                    store.dispatch(setProgressPercent(90))
                } else if (_percent >=90){
                    store.dispatch(setProgressPercent(90))
                }
            }

            return next(action)
        }

        case PLAYER_SET_PROGRESS_PERCENT: {
            let _state = store.getState(),
                _oldValue = _state.player.progressPercent;

            let result = next(action),
                _newValue = action.payload;

            if (_oldValue !== _newValue) {
                window.dataLayer.push({'event': 'play_' + _newValue});
            }

            return result;
        }

        default:
            return next(action)
    }
}

export default GoogleAnalyticsMiddleware;