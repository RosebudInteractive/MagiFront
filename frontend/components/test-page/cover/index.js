import React from 'react'
import {bindActionCreators} from 'redux';
import {connect} from "react-redux";

import {getCountMinutesTitle, getQuestionsTitle} from "tools/word-tools";
import {testSelector} from "ducks/test";
import {createNewTestInstance} from "ducks/test-instance";

import './cover.sass'
import {SocialBlock} from "../social-block";

const INFO_SEPARATOR = <span className="test-page__info-separator">•</span>

class Cover extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const {test, authorized} = this.props,
            _coverUrl = test.Cover,
            _startButtonDisabled = test && test.IsAuthRequired && !authorized


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
                backgroundPosition: `${_backgroundPosition.top} ${_backgroundPosition.left}`,
            }

        return <div className="test-page__cover js-test-content" style={_coverStyle}>
            <div className="margin-block flex-column-block">
                <div className="test-page__info">
                    <h1 className="title">
                        <p className="title__label">Тест:</p>
                        <span>{test.Name ? test.Name.trim() : ""}</span>
                    </h1>
                    <div className="detail">
                        <div className="info__detail-item">{test.questionsCount + ' ' + getQuestionsTitle(test.questionsCount)}</div>
                        {INFO_SEPARATOR}
                        <div className="info__detail-item">{'≈' + test.estimatedTime + ' ' + getCountMinutesTitle(test.estimatedTime)}</div>
                    </div>
                </div>
                <div className="start-button__block">
                    <div className={"button btn--brown start-button" + (_startButtonDisabled ? " disabled" : "")} onClick={::this._createInstance}>
                        Начать тест
                    </div>
                    <SocialBlock counter={test.ShareCounters}/>
                </div>
            </div>
        </div>
    }

    _createInstance() {
        const {test, authorized} = this.props,
            _startButtonDisabled = test && test.IsAuthRequired && !authorized

        if (!_startButtonDisabled) {
            this.props.createNewTestInstance(test.URL)
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
    return bindActionCreators({createNewTestInstance}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Cover)