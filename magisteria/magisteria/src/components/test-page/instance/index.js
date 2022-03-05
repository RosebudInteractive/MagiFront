import React from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import PropTypes from 'prop-types'
import {
    testInstanceSelector,
    questionsSelector,
    setAnswerAndSave,
    setAnswerAndFinish,
    loadingSelector as testInstanceLoading
} from "ducks/test-instance";
import AnswerButton from "./answer-button";
import AnswerBlock from "./answer-block";

import "./instance.sass"
import {ANSWER_TYPES} from "../../../constants/common-consts";
import {sendMessage} from "#common/tools/message-handler";

class Instance extends React.Component {
    static propTypes = {
        test: PropTypes.object,
    }

    constructor(props) {
        super(props)

        this.state = {
            currentIndex : 0,
            hasAnswer: false,
            answer: null,
        }

        this._enterHandler = (e) => {
            if (e.keyCode === 13) {
                if (this.state.hasAnswer) {
                    this._onForward()
                }
            }
        }
    }

    componentDidMount() {
        let _index = this.props.questions.findIndex(item => (item.Answer === null) )

        _index = _index === -1 ? this.props.questions.length - 1 : _index

        if (_index !== this.state.currentIndex) {
            this.setState({currentIndex: _index})
        }

        window.scrollTo(0, 0)
        $(window).bind("keyup", this._enterHandler)
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.currentIndex !== this.state.currentIndex) {
            window.scrollTo(0, 0)
        }
    }

    componentWillUnmount() {
        $(window).unbind("keyup", this._enterHandler)
    }

    render() {
        const {test, questions, fetching} = this.props

        if (fetching || (!questions.length)) { return null }

        const _total = questions.length,
            _question = questions[this.state.currentIndex].Question,
            _needHint = _question.AnswType === ANSWER_TYPES.MULTI_SELECT,
            _text = _question.Text

        return <div className="question-wrapper js-test-content">
            <h3 className="question-title">
                <span className="current">{this.state.currentIndex + 1}</span>
                <span className="total">{`/${_total} `}</span>
                {_text}
                {_needHint && <div className="hint">На этот вопрос возможно несколько правильных ответов</div>}
            </h3>
            <AnswerBlock question={_question} onChangeValue={::this._onChangeValue} answer={this.state.answer && this.state.answer.value}/>
            <AnswerButton test={test} disabled={!this.state.hasAnswer} onButtonClick={::this._onForward}/>
        </div>
    }

    _onChangeValue(answer) {
        this.setState({
            answer: answer,
            hasAnswer: true,
        })
    }

    _onForward() {
        const {currentIndex, answer} = this.state,
            {questions, setAnswerAndSave, setAnswerAndFinish} = this.props

        if (currentIndex < questions.length - 1) {
            setAnswerAndSave({...answer, questionId: questions[currentIndex].Question.Id})

            this.setState({
                currentIndex : currentIndex + 1,
                hasAnswer: false,
                answer: null,
            })
        } else {
            // завершение теста
            setAnswerAndFinish({...answer, questionId: questions[currentIndex].Question.Id})
            if (this.props.isMobileApp) {
                setTimeout(() => {
                    sendMessage({ isTestFinished: true })
                }, 0)
            }
        }
    }

}


const mapStateToProps = (state) => {
    return {
        fetching: testInstanceLoading(state),
        test: testInstanceSelector(state),
        questions: questionsSelector(state),
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({setAnswerAndSave, setAnswerAndFinish}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Instance)
