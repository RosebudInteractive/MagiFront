import React from "react"
import PropTypes from "prop-types"
import "./result-form.sass"
import AuthorItem from "./author-item";
import LessonItem from "./lesson-item";
import CourseItem from "./course-item";
import {getCounterTitle} from "tools/word-tools";
import Pages from "./pages";

const RESULT_TYPE = {
    AUTHOR: "author",
    COURSE: "course",
    LESSON: "lesson",
}

export default class ResultForm extends React.Component {

    static propTypes = {
        result: PropTypes.array,
        count: PropTypes.number
    }

    render() {
        const _count = this.props.count

        return <div className="search-result">
            <div className="search-result__header">
                <div className="font-universal__body-large result-title">{`Всего найдено: ${_count} ${getPageCountTitle(+_count)}`}</div>
                {
                    _count ?
                        <div className="sort-type">
                            <span className="font-universal__body-medium">Сортировать:</span>
                            <span className="font-universal__body-medium sort-type">По релевантности</span>
                            <span className="font-universal__body-medium sort-type _active">По дате</span>
                        </div>
                        :
                        null
                }
            </div>
            <div className="search-result__items">
                {this._getList()}
            </div>
            <Pages/>
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
