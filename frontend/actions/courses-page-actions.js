import {
    GET_COURSES_REQUEST,
    GET_COURSES_SUCCESS,
    GET_COURSES_FAIL,
    GET_SINGLE_COURSE_REQUEST,
    GET_SINGLE_COURSE_SUCCESS,
    GET_SINGLE_COURSE_FAIL,
} from '../constants/courses'

import {
    LOAD_FILTER_VALUES,
} from '../constants/filters'

import 'whatwg-fetch';


// const fetch = (url) => {
//     return new Promise((resolve, reject) => {
//         const xhr = new XMLHttpRequest();
//
//         xhr.open("GET", url, true);
//
//         xhr.onload = function () {
//             resolve(this.responseText);
//         };
//
//         xhr.onerror = reject;
//
//         xhr.send();
//     })
// };

export const getCourses = () => {
    return (dispatch) => {
        dispatch({
            type: GET_COURSES_REQUEST,
            payload: null
        });

        fetch("/api/courses", {credentials: 'include'})
        .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                console.log(data.Courses.length);
                handleCourses(data);

                console.log('GET_COURSES_SUCCESS');
                dispatch({
                    type: GET_COURSES_SUCCESS,
                    payload: data
                });

                console.log('LOAD_FILTER_VALUES');
                dispatch({
                    type: LOAD_FILTER_VALUES,
                    payload: data.Categories
                })
            })
            .catch((err) => {
                dispatch({
                    type: GET_COURSES_FAIL,
                    payload: err
                });
            });
    }
};

export const getCourse = (url) => {
    return (dispatch) => {
        dispatch({
            type: GET_SINGLE_COURSE_REQUEST,
            payload: null
        });

        fetch("/api/courses/" + url, {credentials: 'include'})
        .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                handleCourse(data);

                dispatch({
                    type: GET_SINGLE_COURSE_SUCCESS,
                    payload: data
                });
            })
            .catch((err) => {
                dispatch({
                    type: GET_SINGLE_COURSE_FAIL,
                    payload: err
                });
            });

    }
};

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

// const parseJSON = (data) => {
//     return JSON.parse(data)
// };

// const handleCourse = (course) => {
//     // course.id = course.Id;
//     course.ColorHex = '#' + course.Color.toString(16);
//
//     // course.stateName =
//     return course;
// };

const _getAuthor = (array, id) => {
    return array.find((item) => {
        return item.Id === id
    })
};

const _getCategory = (array, id) => {
    return array.find((item) => {
        return item.Id === id
    })
};

const handleCourses = (data) => {
    console.log('Enter!')
    try {
        data.Courses.forEach((item) => {
            item.CategoriesObj = [];
            item.AuthorsObj = [];

            item.Categories.forEach((category) => {
                let _category = _getCategory(data.Categories, category);
                item.CategoriesObj.push(_category)
            });

            item.Authors.forEach((author) => {
                item.AuthorsObj.push(_getAuthor(data.Authors, author))
            });

            item.ColorHex = '#' + item.Color.toString(16);

            let _readyLessonCount = 0;

            item.Lessons.forEach((lesson) => {
                if (lesson.CoverMeta) {
                    lesson.CoverMeta = JSON.parse(lesson.CoverMeta)
                }

                if (lesson.State === 'R') {
                    _readyLessonCount++
                }
            });

            item.readyLessonCount = _readyLessonCount;
        });

        console.log('exit');
    }
    catch (err) {
        console.error('ERR: ' + err.message);
    }
};

const handleCourse = (data) => {
    console.log('Enter!')

    try {
        if (data.CoverMeta) {
            data.CoverMeta = JSON.parse(data.CoverMeta)
        }

        data.Authors.forEach((author) => {
            if (author.PortraitMeta) {
                author.PortraitMeta = JSON.parse(author.PortraitMeta)
            }
        });

        let _lessonCount = 0,
            _readyLessonCount = 0;

        data.Lessons.forEach((lesson) => {
            if (lesson.State === 'R') {
                _lessonCount++;
                _readyLessonCount++
            } else {
                _lessonCount++
            }

            let _readyDate = new Date(lesson.ReadyDate);
            lesson.readyYear = _readyDate.getFullYear();
            lesson.readyMonth = Months[_readyDate.getMonth()];
        });

        data.lessonCount = _lessonCount;
        data.readyLessonCount = _readyLessonCount;
        console.log('exit');
    }
    catch (err) {
        console.error('ERR: ' + err.message);
    }
};

const Months = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
];