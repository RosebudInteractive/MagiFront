import React from 'react'
import PropTypes from 'prop-types'
import './cover.sass'
import StartButton from "./start-button";
import {getCountMinutesTitle, getQuestionsTitle} from "tools/word-tools";

const INFO_SEPARATOR = <span className="test-page__info-separator">•</span>

export default class Cover extends React.Component {

    static propTypes = {
        test: PropTypes.object,
        course: PropTypes.object,
    }

    constructor(props) {
        super(props)
    }

    render() {
        const {test, course,} = this.props,
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
                backgroundPosition: `${_backgroundPosition.top} ${_backgroundPosition.left}`,
            }

        return <div className="test-page__cover" style={_coverStyle}>
            <div className="test-page__info-wrapper">
                <StartButton test={test} course={course}/>

                <div className="test-page__info">
                    <h1 className="info__title">
                        <p className="title__label">Тест:</p>
                        <span>{test.Name.trim()}</span>
                    </h1>
                    <div className="info__detail">
                        <div className="info__detail-item">{test.questionsCount + ' ' + getQuestionsTitle(test.questionsCount)}</div>
                        {INFO_SEPARATOR}
                        <div className="info__detail-item">{'≈' + test.estimatedTime + ' ' + getCountMinutesTitle(test.estimatedTime)}</div>
                    </div>
                </div>


            </div>
        </div>
    }
}