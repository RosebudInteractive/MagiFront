import {
    GET_LESSON_PLAY_INFO_REQUEST,
    GET_LESSON_PLAY_INFO_SUCCESS,
    GET_LESSON_PLAY_INFO_FAIL,
} from '../constants/lesson'


export const getLessonPlayInfo = (lessonId) => {
    return (dispatch) => {
        dispatch({
            type: GET_LESSON_PLAY_INFO_REQUEST,
            payload: lessonId
        });

        fetch('/api/lessons/play/' + lessonId, {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
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

export const notifyLessonPlayInfoLoaded = () => {

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