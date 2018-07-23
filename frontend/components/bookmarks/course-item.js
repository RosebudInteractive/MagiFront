import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import * as svg from '../../tools/svg-paths';
import {ImageSize, getCoverPath} from '../../tools/page-tools'

export default class Item extends React.Component {

    static propTypes = {
        item: PropTypes.object,
        isFavorite: PropTypes.bool,
    }

    constructor(props) {
        super(props)
        // this._maskNumber = svg.getRandomInt(1, 12).toString().padStart(2, '0')
    }

    _favoritesClick() {
        if (this.props.onRemoveItem) {
            this.props.onRemoveItem(this.props.item)
        }
    }

    render() {
        let {item, isFavorite} = this.props,
            _coverPath = getCoverPath(item, ImageSize.medium),
            _cover = _coverPath ? '/data/' + _coverPath : null;

        let _authors = item.authors.map((author) => {
            return (<Link to={'/autor/' + author.URL} className="fav-card__info-link _author">{author.FirstName + ' ' + author.LastName}</Link>);
        });

        _authors = (_authors.length > 1) ? <div>{_authors[0]}, {_authors[1]}</div> : _authors

        const _flag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fav"/>',
            _image = '<image preserveAspectRatio="xMaxYMax slice" xlink:href="' +  _cover + '" width="724" height="503"/>';

        return (
            <div className="fav-card">
                <div className="fav-card__header">
                    <h3 className="fav-card__title">
                        <span className={"fav" + (isFavorite ? " active" : "")} onClick={::this._favoritesClick}>
                            <svg width="14" height="23" dangerouslySetInnerHTML={{__html: _flag}}/>
                        </span>
                        <Link to={'/category/' + item.URL}>
                            <span className="fav-card__title-text">
                                <span className="label">Курс:</span>
                                <span className='title'>{" " + item.Name}</span>
                            </span>
                        </Link>
                    </h3>
                    <div className="fav-card__info">
                        {_authors}
                        <Link to="#" className="fav-card__info-link _tag">История</Link>
                    </div>
                </div>
                <div className="fav-card__body">
                    <div className="fav-card__col">
                        <Link to={'category/' + item.URL} className="btn btn--rounded fav-card__link">Подробнее о
                            курсе</Link>
                    </div>
                    <div className="fav-card__col">
                        <div className={"fav-card__image-block " + item.Mask}>
                            <svg viewBox="0 0 563 514" width="563" height="514" dangerouslySetInnerHTML={{__html: _image}}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}