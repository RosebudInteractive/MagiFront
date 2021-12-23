import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import $ from 'jquery'
import '@fancyapps/fancybox/dist/jquery.fancybox.js';
import {ImageSize, getImagePath} from '../../tools/page-tools'

export default class Gallery extends React.Component {

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

            let _fileName = getImagePath(item, ImageSize.small)

            return <Link to={"gallery" + _numberWithLeadZero} data-src={"#gallery" + _numberWithLeadZero} data-fancybox="gallery-group" className="gallery-item" key={index}>
                <div className="gallery-item__preview">
                    <span className="number">{_number + '.'}</span>
                    <div className="gallery-item__image"  style={{backgroundImage: 'url(' + '/data/' + _fileName + ')'}}>
                        <img src={'/data/' + _fileName}/>
                    </div>
                    <p className="gallery-item__caption">{item.Name}<br/>{item.Description}</p>
                </div>
            </Link>
        })
    }

    render() {
        return (
            <section className="gallery-block" id="pictures">
                <div className="gallery">
                    <div className="gallery-label">
                        <h2>Галерея <span className="qty">{this.props.gallery.length}</span></h2>
                    </div>
                    {this._getList()}
                </div>
            </section>
        )
    }
}