import React from "react"
import {CONTENT_TYPE} from "../constants/common-consts";

export default class TranscriptParser {

    constructor(data) {
        this.timeStamps = []
        this.episodesTimes = []
        this.paragraphs = []
        this._paraCounter = 0
        this._currentEpisodeFinishTime = 0

        this.html = this._handleTranscript(data)
    }

    _handleTranscript({transcript, playInfo}) {
        let html = [];

        transcript.Episodes.forEach((episode, index) => {
            const _playInfo = playInfo && playInfo.episodes && Array.isArray(playInfo.episodes) && playInfo.episodes[index]

            let _html = this._parseTranscript({episode: episode, playInfo: _playInfo, episodeIndex: index})

            if (_html) {
                html = html.concat(_html)
            }
        });

        const _length = playInfo && playInfo.episodes && Array.isArray(playInfo.episodes) && playInfo.episodes.reduce((acc, item) => {
            return acc + (item.contentType === CONTENT_TYPE.AUDIO) ? item.audio && item.audio.info && item.audio.info.length * 1000 : 0
        }, 0)

        this._calcParagraphTimes({audioLength: _length})

        return (html.length > 0) ? html : null;
    }

    _parseTranscript({episode, playInfo, episodeIndex}) {
        this._paraCounter = 0
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

        let _array = _content.split(/<p>(.*?)<\/p>?/gim);
        let _isToc = true;

        _array
            .filter(item => !!item)
            .forEach((_paragraph) => {

                _paragraph.trim();
                if (_paragraph.length === 0) {
                    return
                }

                _paragraph = this._handleParagraph({paragraph: _paragraph, isToc: _isFirstParagraph || _isToc, startTime: _toc ? _toc.StartTime : null})

                if (_isFirstParagraph) {
                    _div.push(<div id={_toc ? 'toc' + _toc.Id : null} className="toc-anchor">
                        <h2 key={_toc ? _toc.Id : 'undefined'}>{data.tocName}</h2>
                        <p id={`para-${this._paraCounter}`} className='text-intro'
                           dangerouslySetInnerHTML={{__html: _paragraph}}/>
                    </div>)

                    _isFirstParagraph = false;
                } else {
                    if (!_isToc) {
                        _div.push(<p id={`para-${this._paraCounter}`} dangerouslySetInnerHTML={{__html: _paragraph}}/>)
                    } else {
                        _isToc = false;
                        _div.push(<div id={_toc ? 'toc' + _toc.Id : null} className="toc-anchor">
                            <h2 key={_toc ? _toc.Id : 'undefined'}>{data.tocName}</h2>
                            <p id={`para-${this._paraCounter}`} dangerouslySetInnerHTML={{__html: _paragraph}}/>
                        </div>)
                    }
                }

                _isToc = false;

                this._paraCounter++
            })

        data.div = _div
        return {
            div: _div.length ? _div : null,
            newTranscriptText: _transcriptText,
            isFirstParagraph: _isFirstParagraph
        };
    }

    _handleParagraph({paragraph, isToc, startTime}) {
        let _re = /<b><u>ts:{(.*?)}<\/u><\/b>/gim,
            _matches

        let _index = this.paragraphs.push({startTime: null}),
            _newType = false

        while ((_matches = _re.exec(paragraph)) !== null) {
            _newType = true

            if (_matches[1]) {
                let _stringTime = _matches[1].split(":"),
                    _seconds = _stringTime[_stringTime.length - 1] ? _stringTime[_stringTime.length - 1] : 0,
                    _minutes = _stringTime[_stringTime.length - 2] ? _stringTime[_stringTime.length - 2] : 0,
                    _hours = _stringTime[_stringTime.length - 3] ? _stringTime[_stringTime.length - 3] : 0,
                    _milliseconds = (+_seconds + (+_minutes * 60) + (+_hours * 3600)) * 1000

                this.timeStamps.push(_milliseconds)

                if (this.paragraphs[_index - 1].startTime === null) {
                    this.paragraphs[_index - 1].startTime = _milliseconds
                }

                paragraph = (_matches.index === 0) ?
                    paragraph.replace(_matches[0], `<div class="asset-anchor" id="asset-${this.timeStamps.length}"/>`)
                    :
                    paragraph.replace(_matches[0], `<span class="asset-anchor" id="asset-${this.timeStamps.length}"/>`)
            }
        }

        if (!_newType && isToc) {
            this.paragraphs[_index - 1].startTime = startTime
        }

        this.paragraphs[_index - 1].length = $("<div>").html(paragraph).text().length

        return paragraph
    }

    _calcParagraphTimes({audioLength}) {
        let _empties = [],
            _lastIndexWithTime = null

        this.paragraphs.forEach((item, index, paragraphs) => {
            let _time = item.startTime,
                _isLast = index === (paragraphs.length - 1)

            if (_isLast && !item.startTime) {
                _time = audioLength
                _empties.push(index)
            }

            if (_time !== null) {
                if (_empties.length && (_lastIndexWithTime !== null)) {
                    _empties.unshift(_lastIndexWithTime)

                    let _startTime = paragraphs[_lastIndexWithTime].startTime,
                        _finishTime = _time,
                        _timeLength = _finishTime - _startTime,
                        _textLength = _empties.reduce((acc, value) => {
                            return acc + paragraphs[value].length
                        }, 0)

                    _empties.forEach((paragraphIndex, index, empties) => {
                        if (index > 0) {
                            let _part = paragraphs[empties[index - 1]].length / _textLength
                            _startTime += _timeLength * _part
                            paragraphs[paragraphIndex].startTime = _startTime
                        }
                    })

                    _empties = []
                }

                _lastIndexWithTime = index
            } else {
                _empties.push(index)
            }
        })

        this.paragraphs.map((item, index, array) => {
            item.finishTime = index === (array.length - 1) ? audioLength : array[index + 1].startTime
            return item
        })
    }
}
