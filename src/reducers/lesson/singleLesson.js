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
    SET_TWITTER_IMAGE_RESOURCE_ID, LOAD_PARENT_LESSON_SUCCESS, SET_LESSON_EXT_LINKS,
} from '../../constants/lesson/singleLesson'
import {convertLinksToString} from "../../tools/link-tools";

const initialState = {
    initial: null,
    current: null,
    fetching: false,
    hasChanges: false,
    ogImageResourceId: null,
    ogImageId: null,
    twitterImageResourceId: null,
    twitterImageId: null,
    hasOgImage: false,
    hasTwitterImage: false,
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
                IsAuthRequired: true,
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

        case LOAD_PARENT_LESSON_SUCCESS: {
            let _current = Object.assign({}, state.current)
            _current.CurrParentName = action.payload.name
            _current.CurrParentId = action.payload.id

            return {
                ...state,
                current: _current,
            }
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
                _ogImageResourceId = null,
                _twitterResourceId = null,
                _ogImageId = null,
                _twitterImageId = null;

            if (_lesson && _lesson.Images) {
                _lesson.Images.forEach(image => {
                    if (image.Type === 'og') {
                        _ogImageResourceId = image.ResourceId;
                        _ogImageId = image.Id;
                    }

                    if (image.Type === 'twitter') {
                        _twitterResourceId = image.ResourceId;
                        _twitterImageId = image.Id;
                    }
                })
            }

            return {
                ...state,
                initial: action.payload,
                current: Object.assign({}, action.payload),
                ogImageResourceId: _ogImageResourceId,
                ogImageId: _ogImageId,
                hasOgImage: !!_ogImageResourceId,
                twitterImageResourceId: _twitterResourceId,
                twitterImageId: _twitterImageId,
                hasTwitterImage: !!_twitterResourceId,
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
            state.current.extLinksValues = convertLinksToString(state.current.ExtLinks);

            let _newInitialLesson = Object.assign({}, state.current);

            return {
                ...state,
                initialLesson: _newInitialLesson,
                hasOgImage: !!state.current.ogImageResourceId,
                hasTwitterImage: !!state.current.twitterImageResourceId,
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
                    if (image.Type === 'og') {
                        _ogImageId = image.ResourceId;
                    }

                    if (image.Type === 'twitter') {
                        _twitterId = image.ResourceId;
                    }
                })
            }


            return {
                ...state,
                current: Object.assign({}, state.initial),
                fetching: false,
                ogImageResourceId: _ogImageId,
                twitterImageResourceId: _twitterId,
                hasChanges: false,
            };
        }

        case CLEAR_LESSON: {
            return {...state, initial: null,
                current: null,
                ogImageResourceId: null,
                hasOgImage: false,
                twitterImageResourceId: null,
                hasTwitterImage: false,
                fetching: true,
                hasChanges: false,}
        }

        case SET_OG_IMAGE_RESOURCE_ID: {
            return {...state, ogImageResourceId: action.payload, hasChanges: true }
        }

        case SET_TWITTER_IMAGE_RESOURCE_ID: {
            return {...state, twitterImageResourceId: action.payload, hasChanges: true }
        }

        case SET_LESSON_EXT_LINKS: {
            state.current.ExtLinks = action.payload;

            return state
        }

        default:
            return state;
    }

}