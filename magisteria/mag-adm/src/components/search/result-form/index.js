import React from "react"
import PropTypes from "prop-types"
import "./result-form.sass"
import AuthorItem from "./author-item";
import LessonItem from "./lesson-item";
import CourseItem from "./course-item";

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
        return <div className="search-result">
            <div className="result-title">{`Результатов: ${this.props.result.length}`}</div>
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