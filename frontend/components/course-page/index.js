import React from 'react'
import PropTypes from 'prop-types'

import Cover from './cover'
import './course-page.sass'

import {course} from "./mock-data";
import Content from "./content";
import $ from "jquery";

if (!$.fn.isInViewport) {
    $.fn.isInViewport = function(margin) {
        let _this = $(this);
        if (!_this || !_this.length) { return }

        let elementTop = _this.offset().top;
        let elementBottom = elementTop + _this.outerHeight();

        let viewportTop = $(window).scrollTop() + +margin;
        let viewportBottom = viewportTop + $(window).height();

        return elementBottom > viewportTop && elementTop < viewportBottom;
    };
}

export default class Wrapper extends React.Component {

    static propTypes = {
        course: PropTypes.object
    }

    constructor(props) {
        super(props)

        this.state = {
            transparentMenu: true
        }

        this._resizeHandler = () => {
            const _margin =$('.page-header').height()

            let _isCoverVisible = $('.course-page__cover').isInViewport(_margin)
            if (_isCoverVisible && !this.state.transparentMenu) {
                this.setState({transparentMenu: true})
            }

            if (!_isCoverVisible && this.state.transparentMenu) {
                this.setState({transparentMenu: false})
            }
        }

        $(window).on('resize scroll', ::this._resizeHandler)
    }

    componentDidMount() {
        this._resizeHandler()
    }

    componentWillUnmount() {
        $(window).unbind('resize scroll', this._resizeHandler);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.transparentMenu !== prevState.transparentMenu) {
            if (this.state.transparentMenu) {
                $('body').addClass('_transparent-menu')
            } else {
                $('body').removeClass('_transparent-menu')
            }
        }
    }


    render() {
        // const {course} = this.props

        return <div className={"course-page__wrapper"}>
            <Cover course={course}/>
            <Content course={course}/>
        </div>
    }
}