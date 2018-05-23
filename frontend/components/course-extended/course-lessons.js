import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { Link } from 'react-router-dom';
import PlayBlock from './play-block'
import {ImageSize, getCoverPath} from '../../tools/page-tools'

class CourseLessons extends React.Component {

    _getList() {
        return this.props.course.Lessons.map((lesson, index) => {
            let _cover = getCoverPath(lesson, ImageSize.small)

            return lesson.State === 'R' ?
                <LessonFull
                    id={lesson.Id}
                    title={lesson.Name}
                    url={'../' + this.props.courseUrl + '/' + lesson.URL}
                    courseUrl={this.props.courseUrl}
                    lessonUrl={lesson.URL}
                    descr={lesson.ShortDescription}
                    cover={_cover}
                    duration={lesson.DurationFmt}
                    totalDuration={lesson.Duration}
                    subLessons={lesson.NSub}
                    refs={lesson.NRefBooks}
                    books={lesson.NBooks}
                    audios={lesson.Audios}
                    key={index}/>
                :
                <LessonPreview
                    title={lesson.Name}
                    readyDate={lesson.readyMonth + ' ' + lesson.readyYear}
                    key={index}
                />
        })
    }

    render() {
        if (!this.props.course) {
            return null
        }

        return (
            <ol className="lectures-tab">
                {this._getList()}
            </ol>
        );
    }
}

CourseLessons.propTypes = {
    courseUrl: PropTypes.string.isRequired
};

class LessonFull extends React.Component {
    render() {
        return (
            <li className="lecture-full">
                <div className="lecture-full__wrapper">
                    <PlayBlock {...this.props}/>
                    <InfoBlock
                        title={this.props.title}
                        descr={this.props.descr}
                        subLessons={this.props.subLessons}
                        refs={this.props.refs}
                        books={this.props.books}
                        url={this.props.url}
                    />
                </div>
            </li>
        )
    }
}

class InfoBlock extends React.Component {
    render() {
        const _eps = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#eps"/>',
            _lit = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#lit"/>',
            _books = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#books"/>';

        return (
            <div className="lecture-full__info-block">
                <div className="lecture-full__text-block">
                    <h3 className="lecture-full__title"><Link to={this.props.url}>{this.props.title}</Link></h3>
                    <p className="lecture-full__descr">{' ' + this.props.descr + ' '}</p>
                </div>
                <div className="lecture-full__info-table">
                    <div className="lecture-full__info-table-col">
                                                <span className="icon">
                                                    <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _eps}}/>
                                                </span>
                        <p className="lecture-full__info-table-label">Доп. эпизоды</p>
                        <p className="lecture-full__info-table-value">{this.props.subLessons}</p>
                    </div>
                    <div className="lecture-full__info-table-col">
                                                <span className="icon">
                                                    <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _lit}}/>
                                                </span>
                        <p className="lecture-full__info-table-label">Источники</p>
                        <p className="lecture-full__info-table-value">{this.props.refs}</p>
                    </div>
                    <div className="lecture-full__info-table-col">
                                                <span className="icon">
                                                    <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _books}}/>
                                                </span>
                        <p className="lecture-full__info-table-label">Книги</p>
                        <p className="lecture-full__info-table-value">{this.props.books}</p>
                    </div>
                </div>
            </div>
        )
    }
}

class LessonPreview extends React.Component {
    render() {
        return (
            <li className="lecture-full lecture-full--archive">
                <div className="lecture-full__wrapper">
                    <h3 className="lecture-full__archive-title"><a href="#">{this.props.title + ' '}</a></h3>
                    <div className="lecture-full__archive-date">{this.props.readyDate}</div>
                </div>
            </li>
        )
    }
}

function mapStateToProps(state) {
    return {
        course: state.singleCourse.object,
    }
}

export default connect(mapStateToProps)(CourseLessons);