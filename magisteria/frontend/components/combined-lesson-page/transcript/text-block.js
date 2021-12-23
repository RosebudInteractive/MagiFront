import React from "react";
import {connect} from 'react-redux';
import PropTypes from "prop-types";
import $ from "jquery";
import {getLessonNumber, getShareURL} from "tools/page-tools";
import SocialBlock from "../social-block";
import PlayBlock from "../play-block";
import PriceBlock from "../../common/price-block";
import Refs from "./refs"
import AssetBlock from "./asset-viewer";
import "./text-block.sass"
import {refsSelector, textSelector} from "ducks/transcript";
import ContentBlock from "./content-block";

class TextBlock extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        lesson: PropTypes.object,
        isPaidCourse: PropTypes.bool,
        courseUrl: PropTypes.string,
        lessonUrl: PropTypes.string,
        showAssets: PropTypes.bool,
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
    }

    render() {
        let {course, lesson, isPaidCourse, courseUrl, lessonUrl, showAssets} = this.props,
            _singleLesson = course && course.OneLesson

        let _transcriptClassName = "transcript-page _nested" + (_singleLesson ? ' _single' : '')

        return <div className={_transcriptClassName} id="transcript">
                <section className={"text-block js-text-block-start" + (showAssets ? " _with-assets" : " _only-text")}>
                    <p className="text-block__label">Транскрипт</p>
                    <div className="content-block">
                    <ContentBlock course={course} lesson={lesson} courseUrl={courseUrl} lessonUrl={lessonUrl} isPaidCourse={isPaidCourse}/>
                        <div className="right-block white-block">
                            <div className="fixed-container js-play">
                                { showAssets && <AssetBlock/> }
                            </div>
                        </div>
                    </div>
                </section>
            </div>
    }
}

const mapState2Props = (state) => {
    return {
        refs: refsSelector(state),
        text: textSelector(state)
    }
}

export default connect(mapState2Props)(TextBlock)