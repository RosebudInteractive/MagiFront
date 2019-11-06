import React from 'react'
import PropTypes from 'prop-types'

import Cover from './cover'
import Header from '../header-lesson-page'



export default class Wrapper extends React.Component {
    static propTypes = {
        test: PropTypes.object,
        course: PropTypes.object
    }

    constructor(props) {
        super(props);

        this._handleResize = function() {

        }.bind(this)

        this._addEventListeners();
    }

    render() {
        const {course, test} = this.props

        return <Cover test={test} course={course}/>
    }

    _addEventListeners() {

    }
}