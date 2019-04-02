import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import PlayBlock from './play-block'
import SocialBlock from './social-block'

import GallerySlides from '../transcript-page/gallery-slides';
import $ from 'jquery'
import {getCoverPath, getLessonNumber, ImageSize} from "../../tools/page-tools";

export default class TranscriptPage extends React.Component {
    static propTypes = {
        episodes: PropTypes.array,
        refs: PropTypes.array,
        gallery: PropTypes.array,
        isNeedHideGallery: PropTypes.bool,
        isNeedHideRefs: PropTypes.bool,
        lesson: PropTypes.object,
        singleLesson: PropTypes.bool,
        isPaidCourse: PropTypes.bool,
    };

    render() {
        let {isNeedHideGallery} = this.props;

        return [
            <TextBlock {...this.props} />,
            isNeedHideGallery ? null : <GallerySlides {...this.props}/>
        ]
    }
}

class TextBlock extends React.Component {
    static propTypes = {
        episodes: PropTypes.array.isRequired,
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

    _parseTranscript(episode) {
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
                    isFirstParagraph: _isFirstParagraph})

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
                isFirstParagraph: _isFirstParagraph})

            _div.push(data.div)
        }

        if ((_div.length === 0) && (episode.Transcript)) {
            _div.push(<div>
                <p className='text-intro'>
                    <div dangerouslySetInnerHTML={{__html: episode.Transcript}}/>
                </p>
            </div>)
        }

        return _div
    }

    _parseChapter(data) {
        let _div = [],
            _transcriptText = data.text,
            _isFirstParagraph = data.isFirstParagraph;

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

            _paragraph = _paragraph.replace(/<b><u>ts(.*?)<\/u><\/b>/gim, '');

            if (_isFirstParagraph) {
                _div.push(<div id={_toc ? 'toc' + _toc.Id : null}>
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
                    _div.push(<div id={_toc ? 'toc' + _toc.Id : null}>
                        <h2 key={_toc ? _toc.Id : 'undefined'}>{data.tocName}</h2>
                        <p>
                            <div dangerouslySetInnerHTML={{__html: _paragraph}}/>
                        </p>
                    </div>)
                }
            }

            _isToc = false;
        })

        data.div = _div;
        return {div: _div, newTranscriptText: _transcriptText, isFirstParagraph: _isFirstParagraph};
    }

    _getText() {
        let _div = [];

        this.props.episodes.forEach((episode) => {
            let _episodeTranscript = this._parseTranscript(episode)
            _div = _div.concat(_episodeTranscript)
        });

        return _div;
    }

    componentDidMount() {
        this._setIndent()

        $('.text-block__wrapper a').on('click', this._onLinkClick)
    }

    componentWillUnmount() {
        $('.text-block__wrapper a').unbind('click', this._onLinkClick)
    }

    componentDidUpdate() {
        this._setIndent()
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

    render() {
        let {lesson, isNeedHideRefs, singleLesson, isPaidCourse} = this.props,
            _cover = getCoverPath(lesson, ImageSize.icon);

        let _number = getLessonNumber(lesson);
        _number = lesson.Parent ? (_number + ' ') : (_number + '. ');

        let _transcriptClassName = "transcript-page _nested" + (singleLesson ? ' _single' : '')

        return (
            <div className={_transcriptClassName} id="transcript">
                <section className="text-block js-social-start">
                    <SocialBlock shareUrl={this.props.shareUrl} counter={this.props.counter}/>
                    <PlayBlock {...this.props} lesson={lesson} cover={_cover} extClass={'play-btn js-play'} isPaidCourse={isPaidCourse}/>
                    <p className="text-block__label">Транскрипт</p>
                    <div className={'text-block__wrapper'}>
                        <div className='text-block__headline'>
                            <span className="number">
                                {_number}
                            </span>
                            {lesson.Name}
                        </div>
                        {this._getText()}
                        {isNeedHideRefs ? null : <Refs {...this.props}/>}
                    </div>
                </section>
            </div>
        )
    }
}

class Refs extends React.Component {

    _getList() {
        return this.props.refs.map((ref, index) => {
            return <li key={index}>
                {ref.URL ? <Link to={ref.URL}>{ref.Description}</Link> : ref.Description}
            </li>
        })
    }


    render() {
        return (
            <div className="literature-sources" id="recommend">
                <h3 className="literature-sources__title">Литература</h3>
                <ol className="sources-list">
                    {this._getList()}
                </ol>
            </div>
        )
    }
}