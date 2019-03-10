import React from 'react'
import CourseAggregators from './course-aggregators'
import PropTypes from "prop-types";
import Books from "../books";
import CourseBooksList from "../books/course-books-list";

export default class Sources extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    render() {
        return <React.Fragment>
            <CourseAggregators extLinks={this.props.course.ExtLinks}/>
            <Books books={this.props.course.Books} listClass={CourseBooksList}/>
        </React.Fragment>
    }
}