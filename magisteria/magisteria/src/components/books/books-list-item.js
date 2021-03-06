import React from "react";
import PropTypes from "prop-types";
import {getCoverPath, ImageSize} from "../../tools/page-tools";
import {getExtLinks, getDefaultExtLink} from "./tools";
import {Link} from "react-router-dom";

export default class Item extends React.Component {

    static propTypes = {
        book: PropTypes.object,
        isMain: PropTypes.bool,
        isSingle: PropTypes.bool,
    }

    static defaultProps = {
        isSingle: false,
    }

    render() {
        let {book, isMain, isSingle} = this.props,
            _coverPath = isMain ? getCoverPath(book, ImageSize.small) : getCoverPath(book, ImageSize.icon),
            _cover = _coverPath ? '/data/' + _coverPath : '',
            _defaultLink = getDefaultExtLink(book.ExtLinks);

        const _imageDiv = _defaultLink ?
            <a href={_defaultLink} target="_blank" className="book-preview__image">
                <img src={_cover} alt=""/>
            </a>
            :
            <div className="book-preview__image">
                <img src={_cover} alt=""/>
            </div>

        return <li className={"book-list__item book-preview" + (isMain ? " _main" : "") + (isSingle ? " _single" : "")}>
            {_imageDiv}
            <div className="book-preview__info-block">
                <div className="book-preview__info">
                    <h4 className="book-preview__name">{book.Name}</h4>
                    <p className="book-preview__author">{getBookAuthors(book)}</p>
                </div>
                {
                    isMain
                        ?
                        <h5 className="book-preview__title">{book.Description}</h5>
                        :
                        null
                }
                <ul className="stores">
                    {getExtLinks(book.ExtLinks)}
                </ul>
            </div>
        </li>
    }
}

export const getBookAuthors = (book) => {
    let _authors = [],
        _otherAuthor = book.OtherAuthors ? book.OtherAuthors.split(',') : []

    book.Authors.forEach((item) => {
        if (item.Tp === 1) {
            _authors.push(<div className="books__author-wrapper">
                <Link to={"/autor/" + item.URL}><span>{item.FirstName + " " + item.LastName}</span></Link>
            </div>)
        }
    })

    _otherAuthor.forEach((item) => {
        _authors.push(<div className="books__author-wrapper">
            <span className="no-link">{item}</span>
        </div>)
    })

    return (_authors.length > 1) ? _authors.reduce((prev, curr) => [prev, ', ', curr]) : _authors
}