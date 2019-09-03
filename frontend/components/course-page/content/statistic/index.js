import React from 'react'
import PropTypes from 'prop-types'
import './statistic.sass'
import PlayBlock from "../../../common/play-block";
import {getCoverPath, ImageSize} from "tools/page-tools";
import Progress from './progress'
import $ from "jquery";
import {isMobile} from "tools/page-tools";

export default class Statistic extends React.Component {

    static propTypes = {
        course: PropTypes.object
    }

    constructor(props) {
        super(props)

        this.state = {
            fixed : false
        }

        this._handleScroll = () => {
            if (isMobile()) { return }

            let _windowScrollTop = $(window).scrollTop();

            let _wrapper = $('.course-page__statistic'),
                _offsetTop = _wrapper.offset().top - 100;

            if ((_windowScrollTop < _offsetTop) && this.state.fixed){
                this.setState({
                    fixed: false
                });
            }

            if ((_windowScrollTop > _offsetTop) && !this.state.fixed) {
                this.setState({
                    fixed: true
                });
            }
        }

        this._addEventListeners();
    }

    componentDidMount() {
        this._handleScroll();
    }

    componentWillUnmount() {
        this._removeEventListeners();
    }

    render() {
        const {course} = this.props,
            _lesson = course.Lessons[0];

        if (typeof _lesson.CoverMeta === "string") {
            _lesson.CoverMeta = JSON.parse(_lesson.CoverMeta)
        }

        const _cover = getCoverPath(_lesson, ImageSize.small)

        return <div className="course-page__statistic">
            <div className={"course-page__statistic-wrapper" + (this.state.fixed ? " _fixed" : "")}>
                <div className="play-block__wrapper">
                    <PlayBlock course={course} lesson={_lesson} cover={_cover} isAdmin={true}/>
                </div>
                <Progress course={course}/>
            </div>
        </div>
    }

    _addEventListeners() {
        window.addEventListener('scroll', ::this._handleScroll);
    }

    _removeEventListeners() {
        window.removeEventListener('scroll', this._handleScroll);
    }
}