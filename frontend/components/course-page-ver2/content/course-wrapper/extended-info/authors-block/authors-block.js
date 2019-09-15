import React from 'react'
import PropTypes from 'prop-types'
import './authors-block.sass'
import {getAuthorPortraitPath, ImageSize} from "tools/page-tools";

export default class AuthorsBlock extends React.Component {

    static propTypes = {
        authors: PropTypes.array
    }

    constructor(props) {
        super(props)
    }

    render() {
        const _title = (this.props.authors.length > 1) ? 'Авторы курса' : 'Автор курса'

        return <div className="extended-info__authors-block">
            <div className="author-block__title">{_title}</div>
            {this._getAuthorBlocks()}
        </div>
    }

    _getAuthorBlocks() {
        return this.props.authors.map((author) => {
            return <AuthorItem author={author}/>
        })
    }
}

class AuthorItem extends React.Component {
    static propTypes = {
        author: PropTypes.object
    }

    render() {
        const {author} = this.props,
            _name = author.FirstName + " " + author.LastName,
            _portrait = getAuthorPortraitPath(author, ImageSize.icon);

        return <div className="authors-block__item">
            <div className="author-header">
                <div className="author-header__portrait">
                    <img src={_portrait}/>
                </div>
                <div className="author-header__info">
                    <div className="author-header__info-name">{_name}</div>
                    <div className="author-header__occupation">{author.Occupation}</div>
                    <div className="author-header__employment">{author.Employment}</div>
                </div>
            </div>
            <div className="author-description">
                {author.Description}
            </div>
        </div>
    }

}