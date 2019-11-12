import React from 'react'
import {connect} from "react-redux";
import PropTypes from 'prop-types';

import {testSelector} from "ducks/test";
import Cover from './cover'


class Wrapper extends React.Component {
    // static propTypes = {
    //     test: PropTypes.object,
    //     course: PropTypes.object
    // }

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

const mapStateToProps = (state) => {
    return {test: testSelector(state)}
}

export default connect(mapStateToProps,)(Wrapper)
