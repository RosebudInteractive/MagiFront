import React from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import PropTypes from 'prop-types'
import {testInstanceSelector, questionsSelector, setAnswer} from "ducks/test-instance";
import AnswerButton from "./answer-button";
import AnswerBlock from "./answer-block";

import "./instance.sass"

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
    }

    render() {
        const {test, questions} = this.props,
            _total = questions.length,
            _text = questions[this.state.currentIndex].Question.Text

        return <div className="question-wrapper">
            <h3 className="question-title">
                <span className="current">{this.state.currentIndex + 1}</span>
                <span className="total">{"/" + _total + ": "}</span>
                {_text}
            </h3>
            <AnswerBlock question={questions[this.state.currentIndex].Question} onChangeValue={::this._onChangeValue}/>
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
            {questions, setAnswer} = this.props

        if (currentIndex < questions.length - 1) {
            setAnswer({...answer, questionId: questions[currentIndex].Question.Id})

            this.setState({
                currentIndex : currentIndex + 1,
                hasAnswer: false,
                answer: null,
            })
        } else {
            // завершение теста
        }
    }

}


const mapStateToProps = (state) => {
    return {
        test: testInstanceSelector(state),
        questions: questionsSelector(state),
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({setAnswer}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Instance)