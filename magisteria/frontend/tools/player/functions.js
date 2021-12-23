import {LESSON_STATE} from "../../constants/common-consts";

export const getSiblingsLessons = (lessonList, currentLessonId) => {
    let _lessons = []

    lessonList.forEach((lesson) => {
        _lessons.push(lesson)
        if (lesson.Lessons && (lesson.Lessons.length > 0)) {
            lesson.Lessons.forEach((sublesson) => {_lessons.push(sublesson)})
        }
    })

    _lessons = _lessons.filter(item => item.State === LESSON_STATE.READY)

    let _index = _lessons.findIndex((lesson) => {
        return lesson.Id === currentLessonId
    })

    return {
        prev: (_index > 0) ? _lessons[_index - 1] : null,
        current: (_index >= 0) ? _lessons[_index] : null,
        next: (_index < _lessons.length - 1) ? _lessons[_index + 1] : null
    }
}