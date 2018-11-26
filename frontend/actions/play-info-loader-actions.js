import {
    GET_LESSON_PLAY_INFO_REQUEST,
    GET_LESSON_PLAY_INFO_SUCCESS,
    GET_LESSON_PLAY_INFO_FAIL,
    SET_LESSON_PLAY_INFO_LOADED,
} from '../constants/lesson'


export const getLessonPlayInfo = (lesson) => {
    return (dispatch) => {
        dispatch({
            type: GET_LESSON_PLAY_INFO_REQUEST,
            payload: lesson.Id
        });

        fetch('/api/lessons/play/' + lesson.Id, {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                data.lessonUrl = lesson.URL;
                data.courseUrl = lesson.courseUrl;
                data.courseName = lesson.Course.Name;
                data.authorName = lesson.Author.FirstName + ' ' + lesson.Author.LastName;
                data.Number = lesson.Number;
                data.Name = lesson.Name;
                dispatch({
                    type: GET_LESSON_PLAY_INFO_SUCCESS,
                    payload: data
                });
            })
            .catch((err) => {
                dispatch({
                    type: GET_LESSON_PLAY_INFO_FAIL,
                    payload: err
                });
            });
    }
}

export const notifyLessonPlayInfoLoaded = (data) => {
    return (dispatch) => {
        dispatch({
            type: SET_LESSON_PLAY_INFO_LOADED,
            payload: data
        })
    }
}

const checkStatus = (response) => {
    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        let error = new Error(response.statusText);
        error.response = response;
        throw error
    }
};

const parseJSON = (response) => {
    return response.json()
};