import React from "react"
import PropTypes from "prop-types";
import Item from './books-list-item'

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

