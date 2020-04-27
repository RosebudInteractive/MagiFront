import React from 'react'
import {connect} from "react-redux";
import PropTypes from 'prop-types'
import {questionsSelector,} from "ducks/test-instance";
import AnswerBlock from "./answer-block";

import "./answers.sass"
import CommentBlock from "./comment-block";

class Answers extends React.Component {
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

    componentDidMount() {
        let _index = this.props.questions.findIndex(item => !item.Answer)

        _index = _index === -1 ? this.props.questions.length - 1 : _index

        if (_index !== this.state.currentIndex) {
            this.setState({currentIndex: _index})
        }
    }

    render() {
        return <div className="question-wrapper">
            <h2 className="result-header">Проверка ответов:</h2>
            {this._getAnswers()}
        </div>
    }

    _getAnswers() {
        const {questions} = this.props,
            _total = questions.length

        return questions.map((item, index) => {
            return <React.Fragment>
                <h3 className="question-title">
                    <span className="current">{index + 1}</span>
                    <span className="total">{"/" + _total + ": "}</span>
                    <span className="text">{item.Question.Text}</span>
                    <span className={"answer__hint " + (item.IsCorrect ? "correct" : item.IsPartCorrect ? "part-correct" : "wrong") }>{item.IsCorrect ? "Правильный ответ" : item.IsPartCorrect ? "Неполный  ответ" : "Ошибка"}</span>
                </h3>
                <CommentBlock question={item.Question}/>
                <AnswerBlock question={item.Question} answer={item.Answer}/>
            </React.Fragment>
        })
    }

}


const mapStateToProps = (state) => {
    return {
        questions: questionsSelector(state),
    }
}

export default connect(mapStateToProps,)(Answers)