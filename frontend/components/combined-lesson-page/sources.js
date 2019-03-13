import React from 'react'
import PropTypes from "prop-types";
import Books from "../books";
import LessonBooksList from "../books/lesson-books-list";
import Aggregators from '../aggregators/aggregators'
import LessonAggregators from './lesson-aggregators'
import $ from "jquery"

export default class Sources extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
    }

    render() {
        let {lesson} = this.props,
            _needShowBooks = lesson.Books && Array.isArray(lesson.Books) && (lesson.Books.length > 0),
            _needShowAggregators = !!lesson.ExtLinks && !$.isEmptyObject(lesson.ExtLinks)

        return _needShowBooks
            ?
            <div className="lecture-info__wrapper">
                <div className="lecture-sources">
                    <Aggregators title={'Лекция на других ресурсах'} titleClass={"other-sources__title"}
                                 extLinks={lesson.ExtLinks}/>
                    {
                        _needShowAggregators
                        ?
                            <Books books={lesson.Books} titleClassName={"books__headline"} listClass={LessonBooksList}/>
                            :
                            <Books books={lesson.Books} titleClassName={"books__headline lecture-info__extras-label"} listClass={LessonBooksList} extClass={"lecture-info__extras"}/>
                    }
                </div>
            </div>
            :
            <LessonAggregators extLinks={lesson.ExtLinks}/>
    }
}