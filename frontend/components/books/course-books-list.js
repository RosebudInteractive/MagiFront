import React from "react"
import PropTypes from "prop-types";
import {Link} from "react-router-dom"
import {getExtLinks} from "./tools";
import {getCoverPath, ImageSize} from "../../tools/page-tools";

export default class BooksList extends React.Component {

    static propTypes = {
        books: PropTypes.array,
    }

    render() {
        return <ul className="book-list">
            {this._getItems()}
        </ul>
    }

    _getItems() {
        let {books} = this.props

        if (!books) {
            return null
        }

        let _allBooksIsMain = (books.length <= 3)

        return books.map((item, index) => {
            let _isMain = ((index === 0) || _allBooksIsMain)
            return <Item book={item} isMain={_isMain}/>
        })
    }
}

class Item extends React.Component {

    static propTypes = {
        book: PropTypes.object,
        isMain: PropTypes.bool,
    }

    render() {
        let {book, isMain} = this.props,
            _coverPath = isMain ? getCoverPath(book, ImageSize.small) : getCoverPath(book, ImageSize.icon),
            _cover = _coverPath ? '/data/' + _coverPath : '';

        return <li className={"book-list__item book-preview" + (isMain ? " _main" : "")}>
            <div className="book-preview__image">
                <img src={_cover} alt=""/>
            </div>
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
    let _authors = []

    book.Authors.forEach((item) => {
        if (item.Tp === 1) {
            _authors.push(<Link to={"/autor/" + item.URL}><span>{item.FirstName + " " + item.LastName}</span></Link>)
        }
    })

    let _otherAuthor = book.OtherAuthors ? book.OtherAuthors.split(',') : []

    _otherAuthor.forEach((item) => {
        _authors.push(<span>{item}</span>)
    })

    return _authors
}