import React from 'react';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import "./gallery-slider.sass"
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import {
    galleryCurrentIndexSelector,
    galleryVisibleSelector,
    closeGallery,
    galleryItemsSelector
} from "ducks/transcript";

class GallerySlider extends React.Component{

    constructor(props) {
        super(props);

        this.state = {
            currentSlide: this.props.currentIndex,
            showCloseButton: false,
            closeButtonTop: 0,
            closeButtonLeft: 0,
        };

        this._resizeHandler = () => {
            this._setCloseButtonPosition()
        }
    }

    componentDidMount() {
        this._setCloseButtonPosition()
        $(window).bind("resize", this._resizeHandler)
    }


    componentWillUnmount() {
        $(window).unbind("resize", this._resizeHandler)
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.visible && nextProps.visible && (nextProps.currentIndex !== this.state.currentSlide)) {
            this.setState({
                currentSlide: nextProps.currentIndex
            })
        }
    }

    componentDidUpdate(props, state) {
        if ((state.currentSlide !== this.state.currentSlide) || (props.items !== this.props.items) || (!props.visible && this.props.visible)){
            setTimeout(() => {
                this._setCloseButtonPosition()
                    this.setState({
                        showCloseButton: true
                    })
            }, 200)
        }

        if (props.visible && !this.props.visible) {
            this.setState({
                showCloseButton: false,
            })
        }
    }

    render() {
        const {currentSlide, showCloseButton, closeButtonTop, closeButtonLeft} = this.state

        const settings = {
            showThumbs: true,
            showStatus: false,
            showIndicators: false,
            dynamicHeight: true,
            useKeyboardArrows: true,
            // thumbWidth: "auto",
            thumbWidth: 70,
            showArrows: false,
            swipeable: true,
            selectedItem: currentSlide,
            transitionTime: 150
        }



        const _closeStyle = {
            left: closeButtonLeft,
            top: closeButtonTop,
        }

        if (!this.props.visible) return null

        return <div className="gallery-slider__container">
            <div className="gallery-slider__arrow _left" onClick={::this._prev}/>
            {showCloseButton && <button className="gallery-slider__close" style={_closeStyle} onClick={::this._close}/>}
            <Carousel {...settings} onChange={this.updateCurrentSlide}>
                {this._getList()}
            </Carousel >
            <div className="gallery-slider__arrow _right" onClick={::this._next}/>
        </div>
    }

    _setCloseButtonPosition() {
        const _image = $(".slide.selected img")

        if (_image && _image.length) {
            this.setState({
                showCloseButton: true,
                closeButtonTop: _image.position().top + 59 - 24,
                closeButtonLeft: _image.position().left + _image.width() - 24,
            })
        }
    }

    _prev = () => {
        if (this.state.currentSlide > 0) {
            this.setState((state) => ({
                currentSlide: state.currentSlide - 1
            }))
        }
    }

    _next = () => {
        if (this.state.currentSlide < (this.props.items.length - 1)) {
            this.setState((state) => ({
                currentSlide: state.currentSlide + 1
            }))
        }
    }

    updateCurrentSlide = (index) => {
        this.setState({
                showCloseButton: false
            })

        const { currentSlide } = this.state;

        if (currentSlide !== index) {
            this.setState({
                currentSlide: index,
            });
        }
    };

    _getList() {
        return this.props.items.map((item, index) => {
            let _fileName = item.FileName,
                _metaData = JSON.parse(item.MetaData),
                _imageRatio = _metaData && _metaData.size && _metaData.size.width && _metaData.size.height ?
                    _metaData.size.width / _metaData.size.height
                    :
                    1,
                _orientationClass = (_imageRatio > 1) ? "_landscape" : "_portrait"

            let _name = item.Name ? `${(index + 1)}. ${item.Name}` : "",
                _width = $(window).width() - 40,
                _wrapperHeight = $(".carousel-slide__wrapper").height(),
                _maxHeight = _width / _imageRatio

            _maxHeight = (_maxHeight > _wrapperHeight) ? _wrapperHeight : _maxHeight

            const _style = (_imageRatio > 1) ? {maxHeight: _maxHeight} : {maxWidth: _width}

            return <div className={"carousel-slide__wrapper " + _orientationClass} key={index}>
                    <img src={'/data/' + _fileName} style={_style}/>
                <div className="gallery-slide__caption legend font-universal__body-large">
                    <span>{_name}</span>
                    <span>{item.Description}</span>
                </div>
            </div>
        })
    }

    _close() {
        this.props.actions.closeGallery()
    }
}

const mapStateToProps = (state) => {
    return {
        items: galleryItemsSelector(state),
        currentIndex: galleryCurrentIndexSelector(state),
        visible: galleryVisibleSelector(state),
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({closeGallery}, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GallerySlider)