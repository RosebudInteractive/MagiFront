import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import PlayBlock from './play-block'
import SubLessonPlayBlock from './subLesson-play-block'

import * as lessonActions from '../../actions/lesson-actions';
import {ImageSize, getCoverPath} from '../../tools/page-tools'

import $ from 'jquery'

class LessonsListWrapper extends React.Component {
    static propTypes = {
        isDark: PropTypes.bool,
    };

    constructor(props) {
        super(props);
    }

    _getLessonsList() {
        const {object: lessons, authors} = this.props.lessons;

        return lessons.map((lesson, index) => {
            lesson.Author = authors.find((author) => {
                return author.Id === lesson.AuthorId
            });

            lesson.Lessons.forEach((subLesson) => {
                subLesson.Author = authors.find((author) => {
                    return author.Id === subLesson.AuthorId
                });
            })

            return <ListItem {...this.props} lesson={lesson}
                             key={index}/>
        });
    }

    componentWillReceiveProps(nextProps) {
        if ((!this.props.isLessonMenuOpened) && (nextProps.isLessonMenuOpened)) {
            $(window).on('touchmove', stopScrolling);
            $(document).on('touchmove', stopScrolling);


            let _elem = document.getElementById(this.props.active);
            if (_elem) {
                _elem.scrollIntoView()
            }
        }

        if ((this.props.isLessonMenuOpened) && (!nextProps.isLessonMenuOpened)) {
            $(window).unbind('touchmove', stopScrolling);
            $(document).unbind('touchmove', stopScrolling)
        }
    }

    render() {
        return this.props.fetching ? null : (
            <div className={"lectures-list-wrapper" + (this.props.isDark ? ' _dark' : '')}>
                <ol className="lectures-list">
                    {this._getLessonsList()}
                </ol>
            </div>
        )
    }
}

function stopScrolling(e) {
    if (!e.target.closest('.lectures-list-wrapper')) {
        e.preventDefault()
    }
}

class ListItem extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
        // currentNumber: PropTypes.string.isRequired,
        active: PropTypes.string,
    };

    render() {
        let {lesson} = this.props;

        return lesson.State !== 'D' ? this._getReadyLesson(lesson) : this._getDraftLesson(lesson)
    }

    _getReadyLesson(lesson) {
        let _isActive = this.props.active === this.props.lesson.Number,
            _cover = getCoverPath(lesson, ImageSize.icon);

        return (
            <li className={"lectures-list__item" + (_isActive ? ' active' : '')} id={this.props.lesson.Number}>
                <Link to={'/' + this.props.courseUrl + '/' + lesson.URL} className="lectures-list__item-header">
                    <ListItemInfo title={lesson.Name} author={lesson.Author}/>
                    <PlayBlock duration={lesson.DurationFmt} cover={_cover} lessonUrl={lesson.URL}
                               courseUrl={this.props.courseUrl} audios={lesson.Audios} id={lesson.Id}
                               totalDuration={lesson.Duration} isAuthRequired={lesson.IsAuthRequired}/>
                </Link>
                <SubList subLessons={lesson.Lessons} active={this.props.active} courseUrl={this.props.courseUrl}/>
            </li>
        )
    }

    _getDraftLesson(lesson) {
        return (
            <li className="lectures-list__item lectures-list__item--old">
                <div className="lectures-list__item-header">
                    <div className="lectures-list__item-info">
                        <h3 className="lectures-list__item-title"><span>{lesson.Name}</span></h3>
                        <p className="lectures-list__item-author">{lesson.Author.FirstName + ' ' + lesson.Author.LastName}</p>
                    </div>
                    <div className="lectures-list__item-date">{lesson.readyMonth + ' ' + lesson.readyYear}</div>
                </div>
            </li>
        )
    }
}

class ListItemInfo extends React.Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        author: PropTypes.object.isRequired
    };

    render() {
        return (
            <div className="lectures-list__item-info">
                <h3 className="lectures-list__item-title"><span>{this.props.title}</span></h3>
                <p className="lectures-list__item-author">{this.props.author.FirstName + ' ' + this.props.author.LastName}</p>
            </div>
        )
    }
}

class SubList extends React.Component {

    static propTypes = {
        subLessons: PropTypes.array.isRequired,
        courseUrl: PropTypes.string.isRequired,
        active: PropTypes.string.isRequired,
    };

    _getItems() {
        // const _playSmall = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play-small"/>';
        const {active} = this.props;

        return this.props.subLessons.map((lesson, index) => {
            let _isActive = lesson.Number === active;

            return <li className={"lectures-sublist__item" + (_isActive ? ' active' : '')} key={index}>
                <Link to={'/' + this.props.courseUrl + '/' + lesson.URL} className="lectures-sublist__title">
                    <span className="sublist-num">{lesson.Number}</span>{lesson.Name}
                </Link>
                <div className="lectures-sublist__item-info">
                    <p className="lectures-sublist__item-author">{lesson.Author.FirstName + ' ' + lesson.Author.LastName}</p>
                    <SubLessonPlayBlock duration={lesson.DurationFmt} lessonUrl={lesson.URL}
                                        courseUrl={this.props.courseUrl} audios={lesson.Audios} id={lesson.Id}
                                        totalDuration={lesson.Duration}/>
                </div>
            </li>
        })
    }

    render() {
        return this.props.subLessons.length > 0 ?
            <ol className="lectures-item__body lectures-sublist">
                {::this._getItems()}
            </ol>
            :
            null
    }
}

function mapStateToProps(state) {
    return {
        fetching: state.lessons.fetching,
        lessons: state.lessons,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        lessonActions: bindActionCreators(lessonActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonsListWrapper);