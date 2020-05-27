import React from "react";
import PropTypes from "prop-types";
import $ from "jquery";
import {getLessonNumber, getShareURL} from "tools/page-tools";
import SocialBlock from "../social-block";
import PlayBlock from "../play-block";
import PriceBlock from "../../common/price-block";
import Refs from "./refs"
import AssetBlock from "./asset-viewer";
import "./text-block.sass"

export default class TextBlock extends React.Component {

    static propTypes = {
        transcriptData: PropTypes.object,
        course: PropTypes.object,
        lesson: PropTypes.object,
        isPaidCourse: PropTypes.bool,
        courseUrl: PropTypes.string,
        lessonUrl: PropTypes.string,
    };

    constructor(props) {
        super(props)

        this.timeStamps = []
        this.episodesTimes = []

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
            this._setIndent()
        }
    }

    componentDidMount() {
        this._setIndent()

        $('.text-block__wrapper a').bind('click', this._onLinkClick)
        $(window).bind('resize', this._resizeHandler)
    }

    componentWillUnmount() {
        $('.text-block__wrapper a').unbind('click', this._onLinkClick)
        $(window).unbind('resize', this._resizeHandler)
    }

    render() {
        let {transcriptData, course, lesson, isPaidCourse, courseUrl, lessonUrl} = this.props,
            _singleLesson = course && course.OneLesson,
            _isNeedHideRefs = !(transcriptData && transcriptData.refs && (transcriptData.refs.length > 0))

        let _number = getLessonNumber(lesson);
        _number = lesson.Parent ? (_number + ' ') : (_number + '. ');

        let _transcriptClassName = "transcript-page _nested" + (_singleLesson ? ' _single' : '')

        const _authorName = lesson.Author.FirstName + ' ' + lesson.Author.LastName

        return <div className={_transcriptClassName} id="transcript">
                <section className="text-block js-social-start">
                    <div className="left-block">
                        <p className="text-block__label">Транскрипт</p>
                        <PlayBlock course={course}
                                   lesson={lesson}
                                   isPaidCourse={isPaidCourse}
                                   courseUrl={courseUrl}
                                   lessonUrl={lessonUrl}
                                   extClass={'play-btn'}/>
                        <SocialBlock shareUrl={getShareURL()} counter={lesson.ShareCounters}/>
                    </div>

                    <div className={'text-block__wrapper'}>
                        <h1 className='text-block__headline'>
                            <span className="number">
                                {_number}
                            </span>
                            {lesson.Name}
                        </h1>
                        {this._getText()}
                        {
                            this.props.isPaidCourse && !lesson.IsFreeInPaidCourse &&
                            <PriceBlock course={{...this.props.course, author: _authorName}} title={"Купить курс"}/>
                        }
                        {!_isNeedHideRefs && <Refs refs={transcriptData.refs}/>}
                    </div>

                    <div className="right-block js-play">
                        {/*<PlayBlock course={course}*/}
                        {/*           lesson={lesson}*/}
                        {/*           isPaidCourse={isPaidCourse}*/}
                        {/*           courseUrl={courseUrl}*/}
                        {/*           lessonUrl={lessonUrl}*/}
                        {/*           extClass={'play-btn'}/>*/}
                        <AssetBlock timeStamps={this.timeStamps} episodesTimes={this.episodesTimes}/>
                    </div>


                </section>
            </div>
    }

    _parseTranscript(episode) {
        this.timeStamps.length = 0
        this._calcEpisodesTimes()

        let _div = [];
        const _re = /<h2>(.*?)<\/h2>/gim;
        let _matches;

        let _text = episode.Transcript,
            _isFirstParagraph = true;

        if (_re.test(_text)) {
            _re.lastIndex = 0;

            while ((_matches = _re.exec(_text)) !== null) {
                let data = this._parseChapter({
                    toc: episode.Toc,
                    tocName: _matches[1].trim(),
                    text: _text,
                    lastHeaderPos: _re.lastIndex,
                    isFirstParagraph: _isFirstParagraph
                })

                _div.push(data.div)
                _isFirstParagraph = data.isFirstParagraph
                _text = data.newTranscriptText

                _re.lastIndex = 0;
            }
        } else {
            let data = this._parseChapter({
                toc: episode.Toc,
                text: _text,
                lastHeaderPos: 0,
                isFirstParagraph: _isFirstParagraph
            })

            if (data && data.div) {
                _div.push(data.div)
            }
        }

        if ((_div.length === 0) && (episode.Transcript)) {
            _div.push(<div>
                <p className='text-intro'>
                    <div dangerouslySetInnerHTML={{__html: episode.Transcript}}/>
                </p>
            </div>)
        }

        return (_div.length > 0) ? _div : null
    }

    _parseChapter(data) {
        let _div = [],
            _transcriptText = data.text,
            _isFirstParagraph = data.isFirstParagraph

        let _toc = data.toc.find((toc) => {
            return toc.Topic.trim() === data.tocName
        });

        // Отрезаем заголовок
        _transcriptText = _transcriptText.slice(data.lastHeaderPos);
        let _index = _transcriptText.search(/<h2>/gim);
        let _content = '';

        // Отрезаем контент
        if (_index > -1) {
            _content = _transcriptText.slice(0, _index)
            _transcriptText = _transcriptText.slice(_index)
        } else {
            _content = _transcriptText
        }

        _content = _content.trim();

        let _array = _content.split(/<p>(.*?)(<\/p>)?/gim);
        let _isToc = true;

        _array.forEach((item) => {
            let _paragraph = item;

            if (!_paragraph) {
                return
            }

            _paragraph.trim();
            if (_paragraph.length === 0) {
                return
            }

            // _paragraph = _paragraph.replace(/<b><u>ts(.*?)<\/u><\/b>/gim, '');
            _paragraph = this._handleParagraph(_paragraph)

            if (_isFirstParagraph) {
                _div.push(<div id={_toc ? 'toc' + _toc.Id : null} className="toc-anchor">
                    <h2 key={_toc ? _toc.Id : 'undefined'}>{data.tocName}</h2>
                    <p className='text-intro'>
                        <div dangerouslySetInnerHTML={{__html: _paragraph}}/>
                    </p>
                </div>)

                _isFirstParagraph = false;
            } else {
                if (!_isToc) {
                    _div.push(<p dangerouslySetInnerHTML={{__html: _paragraph}}/>)
                } else {
                    _isToc = false;
                    _div.push(<div id={_toc ? 'toc' + _toc.Id : null} className="toc-anchor">
                        <h2 key={_toc ? _toc.Id : 'undefined'}>{data.tocName}</h2>
                        <p>
                            <div dangerouslySetInnerHTML={{__html: _paragraph}}/>
                        </p>
                    </div>)
                }
            }

            _isToc = false;
        })

        data.div = _div
        return {div: _div.length ? _div : null, newTranscriptText: _transcriptText, isFirstParagraph: _isFirstParagraph};
    }

    _getText() {
        const {transcriptData} = this.props

        let _div = [];

        transcriptData.episodes.forEach((episode) => {
            let _episodeTranscript = this._parseTranscript(episode)
            if (_episodeTranscript) {
                _div = _div.concat(_episodeTranscript)
            }
        });

        return (_div.length > 0) ?
            <div className={"text-block__content" + (this.props.needLockLessonAsPaid ? " _isPaid" : "")}>
                {_div}
            </div>
            :
            null;
    }

    _setIndent() {
        let _number = $('.text-block__headline .number')

        if (_number.length > 0) {
            if ((window.innerWidth < 899) && (window.innerWidth > 599)) {
                let _width = _number[0].offsetWidth;
                $('.text-block__headline').css('text-indent', -_width);
            } else {
                $('.text-block__headline').css('text-indent', 0);
            }
        }
    }

    _handleParagraph(paragraph) {
        let _matches = paragraph.match(/<b><u>ts(.*?)<\/u><\/b>/gim);

        if (_matches) {
            _matches.map((item) => {
                let _regExp = /ts:\s*{(.+)}/,
                    _result = _regExp.exec(item)

                if (_result && _result[1]) {
                    let _stringTime = _result[1].split(":"),
                        _seconds = _stringTime[_stringTime.length - 1] ? _stringTime[_stringTime.length - 1] : 0,
                        _minutes = _stringTime[_stringTime.length - 2] ? _stringTime[_stringTime.length - 2] : 0,
                        _hours = _stringTime[_stringTime.length - 3] ? _stringTime[_stringTime.length - 3] : 0,
                        _milliseconds = (+_seconds + (+_minutes * 60) + (+_hours * 3600)) * 1000

                    this.timeStamps.push(_milliseconds)

                    paragraph = paragraph.replace(item, `<div class="asset-anchor" id="asset-${this.timeStamps.length}">asset-${this.timeStamps.length}</div>`)
                }
            })
        }

        return paragraph
    }

    _calcEpisodesTimes() {
        const {transcriptData} = this.props

        this.episodesTimes = transcriptData.episodes[0].Toc.map((item, index, array) => {
            return {
                id: item.Id,
                start: item.StartTime,
                end: index === (array.length - 1) ? null : array[index + 1].StartTime
            }
        })
    }
}
