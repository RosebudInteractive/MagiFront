import React from "react"
import PropTypes from 'prop-types'

import "./answer-block.sass"
import {ANSWER_TYPES} from "../../../../../constants/common-consts";

export default class AnswerBlock extends React.Component {

    static propTypes = {
        question: PropTypes.object,
        answer: PropTypes.array || PropTypes.bool,
    }

    render() {
        const {question} = this.props

        switch (question.AnswType) {
            case ANSWER_TYPES.BOOL:
                return <div className="select-block">{this._getBoolTypeAnswers()}</div>

            case ANSWER_TYPES.SELECT:
                return <div className="select-block">{this._getSelectTypeAnswers()}</div>

            case ANSWER_TYPES.MULTI_SELECT:
                return <div className="select-block">{this._getMultiSelectTypeAnswers()}</div>

            default:
                return null
        }
    }

    _getBoolTypeAnswers() {
        const {question, answer} = this.props,
            _markedYes = !!question.AnswBool || !!answer,
            _yesClassName = "select-block_item" + (_markedYes ? " marked" : "") + (!!question.AnswBool ? " _asCorrect" : "") + (!!answer ? " _asSelected" : ""),
            _markedNo = !question.AnswBool || !answer,
            _noClassName = "select-block_item" + (_markedNo ? " marked" : "") + (!question.AnswBool ? " _asCorrect" : "") + (!answer ? " _asSelected" : "")

        return <React.Fragment>
            <div className={_yesClassName}>
                <label className="answer-text">
                    Да
                    <input type="radio" name={`bool${question.Id}`} checked={!!answer} disabled/>
                    <span className="check-mark radio"/>
                </label>
            </div>
            <div className={_noClassName}>
                <label className="answer-text">
                    Нет
                    <input type="radio" name={`bool${question.Id}`} checked={!answer} disabled/>
                    <span className="check-mark radio"/>
                </label>
            </div>
        </React.Fragment>
    }

    _getSelectTypeAnswers() {
        const {answer, question} = this.props

        return question.Answers.map((item) => {

            let _included = answer && Array.isArray(answer) && answer.includes(item.Id),
                _marked = item.IsCorrect || _included,
                _className = "select-block_item" +
                    (_marked ? " marked" : "") +
                    (item.IsCorrect ? " _asCorrect" : "") +
                    (_included ? " _asSelected" : "")

            return <div className={_className}>
                <label className="answer-text">
                    {item.Text}
                    <input type="radio" name={`radio${this.props.question.Id}`} disabled checked={_included}/>
                    <span className="check-mark radio"/>
                </label>
            </div>
        })
    }

    _getMultiSelectTypeAnswers() {
        const {answer, question} = this.props

        return question.Answers.map((item) => {

            let _included = answer && Array.isArray(answer) && answer.includes(item.Id),
                _marked = item.IsCorrect || _included,
                _className = "select-block_item" +
                    (_marked ? " marked" : "") +
                    (item.IsCorrect ? " _asCorrect" : "") +
                    (_included ? " _asSelected" : "")

            return <div className={_className}>
                <label className="answer-text">
                    {item.Text}
                    <input type="checkbox" disabled checked={_included}/>
                    <span className="check-mark checkbox"/>
                </label>
            </div>
        })
    }
}