import React from "react";
import PropTypes from "prop-types";
import $ from "jquery";
// import {connect} from "react-redux";
import "./asset-viewer.sass"
// import {assetsSelector, episodesTimesSelector, timeStampsSelector} from "ducks/transcript"
// import {isMobilePlatform} from "tools/page-tools";
// import {bindActionCreators} from "redux";
// import {showGallery} from "ducks/transcript";

const IMAGE_MAX_HEIGHT = 400,
    FADE_TIMEOUT = 400,
    SCROLL_TIMEOUT = 200


export default class AssetBlock extends React.Component{

    constructor(props) {
        super(props)

        this.state = {
            asset: null,
            imageLoaded: true,
            imageClear: false,
            fading: false,
        }

        this._scrollTimer = null

        this._scrollHandler = () => {
            if(this._scrollTimer) {
                clearTimeout(this._scrollTimer);
            }

            const _container = $(".fixed-container")

            if (_container && _container.length) {
                _container.css("top", this._getTopMargin() + "px")
            }

            const _readLineTop = this._getReadLineTop(),
                _textBlockElem = $(".text-block__wrapper"),
                _textBlockTop = _textBlockElem.offset().top,
                _textBlockBottom = _textBlockTop + _textBlockElem.height()

            if (_readLineTop < _textBlockTop) {
                this._applyFirstAsset()
                return;
            } else if (_textBlockBottom < _readLineTop) {
                this._applyLastAsset()
                return;
            }

            this._scrollTimer = setTimeout(() => {
                const {timeStamps} = this.props,
                    _newType = timeStamps && Array.isArray(timeStamps) && (timeStamps.length > 0)

                if (_newType) {
                    this._handleScrollNewType()
                } else {
                    this._oldTypeHandleScroll()
                }
            }, SCROLL_TIMEOUT);
        }

        this._resizeHandler = () => {
            const {asset} = this.state

            if (!asset) return

            const _block = $(".image-block"),
                _image = $(".image-block img"),
                _ratio = asset.info.size.width / asset.info.size.height,
                _vertical = _ratio < 1,
                _fixedBlock = $(".js-play"),
                _rightBlock = $(".right-block")

            if (_fixedBlock && (_fixedBlock.length > 0)) {
                _fixedBlock.width(_rightBlock.width())
            }

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

        $(".transcript-block_wrapper").parent().bind('resize scroll', this._scrollHandler)
        $(".transcript-block_wrapper").parent().bind('resize scroll', this._resizeHandler)
    }

    componentWillUnmount() {
        $(window).unbind('resize scroll', this._scrollHandler);
        $(window).unbind('resize scroll', this._resizeHandler);

        $(".transcript-block_wrapper").parent().unbind('resize scroll', this._scrollHandler)
        $(".transcript-block_wrapper").parent().unbind('resize scroll', this._resizeHandler)
    }

    UNSAFE_componentWillMount() {
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
        if (this.state.asset && (!prevState.asset || (prevState.asset.id !== this.state.asset.id))) {
            setTimeout(() => this._resizeHandler(), 0)
        }

    }

    render() {
        const {asset, imageLoaded, fading, imageClear} = this.state

        if (!asset) {return null}

        const _orientation = asset.info.size && ( (asset.info.size.width / asset.info.size.height) < 1 ) ?  "_vertical" : "_horizontal",
            _imageClassName = _orientation + (fading || !imageLoaded ? " _hidden" : ""),
            _fileName = this._getAdaptiveImage(asset)

        return asset &&
            <div className="asset-block">
                <div className="image-block">
                    <img className={_imageClassName} src={imageClear ? null : `/data/${_fileName}`} onLoad={::this._onLoadImage} onClick={::this._onImageClick}/>
                </div>
                { asset.title && imageLoaded && <div className="asset-title font-universal__body-medium ">{asset.title}</div> }
                { asset.title2 && imageLoaded && <div className="asset-title font-universal__body-medium ">{asset.title2}</div> }
            </div>
    }

    _getAdaptiveImage(asset) {
        const _imageBlock = $(".image-block")

        if (_imageBlock && _imageBlock.length) {
            const _width = _imageBlock.width()

            if ((_width < 360) && (asset.info.content.s)) {
                return asset.info.path + asset.info.content.s
            } else if ((_width < 768) && (asset.info.content.m)) {
                return asset.info.path + asset.info.content.m
            } else if ((_width < 1366) && (asset.info.content.l)) {
                return asset.info.path + asset.info.content.l
            } else {
                return asset.file
            }
        } else {
            return asset.file
        }
    }


    _onImageClick() {
        // if (!isMobilePlatform()) {
        //     this.props.actions.showGallery(this.state.asset)
        // }
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

        if (_current) this._applyNewAsset(_current.asset)
    }

    _oldTypeHandleScroll() {
        const {lessonPlayInfo, episodesTimes} = this.props

        if (!(lessonPlayInfo && episodesTimes && Array.isArray(episodesTimes) && (episodesTimes.length > 0))) return

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

        const _current = _visible[0],
            _assetsInCurrent = lessonPlayInfo.episodes[_current.episodeIndex].elements
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

        this._applyNewAsset(_asset)
    }

    _onLoadImage() {
        this.setState({
            imageLoaded: true,
            imageClear: false,
        })
    }

    _applyFirstAsset() {
        const {lessonPlayInfo} = this.props

        const _firstElem = lessonPlayInfo && lessonPlayInfo.episodes[0] ? lessonPlayInfo.episodes[0].elements[0] : null,
            _asset = _firstElem ? lessonPlayInfo.assets.find(asset => asset.id === _firstElem.assetId) : null

        this._applyNewAsset(_asset)
    }

    _applyLastAsset() {
        const {lessonPlayInfo} = this.props

        const _episode = lessonPlayInfo && lessonPlayInfo.episodes[lessonPlayInfo.episodes.length - 1],
            _elem = _episode  ? _episode.elements[_episode.elements.length - 1] : null,
            _asset = _elem ? lessonPlayInfo.assets.find(asset => asset.id === _elem.assetId) : null

        this._applyNewAsset(_asset)
    }

    _applyNewAsset(asset) {
        if (asset && (!this.state.asset || (asset.id !== this.state.asset.id))) {

            this.setState({
                fading: true
            })

            setTimeout(() => {
                this.setState({
                    imageClear: true,
                    imageLoaded: false,
                })

                setTimeout(() => {
                    this.setState({
                        asset: asset,
                        fading: false,
                        imageClear: false,
                    })
                }, 0)

            }, FADE_TIMEOUT)
        }
    }

    _getReadLineTop() {
        // return $(window).scrollTop() + this._getTopMargin()
        return this._getTopMargin()
    }

    _getTopMargin() {
        // const _menu = $(".js-lectures-menu")
        //
        // let _margin = 52
        //
        // if (_menu && _menu.length) {
        //     _margin = _menu.height()
        // }
        //
        // return _margin

        const _textBlockDiv = $(".transcript-block_wrapper")

        return _textBlockDiv.parent().offset().top
    }
}

// const mapStateToProps = (state) => {
//     return {
//         episodesTimes: episodesTimesSelector(state),
//         timeStamps: timeStampsSelector(state),
//         lessonPlayInfo: assetsSelector(state),
//     }
// }
//
// const mapDispatchToProps = (dispatch) => {
//     return {
//         actions: bindActionCreators({showGallery}, dispatch)
//     }
// }

// export default connect(mapStateToProps, mapDispatchToProps)(AssetBlock);

AssetBlock.propTypes = {
    episodesTimes: PropTypes.object,
    timeStamps: PropTypes.array,
    lessonPlayInfo: PropTypes.object
}
