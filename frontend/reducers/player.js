import {
    PLAYER_PLAYED,
    PLAYER_PAUSED,
    PLAYER_SET_CURRENT_TIME,
    PLAYER_SET_TITLE,
    PLAYER_SET_MUTE_STATE,
    PLAYER_SET_VOLUME,
    PLAYER_SET_CURRENT_CONTENT,
    PLAYER_SET_RATE,
    PLAYER_SET_CONTENT_ARRAY,
} from '../constants/player';

import * as tools from '../tools/time-tools'

const initialState = {
    currentTime: 0,
    currentContent: null,
    paused: true,
    muted: false,
    volume: 0,
    rate: 0,
    title: '',
    subTitle: '',
    totalDurationFmt: '',
    totalDuration: 0,
    contentArray: [],
    // playingLesson: null,
};

export default function player(state = initialState, action) {

    switch (action.type) {
        case PLAYER_PLAYED:
            return {...state, paused: false};

        case PLAYER_PAUSED:
            return {...state, paused: true};

        case PLAYER_SET_CURRENT_TIME:
            if (state.currentTime !== action.payload) {
                return {...state, currentTime: action.payload}
            } else {
                return state
            }

        case PLAYER_SET_TITLE: {
            if (state.title !== action.payload) {
                return {...state, title: action.payload}
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

            return {...state,
                totalDuration: _result.totalDuration,
                totalDurationFmt: _result.totalDurationFmt,
                contentArray: [..._result.content]}
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