import React from "react";
// import PropTypes from "prop-types";
import $ from "jquery";
import {connect} from "react-redux";
import "./asset-viewer.sass"
import {assetsSelector, episodesTimesSelector, timeStampsSelector} from "ducks/transcript"

const IMAGE_MAX_HEIGHT = 400


class AssetBlock extends React.Component{

    constructor(props) {
        super(props)

        this.state = {
            asset: null,
            imageLoaded: true,
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

        this._resizeHandler = () => {
            const {asset} = this.state

            if (!asset) return

            const _block = $(".image-block"),
                _image = $(".image-block img"),
                _ratio = asset.info.size.width / asset.info.size.height,
                _vertical = _ratio < 1

            let _width = _block.width(),
                _height = _vertical ? _width : _width / _ratio


            if (_height > IMAGE_MAX_HEIGHT) {

                _width = (IMAGE_MAX_HEIGHT / _height) * 100
                _height = IMAGE_MAX_HEIGHT

                if (_vertical) {
                    _image.css("width", "")
                } else {
                    _image.width(_width + "%")
                }
            } else {
                _image.css("width", "")
            }

            _block.height(_height)
        }

        $(window).bind('resize scroll', this._scrollHandler)
        $(window).bind('resize scroll', this._resizeHandler)
    }

    componentDidMount() {
        this._scrollHandler()
    }

    componentWillUnmount() {
        $(window).unbind('resize scroll', this._scrollHandler);
        $(window).unbind('resize scroll', this._resizeHandler);
    }

    componentWillMount() {
        const {lessonPlayInfo} = this.props

        if (lessonPlayInfo) {
            const _firstElem = lessonPlayInfo && lessonPlayInfo.episodes[0] ? lessonPlayInfo.episodes[0].elements[0] : null,
                _asset = _firstElem ? lessonPlayInfo.assets.find(asset => asset.id === _firstElem.assetId) : null

            this.setState({
                asset: _asset
            })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.imageLoaded && !this.state.imageLoaded) {
            setTimeout(() => {
                this.setState({
                    imageLoaded: true
                })
            }, 300)
        }

    }

    render() {
        const {asset, imageLoaded} = this.state

        if (!asset) {return null}

        const _orientation = asset.info.size && ( (asset.info.size.width / asset.info.size.height) < 1 ) ?  "_vertical" : "_horizontal",
            _imageClassName = _orientation + (!imageLoaded ? " _hidden" : "")

        return asset &&
            <div className="asset-block">
                <div className="image-block">
                    <img className={_imageClassName} src={`/data/${asset.file}`} />
                </div>
                { asset.title && <div className="asset-title font-universal__body-medium ">{asset.title}</div> }
                { asset.title2 && <div className="asset-title font-universal__body-medium ">{asset.title2}</div> }
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

        if (_current &&  (!this.state.asset || (_current.asset.id !== this.state.asset.id))) {
            this.setState({
                asset: _current.asset,
                imageLoaded: false,
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
                id = _current.attr("id")

            if (!id) {return}
            id = id.replace("toc", "")

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
                asset: _asset,
                imageLoaded: false,
            })
        }

    }

    _getFirstAsset() {
        const {lessonPlayInfo} = this.props,
            _firstElem = lessonPlayInfo && lessonPlayInfo.episodes[0] ? lessonPlayInfo.episodes[0].elements[0] : null

        return _firstElem ? lessonPlayInfo.assets.find(asset => asset.id === _firstElem.assetId) : null
    }

    // _onLoadImage() {
    //     this.setState({
    //         imageLoaded: true
    //     })
    // }
}

const mapStateToProps = (state) => {
    return {
        episodesTimes: episodesTimesSelector(state),
        timeStamps: timeStampsSelector(state),
        lessonPlayInfo: assetsSelector(state),
    }
}

export default connect(mapStateToProps,)(AssetBlock);