import React from 'react'
import PropTypes from "prop-types";
import Books from "../books";
import CourseBooksList from "../books/course-books-list";
import Aggregators from '../aggregators/aggregators'

export default class Sources extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    render() {
        return <div className="course-module__sources">
            <Aggregators title={'Курс на других ресурсах'} titleClass={"other-sources__headline"} extLinks={this.props.course.ExtLinks}/>
            <Books books={this.props.course.Books} titleClassName={"books__title"} listClass={CourseBooksList}/>
        </div>
    }
}