import React from "react";
import PropTypes from "prop-types";
import $ from "jquery";
import {connect} from "react-redux";
import "./asset-viewer.sass"


class AssetBlock extends React.Component{

    static propTypes = {
        timeStamps: PropTypes.array.isRequired,
        episodesTimes: PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props)

        this.state = {
            asset: null
        }

        this._scrollHandler = () => {
            const {timeStamps} = this.props,
                _newType = timeStamps && Array.isArray(timeStamps) && (timeStamps.length > 0)

            if (_newType) {
                this._handleScrollNewType()
            } else {
                this._oldTypeHandleScroll()
            }


        }

        $(window).bind('resize scroll', ::this._scrollHandler)
    }

    componentDidMount() {
        this._scrollHandler()
    }

    componentWillUnmount() {
        $(window).unbind('resize scroll', this._scrollHandler);
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.lessonPlayInfo && nextProps.lessonPlayInfo) {
            const {lessonPlayInfo} = nextProps,
                _firstElem = lessonPlayInfo && lessonPlayInfo.episodes[0] ? lessonPlayInfo.episodes[0].elements[0] : null,
                _asset = _firstElem ? lessonPlayInfo.assets.find(asset => asset.id === _firstElem.assetId) : null

            this.setState({
                asset: _asset
            })
        }
    }

    render() {
        const {asset} = this.state

        return asset &&
            <div className="asset-block">
                <div className="image-wrapper">
                    {/*<div className="image-block">*/}
                        <img src={`/data/${asset.file}`}/>
                    {/*</div>*/}
                </div>
                <div className="asset-title font-universal__body-medium ">{asset.title}</div>
            </div>
    }


    _handleScrollNewType() {
        const {lessonPlayInfo, timeStamps} = this.props

        if (!(lessonPlayInfo && timeStamps && Array.isArray(timeStamps) && (timeStamps.length > 0))) return


        let _visible = timeStamps
            .map((item, index) => {
                // return isInViewport(`#asset-${index + 1}`) ? {time: item, top: $(`#asset-${index + 1}`).offset().top} : null
                return {time: item, top: $(`#asset-${index + 1}`).offset().top}
            })
            // .filter(item => !!item)
            .sort((a, b) => {
                const _readLineTop =  $(window).scrollTop() + ($(window).height() / 3),
                    _inReadLineA = (_readLineTop - a.top) >= 0,
                    _inReadLineB = (_readLineTop - b.top) >= 0

                return (_inReadLineA && _inReadLineB) ? (b.top - a.top) : (a.top - b.top)
            })

        if (_visible.length === 0) return;

        let _assets = lessonPlayInfo.episodes[0].elements.map((item, index, array) => {
            let _asset = lessonPlayInfo.assets.find(asset => asset.id === item.assetId)

            return _asset ? {
                start: item.start * 1000,
                end: (index === (array.length - 1) ? lessonPlayInfo.episodes[0].audio.info.length : array[index + 1].start) * 1000,
                image: _asset.file
            } : null
        })

        let _visibleImage = _assets.find((item) => {
            return (item.start >= _visible[0].time) && (_visible[0].time < item.end)
        })

        if (_visibleImage && (_visibleImage.image !== this.state.image)) {
            this.setState({
                image: _visibleImage.image
            })
        }
    }

    _oldTypeHandleScroll() {
        const {lessonPlayInfo, episodesTimes} = this.props

        if (!(lessonPlayInfo && episodesTimes && Array.isArray(episodesTimes) && (episodesTimes.length > 0))) return

        const _readLineTop =  $(window).scrollTop() + ($(window).height() / 3)

        let _anchors = $(".toc-anchor")

        if (_anchors.length === 0) return;

        // let that = this

        _anchors.each(function() {
            let _current = $(this),
                id = _current.attr("id").replace("toc", "")

            id = +id

            if (id) {
                let _item = episodesTimes.find(item => item.id === id)

                if (_item) {
                    _item.top = _current.offset().top
                }
            }
        })

        let _visible = episodesTimes
            .filter(item => !!item.top)
            .map((item, index, array) => {
                let _blockElem = $(".text-block__wrapper"),
                    _bottom = index === (array.length - 1) ? _blockElem.offset().top + _blockElem.height() : array[index + 1].top,
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

        const _current = _visible[0],
            _assetsInCurrent = lessonPlayInfo.episodes[0].elements
                .map((item) => {
                    let _length = _current.end - _current.start
                    if (((item.start * 1000) >= _current.start) && ((item.start * 1000) < (_current.start + _length * _current.percent))) {
                        return item
                    } else {
                        return null
                    }

                })
                .filter(item => !!item)

        const _visibleElem = _assetsInCurrent.length ? _assetsInCurrent[_assetsInCurrent.length - 1] : null,
            _asset = _visibleElem ? lessonPlayInfo.assets.find(asset => asset.id === _visibleElem.assetId) : null
            // _image = _asset ? _asset.file : null


        if (_asset && (!this.state.asset || (_asset.id !== this.state.asset.id))) {
            this.setState({
                asset: _asset
            })
        }

    }

    _getFirstAsset() {
        const {lessonPlayInfo} = this.props,
            _firstElem = lessonPlayInfo && lessonPlayInfo.episodes[0] ? lessonPlayInfo.episodes[0].elements[0] : null

        return _firstElem ? lessonPlayInfo.assets.find(asset => asset.id === _firstElem.assetId) : null
    }
}

const mapStateToProps = (state) => {
    return {
        lessonPlayInfo: state.lessonPlayInfo.playInfo
    }
}

export default connect(mapStateToProps,)(AssetBlock);