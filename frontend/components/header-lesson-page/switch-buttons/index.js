import React from 'react';
import {episodesTimesSelector, timeStampsSelector} from "ducks/transcript"
import $ from "jquery";
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';

import {startSetCurrentTime, startPause, startPlay} from "actions/player-start-actions"
import {SVG} from "tools/svg-paths";
import PropTypes from 'prop-types';

const TIME_DELTA = 5

class SwitchButtons extends React.Component {

    static propTypes = {
        type: PropTypes.string,
        isPlayerMode: PropTypes.bool,
        lesson: PropTypes.object,
    }

    constructor(props) {
        super(props);

        this._currentTime = 0

        this._scrollHandler = () => {
            // const {timeStamps} = this.props,
            //     _newType = timeStamps && Array.isArray(timeStamps) && (timeStamps.length > 0)
            //
            // if (_newType) {
            //     this._handleScrollNewType()
            // } else {
                this._oldTypeHandleScroll()
            // }
        }

        $(window).bind('resize scroll', this._scrollHandler)
    }

    componentDidMount() {
        this._scrollHandler()
    }

    componentWillUnmount() {
        $(window).unbind('resize scroll', this._scrollHandler);
    }

    render() {
        return (this.props.type === "_dark") ?
            <button className="lectures-menu__fullscreen fullscreen-btn js-adjust" type="button"
                    onClick={::this._toText}>
                <svg width="24" height="24" dangerouslySetInnerHTML={{__html: SVG.TO_TRANSCRIPT}}/>
            </button>
            :
            <button className="lectures-menu__fullscreen fullscreen-btn js-adjust" type="button"
                    onClick={::this._toPlayer}>
                <svg width="24" height="24" dangerouslySetInnerHTML={{__html: SVG.TO_PLAYER}}/>
            </button>
    }

    _toPlayer() {
        if (!this.props.isPlayerMode) return

        const _newValue = this._currentTime / 1000

        if (Math.abs(_newValue - this.props.playerTime) <= TIME_DELTA) {
            this.props.actions.startPlay(this.props.lesson.Id)
        } else {
            this.props.actions.startSetCurrentTime(_newValue)
        }

        window.scrollTo(0, 0)
    }

    _toText() {
        if (!this.props.isPlayerMode) return

        this.props.actions.startPause()

        const {playerTime, episodesTimes} = this.props

        const _textBlockElem = $(".text-block__wrapper"),
            _textBlockTop = _textBlockElem.offset().top,
            _textBlockBottom = _textBlockTop + _textBlockElem.height()

        let _anchors = $(".toc-anchor")

        if (_anchors.length !== 0) {
            _anchors.each(function() {
                let _current = $(this),
                    id = _current.attr("id")

                if (!id) {
                    if ((episodesTimes.length === 1) && (episodesTimes[0].id === null)) {
                        episodesTimes[0].top = _current.offset().top
                        return
                    } else {
                        return
                    }
                }
                id = id.replace("toc", "")

                id = +id

                if (id) {
                    let _item = episodesTimes.find(item => item.id === id)

                    if (_item) {
                        _item.top = _current.offset().top
                    }
                }
            })
        } else if ((episodesTimes.length === 1) && (episodesTimes[0].id === null)) {
            episodesTimes[0].top = _textBlockTop
        } else {
            return
        }

        let _visible = episodesTimes
            .filter(item => !!item.top)
            .map((item, index, array) => {
                item.bottom = index === (array.length - 1) ? _textBlockBottom : array[index + 1].top

                return item
            })
            .filter(item => !!item)

        const _item = _visible.find((item) => {
            return ((playerTime * 1000) >= item.start) && (item.end > (playerTime * 1000))
        })

        if (_item) {

            const _timeLength = _item.end - _item.start,
                _timeDelta = playerTime * 1000 - _item.start,
                _part = _timeDelta / _timeLength,
                _length = _item.bottom - _item.top,
                _delta = _length * _part,
                _currentPos = _item.top + _delta - this._getTopMargin() - (_delta * 0.03)//($(window).height() / 2)

            window.scrollTo(0, _currentPos)
        }
    }

