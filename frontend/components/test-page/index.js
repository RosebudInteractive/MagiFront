import React from 'react'
import PropTypes from 'prop-types'

import Cover from './cover'
import './test-page.sass'
import {isMobile, isPhoneViewPort} from "tools/page-tools";

// import {course} from "./mock-data";

export default class Wrapper extends React.Component {
    static propTypes = {
        test: PropTypes.object
    }

    constructor(props) {
        super(props);

        this.state = {
            isMobile: isMobile(),
            isPhoneViewPort: isPhoneViewPort()
        }

        this._width = window.innerWidth;

        this._handleResize = function() {
            if (this.state.isMobile !== isMobile()) {
                this.setState({isMobile: isMobile()})
            }

            if (this.state.isPhoneViewPort !== isPhoneViewPort()) {
                this.setState({isPhoneViewPort: isPhoneViewPort()})
            }
        }.bind(this)

        this._addEventListeners();
    }

    render() {
        const {test} = this.props

        return <div className="test-page"/>
    }
}