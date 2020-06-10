import React from "react"
import {CONTENT_TYPE} from "../constants/common-consts";

export default class TranscriptParser {

    constructor(data) {
        this.timeStamps = []
        this.episodesTimes = []
        this._currentEpisodeFinishTime = 0

        this.html = this._handleTranscript(data)
    }

    _handleTranscript({transcript, playInfo}) {
        let html = [];

        transcript.Episodes.forEach((episode, index) => {
            const _playInfo = playInfo && playInfo.episodes && Array.isArray(playInfo.episodes) && playInfo.episodes[index]

            let _html = this._parseTranscript({episode: episode, playInfo: _playInfo, episodeIndex: index})

            if (_html) { html = html.concat(_html) }
        });

        return (html.length > 0) ? html : null;
    }

    _parseTranscript({episode, playInfo, episodeIndex}) {
        this.timeStamps.length = 0
        this._calcEpisodesTimes({episode: episode, playInfo: playInfo, episodeIndex: episodeIndex})

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

    _calcEpisodesTimes({episode, playInfo, episodeIndex}) {
        const _episodeEnd = playInfo ?
            (playInfo.contentType === CONTENT_TYPE.AUDIO) ?
                playInfo.audio && playInfo.audio.info && playInfo.audio.info.length ? (playInfo.audio.info.length * 1000) : 0
                :
                (playInfo.contentType === CONTENT_TYPE.VIDEO) ?
                    playInfo.video && playInfo.video.duration * 1000
                    :
                    null
            :
            null

        let _times = []
        if (episode.Toc.length) {
            _times = episode.Toc.map((item, index, array) => {
                const _startTime = item.StartTime,
                    _finishTime = (index === (array.length - 1) ? _episodeEnd ? _episodeEnd : null : array[index + 1].StartTime)

                return {
                    id: item.Id,
                    episodeIndex: episodeIndex,
                    start: _startTime,
                    end: _finishTime,
                }
            })
        } else {
            _times.push({
                id: null,
                episodeIndex: episodeIndex,
                start: 0,
                end: _episodeEnd,
            })
        }

        this.episodesTimes = this.episodesTimes.concat(_times)
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

                    // paragraph = paragraph.replace(item, `<div class="asset-anchor" id="asset-${this.timeStamps.length}">asset-${this.timeStamps.length}</div>`)
                    paragraph = paragraph.replace(item, `<div class="asset-anchor" id="asset-${this.timeStamps.length}"/>`)
                }
            })
        }

        return paragraph
    }
}
