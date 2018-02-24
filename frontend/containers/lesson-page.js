import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import { Link } from 'react-router-dom';

// import Cover from '../components/course-extended/cover-extended';
// import Content from '../components/course-extended/content-extended';
// import CourseLessons from '../components/course-extended/course-lessons';
// import CourseBooks from '../components/course-extended/course-books';

import * as lessonActions from '../actions/lesson-actions';
import * as pageHeaderActions from '../actions/page-header-actions';

import {pages} from '../tools/page-tools';

class LessonPage extends React.Component {
    constructor(props) {
        super(props);
        // this.props.coursesActions.getCourses();
    }

    componentWillMount() {
        this._bodyClassName = document.getElementById('body').className;
        document.getElementById('body').className = 'fp-viewing-lecture01';

        this._htmlClassName = document.getElementById('html').className;
        document.getElementById('html').className = 'fp-enabled';

        let {courseUrl, lessonUrl} = this.props;

        this.props.lessonActions.getLesson(courseUrl, lessonUrl);
        this.props.pageHeaderActions.setCurrentPage(pages.lesson);
    }

    componentWillUnmount() {
        document.getElementById('body').className = this._bodyClassName;
        document.getElementById('html').className = this._htmlClassName;
    }

    _getLessonsBundles() {

    }

    render() {
        let {
            lesson,
            fetching
        } = this.props;

        const _style = {
            height: "100%",
            position: "relative",
            touchAction: "none",
            transform: "translate3d(0px, 0px, 0px)",
            transition: "all 700ms ease"
        };

        return (
            <div>
                {
                    fetching ?
                        <p>Загрузка...</p>
                        :
                        lesson ?
                            <div className="fullpage-wrapper"
                                 id="fullpage"
                                 style={_style}>
                                {this._getLessonsBundles()}
                                <LectureWrapper lesson={lesson}/>
                            </div> : null
                }
            </div>
        )
    }
}

class LectureWrapper extends React.Component {
    render() {
        return (
            <section className="fullpage-section lecture-wrapper" style={{backgroundImage: "url(" + '/data/'+ this.props.lesson.Cover + ")"}}>
                <div className="fp-tableCell" style={{height: 472}}>
                    <Menu/>
                    <Link to="lecture-transcript.html" className="link-to-transcript">Транскрипт <br/>и материалы</Link>

                </div>
            </section>
        )
    }
}

LectureWrapper.props = {
    lesson: PropTypes.object.isRequired
};

class Menu extends React.Component {
    static props = {

    }


    render() {
        const _logoMob = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#logo-mob"/>',
            _linkBack = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#link-back"></use>',
            _share='<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#share"/>';


        return (
            <div className="lectures-menu js-lectures-menu _dark">
                <div className="lectures-menu__section">
                    <Link to={'/'} className="logo-min">
                        <svg width="75" height="40" dangerouslySetInnerHTML={{ __html: _logoMob }}/>
                    </Link>
                    <a href="#" className="lectures-menu__link-back">
                        <div className="icon">
                            <svg width="18" height="18" dangerouslySetInnerHTML={{ __html: _linkBack }}/>
                        </div>
                        <span><span className="label">Курс:</span> Империи и цивилизации древней Евразии</span>
                    </a>
                </div>
                <div className="lectures-menu__section lectures-list-block">
                    <button type="button" className="lectures-list-trigger js-lectures-list-trigger"><span>Лекция</span> <span className="num"><span className="current">10</span>/13</span></button>

                </div>
                <button type="button" className="social-trigger">
                    <svg width="18" height="18" dangerouslySetInnerHTML={{ __html: _share }}/>
                </button>
            </div>
        )
    }
}

// class TitleWrapper extends React.Component {
//     render() {
//         return (
//             <div className="course-module__title-wrapper">
//                 <h1 className="course-module__title"><p className="course-module__label">
//                     Курс:</p>{' ' + this.props.title}</h1>
//             </div>
//         )
//     }
// }

// class Inner extends React.Component {
//     render() {
//         return (
//             <div className="course-module__inner">
//                 <Cover/>
//                 <Content/>
//             </div>
//         )
//     }
// }

// const CourseTabsName = {
//     lessons: 'lesson',
//     books: 'books'
// };

// class CourseTabs extends React.Component {
//     constructor(props) {
//         super(props);
//
//         this.state = {
//             activeTab: CourseTabsName.lessons
//         }
//     }
//
//     _onSetActiveTab(tabName) {
//         if (tabName !== this.state.activeTab) {
//             this.setState({activeTab: tabName})
//         }
//     }
//
//     _getList() {
//         return (
//             this.state.activeTab === CourseTabsName.lessons ? <CourseLessons/> : <CourseBooks/>
//         )
//     }
//
//     render() {
//         return (
//             <div className="course-tabs">
//                 <ul className="course-tab-controls">
//                     <LessonsTab
//                         total={this.props.lessons.total}
//                         ready={this.props.lessons.ready}
//                         onClick={::this._onSetActiveTab}
//                         active={this.state.activeTab === CourseTabsName.lessons}/>
//                     <BooksTab
//                         total={this.props.books.total}
//                         onClick={::this._onSetActiveTab}
//                         active={this.state.activeTab === CourseTabsName.books}/>
//                 </ul>
//                 <ul className="course-tabs-list">
//                     {this._getList()}
//                 </ul>
//             </div>
//         )
//     }
// }

// class LessonsTab extends React.Component {
//     _onClick() {
//         this.props.onClick(CourseTabsName.lessons)
//     }
//
//     render() {
//         return (
//             <li className={'course-tab-control' + (this.props.active ? ' active' : '')} onClick={::this._onClick}>
//                 <span className="course-tab-control__title">Лекции</span>
//                 <span className="course-tab-control__label">Вышло</span>
//                 <span className="course-tab-control__actual">{this.props.ready}</span>
//                 <span className="course-tab-control__total">/{this.props.total}</span>
//             </li>
//         )
//     }
// }

// class BooksTab extends React.Component {
//     _onClick() {
//         if ((this.props) && (this.props.total)) {
//             this.props.onClick(CourseTabsName.books)
//         }
//     }
//
//     render() {
//         return (
//             <li className={'course-tab-control' + (this.props.active ? ' active' : '')} onClick={::this._onClick}>
//                 <span className="course-tab-control__title _desktop">Список для чтения:</span>
//                 <span className="course-tab-control__title _mobile">Книги</span>
//                 {
//                     this.props.total ?
//                         <div>
//                             <span className="course-tab-control__actual">{this.props.total + ' '}</span>
//                             <span className="course-tab-control__label">книги</span>
//                         </div>
//                         :
//                         <div style={{marginBottom: 2}}>
//                             <span className="course-tab-control__empty _desktop">пока пуст</span>
//                             <span className="course-tab-control__empty _mobile">0</span>
//                         </div>
//                 }
//             </li>
//         )
//     }
// }

function mapStateToProps(state, ownProps) {
    return {
        courseUrl: ownProps.match.params.courseUrl,
        lessonUrl: ownProps.match.params.lessonUrl,
        fetching: state.singleLesson.fetching,
        lesson: state.singleLesson.object,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        lessonActions: bindActionCreators(lessonActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonPage);