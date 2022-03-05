import React from 'react'
import GridControl from "../../gridControl";
import PropTypes from "prop-types";
import BookAuthorDialog from "./author-dialog";
import {connect} from "react-redux";

export class AuthorsGrid extends GridControl {

    constructor(props) {
        super(props)
        this._editing = false;
    }

    static propTypes = {
        onDataUpdate: PropTypes.func,
    }

    getUI() {
        let that = this;

        let _gui = super.getUI();
        _gui.on.onItemClick = function (id) {
            this.editStop()
            that._editing = false

            if (id && ((id.column === 'Tp') || (id && id.column === 'TpView'))) {
                this.editCell(id.row, id.column, true, true)
                that._editing = true
            }
        }

        _gui.on.onDataUpdate = (id, data) => {
            if (this.props.onDataUpdate) {
                this.props.onDataUpdate(data)
            }
        }

        _gui.on.onBlur = function() {
            this.editStop()
            that._editing = false
        }

        return _gui;
    }

    _getId() {
        return 'book-authors';
    }

    _getColumns() {
        let _columns = [
            {id: 'Number', header: '#', width: 30},
            {id: 'Name', header: 'Автор', fillspace: true},
            {
                id: 'Tp', header: 'Тип автора', width: 180, editor: 'select',
                // автор текста" - 1, "автор комментария" - 2, "автор перевода" - 3
                options: [
                    {id: '1', value: 'Автор текста'},
                    {id: '2', value: 'Автор комментария'},
                    {
                        id: '3', value: 'Автор перевода'
                    }]
            },
            {
                id: 'TpView', header: 'Отображение', width: 180, editor: 'select',
                //"курс" - 1, "курс+лекция" - 2
                options: [
                    {id: '1', value: 'Курс'},
                    {id: '2', value: 'Курс + Лекция'},
                ]
            },
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}

class BookAuthorsGrid extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._newId = 0;

        this.state = {
            showDialog: false
        }
    }

    render() {
        let _bookAuthors = this._getBookAuthors()

        return <div className="books-authors">
            <AuthorsGrid addAction={::this._showAuthorsLookup}
                         removeAction={::this._remove}
                         selectAction={::this._select}
                         onDataUpdate={::this._update}
                // selected={this.props.selectedAuthor}
                         editMode={this.props.editMode}
                         data={_bookAuthors}/>
            {
                this.state.showDialog
                    ?
                    <BookAuthorDialog
                        authors={this.props.authors}
                        bookAuthors={_bookAuthors}
                        cancel={::this._hideAuthorsLookup}
                        accept={::this._add}/>
                    :
                    null
            }
        </div>

    }

    _showAuthorsLookup() {
        this.setState({showDialog: true})
    }

    _hideAuthorsLookup() {
        this.setState({showDialog: false})
    }

    _add(authorId) {
        this.setState({showDialog: false})

        let _array = [...this.props.input.value]
        _array.push({
            id: --this._newId,
            AuthorId: authorId,
            Tp: 1,
            TpView: 1,
        })

        this.props.input.onChange(_array)
    }

    _update(data) {
        let _array = [...this.props.input.value],
            _index = _array.findIndex((item) => {
                return item.AuthorId === data.AuthorId
            })

        if (_index >= 0) {
            let _item = Object.assign({}, _array[_index])
            _item.Tp = +data.Tp
            _item.TpView = +data.TpView

            _array[_index] = _item;
        }

        this.props.input.onChange(_array)
    }

    _remove(id) {
        let _array = [...this.props.input.value],
            _index = _array.findIndex((item) => {
                return item.id === +id
            })

        if (_index >= 0) {
            _array.splice(_index, 1)
        }

        this.props.input.onChange(_array)
    }

    _select() {
    }

    _getBookAuthors() {
        const {
            authors,
            input
        } = this.props;

        let _bookAuthors = [];

        if (input.value) {
            input.value.map((item, index) => {
                let _author = authors.find((author) => {
                    return author.id === item.AuthorId
                });

                if (_author) {
                    let _item = Object.assign({}, item)
                    _item.Number = index + 1
                    _item.Name = _author.FirstName + ' ' + _author.LastName

                    _bookAuthors.push(_item);
                }
            });
        }

        return _bookAuthors;
    }
}

function mapStateToProps(state) {
    return {
        authors: state.authorsList.authors,
    }
}

export default connect(mapStateToProps)(BookAuthorsGrid);