    _handleScrollNewType() {
        const {lessonPlayInfo, timeStamps} = this.props

        if (!(lessonPlayInfo && timeStamps && Array.isArray(timeStamps) && (timeStamps.length > 0))) return

        let _visible = timeStamps
            .map((item, index) => {
                return {time: item, top: $(`#asset-${index + 1}`).offset().top}
            })
            .sort((a, b) => {
                const _readLineTop =  this._getReadLineTop(),
                    _inReadLineA = (_readLineTop - a.top) >= 0,
                    _inReadLineB = (_readLineTop - b.top) >= 0

                return (_inReadLineA && _inReadLineB) ? (b.top - a.top) : (a.top - b.top)
            })

        if (_visible.length === 0) return;

        let _assets = lessonPlayInfo.episodes[0].elements.map((item, index, array) => {
            let _asset = lessonPlayInfo.assets.find(asset => asset.id === item.assetId)

            return _asset ? {
                start: item.start * 1000,
                end: (index === (array.length - 1) ?
                    lessonPlayInfo.episodes[0].audio ? lessonPlayInfo.episodes[0].audio.info.length : array[index].start
                    :
                    array[index + 1].start) * 1000,
                asset: _asset
            } : null
        })

        let _current = _assets.find((item) => {
            return (item.start >= _visible[0].time) && (_visible[0].time < item.end)
        })

        // if (_current) this._applyNewAsset(_current.asset)
    }

    _oldTypeHandleScroll() {
        const {episodesTimes} = this.props

        if (!(episodesTimes && Array.isArray(episodesTimes) && (episodesTimes.length > 0))) return

        const _readLineTop = this._getReadLineTop(),
            _textBlockElem = $(".text-block__wrapper"),
            _textBlockTop = _textBlockElem.offset().top,
            _textBlockBottom = _textBlockTop + _textBlockElem.height()

        let _anchors = $(".toc-anchor")

        if (_anchors.length !== 0) {
            _anchors.each(function() {
                let _current = $(this),
                    id = _current.attr("id")

                if (!id) {
                    if ((episodesTimes.length === 1) && (episodesTimes[0].id === null)) {
                        episodesTimes[0].top = _current.offset().top
                        return
                    } else {
                        return
                    }
                }
                id = id.replace("toc", "")

                id = +id

                if (id) {
                    let _item = episodesTimes.find(item => item.id === id)

                    if (_item) {
                        _item.top = _current.offset().top
                    }
                }
            })
        } else if ((episodesTimes.length === 1) && (episodesTimes[0].id === null)) {
            episodesTimes[0].top = _textBlockTop
        } else {
            return
        }

        let _visible = episodesTimes
            .filter(item => !!item.top)
            .map((item, index, array) => {
                let _bottom = index === (array.length - 1) ? _textBlockBottom : array[index + 1].top,
                    _height = _bottom - item.top

                item.bottom = _bottom
                item.percent = (_bottom < _readLineTop) ?
                    1
                    :
                    (item.top > _readLineTop) ?
                        0
                        :
                        (_readLineTop - item.top) / _height

                return item
            })
            .filter(item => !!item)
            .sort((a, b) => {
                const _inReadLineA = (_readLineTop - a.top) >= 0,
                    _inReadLineB = (_readLineTop - b.top) >= 0

                return (_inReadLineA && _inReadLineB) ? (b.top - a.top) : (a.top - b.top)
            })

        if (_visible.length === 0) return;

        const _topPos = this._getReadLineTop() - _visible[0].top
        if (_topPos >= 0) {
            const _timeLength = _visible[0].end - _visible[0].start,
                _timePart = _timeLength * _visible[0].percent

            this._currentTime = _visible[0].start + _timePart
        }
    }

    _getReadLineTop() {
        // return $(window).scrollTop() + ($(window).height() / 2)
        return $(window).scrollTop() + this._getTopMargin()
    }

    _getTopMargin() {
        const _headline = $(".text-block__headline"),
            _menu = $(".js-lectures-menu")

        let _margin = 92

        if (_headline && _headline.length && _menu && _menu.length) {
            _margin = +_headline.css("margin-bottom").replace("px", "") + _menu.height()
        }

        return _margin
    }

}

const mapStateToProps = (state) => {
    return {
        episodesTimes: episodesTimesSelector(state),
        timeStamps: timeStampsSelector(state),
        playerTime: state.player.currentTime,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions : bindActionCreators({startSetCurrentTime, startPause, startPlay}, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SwitchButtons)