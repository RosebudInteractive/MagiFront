import React from "react"
import PropTypes from "prop-types"
import LessonsTab from "./lessons-tab"
import BooksTab from "./books-tab"
import CourseLessons from "./course-lessons";
import CourseBooks from "./course-books";

const TABS_NAME = {
    LESSONS: 'LESSONS',
    BOOKS: 'BOOKS'
};

export default class TabsWrapper extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        lessons: PropTypes.object,
        books: PropTypes.object,
    }

    constructor(props) {
        super(props);

        this.state = {
            activeTab: TABS_NAME.LESSONS
        }
    }

    _onSetActiveTab(tabName) {
        if (tabName !== this.state.activeTab) {
            this.setState({activeTab: tabName})
        }
    }

    _getList() {
        return (
            this.state.activeTab === TABS_NAME.LESSONS ?
                <CourseLessons course={this.props.course}/>
                :
                <CourseBooks/>
        )
    }

    render() {
        return (
            <div className="course-tabs">
                <ul className="course-tab-controls">
                    <LessonsTab
                        total={this.props.lessons.total}
                        ready={this.props.lessons.ready}
                        onClick={() => { this._onSetActiveTab(TABS_NAME.LESSONS) }}
                        active={this.state.activeTab === TABS_NAME.LESSONS}/>
                    <BooksTab
                        total={this.props.books.total}
                        onClick={() => { this._onSetActiveTab(TABS_NAME.BOOKS) }}
                        active={this.state.activeTab === TABS_NAME.BOOKS}/>
                </ul>
                <ul className="course-tabs-list">
                    {this._getList()}
                </ul>
            </div>
        )
    }
}
