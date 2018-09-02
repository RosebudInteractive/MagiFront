import {
    PLAYER_PLAYED,
    PLAYER_PAUSED,
    PLAYER_STOPPED,
    PLAYER_SET_CURRENT_TIME,
    PLAYER_SET_TITLE,
    PLAYER_SET_MUTE_STATE,
    PLAYER_SET_VOLUME,
    PLAYER_SET_CURRENT_CONTENT,
    PLAYER_SET_RATE,
    PLAYER_SET_CONTENT_ARRAY,
    PLAYER_ENDED,
    PLAYER_SET_BUFFERED_TIME,
    SHOW_CONTENT_TOOLTIP,
    HIDE_CONTENT_TOOLTIP,
    SHOW_SPEED_TOOLTIP,
    HIDE_SPEED_TOOLTIP, PLAYER_START_PLAY_LESSON,
} from '../constants/player';

import * as tools from '../tools/time-tools'

import {
    SET_LESSON_PLAY_INFO_LOADED,
    GET_LESSON_PLAY_INFO_REQUEST,
} from '../constants/lesson'

const initialState = {
    currentTime: 0,
    bufferedTime: 0,
    currentContent: null,
    starting: false,
    paused: true,
    ended: false,
    muted: false,
    volume: 0,
    rate: 0,
    title: '',
    subTitle: '',
    totalDurationFmt: '',
    totalDuration: 0,
    contentArray: [],
    playingLesson: null,
    stopped: false,
    showContentTooltip: false,
    showSpeedTooltip: false,
};

export default function player(state = initialState, action) {

    switch (action.type) {
        case GET_LESSON_PLAY_INFO_REQUEST: {
            return initialState;
        }

        case SET_LESSON_PLAY_INFO_LOADED: {
            return {...state, playingLesson: Object.assign({}, action.payload)}
        }

        case PLAYER_START_PLAY_LESSON: {
            return {...state, starting: true}
        }

        case PLAYER_PLAYED:
            return {...state, paused: false, ended: false, stopped: false, starting: false, };

        case PLAYER_PAUSED:
            return {...state, paused: true, starting: false,};

        case PLAYER_STOPPED:
            // return initialState;
            return {...state, stopped: true, currentTime: 0, starting: false,};

        case PLAYER_ENDED:
            return {...state, ended: true, starting: false,};

        case PLAYER_SET_CURRENT_TIME: {
            let _delta = (action.payload - state.currentTime)
            if ((_delta > 0.5) || (_delta < 0)) {
                return {...state, currentTime: action.payload}
            } else {
                return state
            }
        }

        case PLAYER_SET_BUFFERED_TIME: {
            return {...state, bufferedTime: action.payload}
        }

        case PLAYER_SET_TITLE: {
            let _newTitle = action.payload ? action.payload.title : '',
                _newSubTitle = action.payload ? action.payload.subTitle : '';

            if ((state.title !== _newTitle) || (state.subTitle !== _newSubTitle)) {
                return {...state, title: _newTitle, subTitle: _newSubTitle}
            } else {
                return state
            }
        }

        case PLAYER_SET_MUTE_STATE: {
            return {...state, muted: action.payload}
        }

        case PLAYER_SET_VOLUME: {
            return {...state, volume: action.payload}
        }

        case PLAYER_SET_RATE: {
            let _newRate = parseFloat(action.payload)

            if (state.rate !== _newRate) {
                return {...state, rate: _newRate}
            } else {
                return state
            }
        }

        case PLAYER_SET_CONTENT_ARRAY: {
            let _result = _calcContent(action.payload)

            return {
                ...state,
                totalDuration: _result.totalDuration,
                totalDurationFmt: _result.totalDurationFmt,
                contentArray: [..._result.content]
            }
        }

        case PLAYER_SET_CURRENT_CONTENT: {
            let _changeEmpty = !state.currentContent && action.payload,
                _newValueHasChanges = state.currentContent && (state.currentContent.id !== action.payload.id);
            if (_changeEmpty || _newValueHasChanges) {
                return {...state, currentContent: Object.assign({}, action.payload)}
            } else {
                return state
            }
        }

        case SHOW_CONTENT_TOOLTIP: {
            return {...state, showContentTooltip: true}
        }

        case HIDE_CONTENT_TOOLTIP: {
            return {...state, showContentTooltip: false}
        }

        case SHOW_SPEED_TOOLTIP: {
            return {...state, showSpeedTooltip: true}
        }

        case HIDE_SPEED_TOOLTIP: {
            return {...state, showSpeedTooltip: false}
        }

        default:
            return state;
    }
}

const _calcContent = (content) => {
    let _length = 0;
    let _items = [];
    content.forEach((episodeContent) => {
        _length += episodeContent.duration;

        episodeContent.content.forEach((item) => {
            _items.push({id: item.id, title: item.title, begin: item.begin, episodeTitle: episodeContent.title})
        })
    });

    let _total = tools.getTimeFmt(_length);

    return {
        totalDurationFmt: _total,
        totalDuration: _length,
        content: _items,
    }
}