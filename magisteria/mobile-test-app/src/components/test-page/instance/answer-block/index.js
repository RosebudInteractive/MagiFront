import React from "react"
import PropTypes from 'prop-types'

import "./answer-block.sass"
import {ANSWER_TYPES} from "#common/constants/common-consts";

export default class AnswerBlock extends React.Component {

    static propTypes = {
        question: PropTypes.object,
        onChangeValue: PropTypes.func,
        answer: PropTypes.array || PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._value = null
    }

    componentDidUpdate(prevProps) {
        if (this.props.question !== prevProps.question) {
            $('.answer-text input').prop('checked',false);
        }
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
            _answerDefined = answer !== null,
            _yesClassName = "select-block_item" + (_answerDefined && !!answer ? " marked _asSelected" : ""),
            _noClassName = "select-block_item" + (_answerDefined && !answer ? " marked _asSelected" : "")

        return <React.Fragment>
            <div className={_yesClassName}>
                <label className="answer-text">
                    Да
                    <input type="radio" name={`bool${question.Id}`} onChange={::this._onChangeBoolValue} data-value={true}/>
                    <span className="check-mark radio"/>
                </label>
            </div>
            <div className={_noClassName}>
                <label className="answer-text">
                    Нет
                    <input type="radio" name={`bool${question.Id}`} onChange={::this._onChangeBoolValue} data-value={false}/>
                    <span className="check-mark radio"/>
                </label>
            </div>
        </React.Fragment>
    }

    _getSelectTypeAnswers() {
        const {answer, question} = this.props

        return question.Answers.map((item) => {

            let _marked = answer && answer.includes(item.Id),
                _className = "select-block_item" + (_marked ? " marked _asSelected" : "")

            return <div className={_className}>
                <label className="answer-text">
                    {item.Text}
                    <input type="radio" name={`radio${this.props.question.Id}`} onChange={::this._onChangeSelectedValue} data-value={item.Id}/>
                    <span className="check-mark radio"/>
                </label>
            </div>
        })
    }

    _getMultiSelectTypeAnswers() {
        const {answer, question} = this.props

        return question.Answers.map((item) => {

            let _marked = answer && answer.includes(item.Id),
                _className = "select-block_item" + (_marked ? " marked _asSelected" : "")

            return <div className={_className}>
                <label className="answer-text">
                    {item.Text}
                    <input type="checkbox" onChange={::this._onChangeSelectedValue} data-value={item.Id}/>
                    <span className="check-mark checkbox"/>
                </label>
            </div>
        })
    }

    _onChangeBoolValue(e) {
        if (this.props.onChangeValue) {this.props.onChangeValue({
            value: e.target.dataset.value === "true",
        })}
    }

    _onChangeSelectedValue() {
        let _answer = [],
            _inputs = $('.answer-text input');

        if (_inputs && (_inputs.length > 0)) {
            for (let i = 0; i < _inputs.length; i++) {
                if (_inputs[i].checked) {
                    _answer.push(+_inputs[i].dataset.value)
                }
            }
        }

        if (this.props.onChangeValue) {this.props.onChangeValue({
            value: _answer
        })}
    }
}