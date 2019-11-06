import React from "react"
import PropTypes from 'prop-types'

import "./answer-button.sass"

export const BUTTON_TYPE = {
    FORWARD: "FORWARD",
    SUBMIT: "SUBMIT",
}

export default class AnswerButton extends React.Component {

    static propTypes = {
        buttonType: PropTypes.string,
        disabled: PropTypes.bool,
    }

    render() {
        const {disabled} = this.props

        return <div className="answer-button__wrapper">
                <button className="button btn--brown" disabled={disabled}>
                    Ответить
                </button>
        </div>
    }
}