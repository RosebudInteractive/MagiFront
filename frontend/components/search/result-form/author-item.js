import React from "react"
import PropTypes from "prop-types"
import "./result-form.sass"
import {Link} from "react-router-dom";
import {replaceAll} from "tools/word-tools";
import {ellipsisHighlightItem, trimHighlight} from "./tools";

export default class AuthorItem extends React.Component {

    static propTypes = {
        item: PropTypes.object
    }

    constructor(props) {
        super(props)

        this.wrapper = null
        this.highlight = null

        this._resizeHandler = () => { this._calcTextLength(this._highlightHTML) }
    }

    componentDidMount() {
        this._highlightHTML = this.highlight.innerHTML

        $(window).bind('resize', this._resizeHandler)
        this._calcTextLength(this._highlightHTML)
    }

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler)
    }

    render() {
        const {item} = this.props

        if (!item) return null

        const _portrait = item.PortraitMeta && item.PortraitMeta.icon ? item.PortraitMeta.icon : item.Portrait,
            _style = {backgroundImage: `url("${_portrait}")`}

        return item && <div className="search-result__item author-item">
            <div className="content">
                <a href={item.URL} target="_blank" className="text">
                    <div className="image" style={_style}/>
                    <span className="item__text-block" ref={e => this.wrapper = e}>
                        <span className="header font-universal__title-smallx">
                            <span className="title">Автор</span>
                            <a href={item.URL} target="_blank" className="name result-link header" dangerouslySetInnerHTML={{__html: this._getNameText()}}/>
                        </span>
                        <span className="highlights font-universal__book-medium" ref={e => this.highlight = e}>{this._getHighlights()}</span>
                    </span>
                </a>
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

        return item.highlight.Description && item.highlight.Description.length ?
            item.highlight.Description.map((desc, index, array) => {
                const _text = ellipsisHighlightItem({item: desc, fullText: item.Description, isLastItem: index === (array.length - 1)})
                return <span className="highlights__item" dangerouslySetInnerHTML={{__html: _text}}/>
            })
            :
            item.highlight.ShortDescription && item.highlight.ShortDescription.length ?
                item.highlight.ShortDescription.map((desc, index, array) => {
                    const _text = ellipsisHighlightItem({item: desc, fullText: item.ShortDescription, isLastItem: index === (array.length - 1)})
                    return <span className="highlights__item" dangerouslySetInnerHTML={{__html: _text}}/>
                })
                :
                item.Description ?
                    <span className="highlights__item" dangerouslySetInnerHTML={{__html: item.Description}}/>
                    :
                    item.ShortDescription ?
                        <span className="highlights__item" dangerouslySetInnerHTML={{__html: item.ShortDescription}}/>
                        :
                        null
    }

    _calcTextLength(html) {
        const _lineCount = $(window).outerWidth() < 900 ? 8 : 3

        if (this.highlight.innerHTML !== html) {
            this.highlight.innerHTML = html
        }

        while (this.wrapper.getClientRects().length > _lineCount) {
            let _text = trimHighlight(this.highlight.innerHTML)
            this.highlight.innerHTML = _text
        }
    }
}
