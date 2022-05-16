import React from 'react'
import {bindActionCreators} from 'redux';
import './cover.sass'
import {testSelector} from "ducks/test";
import {connect} from "react-redux";
import {SocialBlock} from "../../social-block";
import {
    testInstanceSelector,
    shareUrlSelector,
    urlCreatedSelector,
    createNewTestInstance,
    getShareLink,
    setShareUrl,
} from "ducks/test-instance";
import {getDomain} from "tools/page-tools";
import {lessonsSelector, courseSelector} from "ducks/lesson-menu";
import {LESSON_STATE, TEST_TYPE} from "#common/constants/common-consts";
import ShareIcon from "../../share-icon.svg";
import LessonButton from "./lesson-button";
import {Link} from "react-router-dom";

const RELOAD = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#reload"/>'

class Cover extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const {test, result, urlCreated, shareUrl, course} = this.props,
            _coverUrl = test.Cover

        if (typeof test.CoverMeta === "string") {
            test.CoverMeta = JSON.parse(test.CoverMeta)
        }

        const _backgroundPosition = test.CoverMeta && test.CoverMeta.backgroundPosition ?
                {
                    top: test.CoverMeta.backgroundPosition.percent.top * 100 + "%",
                    left: test.CoverMeta.backgroundPosition.percent.left * 100 + "%",
                }
                :
                {
                    top: "top",
                    left: "center"
                },
            _coverStyle = {
                backgroundImage : "linear-gradient(rgba(47, 47, 47, 0.4) 0%, rgba(47, 47, 47, 0.4) 100%), url(" + '/data/' + _coverUrl + ")",
                backgroundPositionX: _backgroundPosition.left,
                backgroundPositionY: _backgroundPosition.top,
            }

        const _percent = Math.round((result.CorrectCount / result.TotalCount) * 100)

        let _nextLessonUrl = this._getNextLessonUrl(),
            _isLessonStartTest = !!test.LessonId && (test.TestTypeId === TEST_TYPE.STARTED)

        _nextLessonUrl = _nextLessonUrl ? `/${course.URL}/${_nextLessonUrl}` : null

        return <div className="test-result__cover js-test-content" style={_coverStyle}>
            <div className="margin-block flex-column-block">
                <div className="test-result__info">
                        <h1 className="title font-universal__title-large">
                            {`Верно ${result.CorrectCount} из ${result.TotalCount}`}
                        </h1>
                        <div className="message font-universal__title-medium">
                            {`Вы ответили правильно на ${_percent}% вопросов теста «${test.Name}»`}
                        </div>
                </div>
                <div className="next-lesson__buttons-block">
                    <LessonButton isMobileApp={this.props.isMobileApp} isLessonStartTest={_isLessonStartTest} nextLessonUrl={_nextLessonUrl}/>
                    <div className="reinit-button" onClick={::this._createInstance}>
                        <div className="button _white">Пройти тест заново</div>
                    </div>
                    {
                        this.props.isMobileApp &&
                        <Link to={"#share-social"} className="button btn--brown share-button">
                            <div className="share-icon">
                                <ShareIcon/>
                            </div>
                            Поделиться
                        </Link>
                    }
                    {
                        this.props.isMobileApp && <div className="test-result__arrow"/>
                    }
                </div>
                {
                    !this.props.isMobileApp &&
                    <React.Fragment>
                        <div className="social-block__title">Поделиться результатом с друзьями</div>
                        <div className="social-block__wrapper">
                            <SocialBlock beforeOnClick={::this._beforeOnClick} shareUrl={urlCreated ? shareUrl : null} urlCreated={urlCreated}/>
                            <div className="reinit-button" onClick={::this._createInstance}>
                                <span>
                                    <svg width="15" height="15" dangerouslySetInnerHTML={{__html: RELOAD}}/>
                                </span>
                                Пройти тест заново
                            </div>
                        </div>
                    </React.Fragment>
                }

            </div>
        </div>
    }

    _createInstance() {
        this.props.createNewTestInstance(this.props.test.URL)
    }

    _beforeOnClick(socialBlock, button) {
        return new Promise(() => {
            getShareLink(this.props.result.Id)
                .then((data) => {
                    socialBlock.doBeforeSetUrl(button)
                    this.props.setShareUrl(`${getDomain()}/test-result/${data.Id}`)
                })
                .catch((e) => {
                    console.error(e)
                })
        })
    }

    _getNextLessonUrl() {
        const {test, lessonList} = this.props,
            _isLessonTest = !!test.LessonId

        if (_isLessonTest) {
            if (test.TestTypeId === TEST_TYPE.STARTED) {
                return test.LsnURL
            } else {
                const _lessons = this._convertLessonList(),
                    _index = _lessons.findIndex(item => item.Id === test.LessonId)

                if (_index === (_lessons.length - 1)) return null

                const _cutArray = _lessons.slice(_index + 1),
                    _nextLesson = _cutArray.find(item => item.State === LESSON_STATE.READY)

                return _nextLesson ? _nextLesson.URL : null
            }
        }
        else {
            if (test.TestTypeId === TEST_TYPE.STARTED) {
                const _nextLesson = lessonList.find(item => item.State === LESSON_STATE.READY)

                return _nextLesson ? _nextLesson.URL : null
            } else {
                return null
            }
        }
    }

    _convertLessonList() {
        let _result = []

        this.props.lessonList.forEach((item) => {
            _result.push({Id: item.Id, URL: item.URL, State: item.State})
            if (item.Lessons && item.Lessons.length) {
                item.Lessons.forEach((subitem) => {
                    _result.push({Id: subitem.Id, URL: subitem.URL, State: subitem.State})
                })
            }
        })

        return _result
    }
}

const mapStateToProps = (state) => {
    return {
        test: testSelector(state),
        result: testInstanceSelector(state),
        shareUrl: shareUrlSelector(state),
        urlCreated: urlCreatedSelector(state),
        lessonList: lessonsSelector(state),
        course: courseSelector(state),
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({createNewTestInstance, setShareUrl}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Cover)
