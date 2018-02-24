import {
    GET_LESSON_REQUEST,
    GET_LESSON_SUCCESS,
    GET_LESSON_FAIL, GET_LESSONS_ALL_REQUEST, GET_LESSONS_ALL_SUCCESS, GET_LESSONS_ALL_FAIL,
} from '../constants/lesson'

import 'whatwg-fetch';

export const getLesson = (courseUrl, lessonUrl) => {
    return (dispatch) => {
        dispatch({
            type: GET_LESSON_REQUEST,
            payload: null
        });

        fetch("/api/lessons/" + courseUrl + '/' + lessonUrl, {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                // handleCourses(data);

                dispatch({
                    type: GET_LESSON_SUCCESS,
                    payload: data
                });
            })
            .catch((err) => {
                dispatch({
                    type: GET_LESSON_FAIL,
                    payload: err
                });
            });
    }
};

export const getLessonsAll = (courseUrl, lessonUrl) => {
    return (dispatch) => {
        dispatch({
            type: GET_LESSONS_ALL_REQUEST,
            payload: null
        });

        fetch("/api/lessons-all/" + courseUrl + '/' + lessonUrl, {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                // handleCourses(data);

                dispatch({
                    type: GET_LESSONS_ALL_SUCCESS,
                    payload: data
                });
            })
            .catch((err) => {
                dispatch({
                    type: GET_LESSONS_ALL_FAIL,
                    payload: err
                });
            });
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

// const _getAuthor = (array, id) => {
//     return array.find((item) => {
//         return item.Id === id
//     })
// };
//
// const _getCategory = (array, id) => {
//     return array.find((item) => {
//         return item.Id === id
//     })
// };
//
// const handleLesson = (data) => {
//     try {
//         if (data.CoverMeta) {
//             data.CoverMeta = JSON.parse(data.CoverMeta)
//         }
//
//         data.Authors.forEach((author) => {
//             if (author.PortraitMeta) {
//                 author.PortraitMeta = JSON.parse(author.PortraitMeta)
//             }
//         });
//
//         let _lessonCount = 0,
//             _readyLessonCount = 0;
//
//         data.Lessons.forEach((lesson) => {
//             if (lesson.State === 'R') {
//                 _lessonCount++;
//                 _readyLessonCount++
//             } else {
//                 _lessonCount++
//             }
//
//             let _readyDate = new Date(lesson.ReadyDate);
//             lesson.readyYear = _readyDate.getFullYear();
//             lesson.readyMonth = Months[_readyDate.getMonth()];
//         });
//
//         data.lessonCount = _lessonCount;
//         data.readyLessonCount = _readyLessonCount;
//         console.log('exit');
//     }
//     catch (err) {
//         console.error('ERR: ' + err.message);
//     }
// };

// const Months = [
//     'Январь',
//     'Февраль',
//     'Март',
//     'Апрель',
//     'Май',
//     'Июнь',
//     'Июль',
//     'Август',
//     'Сентябрь',
//     'Октябрь',
//     'Ноябрь',
//     'Декабрь',
// ];