import React from 'react'
import {bindActionCreators} from 'redux';
import {connect} from "react-redux";

import {getCountMinutesTitle, getQuestionsTitle} from "tools/word-tools";
import {testSelector} from "ducks/test";
import {createNewTestInstance, unlockTest} from "ducks/test-instance";

import './cover.sass'
import {SocialBlock} from "../social-block";
import {Link} from "react-router-dom";
import ShareIcon from "../share-icon.svg"

const INFO_SEPARATOR = <span className="test-page__info-separator">•</span>

class Cover extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const {test,} = this.props,
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

        const _preTimeChar = test.estimatedTime ? "≈" : "<",
            _time = test.estimatedTime ? test.estimatedTime : 1,
            _title = test.estimatedTime ? getCountMinutesTitle(_time) : "минуты"

        return <div className="test-page__cover js-test-content" style={_coverStyle}>
            <div className="margin-block flex-column-block">
                <div className="test-page__info">
                    <h1 className="title">
                        <p className="title__label">Тест:</p>
                        <span>{test.Name ? test.Name.trim() : ""}</span>
                    </h1>
                    { test.Description && <div className="description font-universal__body-large">{test.Description}</div> }
                    <div className="detail">
                        <div className="info__detail-item">{test.questionsCount + ' ' + getQuestionsTitle(test.questionsCount)}</div>
                        {INFO_SEPARATOR}
                        <div className="info__detail-item">{`${_preTimeChar} ${_time} ${_title}`}</div>
                    </div>
                </div>
                <div className="start-button__block">
                    {
                        this.props.isMobileApp &&
                        <Link href={"/share-action"} className="button btn--brown share-button">
                            <div className="share-icon">
                                <ShareIcon/>
                            </div>
                            Поделиться
                        </Link>
                    }
                    <div className="button btn--brown start-button" onClick={::this._createInstance}>
                        Начать тест
                    </div>
                    {
                        !this.props.isMobileApp &&
                        <SocialBlock counter={test.ShareCounters}/>
                    }
                </div>
            </div>
        </div>
    }

    _createInstance() {
        const {test, authorized} = this.props,
            _canCreateInstance = test && test.IsAuthRequired && !authorized

        if (!_canCreateInstance) {
            this.props.createNewTestInstance(test.URL)
        } else {
            this.props.unlockTest(test.URL)
        }
    }
}

const mapStateToProps = (state) => {
    return {
        test: testSelector(state),
        authorized: !!state.user.user,
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({createNewTestInstance, unlockTest}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Cover)
