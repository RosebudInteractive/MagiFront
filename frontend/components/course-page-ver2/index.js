import React from 'react'
import PropTypes from 'prop-types'

import Cover from './cover'
import './course-page.sass'

// import {course} from "./mock-data";
import Content from "./content";
import $ from "jquery";
import {isInViewport} from "tools/page-tools";
import MobileButton from "./mobile-button";

export default class Wrapper extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        isFavorite: PropTypes.bool,
        onFavoritesClick: PropTypes.func,
    }

    constructor(props) {
        super(props)

        $('body').addClass('course-page-ver2').addClass('_transparent-menu')

        this.state = {
            transparentMenu: true
        }

        this._resizeHandler = () => {
            const _margin =$('.page-header').height()

            let _isCoverVisible = isInViewport('.course-page__cover', _margin)
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
        $('body').removeClass('course-page-ver2').removeClass('_transparent-menu')
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
        const {course, shareUrl} = this.props

        return <div className={"course-page__wrapper"}>
            <Cover {...this.props}/>
            <Content course={course} shareUrl={shareUrl}/>
            <MobileButton course={course}/>
        </div>
    }
}