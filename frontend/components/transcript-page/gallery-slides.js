import React from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery'
import '@fancyapps/fancybox/dist/jquery.fancybox.js';

export default class GallerySlides extends React.Component {

    static propTypes = {
        gallery: PropTypes.array.isRequired,
    };

    static defaultProps = {
        gallery: []
    };

    componentDidMount() {
        $('[data-fancybox]').fancybox();
    }

    _getList() {
        return this.props.gallery.map((item, index) => {
            let _number = index + 1,
                _numberWithLeadZero = _number.toString().padStart(2, '0');

            return <div id={"gallery" + _numberWithLeadZero} className="gallery-slide" style={{display: 'none'}}>
                <div className="gallery-slide__image" style={{backgroundImage: 'url(' + '/data/' + item.FileName + ')'}}/>
                <p className="gallery-slide__caption">
                    <span className="number">{_number + '.'}</span>{item.Name}<br/>{item.Description}</p>
            </div>
        })
    }

    render() {
        return (
            <div className="gallery-slides" style={{position: 'absolute', top: 0, left: 0, zIndex: -1000, display: 'none'}}>
                {this._getList()}
            </div>
        )
    }
}