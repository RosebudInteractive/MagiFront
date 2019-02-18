import React from 'react';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import Swiper from 'swiper';

import * as appActions from "../../actions/app-actions";

import $ from 'jquery'
import {getImagePath, ImageSize} from "../../tools/page-tools";
import * as userActions from "actions/user-actions";

class GalleryWrapper extends React.Component {

    static propTypes = {
        gallery: PropTypes.array.isRequired,
    };

    static defaultProps = {
        gallery: []
    };

    componentDidMount() {
        let _gallerySlider = new Swiper('.js-gallery-slider', {
            navigation: {
                prevEl: '.js-gallery-controls .swiper-button-prev',
                nextEl: '.js-gallery-controls .swiper-button-next'
            },
            pagination: {
                el: '.swiper-pagination',
                type: 'progressbar',
                // type: 'fraction',
            },
            slidesPerView: 'auto',
            scrollbar: {
                el: '.swiper-scrollbar',
                // draggable: true,
            },
            on: {
                resize: () => {
                    _gallerySlider.update();
                }
            },
            // observer: true,
        });

        let that = this;

        $('.js-gallery-trigger').on('click', function () {
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

    componentWillUnmount() {
        this.props.appActions.closeGallery()
    }

    _openGallerySlider() {
        if (this.props.authorized) {
            let _controls = $('.js-gallery-controls'),
                _wrap = $('.js-gallery-slider-wrapper'),
                _stickyBlock = $('.js-sticky-block');

            _controls.removeClass('hide').addClass('show');
            _wrap.addClass('show');
            _stickyBlock.addClass('slider-opened');

            this.props.appActions.openGallery()
        } else {
            this.props.userActions.showSignInForm();
        }
    }

    _closeGallerySlider() {
        let _controls = $('.js-gallery-controls'),
            _wrap = $('.js-gallery-slider-wrapper'),
            _stickyBlock = $('.js-sticky-block');

        _controls.addClass('hide').removeClass('show');
        _wrap.removeClass('show');
        _stickyBlock.removeClass('slider-opened');

        this.props.appActions.closeGallery()
    }

    _getList() {
        return this.props.gallery.map((item, index) => {
            let _number = index + 1,
                _numberWithLeadZero = _number.toString().padStart(2, '0');

            let _fileName = getImagePath(item, ImageSize.medium)

            return <div data-src={"#gallery" + _numberWithLeadZero}
                         data-fancybox="gallery-group" className="gallery-slide swiper-slide" key={index}>
                <div className="gallery-slide__image">
                    <img src={'/data/' + _fileName}/>
                </div>
                <p className="gallery-slide__caption">{item.Name}<br/>{item.Description}</p>
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

function mapStateToProps(state) {
    return {
        authorized: !!state.user.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GalleryWrapper);