import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

import * as lessonActions from '../../actions/lesson-actions';

class LessonsListWrapper extends React.Component {
    static propTypes = {
        courseUrl: PropTypes.string.isRequired,
        lessonUrl: PropTypes.string.isRequired,
        isDark: PropTypes.bool,
    };

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        // if (!this.props.lessons.loaded) {
        let {courseUrl, lessonUrl} = this.props;
        this.props.lessonActions.getLessonsAll(courseUrl, lessonUrl)
        // }
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

            return <ListItem {...this.props} isActive={lesson.Number === this.props.current} lesson={lesson}
                             key={index}/>
        });
    }

    render() {
        return (
            <div className={"lectures-list-wrapper" + (this.props.isDark ? ' _dark' : '')}>
                <ol className="lectures-list">
                    {this._getLessonsList()}
                </ol>
            </div>
        )
    }

}

class ListItem extends React.Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        isActive: PropTypes.bool.isRequired
    };

    render() {
        let {lesson} = this.props;

        return lesson.State !== 'D' ? this._getReadyLesson(lesson) : this._getDraftLesson(lesson)
    }

    _getReadyLesson(lesson) {
        return (
            <li className={"lectures-list__item" + (this.props.isActive ? ' active' : '')}>
                <Link to={'/' + this.props.courseUrl + '/' + lesson.URL} className="lectures-list__item-header">
                    <ListItemInfo title={lesson.Name} author={lesson.Author}/>
                    <PlayBlock duration={lesson.DurationFmt} cover={lesson.Cover} lessonUrl={lesson.URL} courseUrl={this.props.courseUrl}/>
                </Link>
                <SubList subLessons={lesson.Lessons} parentNumber={lesson.Number} courseUrl={this.props.courseUrl}/>
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

class PlayBlock extends React.Component {
    static propTypes = {
        cover: PropTypes.string.isRequired,
        duration: PropTypes.string.isRequired,
        courseUrl : PropTypes.string.isRequired,
        lessonUrl : PropTypes.string.isRequired,
    };

    render() {
        const _play = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play"></use>',
            _playSmall = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play-small"></use>'

        return (
            <div>
                <div className="play-block">
                    <div className="play-block__image-wrapper"
                         style={{backgroundImage: "url(" + '/data/' + this.props.cover + ")"}}/>
                    <div className="play-block__loader" id="cont01" data-pct="100">
                        <svg className="svg-loader" id="svg01" width="200" height="200" viewBox="0 0 200 200"
                             version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <circle r="98.25" cx="50%" cy="50%" fill="transparent" strokeDasharray="565.48"
                                    strokeDashoffset="0" style={{r: 98.25}}/>
                            <circle className="bar" id="bar01" r="98.25" cx="50%" cy="50%" fill="transparent"
                                    strokeDasharray="565.48" strokeDashoffset="0"/>
                        </svg>
                    </div>
                    <Link to={'/play-lesson/' + this.props.courseUrl + '/' + this.props.lessonUrl} className="play-block__btn">
                        <svg width="41" height="36" dangerouslySetInnerHTML={{__html: _play}}/>
                    </Link>
                    <div className="play-block__tooltip">Смотреть</div>
                    <div className="play-block__duration">{this.props.duration}</div>
                </div>

                <div className="play-block-mobile">
                    <div className="play-block-mobile__play-block">
                        <button type="button" className="play-btn-small">
                            <svg width="12" height="11" dangerouslySetInnerHTML={{__html: _playSmall}}/>
                            <span>Воспроизвести</span>
                        </button>
                        <span className="play-block-mobile__duration">{this.props.duration}</span>
                    </div>
                </div>
            </div>

        )
    }
}

class SubList extends React.Component {

    static propTypes = {
        subLessons: PropTypes.array.isRequired,
        parentNumber: PropTypes.number.isRequired,
        courseUrl: PropTypes.string.isRequired
    };

    _getItems() {
        const _playSmall = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play-small"/>';

        return this.props.subLessons.map((lesson, index) => {
            return <li className="lectures-sublist__item" key={index}>
                <Link to={'/' + this.props.courseUrl + '/' + lesson.URL} className="lectures-list__item-header">
                    <h4 className="lectures-sublist__title">{lesson.Name}</h4>
                </Link>
                <div className="lectures-sublist__item-info">
                    <p className="lectures-sublist__item-author">{lesson.Author.FirstName + ' ' + lesson.Author.LastName}</p>
                    <div className="lectures-sublist__play-block">
                        <button type="button" className="play-btn-small">
                            <svg width="12" height="11" dangerouslySetInnerHTML={{__html: _playSmall}}/>
                            <span>Воспроизвести</span>
                        </button>
                        <span className="lectures-sublist__item-duration">{lesson.DurationFmt}</span>
                    </div>
                </div>
            </li>
        })
    }

    render() {
        return this.props.subLessons.length > 0 ?
            <ol start={this.props.parentNumber} className="lectures-item__body lectures-sublist">
                {this._getItems()}
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