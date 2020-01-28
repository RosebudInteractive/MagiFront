import {SIGN_IN_SUCCESS, SIGN_UP_SUCCESS, WHO_AM_I_SUCCESS,} from "../constants/user";
import {PLAYER_PLAYED, PLAYER_SET_CURRENT_TIME, PLAYER_SET_PROGRESS_PERCENT} from '../constants/player'
import {NOTIFY_GA_CHANGE_PAGE} from "ducks/app";

import {setProgressPercent} from "../actions/player-actions";
import {MAIL_SUBSCRIBE_SUCCESS} from "ducks/message";
import {store} from "./configureStore";
import {
    getNonRegisterTransaction,
    notifyUserIdChanged,
    notifyNewUserRegistered,
    setPlayerProgress, notifyPageChanged, notifyPlayerPlayed, GET_NON_REGISTER_TRANSACTION_SUCCESS
} from "ducks/google-analytics";
import PaymentsChecker from "tools/payments-checker";
import {SEND_PAYMENT_SUCCESS} from "ducks/billing";

const GoogleAnalyticsMiddleware = store => next => action => {

    switch (action.type) {

        case SIGN_IN_SUCCESS:
        case WHO_AM_I_SUCCESS: {
            let _prevState = store.getState().user

            let result = next(action)
            let _nextState = store.getState().user

            if ((!_prevState.user && _nextState.user) || (_prevState.user && _nextState.user && _prevState.user.Id !== _nextState.user.Id)) {
                Analytics.getInstance().sendUserId(_nextState.user.Id)
                Analytics.getInstance().loadNonRegisterTransactions()
            }

            return result
        }

        case NOTIFY_GA_CHANGE_PAGE: {
            let result = next(action)

            let _pathPrefix = window.location.protocol + '//' + window.location.host;

            Analytics.getInstance().sendPageChanged({
                'event': 'Pageview',
                'url': _pathPrefix + action.payload,
                'page_title': document.title
            });

            return result
        }

        case SIGN_UP_SUCCESS: {
            Analytics.getInstance().sendNewUserRegistered()

            return next(action)
        }

        case MAIL_SUBSCRIBE_SUCCESS: {
            if (window.dataLayer) {
                window.dataLayer.push({'event': 'subscribe'});
            }

            return next(action)
        }

        case PLAYER_PLAYED: {
            let _state = store.getState(),
                _authorName,
                _courseName,
                _lessonName,
                _totalDuration;

            let _isPlayingLessonExists = !!_state.player.playingLesson;
            if (_isPlayingLessonExists) {
                _totalDuration = _state.player.totalDuration
                _authorName = _state.lessonPlayInfo.playInfo.authorName
                _courseName = _state.lessonPlayInfo.playInfo.courseName
                _lessonName = _state.lessonPlayInfo.playInfo.Name
            }

            Analytics.getInstance().sendPlayerPlayed({
                'event': 'play',
                'dimension1': _lessonName,
                'dimension2': _courseName,
                'dimension3': _authorName,
                'metric3': _totalDuration
            });

            return next(action)
        }

        case PLAYER_SET_CURRENT_TIME: {
            let _state = store.getState();

            let _isPlayingLessonExists = !!_state.player.playingLesson;
            if (_isPlayingLessonExists) {
                let _totalDuration = _state.player.totalDuration,
                    _newPosition = action.payload,
                    _percent = Math.round(_newPosition * 100 / _totalDuration)

                if ((_percent >= 10) && (_percent < 25)) {
                    store.dispatch(setProgressPercent(10))
                } else if ((_percent >= 25) && (_percent < 50)) {
                    store.dispatch(setProgressPercent(25))
                } else if ((_percent >= 50) && (_percent < 75)) {
                    store.dispatch(setProgressPercent(50))
                } else if ((_percent >= 75) && (_percent < 90)) {
                    store.dispatch(setProgressPercent(75))
                } else if ((_percent >= 90) && (_percent <= 97)) {
                    store.dispatch(setProgressPercent(90))
                } else if (_percent > 97) {
                    store.dispatch(setProgressPercent(100))
                }
            }

            return next(action)
        }

        case PLAYER_SET_PROGRESS_PERCENT: {
            let _state = store.getState(),
                _oldValue = _state.player.progressPercent,
                _authorName,
                _courseName,
                _lessonName,
                _totalDuration;

            let _isPlayingLessonExists = !!_state.player.playingLesson;
            if (_isPlayingLessonExists) {
                _totalDuration = _state.player.totalDuration
                _authorName = _state.lessonPlayInfo.playInfo.authorName
                _courseName = _state.lessonPlayInfo.playInfo.courseName
                _lessonName = _state.lessonPlayInfo.playInfo.Name
            }

            let result = next(action),
                _newValue = action.payload;

            if (_oldValue !== _newValue) {
                Analytics.getInstance().sendPlayerProgress({
                    'event': 'play_' + _newValue,
                    'dimension1': _lessonName,
                    'dimension2': _courseName,
                    'dimension3': _authorName,
                    'metric3': _totalDuration
                })
            }

            return result;
        }

        case GET_NON_REGISTER_TRANSACTION_SUCCESS: {
            let _data = action.payload

            if (_data && Array.isArray(_data) && _data.length > 0) {
                PaymentsChecker.clear()
            } else {
                if (PaymentsChecker.hasPendingPayment()) {
                    PaymentsChecker.startPing()
                }
            }

            return next(action)
        }

        case SEND_PAYMENT_SUCCESS: {
            PaymentsChecker.setPaymentDate()

            return next(action)
        }


        default:
            return next(action)
    }
}

let _instance = null;

class Analytics {

    static getInstance() {
        if (!_instance) {
            _instance = new Analytics()
        }

        return _instance
    }

    loadNonRegisterTransactions() {
        store.dispatch(getNonRegisterTransaction());
    }

    sendUserId(userId) {
        store.dispatch(notifyUserIdChanged(userId));
    }

    sendNewUserRegistered() {
        store.dispatch(notifyNewUserRegistered());
    }

    sendPlayerProgress(data){
        store.dispatch(setPlayerProgress(data))
    }

    sendPlayerPlayed(data){
        store.dispatch(notifyPlayerPlayed(data))
    }

    sendPageChanged(data){
        store.dispatch(notifyPageChanged(data))
    }
}

export default GoogleAnalyticsMiddleware;