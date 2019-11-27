import React from "react";
import PropTypes from "prop-types";
import "./lesson-tests.sass"
import TestItem from "../test-item";

export default class LessonTests extends React.Component {

    static propTypes = {
        tests: PropTypes.array
    }

    render() {
        const {tests} = this.props

        if (!tests || (tests.length === 0)) {
            return null
        }

        return <div className="lesson__test-list ">
            {this._getTests()}
        </div>

    }

    _getTests() {
        return this.props.tests
            .sort((a, b) => {
                return +b.TestTypeId - +a.TestTypeId
            })
            .map((item) => {
                return <TestItem test={item}/>
            })
    }

}
