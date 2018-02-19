import React from 'react';
import {connect} from 'react-redux';

import * as svg from '../../tools/svg-paths'

class CourseLessons extends React.Component {

    _getList() {
        return this.props.course.Lessons.map((lesson, index) => {
            return lesson.State === 'R' ?
                <LessonFull
                    title={lesson.Name}
                    descr={lesson.ShortDescription}
                    cover={lesson.Cover}
                    duration={lesson.DurationFmt}
                    subLessons={lesson.NSub}
                    refs={lesson.NRefBooks}
                    books={lesson.NBooks}
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

class LessonFull extends React.Component {
    render() {
        return (
            <li className="lecture-full">
                <div className="lecture-full__wrapper">
                    <PlayBlock
                        cover={this.props.cover}
                        duration={this.props.duration}
                    />
                    <InfoBlock
                        title={this.props.title}
                        descr={this.props.descr}
                        subLessons={this.props.subLessons}
                        refs={this.props.refs}
                        books={this.props.books}
                    />
                </div>
            </li>
        )
    }
}

class PlayBlock extends React.Component {
    render() {
        return (
            <div className="lecture-full__play-block">
                <div className="play-block play-block--big">
                    <div className="play-block__image-wrapper">
                        <img src={'/data/' + this.props.cover} width="311" height="311" alt=""/>
                    </div>
                    <div className="play-block__loader" id="cont" data-pct="100">
                        <svg className="svg-loader" id="svg" width="200" height="200" viewBox="0 0 200 200"
                             version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <circle r={98.75} cx="100" cy="100" fill="transparent" strokeDasharray={565.48}
                                    strokeDashoffset={0}/>
                            <circle className="bar" id="bar" r={98.75} cx="100" cy="100" fill="transparent"
                                    strokeDasharray={565.48} strokeDashoffset={0}
                            />
                        </svg>
                    </div>
                    <div className="play-block__btn">
                        <svg width="41" height="36">
                            {svg.play}
                        </svg>
                    </div>
                    <div className="play-block__tooltip">Смотреть</div>
                    <div className="play-block__duration">{this.props.duration}</div>
                </div>
            </div>
        )
    }
}

class InfoBlock extends React.Component {
    render() {
        return (
            <div className="lecture-full__info-block">
                <div className="lecture-full__text-block">
                    <h3 className="lecture-full__title"><a href="#">{this.props.title}</a></h3>
                    <p className="lecture-full__descr">{' ' + this.props.descr + ' '}</p>
                </div>
                <div className="lecture-full__info-table">
                    <div className="lecture-full__info-table-col">
                                                <span className="icon">
                                                    <svg width="18" height="18">
                                                        {/*<use xmlns:xlink="http://www.w3.org/1999/xlink"*/}
                                                        {/*xlink:href="#eps"></use>*/}
                                                        {svg.eps}
                                                    </svg>
                                                </span>
                        <p className="lecture-full__info-table-label">Доп. эпизоды</p>
                        <p className="lecture-full__info-table-value">{this.props.subLessons}</p>
                    </div>
                    <div className="lecture-full__info-table-col">
                                                <span className="icon">
                                                    <svg width="18" height="18">
                                                        {/*<use xmlns:xlink="http://www.w3.org/1999/xlink"*/}
                                                        {/*xlink:href="#lit"></use>*/}
                                                        {svg.lit}
                                                    </svg>
                                                </span>
                        <p className="lecture-full__info-table-label">Источники</p>
                        <p className="lecture-full__info-table-value">{this.props.refs}</p>
                    </div>
                    <div className="lecture-full__info-table-col">
                                                <span className="icon">
                                                    <svg width="18" height="18">
                                                        {/*<use xmlns:xlink="http://www.w3.org/1999/xlink"*/}
                                                        {/*xlink:href="#books"></use>*/}
                                                        {svg.book}
                                                    </svg>
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