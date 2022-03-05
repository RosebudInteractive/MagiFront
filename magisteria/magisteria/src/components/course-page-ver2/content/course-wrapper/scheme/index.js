import React from 'react'
import PropTypes from 'prop-types'
import './scheme.sass'
import LessonsList from './lessons-list'
import {TEST_TYPE} from "../../../../../constants/common-consts";
import TestItem from "./test-item";

export default class Scheme extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        visible: PropTypes.bool,
    }

    constructor(props) {
        super(props)
    }

    render() {
        const {course} = this.props

        return <div className="course-wrapper__scheme wrapper-item">
            <div className="block-title course-scheme__title">Программа курса </div>
            <TestItem test={this._getStartedTest()}/>
            <LessonsList course={course}/>
            <TestItem test={this._getFinishedTest()}/>
            {this._getOtherTests()}
        </div>
    }

    _getStartedTest() {
        return this.props.course.Tests && (this.props.course.Tests.length > 0) &&
            this.props.course.Tests.find(item => item.TestTypeId === TEST_TYPE.STARTED)
    }

    _getFinishedTest() {
        return this.props.course.Tests && (this.props.course.Tests.length > 0) &&
            this.props.course.Tests.find(item => item.TestTypeId === TEST_TYPE.FINISHED)
    }

    _getOtherTests() {
        return this.props.course.Tests && (this.props.course.Tests.length > 0) &&
            this.props.course.Tests
                .filter((item) => {
                    return ((item.TestTypeId !== TEST_TYPE.FINISHED) && (item.TestTypeId !== TEST_TYPE.STARTED))
                })
                .map(item => <TestItem test={item}/>)
    }
}