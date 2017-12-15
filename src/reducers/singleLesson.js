import {
    CREATE_NEW_LESSON,
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
    REMOVE_RECOMMENDED_REFERENCE,
    INSERT_COMMON_REFERENCE,
    REMOVE_COMMON_REFERENCE,
    UPDATE_COMMON_REFERENCE,
    UPDATE_RECOMMENDED_REFERENCE,
    MOVE_RECOMMENDED_REFERENCE_DOWN,
    MOVE_RECOMMENDED_REFERENCE_UP,
    MOVE_COMMON_REFERENCE_UP,
    MOVE_COMMON_REFERENCE_DOWN,
    CHANGE_LESSON_DATA,
    CANCEL_CHANGE_LESSON_DATA,
    SAVE_LESSON_SUCCESS,
    CLEAR_LESSON,
} from '../constants/SingleLesson'

import * as tools from './tools';

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
        case CREATE_NEW_LESSON: {
            let _lesson = {
                CourseId: action.payload.CourseId,
                CourseName: action.payload.CourseName,
                Number: action.payload.Number,
                State:'D',
                LessonType: action.payload.LessonType,
                mainEpisodes: [],
                suppEpisodes: [],
                recommendedRef: [],
                commonRef: [],
            };

            return {
                ...state,
                initialLesson: _lesson,
                lesson: Object.assign({}, _lesson),
                mainEpisodes: [],
                suppEpisodes: [],
                recommendedRef: [],
                commonRef: [],
                fetching: false,
                hasChanges: false,
            };
        }

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

        case GET_SINGLE_LESSON_SUCCESS: {
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

        }

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

        case SAVE_LESSON_SUCCESS: {
            let _newInitialLesson = Object.assign({},state.lesson);
            _newInitialLesson.mainEpisodes = [...state.mainEpisodes];
            _newInitialLesson.suppEpisodes = [...state.suppEpisodes];
            _newInitialLesson.recommendedRef = [...state.recommendedRef];
            _newInitialLesson.commonRef = [...state.commonRef];

            return {
                ...state,
                initialLesson: _newInitialLesson,
                fetching: false,
                hasChanges : false,
            };
        }

        case REMOVE_MAIN_EPISODE: {
            let _result = tools.removeObject(state.mainEpisodes, action.payload);
            return {...state, mainEpisodes: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
        }

        case MOVE_MAIN_EPISODE_UP: {
            let _result = tools.moveObjectUp(state.mainEpisodes, action.payload);
            return {...state, mainEpisodes: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
        }

        case MOVE_MAIN_EPISODE_DOWN: {
            let _result = tools.moveObjectDown(state.mainEpisodes, action.payload);
            return {...state, mainEpisodes: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
        }

        case REMOVE_SUPP_EPISODE: {
            let _result = tools.removeObject(state.suppEpisodes, action.payload);
            return {...state, suppEpisodes: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
        }

        case MOVE_SUPP_EPISODE_UP: {
            let _result = tools.moveObjectUp(state.suppEpisodes, action.payload);
            return {...state, suppEpisodes: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
        }

        case MOVE_SUPP_EPISODE_DOWN: {
            let _result = tools.moveObjectDown(state.suppEpisodes, action.payload);
            return {...state, suppEpisodes: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
        }

        case INSERT_RECOMMENDED_REFERENCE: {
            let _array = [...state.recommendedRef, action.payload];
            tools.setObjectsRank(_array);

            return {...state, recommendedRef: _array, hasChanges: true};
        }

        case UPDATE_RECOMMENDED_REFERENCE: {
            let _array = [];
            let _replaced = false;
            state.recommendedRef.forEach((item) => {
                if (item.Id !== action.payload.Id) {
                    _array.push({...item})
                } else {
                    _array.push(action.payload);
                    _replaced = true;
                }
            });

            if (!_replaced) {
                _array.push(action.payload)
            }

            return {
                ...state,
                recommendedRef: _array,
                hasChanges: true
                // selected: _replaced ? state.selected : action.payload.id
            };
        }

        case REMOVE_RECOMMENDED_REFERENCE: {
            let _result = tools.removeObject(state.recommendedRef, action.payload);
            return {...state, recommendedRef: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
        }

        case MOVE_RECOMMENDED_REFERENCE_UP: {
            let _result = tools.moveObjectUp(state.recommendedRef, action.payload);
            return {...state, recommendedRef: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
        }

        case MOVE_RECOMMENDED_REFERENCE_DOWN: {
            let _result = tools.moveObjectDown(state.recommendedRef, action.payload);
            return {...state, recommendedRef: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
        }

        case INSERT_COMMON_REFERENCE: {
            let _array = [...state.commonRef, action.payload];
            tools.setObjectsRank(_array);

            return {...state, commonRef: _array, hasChanges: true};
        }

        case UPDATE_COMMON_REFERENCE: {
            let _array = [];
            let _replaced = false;
            state.commonRef.forEach((item) => {
                if (item.Id !== action.payload.Id) {
                    _array.push({...item})
                } else {
                    _array.push(action.payload);
                    _replaced = true;
                }
            });

            if (!_replaced) {
                _array.push(action.payload)
            }

            return {
                ...state,
                commonRef: _array,
                hasChanges: true
                // selected: _replaced ? state.selected : action.payload.id
            };
        }

        case REMOVE_COMMON_REFERENCE: {
            let _result = tools.removeObject(state.commonRef, action.payload);
            return {...state, commonRef: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
        }

        case MOVE_COMMON_REFERENCE_UP: {
            let _result = tools.moveObjectUp(state.commonRef, action.payload);
            return {...state, commonRef: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
        }

        case MOVE_COMMON_REFERENCE_DOWN: {
            let _result = tools.moveObjectDown(state.commonRef, action.payload);
            return {...state, commonRef: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
        }

        case CHANGE_LESSON_DATA : {
            let _object = Object.assign({}, action.payload);

            return {...state, lesson: _object, hasChanges: true };
        }

        case CANCEL_CHANGE_LESSON_DATA: {
            tools.setObjectsRank(state.initialLesson.mainEpisodes);
            tools.setObjectsRank(state.initialLesson.suppEpisodes);
            tools.setObjectsRank(state.initialLesson.recommendedRef);
            tools.setObjectsRank(state.initialLesson.commonRef);
            
            return {
                ...state,
                lesson: Object.assign({},state.initialLesson),
                mainEpisodes: [...state.initialLesson.mainEpisodes],
                suppEpisodes: [...state.initialLesson.suppEpisodes],
                recommendedRef: [...state.initialLesson.recommendedRef],
                commonRef: [...state.initialLesson.commonRef],
                fetching: false,
                hasChanges : false,
            };
        }

        case CLEAR_LESSON:{
            return initialState
        }

        default:
            return state;
    }

}