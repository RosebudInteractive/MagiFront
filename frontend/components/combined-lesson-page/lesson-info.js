import React from 'react';
import PropTypes from 'prop-types';
// import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';


class LessonInfo extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
    }

    _getSublessonList() {
        const _playNofill = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play-nofill"/>',
            _pauseAlt = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pause-alt"/>';

        let {lesson} = this.props;

        return lesson.Lessons.map((item) => {
            return (
                <li>
                    <Link to="#" className="extras-list__item">
                        <span className="counter">10.</span>
                        <span className="inner-counter">{item.Number}</span>
                        {item.Name + ' '}
                        <span className="duration">{item.DurationFmt}</span>
                    </Link>
                    <button className="extras-list__play-btn" type="button"
                            style="background-image: url('assets/images/play-big03.png')">
                        <span className="duration">5:18</span>
                        <svg className="play" width="12" height="11" dangerouslySetInnerHTML={{__html: _playNofill}}/>
                        <svg className="pause" width="8" height="14" dangerouslySetInnerHTML={{__html: _pauseAlt}}/>
                    </button>
                    <button className="extras-list__fav" type="button">
                        <svg width="14" height="23" dangerouslySetInnerHTML={{__html: _pauseAlt}}/>
                    </button>
                </li>
            )
        })
    }

    render() {
        let {lesson} = this.props;

        const _fb = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fb"/>',
            _vk = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#vk"/>',
            _ok = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ok"/>',
            _tw = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tw"/>';

        return (
            lesson && lesson.Lessons && (lesson.Lessons.length > 0)
                ?
                <section className="lecture-info">
                    <div className="lecture-info__wrapper">
                        <div className="lecture-info__block _mobile">
                            <h2 className="lecture-info__title">
                                <span className="number">{lesson.Number + '. '}</span>{lesson.Name}
                            </h2>
                            <p className="lecture-info__descr">{lesson.Description + ' '}
                                <span className="lecture-info__author">Олег Лекманов</span>
                            </p>
                        </div>
                        <div className="social-block social-block--dark _mobile">
                            <div className="social-block__inner">
                                <a href="#" className="social-btn _active">
                                    <div className="social-btn__icon">
                                        <svg width="24" height="24" dangerouslySetInnerHTML={{__html: _fb}}/>
                                    </div>
                                    <span className="social-btn__actions">64</span>
                                </a>
                                <a href="#" className="social-btn _active">
                                    <div className="social-btn__icon">
                                        <svg width="26" height="15" dangerouslySetInnerHTML={{__html: _vk}}/>
                                    </div>
                                    <span className="social-btn__actions">91</span>
                                </a>
                                <a href="#" className="social-btn _active">
                                    <div className="social-btn__icon">
                                        <svg width="14" height="24" dangerouslySetInnerHTML={{__html: _ok}}/>
                                    </div>
                                    <span className="social-btn__actions">4</span>
                                </a>
                                <a href="#" className="social-btn">
                                    <div className="social-btn__icon">
                                        <svg width="27" height="22" dangerouslySetInnerHTML={{__html: _tw}}/>
                                    </div>
                                    <span className="social-btn__actions"/>
                                </a>
                            </div>
                        </div>
                        <div className="lecture-info__extras">
                            <p className="lecture-info__extras-label">Доп<span
                                className="mobile">олнительные</span><span
                                className="desktop">.</span> эпизоды</p>
                            <ol className="lecture-info__extras-list extras-list _full" data-number="10">
                                {this._getSublessonList()}
                            </ol>
                        </div>
                    </div>
                </section>
                :
                null
        )
    }
}

function mapStateToProps(state) {
    return {
        // lessons: state.lessons,
        // course: state.singleLesson.course,
        // isLessonMenuOpened: state.app.isLessonMenuOpened,
        // contentArray: state.player.contentArray,
        // menuId: state.app.menuId,
        // showContentTooltip: state.player.showContentTooltip,
        // showSpeedTooltip: state.player.showSpeedTooltip,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        // playerActions: bindActionCreators(playerActions, dispatch),
        // appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonInfo);