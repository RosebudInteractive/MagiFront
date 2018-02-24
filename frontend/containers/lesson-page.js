import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

import LessonsListWrapper from '../components/lesson-page/lessons-list-wrapper';
import LessonFrame from '../components/lesson-page/lesson-frame';

import * as lessonActions from '../actions/lesson-actions';
import * as pageHeaderActions from '../actions/page-header-actions';

import {pages} from '../tools/page-tools';

class LessonPage extends React.Component {
    constructor(props) {
        super(props);
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
        let {
            object : lesson,
            authors,
        } = this.props.lessonInfo;

        lesson.Author = authors.find((author) => {
            return author.Id === lesson.AuthorId
        });

        return <LectureWrapper
            height={this.props.height}
            lesson={lesson}
            lessonUrl={this.props.lessonUrl}
            courseUrl={this.props.course.URL}
            courseTitle={this.props.course.Name}
            lessonCount={this.props.lessons.object.length}
        />
    }

    render() {
        let {
            lessonInfo,
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
                        lessonInfo.object ?
                            <div className="fullpage-wrapper"
                                 id="fullpage"
                                 style={_style}>
                                {this._getLessonsBundles()}

                            </div> : null
                }
            </div>
        )
    }
}

class LectureWrapper extends React.Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        height: PropTypes.number.isRequired,
        courseUrl: PropTypes.string.isRequired,
        lessonUrl: PropTypes.string.isRequired,
        lessonCount: PropTypes.number.isRequired,
    };

    render() {
        return (
            <section className="fullpage-section lecture-wrapper"
                     style={{backgroundImage: "url(" + '/data/' + this.props.lesson.Cover + ")"}}>
                <div className="fp-tableCell" style={{height: this.props.height}}>
                    <Menu {...this.props} current={this.props.lesson.Number} total={this.props.lessonCount}/>
                    <Link to="lecture-transcript.html" className="link-to-transcript">Транскрипт <br/>и материалы</Link>
                    <LessonFrame lesson={this.props.lesson}/>
                </div>
            </section>
        )
    }
}

class Menu extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            opened : false
        }
    }

    static propTypes = {
        courseTitle: PropTypes.string.isRequired,
        courseUrl: PropTypes.string.isRequired,
        current: PropTypes.number.isRequired,
        total: PropTypes.number.isRequired,
    };

    _switchMenu() {
        this.setState({opened: !this.state.opened})
    }


    render() {
        const _logoMob = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#logo-mob"/>',
            _linkBack = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#link-back"></use>',
            _share = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#share"/>';


        return (
            <div className={"lectures-menu _dark" + (this.state.opened ? ' opened' : '')}>
                <div className="lectures-menu__section">
                    <Link to={'/'} className="logo-min">
                        <svg width="75" height="40" dangerouslySetInnerHTML={{__html: _logoMob}}/>
                    </Link>
                    <Link to={'/category/' + this.props.courseUrl} className="lectures-menu__link-back">
                        <div className="icon">
                            <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _linkBack}}/>
                        </div>
                        <span><span className="label">Курс:</span>{' ' + this.props.courseTitle}</span>
                    </Link>
                </div>
                <div className="lectures-menu__section lectures-list-block">
                    <button type="button" className="lectures-list-trigger js-lectures-list-trigger" onClick={::this._switchMenu}><span>Лекция</span>
                        <span className="num"><span className="current">{this.props.current}</span>{'/' + this.props.total}</span></button>
                    <LessonsListWrapper {...this.props}/>
                </div>
                <button type="button" className="social-trigger">
                    <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _share}}/>
                </button>
            </div>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        courseUrl: ownProps.match.params.courseUrl,
        lessonUrl: ownProps.match.params.lessonUrl,
        fetching: state.singleLesson.fetching,
        lessonInfo: state.singleLesson,
        course: state.singleLesson.course,
        lessons: state.lessons,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        lessonActions: bindActionCreators(lessonActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonPage);