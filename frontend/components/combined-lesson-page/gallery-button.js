import React from "react";
import PropTypes from 'prop-types';


export default class GalleryButtons extends React.Component {

    static propTypes = {
        isLocked : PropTypes.bool,
    }

    render() {
        const _gallery = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#gallery"/>',
            _lock = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#lock"/>',
            _prev = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#slider-prev"/>',
            _next = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#slider-next"/>';

        return (
            <div className="js-gallery-controls gallery-controls hide" style={{display: 'none'}}>
                <button className="gallery-trigger js-gallery-trigger" type="button">
                    <span className="visually-hidden">Галерея</span>
                    <svg width="16" height="16" dangerouslySetInnerHTML={{__html: this.props.isLocked ? _lock : _gallery}}/>
                    <span className="text">Галерея</span>
                </button>
                <button className="swiper-button-prev swiper-button-disabled" type="button">
                    <svg width="11" height="18" dangerouslySetInnerHTML={{__html: _prev}}/>
                </button>
                <button className="swiper-button-next" type="button">
                    <svg width="11" height="18" dangerouslySetInnerHTML={{__html: _next}}/>
                </button>
            </div>
        )
    }
}