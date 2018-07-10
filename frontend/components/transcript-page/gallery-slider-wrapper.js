import React from 'react';
import PropTypes from 'prop-types';
import Swiper from 'swiper';
import $ from 'jquery'

export default class GalleryWrapper extends React.Component {

    static propTypes = {
        gallery: PropTypes.array.isRequired,
    };

    static defaultProps = {
        gallery: []
    };

    componentDidMount() {
        this.gallerySlider = new Swiper('.js-gallery-slider', {
            navigation: {
                prevEl: '.js-gallery-controls .swiper-button-prev',
                nextEl: '.js-gallery-controls .swiper-button-next'
            },
            pagination: {
                el: '.swiper-pagination',
                type: 'progressbar',
            },
            slidesPerView: 'auto',
            on: {
                resize: () => {
                    this.gallerySlider.update();
                }
            }
        });

        let that = this;

        $('.js-gallery-trigger').on('click', function() {
            if ($(this).closest('.js-gallery-controls').hasClass('hide')) {
                let _isRecommendedExists = $('#recommend').length > 0,
                    _isRecommendedVisible = _isRecommendedExists ? $(window).scrollTop() >= ($('#recommend').offset().top - $(window).height()) : false;

                if (_isRecommendedVisible) {
                    $('html, body').animate({
                        scrollTop: $('#recommend').offset().top - $(window).height()
                    }, 600, function () {
                        that._openGallerySlider();
                    });
                } else {
                    that._openGallerySlider();
                }
            } else {
                that._closeGallerySlider();
            }
        });
    }

    _openGallerySlider() {
        let _controls = $('.js-gallery-controls'),
            _wrap = $('.js-gallery-slider-wrapper'),
            _stickyBlock = $('.js-sticky-block');

        _controls.removeClass('hide').addClass('show');
        _wrap.addClass('show');
        _stickyBlock.addClass('slider-opened');
    }

    _closeGallerySlider() {
        let _controls = $('.js-gallery-controls'),
            _wrap = $('.js-gallery-slider-wrapper'),
            _stickyBlock = $('.js-sticky-block');

        _controls.addClass('hide').removeClass('show');
        _wrap.removeClass('show');
        _stickyBlock.removeClass('slider-opened');
    }

    _getList() {
        return this.props.gallery.map((item, index) => {
            let _number = index + 1;

            return <div className="gallery-slide swiper-slide">
                <div className="gallery-slide__image">
                    <img src={'/data/' + item.FileName}/>
                </div>
                <p className="gallery-slide__caption"><span className="number">{_number + '.'}</span>{item.Name}<br/>{item.Description}</p>
            </div>
        })
    }

    render() {
        return (
            <div className="gallery-slider-wrapper js-gallery-slider-wrapper">
                <div className="gallery-slider swiper-container js-gallery-slider">
                    <div className="gallery-wrapper swiper-wrapper">
                        {this._getList()}
                    </div>
                    <div className="swiper-pagination"/>
                </div>
            </div>
        )
    }
}