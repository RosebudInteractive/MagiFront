import React from 'react'
import LookupDialog from "../../LookupDialog";
import PropTypes from "prop-types";

export default class BookAuthorDialog extends React.Component {

    static propTypes = {
        bookAuthors: PropTypes.array,
        authors: PropTypes.array,
        accept: PropTypes.func,
        cancel: PropTypes.func,
    }

    render() {
        return <LookupDialog message='Авторы' data={::this._getAuthorsList()}
                          yesAction={::this._yes}
                          noAction={::this._no}/>

    }

    _getAuthorsList() {
        const {
            authors,
            bookAuthors
        } = this.props;

        if (!bookAuthors) return

        let _filtered = authors.filter((value) => {
            return !bookAuthors.find((item) => {
                return item.AuthorId === value.id
            });
        });

        return _filtered.map((element) => {
            return {id: element.id, value: element.FirstName + ' ' + element.LastName}
        })
    }

    _yes(data) {
        if (this.props.accept) {
            this.props.accept(data)
        }
    }

    _no() {
        if (this.props.cancel) {
            this.props.cancel()
        }
    }
}