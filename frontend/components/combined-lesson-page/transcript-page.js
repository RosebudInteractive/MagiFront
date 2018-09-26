import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import PlayBlock from './play-block'
import SocialBlock from './social-block'

import GallerySlides from '../transcript-page/gallery-slides';
import $ from 'jquery'
import {getCoverPath, ImageSize} from "../../tools/page-tools";

export default class TranscriptPage extends React.Component {
    static propTypes = {
        episodes: PropTypes.array,
        refs: PropTypes.array,
        gallery: PropTypes.array,
        isNeedHideGallery: PropTypes.bool,
        isNeedHideRefs: PropTypes.bool,
        lesson: PropTypes.object,
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

        while ((_matches = _re.exec(_text)) !== null) {
            let _toc = episode.Toc.find((toc) => {
                return toc.Topic.trim() === _matches[1].trim()
            });

            _text = _text.slice(_re.lastIndex);
            let _index = _text.search(/<h2>/gim);
            let _content = '';

            if (_index > -1) {
                // _content = _text.substr(0, _index)
                _content = _text.slice(0, _index)
                _text = _text.slice(_index)
            } else {
                _content = _text
            }

            _content = _content.trim();

            let _array = _content.split(/<p>(.*?)<\/p>/gim);
            let _isToc = true;

            _array.forEach((item) => {
                let _paragraph = item;

                _paragraph.trim();
                if (_paragraph.length === 0) {
                    return
                }

                _paragraph = _paragraph.replace(/<b><u>ts(.*?)<\/u><\/b>/gim, '');

                if (_isFirstParagraph) {
                    let _firstLetter = _paragraph.slice(0, 1);
                    _paragraph = _paragraph.slice(1);

                    _div.push(<div id={_toc ? 'toc' + _toc.Id : null}>
                        <h2 key={_toc ? _toc.Id : 'undefined'}>{_matches[1]}</h2>
                        <p className='text-intro'>
                            <span className="first-letter">{_firstLetter}</span>
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
                            <h2 key={_toc ? _toc.Id : 'undefined'}>{_matches[1]}</h2>
                            <p>
                                <div dangerouslySetInnerHTML={{__html: _paragraph}}/>
                            </p>
                        </div>)
                    }

                }

                _isToc = false;
            })

            _re.lastIndex = 0;
        }

        if ((_div.length === 0) && (episode.Transcript)) {
            let _firstLetter = episode.Transcript.slice(0, 1);
            let _content = episode.Transcript.slice(1);

            _div.push(<div>
                <p className='text-intro'>
                    <span className="first-letter">{_firstLetter}</span>
                    <div dangerouslySetInnerHTML={{__html: _content}}/>
                </p>
            </div>)
        }

        return _div
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
        let {lesson, isNeedHideRefs} = this.props,
            _cover = getCoverPath(lesson, ImageSize.icon);

        return (
            <div className="transcript-page _nested" id="transcript">
                <section className="text-block js-social-start">
                    <SocialBlock shareUrl={this.props.shareUrl} counter={this.props.counter}/>
                    <PlayBlock {...this.props} lesson={lesson} cover={_cover} extClass={'play-btn js-play'}/>
                    <p className="text-block__label">Транскрипт</p>
                    <div className={'text-block__wrapper'}>
                        <div className='text-block__headline'><span
                            className="number">{lesson.Number + '. '}</span>{lesson.Name}</div>
                        {this._getText()}
                        {isNeedHideRefs ? null : <Refs {...this.props}/>}
                    </div>
                </section>
            </div>
        )
    }
}

class SocialBlockMoc extends React.Component {

    render() {
        const _tw = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tw"/>',
            _fb = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fb"/>',
            _vk = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#vk"/>',
            _ok = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ok"/>';

        const _style = {top: 0, bottom: 'auto'}

        return (
            <div className="social-block-vertical _left js-social" style={_style}>
                <a href="#" className="social-btn-dark">
                    <div className="social-btn-dark__icon">
                        <svg width="27" height="22" dangerouslySetInnerHTML={{__html: _tw}}/>
                    </div>
                    <span className="social-btn-dark__actions">19</span>
                </a>
                <a href="#" className="social-btn-dark _active">
                    <div className="social-btn-dark__icon">
                        <svg width="24" height="24" dangerouslySetInnerHTML={{__html: _fb}}/>
                    </div>
                    <span className="social-btn-dark__actions">64</span>
                </a>
                <a href="#" className="social-btn-dark _active">
                    <div className="social-btn-dark__icon">
                        <svg width="26" height="15" dangerouslySetInnerHTML={{__html: _vk}}/>
                    </div>
                    <span className="social-btn-dark__actions">91</span>
                </a>
                <a href="#" className="social-btn-dark _active">
                    <div className="social-btn-dark__icon">
                        <svg width="14" height="24" dangerouslySetInnerHTML={{__html: _ok}}/>
                    </div>
                    <span className="social-btn-dark__actions"/>
                </a>
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
                <h3 className="literature-sources__title">Источники</h3>
                <ol className="sources-list">
                    {this._getList()}
                </ol>
            </div>
        )
    }
}