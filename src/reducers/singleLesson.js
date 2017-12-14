import {
    GET_SINGLE_LESSON_REQUEST,
    GET_SINGLE_LESSON_SUCCESS,
    GET_SINGLE_LESSON_FAIL,
    REMOVE_MAIN_EPISODE,
    MOVE_MAIN_EPISODE_UP,
    MOVE_MAIN_EPISODE_DOWN,
    REMOVE_SUPP_EPISODE,
    MOVE_SUPP_EPISODE_UP,
    MOVE_SUPP_EPISODE_DOWN,
    INSERT_RECOMMENDED_REFERENCE,
    // UPDATE_RECOMMENDED_REFERENCE,
    REMOVE_RECOMMENDED_REFERENCE,
    INSERT_COMMON_REFERENCE,
    // UPDATE_COMMON_REFERENCE,
    REMOVE_COMMON_REFERENCE,
} from '../constants/SingleLesson'

const initialState = {
    initialLesson: null,
    lesson: null,
    mainEpisodes: [],
    suppEpisodes: [],
    recommendedRef: [],
    commonRef: [],
    fetching: false,
    hasChanges: false,
};

export default function singleLesson(state = initialState, action) {

    switch (action.type) {
        case GET_SINGLE_LESSON_REQUEST:
            return {
                ...state,
                initialLesson : null,
                lesson: null,
                mainEpisodes: [],
                suppEpisodes: [],
                recommendedRef: [],
                commonRef: [],
                fetching: true,
                hasChanges : false,
            };

        case GET_SINGLE_LESSON_SUCCESS:
            return {
                ...state,
                initialLesson: action.payload,
                lesson: Object.assign({}, action.payload),
                mainEpisodes: [...action.payload.mainEpisodes],
                suppEpisodes: [...action.payload.suppEpisodes],
                recommendedRef: [...action.payload.recommendedRef],
                commonRef: [...action.payload.commonRef],
                fetching: false,
                hasChanges : false,
            };

        case GET_SINGLE_LESSON_FAIL:
            return {
                ...state,
                initialLesson : null,
                lesson: null,
                mainEpisodes: [],
                suppEpisodes: [],
                recommendedRef: [],
                commonRef: [],
                fetching: false,
                hasChanges : false,
            };

        case REMOVE_MAIN_EPISODE: {
            let _array = [];
            let _modified = false;

            let _itemId = action.payload;
            let _index = state.mainEpisodes.findIndex((item) => {return item.id === _itemId});
            if (_index > -1) {
                _modified = true;
                state.mainEpisodes.splice(_index, 1);
            }

            _array.push(...state.mainEpisodes);

            return {...state, mainEpisodes: _array, hasChanges: _modified ? true : state.hasChanges};
        }

        case MOVE_MAIN_EPISODE_UP: {
            let _array = [];
            let _modified = false;

            let _itemId = action.payload;
            let _index = state.mainEpisodes.findIndex((item) => {return item.id === _itemId});
            if (_index > 0) {
                let _deleted = state.mainEpisodes.splice(_index - 1, 1);
                state.mainEpisodes.splice(_index, 0, _deleted[0]);
                _modified = true;
            }

            if (_modified) {
                state.mainEpisodes.forEach((item, index) => {
                    item.Number = index +1
                })
            }

            _array.push(...state.mainEpisodes);

            return {...state, mainEpisodes: _array, hasChanges: _modified ? true : state.hasChanges};
        }

        case MOVE_MAIN_EPISODE_DOWN: {
            let _array = [];
            let _modified = false;

            let _itemId = action.payload;
            let _index = state.mainEpisodes.findIndex((item) => {
                return item.id === _itemId
            });
            if (_index < state.mainEpisodes.length - 1) {
                let _deleted = state.mainEpisodes.splice(_index, 1);
                state.mainEpisodes.splice(_index + 1, 0, _deleted[0]);
                _modified = true;
            }

            if (_modified) {
                state.mainEpisodes.forEach((item, index) => {
                    item.Number = index + 1
                })
            }

            _array.push(...state.mainEpisodes);

            return {...state, mainEpisodes: _array, hasChanges: _modified ? true : state.hasChanges};
        }

        case REMOVE_SUPP_EPISODE: {
            let _array = [];
            let _modified = false;

            let _itemId = action.payload;
            let _index = state.suppEpisodes.findIndex((item) => {return item.id === _itemId});
            if (_index > -1) {
                _modified = true;
                state.suppEpisodes.splice(_index, 1);
            }

            _array.push(...state.suppEpisodes);

            return {...state, suppEpisodes: _array, hasChanges: _modified ? true : state.hasChanges};
        }

        case MOVE_SUPP_EPISODE_UP: {
            let _array = [];
            let _modified = false;

            let _itemId = action.payload;
            let _index = state.suppEpisodes.findIndex((item) => {return item.id === _itemId});
            if (_index > 0) {
                let _deleted = state.suppEpisodes.splice(_index - 1, 1);
                state.suppEpisodes.splice(_index, 0, _deleted[0]);
                _modified = true;
            }

            if (_modified) {
                state.suppEpisodes.forEach((item, index) => {
                    item.Number = index +1
                })
            }

            _array.push(...state.suppEpisodes);

            return {...state, suppEpisodes: _array, hasChanges: _modified ? true : state.hasChanges};
        }

        case MOVE_SUPP_EPISODE_DOWN: {
            let _array = [];
            let _modified = false;

            let _itemId = action.payload;
            let _index = state.suppEpisodes.findIndex((item) => {
                return item.id === _itemId
            });
            if (_index < state.suppEpisodes.length - 1) {
                let _deleted = state.suppEpisodes.splice(_index, 1);
                state.suppEpisodes.splice(_index + 1, 0, _deleted[0]);
                _modified = true;
            }

            if (_modified) {
                state.suppEpisodes.forEach((item, index) => {
                    item.Number = index + 1
                })
            }

            _array.push(...state.suppEpisodes);

            return {...state, suppEpisodes: _array, hasChanges: _modified ? true : state.hasChanges};
        }

        case INSERT_RECOMMENDED_REFERENCE: {
            return {...state, recommendedRef: [...state.recommendedRef, action.payload], hasChanges: true};
        }

        case REMOVE_RECOMMENDED_REFERENCE: {
            let _array = [];
            let _modified = false;

            let _itemId = action.payload;
            let _index = state.recommendedRef.findIndex((item) => {return item.id === _itemId});
            if (_index > -1) {
                _modified = true;
                state.recommendedRef.splice(_index, 1);
            }

            _array.push(...state.recommendedRef);

            return {...state, recommendedRef: _array, hasChanges: _modified ? true : state.hasChanges};
        }

        case INSERT_COMMON_REFERENCE: {
            return {...state, commonRef: [...state.commonRef, action.payload], hasChanges: true};
        }

        case REMOVE_COMMON_REFERENCE: {
            let _array = [];
            let _modified = false;

            let _itemId = action.payload;
            let _index = state.commonRef.findIndex((item) => {return item.id === _itemId});
            if (_index > -1) {
                _modified = true;
                state.commonRef.splice(_index, 1);
            }

            _array.push(...state.commonRef);

            return {...state, commonRef: _array, hasChanges: _modified ? true : state.hasChanges};
        }

        default:
            return state;
    }

}