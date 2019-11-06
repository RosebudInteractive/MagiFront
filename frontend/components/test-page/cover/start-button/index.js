import React from "react"
import {Link} from "react-router-dom";
import PropTypes from 'prop-types'

import "./start-button.sass"


export default class StartButton extends React.Component {

    static propTypes = {
        test: PropTypes.object,
        course: PropTypes.object,
    }

    render() {
        const {test, course} = this.props

        return <div className="start-button__wrapper">
            <Link to={`/test-instance/${course.URL}/${test.URL}`}>
                <div className="button btn--brown">
                    Начать тест
                </div>
            </Link>
        </div>
    }
}