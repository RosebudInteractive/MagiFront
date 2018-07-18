import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

// import Gallery from './gallery';
// import GallerySlides from './gallery-slides';
import $ from 'jquery'

export default class TranscriptPage extends React.Component {
    static propTypes = {
        episodes: PropTypes.array,
        refs: PropTypes.array,
        gallery: PropTypes.array,
        isNeedHideGallery: PropTypes.bool,
        isNeedHideRefs: PropTypes.bool,
        lesson: PropTypes.object,
    };

    constructor(props) {
        super(props);

        this._resizeHandler = () => {
            $('#cover-test').height(window.innerHeight);
            $('#cover-test').width(window.innerWidth);
        }

        // let that = this;
        this._scrollHandler = () => {
            $(window).unbind('resize', this._resizeHandler)
            clearTimeout($.data(this, 'scrollTimer'));
            $.data(this, 'scrollTimer', setTimeout(() => {
                // do something
                $(window).on('resize', this._resizeHandler)
            }, 250));
        }
    }

    componentDidMount() {
        // $(window).on('resize', this._resizeHandler)
        // $(window).on('scroll', this._scrollHandler)
        //
        // this._resizeHandler();
    }

    render() {
        // let {isNeedHideGallery} = this.props;

        return (
            <div>
                <div id='cover-test' style={{
                    width:'100vw',
                    height: '100vh',
                    backgroundImage: "radial-gradient(rgba(28, 27, 23, 0) 0%, #1C1B17 100%), url(" + '/data/' + this.props.lesson.Cover + ")",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "top center",
                }}>

                </div>
                <TextBlock {...this.props} />
                {/*<ReadingBlock {...this.props}/>*/}
                {/*{isNeedHideGallery ? null : <Gallery {...this.props}/>}*/}
                {/*{isNeedHideGallery ? null : <GallerySlides {...this.props}/>}*/}
            </div>
        )
    }
}

class TextBlock extends React.Component {
    static propTypes = {
        episodes: PropTypes.array.isRequired,
    };

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
            let _index = _text.search(/^<h2>/gim);
            let _content = '';

            if (_index > -1) {
                // _content = _text.substr(0, _index)
                _content = _text.slice(0, _index)
            } else {
                _content = _text
            }

            _content = _content.trim();

            let _array = _content.split(/<p>(.*?)<\/p>/gim);
            let _isToc = true;

            _array.forEach((item, index) => {
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

    componentDidMount(){
        this._setIndent()
    }

    componentDidUpdate(){
        this._setIndent()
    }

    _setIndent() {
        let _number = $('.title-text .number')

        if (_number.length > 0) {
            if (window.outerWidth > 899) {
                let _width = _number[0].offsetWidth;
                $('.title-text').css('text-indent', -_width);
            } else {
                $('.title-text').css('text-indent', 0);
            }
        }
    }

    render() {
        let {lesson, isNeedHideRefs} = this.props;

        return (
            <section className={'text-block'} id='text'>
                <div className={'text-block__wrapper'}>
                    <div className='title-text'><span className="number">{lesson.Number + '. '}</span>{lesson.Name}</div>
                    {this._getText()}
                    {isNeedHideRefs ? null : <Refs {...this.props}/>}
                </div>
            </section>
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