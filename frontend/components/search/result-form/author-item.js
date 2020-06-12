import React from "react"
import PropTypes from "prop-types"
import "./result-form.sass"
import {Link} from "react-router-dom";
import {replaceAll} from "tools/word-tools";

export default class AuthorItem extends React.Component {

    static propTypes = {
        item: PropTypes.object
    }

    render() {
        const {item} = this.props

        if (!item) return null

        const _portrait = item.PortraitMeta && item.PortraitMeta.icon ? item.PortraitMeta.icon : item.Portrait,
            _style = {backgroundImage: `url("${_portrait}")`}

        return item && <div className="search-result__item author-item">
            <div className="image _desktop" style={_style}/>
            <div className="content font-universal__title-smallx">
                <div className="text">
                    <div className="image _mobile" style={_style}/>
                    <span className="header">
                        <span className="title">Автор</span>
                        <Link to={item.URL} target="_blank" className="name result-link header" dangerouslySetInnerHTML={{__html: this._getNameText()}}/>
                    </span>
                    <span className="highlights font-universal__book-medium">{this._getHighlights()}</span>
                </div>
            </div>
        </div>
    }

    _getNameText() {
        const {item} = this.props,
            _name = item.Name,
            _highlightName = item.highlight.Name && item.highlight.Name.length && item.highlight.Name.find((item) => {
                let text = replaceAll(item, "<em>","")
                text = replaceAll(text, "</em>", "")

                return text === _name
            })

        return _highlightName ? _highlightName : _name
    }

    _getHighlights() {
        const {item} = this.props

        return item.Description ?
            <div className="highlights__item" dangerouslySetInnerHTML={{__html: item.Description}}/>
            :
            item.ShortDescription ?
                <div className="highlights__item" dangerouslySetInnerHTML={{__html: item.ShortDescription}}/>
                :
                null
    }
}
