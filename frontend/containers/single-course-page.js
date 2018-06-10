import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import Cover from '../components/course-extended/cover-extended';
import Content from '../components/course-extended/content-extended';
import CourseLessons from '../components/course-extended/course-lessons';
import CourseBooks from '../components/course-extended/course-books';

import * as coursesActions from '../actions/courses-page-actions';
import * as pageHeaderActions from '../actions/page-header-actions';
import * as storageActions from '../actions/lesson-info-storage-actions';
import * as userActions from "../actions/user-actions";

import {pages} from '../tools/page-tools';

class Main extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.userActions.whoAmI()
        this.props.storageActions.refreshState();
        this.props.coursesActions.getCourse(this.props.courseUrl);
        this.props.pageHeaderActions.setCurrentPage(pages.singleCourse);
    }

    componentDidUpdate() {
        if (this.props.course) {
            document.title = 'Курс: ' + this.props.course.Name + ' - Магистерия'
        }
    }

    render() {
        let {
            course,
            fetching
        } = this.props;

        return (
            <div>
                {
                    fetching ?
                        <p>Загрузка...</p>
                        :
                        course ?
                            <div className="courses">
                                <CourseModuleExt title={course.Name}/>
                                <CourseTabs
                                    lessons={{total: course.lessonCount, ready: course.readyLessonCount}}
                                    books={{total: course.Books.length}}
                                    courseUrl={this.props.courseUrl}
                                />
                            </div> : null
                }
            </div>
        )
    }
}

class CourseModuleExt extends React.Component {
    render() {
        return (
            <div className="course-module course-module--extended">
                <TitleWrapper title={this.props.title}/>
                <Inner/>
            </div>
        )
    }
}

class TitleWrapper extends React.Component {
    render() {
        return (
            <div className="course-module__title-wrapper">
                <h1 className="course-module__title no_underline">
                    <span className="favourites">В закладки</span>
                    <p className="course-module__label">Курс:</p> <span>{' ' + this.props.title}</span>
                </h1>
            </div>
        )
    }
}

class Inner extends React.Component {
    render() {
        return (
            <div className="course-module__inner">
                <Cover/>
                <Content/>
            </div>
        )
    }
}

const CourseTabsName = {
    lessons: 'lesson',
    books: 'books'
};

class CourseTabs extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: CourseTabsName.lessons
        }
    }

    _onSetActiveTab(tabName) {
        if (tabName !== this.state.activeTab) {
            this.setState({activeTab: tabName})
        }
    }

    _getList() {
        return (
            this.state.activeTab === CourseTabsName.lessons ? <CourseLessons courseUrl={this.props.courseUrl}/> :
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
                        onClick={::this._onSetActiveTab}
                        active={this.state.activeTab === CourseTabsName.lessons}/>
                    <BooksTab
                        total={this.props.books.total}
                        onClick={::this._onSetActiveTab}
                        active={this.state.activeTab === CourseTabsName.books}/>
                </ul>
                <ul className="course-tabs-list">
                    {this._getList()}
                </ul>
            </div>
        )
    }
}

class LessonsTab extends React.Component {
    _onClick() {
        this.props.onClick(CourseTabsName.lessons)
    }

    render() {
        return (
            <li className={'course-tab-control' + (this.props.active ? ' active' : '')} onClick={::this._onClick}>
                <span className="course-tab-control__title">Лекции</span>
                <span className="course-tab-control__label">Вышло</span>
                <span className="course-tab-control__actual">{this.props.ready}</span>
                <span className="course-tab-control__total">/{this.props.total}</span>
            </li>
        )
    }
}

class BooksTab extends React.Component {
    _onClick() {
        if ((this.props) && (this.props.total)) {
            this.props.onClick(CourseTabsName.books)
        }
    }

    render() {
        return (
            <li className={'course-tab-control' + (this.props.active ? ' active' : '')} onClick={::this._onClick}>
                <span className="course-tab-control__title _desktop">Список для чтения:</span>
                <span className="course-tab-control__title _mobile">Книги</span>
                {
                    this.props.total ?
                        <div>
                            <span className="course-tab-control__actual">{this.props.total + ' '}</span>
                            <span className="course-tab-control__label">книги</span>
                        </div>
                        :
                        <div className='course-tab-control__empty-container'>
                            <span className="course-tab-control__empty _desktop">пока пуст</span>
                            <span className="course-tab-control__empty _mobile">0</span>
                        </div>
                }
            </li>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        courseUrl: ownProps.match.params.url,
        fetching: state.singleCourse.fetching,
        course: state.singleCourse.object,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        coursesActions: bindActionCreators(coursesActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        storageActions: bindActionCreators(storageActions, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);