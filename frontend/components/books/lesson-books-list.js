import React from "react"
import PropTypes from "prop-types";
import Item from './books-list-item'

export default class BooksList extends React.Component {

    static propTypes = {
        books: PropTypes.array,
    }

    render() {
        let {books} = this.props,
            _needGrid = books && Array.isArray(books) && (books.length > 2)

        return <ul className={"book-list" + (_needGrid ? " _grid" : "")}>
            {this._getItems()}
        </ul>
    }

    _getItems() {
        let {books} = this.props

        if (!books) {
            return null
        }

        let _allBooksIsMain = (books.length < 3)

        return books.map((item, index) => {
            let _isMain = ((index === 0) || _allBooksIsMain)
            return <Item book={item} isMain={_isMain} isSingle={books.length === 1}/>
        })
    }
}