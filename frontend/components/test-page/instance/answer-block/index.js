import React from "react"
import PropTypes from 'prop-types'

import "./answer-block.sass"
import {ANSWER_TYPES} from "../../../../constants/common-consts";

export default class AnswerBlock extends React.Component {

    static propTypes = {
        question: PropTypes.object,
        onChangeValue: PropTypes.func
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
        return <React.Fragment>
            <div className="select-block_item">
                <label className="answer-text">
                    Да
                    <input type="radio" name="radio" onChange={::this._onChangeValue}/>
                    <span className="check-mark radio"/>
                </label>
            </div>
            <div className="select-block_item">
                <label className="answer-text">
                    Нет
                    <input type="radio" name="radio" onChange={::this._onChangeValue}/>
                    <span className="check-mark radio"/>
                </label>
            </div>
        </React.Fragment>
    }

    _getSelectTypeAnswers() {
        return this.props.question.Answers.map((item) => {
            return <div className="select-block_item">
                <label className="answer-text">
                    {item.Text}
                    <input type="radio" name="radio" onChange={::this._onChangeValue}/>
                    <span className="check-mark radio"/>
                </label>
            </div>
        })
    }

    _getMultiSelectTypeAnswers() {
        return this.props.question.Answers.map((item) => {
            return <div className="select-block_item">
                <label className="answer-text">
                    {item.Text}
                    <input type="checkbox" onChange={::this._onChangeValue}/>
                    <span className="check-mark checkbox"/>
                </label>
            </div>
        })
    }

    _onChangeValue() {
        if (this.props.onChangeValue) {this.props.onChangeValue()}
    }
}
