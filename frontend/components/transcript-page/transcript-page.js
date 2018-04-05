import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import Gallery from './gallery';

export default class TranscriptPage extends React.Component {
    static propTypes = {
        episodes: PropTypes.array.isRequired,
        refs: PropTypes.array.isRequired,
        gallery: PropTypes.array.isRequired,
    };

    render() {
        return (
            <div>
                <TextBlock {...this.props} />
                {/*<ReadingBlock {...this.props}/>*/}
                <Gallery {...this.props}/>
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
        const _re = /^<h2>(.+)<\/h2>/gim;
        let _matches;

        let _text = episode.Transcript;

        while ((_matches = _re.exec(_text) ) !== null) {
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
            let _firstLetter = _content.slice(0, 1);
            _content = _content.slice(1);

            _div.push(<div id={_toc ? 'toc' + _toc.Id : null}>
                <h2 key={_toc ? _toc.Id : 'undefined'}>{_matches[1]}</h2>
                <p className='text-intro'>
                    <span className="first-letter">{_firstLetter}</span>
                    <div dangerouslySetInnerHTML={{__html: _content}}/>
                </p>
            </div>)

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

    render() {
        return (
            <section className={'text-block'} id='text'>
                <div className={'text-block__wrapper'}>
                    {/*<div dangerouslySetInnerHTML={{__html: this._getText()}}/>*/}
                    {this._getText()}
                    <Refs {...this.props}/>
                </div>
            </section>
        )
    }
}

class Refs extends React.Component {

    _getList() {
        return this.props.refs.map((ref, index) => {
            return <li key={index}>
                {ref.URL ? <Link to={ref.URL}>ref.Description</Link> : ref.Description}
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