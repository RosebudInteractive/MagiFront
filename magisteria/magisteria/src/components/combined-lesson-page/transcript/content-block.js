import React from "react";
import {connect} from 'react-redux';
import PropTypes from "prop-types";
import $ from "jquery";
import {getLessonNumber, getShareURL} from "tools/page-tools";
import SocialBlock from "../social-block";
import PlayBlock from "../play-block";
import PriceBlock from "../../common/price-block";
import Refs from "./refs"
import "./text-block.sass"
import {refsSelector, textSelector} from "ducks/transcript";

class ContentBlock extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        lesson: PropTypes.object,
        isPaidCourse: PropTypes.bool,
        courseUrl: PropTypes.string,
        lessonUrl: PropTypes.string,
    };

    constructor(props) {
        super(props)

        this._onLinkClick = (e) => {
            let _target = $(e.target),
                _href = _target ? _target.attr('href') : null;

            if (_target && _href && _href.includes('#')) {
                let _name = _href.split('#'),
                    _elem = $('a[name =' + _name[1] + ']');

                if (_elem) {
                    let _elemTop = _elem.offset().top,
                        _scrollTop = _elemTop - 53;

                    $('html,body').animate({scrollTop: _scrollTop}, 300);

                    e.preventDefault();
                }
            }
        }

        this._resizeHandler = () => {
            _setIndent()
        }
    }

    componentDidMount() {
        _setIndent()

        $('.text-block__wrapper a').bind('click', this._onLinkClick)
        $(window).bind('resize', this._resizeHandler)
    }

    componentWillUnmount() {
        $('.text-block__wrapper a').unbind('click', this._onLinkClick)
        $(window).unbind('resize', this._resizeHandler)
    }

    render() {
        let {course, lesson, isPaidCourse, courseUrl, lessonUrl, refs, text,} = this.props

        let _number = getLessonNumber(lesson);
        _number = lesson.Parent ? (_number + ' ') : (_number + '. ');

        const _authorName = lesson.Author.FirstName + ' ' + lesson.Author.LastName

        return <React.Fragment>
                    {/*<div className="text-container">*/}
                        <div className="white-block left-block">
                            <div className="fixed-container js-container">
                                <PlayBlock course={course}
                                           lesson={lesson}
                                           isPaidCourse={isPaidCourse}
                                           courseUrl={courseUrl}
                                           lessonUrl={lessonUrl}
                                           extClass={'play-btn'}/>
                                <SocialBlock shareUrl={getShareURL()} counter={lesson.ShareCounters}/>
                            </div>
                        </div>
                        <div className={'text-block__wrapper'}>
                            <h1 className='text-block__headline'>
                            <span className="number">
                                {_number}
                            </span>
                                {lesson.Name}
                            </h1>
                            {
                                text &&
                                <div className={"text-block__content" + (this.props.needLockLessonAsPaid ? " _isPaid" : "")}>
                                    {text}
                                </div>
                            }
                            {
                                this.props.isPaidCourse && !lesson.IsFreeInPaidCourse &&
                                <PriceBlock course={{...this.props.course, author: _authorName}} title={"???????????? ????????"}/>
                            }
                            {<Refs refs={refs}/>}
                        </div>
                    {/*</div>*/}
                </React.Fragment>
    }
}

const _setIndent = () => {
    const _number = $('.text-block__headline .number')

    if (_number.length > 0) {
        if ((window.innerWidth < 899) && (window.innerWidth > 599)) {
            let _width = _number[0].offsetWidth;
            $('.text-block__headline').css('text-indent', -_width);
        } else {
            $('.text-block__headline').css('text-indent', 0);
        }
    }
}

const mapState2Props = (state) => {
    return {
        refs: refsSelector(state),
        text: textSelector(state)
    }
}

export default connect(mapState2Props)(ContentBlock)