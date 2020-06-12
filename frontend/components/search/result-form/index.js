import React from "react"
import PropTypes from "prop-types"
import "./result-form.sass"
import AuthorItem from "./author-item";
import LessonItem from "./lesson-item";
import CourseItem from "./course-item";
import {getCounterTitle} from "tools/word-tools";
import Pages from "./pages";
import SortBlock from "./sort-block";
import SearchEmpty from "./search-result-empty";

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
        const {count} = this.props

        return <div className="search-result">
            <div className="search-result__header">
                <div
                    className="font-universal__body-large result-title">{`Всего найдено: ${count} ${getPageCountTitle(+count)}`}</div>
                <SortBlock/>
            </div>
            {
                count ?
                    <React.Fragment>
                        <div className="search-result__items">
                            {this._getList()}
                        </div>
                        <Pages/>
                    </React.Fragment>
                    :
                    <SearchEmpty/>
            }
        </div>
    }

    _getList() {
        return this.props.result.map((item) => {
            switch (item.type) {
                case RESULT_TYPE.AUTHOR:
                    return <AuthorItem item={item}/>
                case RESULT_TYPE.COURSE:
                    return <CourseItem item={item}/>
                case RESULT_TYPE.LESSON:
                    return <LessonItem item={item}/>
                default:
                    return null
            }
        })
    }
}

const getPageCountTitle = (count) => {
    return getCounterTitle(count, {single: 'страница', twice: 'страницы', many: 'страниц'})
}
