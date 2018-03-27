import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

export default class Gallery extends React.Component {

    static propTypes = {
        gallery: PropTypes.array.isRequired,
    };

    static defaultProps = {
        gallery: []
    };

    _getList() {
        return this.props.gallery.map((item, index) => {
            return <Link to={'#'} className={'gallery-item'} key={index}>
                <div className="gallery-item__preview">
                    <span className="number">{index + 1 + '.'}</span>
                    <div className="gallery-item__image">
                        <img src={'/data/' + item.FileName}/>
                    </div>
                    <p className="gallery-item__caption">{item.Name}<br/>{item.Description}</p>
                </div>
            </Link>
        })
    }

    render() {
        return (
            <section className="gallery-block" id="gallery">
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