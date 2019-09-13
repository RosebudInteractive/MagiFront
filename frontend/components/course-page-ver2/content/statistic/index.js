import React from 'react'
import PropTypes from 'prop-types'
import './statistic.sass'
import PlayBlock from "../../../common/play-block";
import {getCoverPath, ImageSize} from "tools/page-tools";
import Progress from './progress'
import $ from "jquery";
import {isMobile} from "tools/page-tools";
import PriceBlock from "../../../common/price-block";
import Data from "./data";

export default class Statistic extends React.Component {

    static propTypes = {
        course: PropTypes.object
    }

    constructor(props) {
        super(props)

        this.state = {
            fixed : false
        }


        // let that = this
        this._handleScroll = function() {
            if (isMobile()) {
                if (this.state.fixed) {
                    this.setState({
                        fixed: false
                    })
                }

                return
            }

            let _windowScrollTop = $(window).scrollTop();

            let _wrapper = $('.course-page__statistic')

            if (!_wrapper || !_wrapper.length) return;

            let _offsetTop = _wrapper.offset().top - 100;

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
        }.bind(this)

        // this._handleScroll = _handleScroll.bind(this)

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
            _lesson = course.statistics.lessons.lastListened;

        if (typeof _lesson.CoverMeta === "string") {
            _lesson.CoverMeta = JSON.parse(_lesson.CoverMeta)
        }

        const _cover = getCoverPath(_lesson, ImageSize.small),
            _isBought = course && (!course.IsPaid || course.IsGift || course.IsBought)

        return <div className="course-page__statistic">
            <div className={"course-page__statistic-wrapper" + (this.state.fixed ? " _fixed" : "")}>
                {
                    _isBought ?
                        <React.Fragment>
                            <div className="play-block__wrapper">
                                <PlayBlock course={course} lesson={_lesson} cover={_cover} isAdmin={true}/>
                            </div>
                            <Progress course={course}/>
                        </React.Fragment>
                        :
                        <React.Fragment>
                            <PriceBlock course={course}/>
                            <Data course={course}/>
                        </React.Fragment>
                }
            </div>
        </div>
    }

    _addEventListeners() {
        $(window).bind('resize scroll', this._handleScroll)
    }

    _removeEventListeners() {
        $(window).unbind('resize scroll', this._handleScroll)
    }
}