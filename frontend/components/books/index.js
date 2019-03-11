import React from 'react';
import PropTypes from "prop-types";

export default class Books extends React.Component {

    static propTypes = {
        books: PropTypes.array,
        extClass: PropTypes.string,
        listClass: PropTypes.string.required,
        titleClassName: PropTypes.string,
    }


    render() {
        let {books, extClass, titleClassName} = this.props,
            _needShowBlock = books && Array.isArray(books) && (books.length > 0)

        const BooksList = this.props.listClass

        return _needShowBlock
            ?
            <div className={"books" + (extClass ? (' ' + extClass) : '')}>
                <h3 className={titleClassName}>Книги</h3>
                <BooksList books={books}/>
            </div>
            :
            null
    }
}