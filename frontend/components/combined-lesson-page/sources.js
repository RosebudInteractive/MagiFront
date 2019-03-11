import React from 'react'
import PropTypes from "prop-types";
import Books from "../books";
import LessonBooksList from "../books/lesson-books-list";
import Aggregators from '../aggregators/aggregators'
import LessonAggregators from './lesson-aggregators'

export default class Sources extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
    }

    render() {
        let {lesson} = this.props,
            _needShowBooks = lesson.Books && Array.isArray(lesson.Books) && (lesson.Books.length > 0)

        return _needShowBooks
        ?
            <div className="lecture-sources">
                <Aggregators title={'Лекция на других ресурсах'} titleClass={"other-sources__title"} extLinks={lesson.ExtLinks}/>
                <Books books={lesson.Books} titleClassName={"books__headline"} listClass={LessonBooksList}/>
            </div>
            :
            <LessonAggregators extLinks={lesson.ExtLinks}/>
    }
}