import React from 'react'
import PropTypes from 'prop-types'
import AnswerButton from "./answer-button";

import "./instance.sass"
import AnswerBlock from "./answer-block";

export default class Wrapper extends React.Component {
    static propTypes = {
        test: PropTypes.object,
    }

    constructor(props) {
        super(props)

        this.state = {
            currentIndex : 0
        }
    }

    render() {
        const {test} = this.props,
            _total = test.questions.length,
            _text = test.questions[this.state.currentIndex].Text

        return <div className="question-wrapper">
            <h3 className="question-title">
                <span className="current">{this.state.currentIndex + 1}</span>
                <span className="total">{"/" + _total + ": "}</span>
                {_text}
            </h3>
            <AnswerBlock question={test.questions[this.state.currentIndex]}/>
            <AnswerButton test={test} disabled={true}/>
        </div>
    }

}