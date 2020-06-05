import React from "react"
import PropTypes from "prop-types"
import "./result-form.sass"
import AuthorItem from "./author-item";
import LessonItem from "./lesson-item";
import CourseItem from "./course-item";
import {getCounterTitle} from "tools/word-tools";

const RESULT_TYPE = {
    AUTHOR: "author",
    COURSE: "course",
    LESSON: "lesson",
}

export default class ResultForm extends React.Component {

    static propTypes = {
        result: PropTypes.array
    }

    render() {
        const _count = this.props.result.length

        return <div className="search-result">
            <div className="font-universal__body-large result-title">{`Всего найдено: ${_count} ${getPageCountTitle(+_count)}`}</div>
            {this._getList()}
        </div>
    }

    _getList() {
        return this.props.result.map((item) => {
            switch (item.type) {
                case RESULT_TYPE.AUTHOR: return <AuthorItem item={item}/>
                case RESULT_TYPE.COURSE: return <CourseItem item={item}/>
                case RESULT_TYPE.LESSON: return <LessonItem item={item}/>
                default: return null
            }
        })
    }
}

const getPageCountTitle = (count) => {
    return getCounterTitle(count, {single: 'страница', twice: 'страницы', many: 'страниц'})
}
