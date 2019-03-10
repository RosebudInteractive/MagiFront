import React from 'react';
import PropTypes from "prop-types";

export default class Books extends React.Component {

    static propTypes = {
        books: PropTypes.array,
        extClass: PropTypes.string,
        listClass: PropTypes.string.required,
    }


    render() {
        let {books, extClass} = this.props;

        const BooksList = this.props.listClass

        return <div className={"books" + (extClass ? (' ' + extClass) : '')}>
            <h3 className="books__title">Книги</h3>
            <BooksList books={books}/>
        </div>
    }
}