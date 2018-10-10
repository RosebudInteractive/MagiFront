import {
    CREATE_NEW_LESSON,
    GET_SINGLE_LESSON_REQUEST,
    GET_SINGLE_LESSON_SUCCESS,
    GET_SINGLE_LESSON_FAIL,
    CHANGE_LESSON_DATA,
    CANCEL_CHANGE_LESSON_DATA,
    SAVE_LESSON_SUCCESS,
    CLEAR_LESSON,
    SET_OG_IMAGE_RESOURCE_ID,
    SET_TWITTER_IMAGE_RESOURCE_ID,
} from '../../constants/lesson/singleLesson'

const initialState = {
    initial: null,
    current: null,
    fetching: false,
    hasChanges: false,
    ogImageId: null,
    twitterImageId: null,
};

export default function singleLesson(state = initialState, action) {

    switch (action.type) {
        case CREATE_NEW_LESSON: {
            let _newObject = {
                CourseId: action.payload.CourseId,
                CourseName: action.payload.CourseName,
                Number: action.payload.Number,
                State: 'D',
                LessonType: action.payload.LessonType,
                CurrParentName: action.payload.CurrParentName,
                CurrParentId: action.payload.CurrParentId,
                suppEpisodes: [],
                mainEpisodes: [],
            };

            return {
                ...state,
                initial: _newObject,
                current: Object.assign({}, _newObject),
                fetching: false,
                hasChanges: false,
            };
        }

        case GET_SINGLE_LESSON_REQUEST:
            return {
                ...state,
                initial: null,
                current: null,
                fetching: true,
                hasChanges: false,
            };

        case GET_SINGLE_LESSON_SUCCESS: {
            let _lesson = action.payload,
                _ogImageId = null,
                _twitterId = null;

            if (_lesson && _lesson.Images) {
                _lesson.Images.forEach(image => {
                    if (image.type === 'og') {
                        _ogImageId = image.ResourceId;
                    }

                    if (image.type === 'twitter') {
                        _twitterId = image.ResourceId;
                    }
                })
            }

            return {
                ...state,
                initial: action.payload,
                current: Object.assign({}, action.payload),
                ogImageId: _ogImageId,
                twitterId: _twitterId,
                fetching: false,
                hasChanges: false,
            };

        }

        case GET_SINGLE_LESSON_FAIL:
            return {...state, initial: null,
                current: null,
                fetching: false,
                hasChanges: false,};

        case SAVE_LESSON_SUCCESS: {
            let _id = action.payload.id ? action.payload.id : state.current.id;
            state.current.id = _id;
            state.current.Id = _id;

            let _newInitialLesson = Object.assign({}, state.current);

            return {
                ...state,
                initialLesson: _newInitialLesson,
                fetching: false,
                hasChanges: false,
            };
        }

        case CHANGE_LESSON_DATA : {
            let _object = Object.assign({}, action.payload);

            return {...state, current: _object, hasChanges: true};
        }

        case CANCEL_CHANGE_LESSON_DATA: {
            let _lesson = state.initial,
                _ogImageId = null,
                _twitterId = null;

            if (_lesson && _lesson.Images) {
                _lesson.Images.forEach(image => {
                    if (image.type === 'og') {
                        _ogImageId = image.ResourceId;
                    }

                    if (image.type === 'twitter') {
                        _twitterId = image.ResourceId;
                    }
                })
            }


            return {
                ...state,
                current: Object.assign({}, state.initial),
                fetching: false,
                ogImageId: _ogImageId,
                twitterId: _twitterId,
                hasChanges: false,
            };
        }

        case CLEAR_LESSON: {
            return {...state, initial: null,
                current: null,
                ogImageId: null,
                twitterImageId: null,
                fetching: true,
                hasChanges: false,}
        }

        case SET_OG_IMAGE_RESOURCE_ID: {
            return {...state, ogImageId: action.payload, hasChanges: true }
        }

        case SET_TWITTER_IMAGE_RESOURCE_ID: {
            return {...state, twitterImageId: action.payload, hasChanges: true }
        }

        default:
            return state;
    }

}