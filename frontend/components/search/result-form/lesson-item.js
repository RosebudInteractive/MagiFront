import React from "react"
import PropTypes from "prop-types"
import "./result-form.sass"
import {Link} from "react-router-dom";
import {replaceAll} from "tools/word-tools";
import {ellipsisHighlightItem, trimHighlight} from "./tools";

export default class LessonItem extends React.Component {

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

        const _cover = item.CoverMeta && item.CoverMeta.icon ? item.CoverMeta.icon : item.Cover,
            _style = {backgroundImage: `url("${_cover}")`}

        return item && <div className="search-result__item lesson-item">
            <Link to={item.URL} target="_blank" className="image _desktop" style={_style}/>
            <div className="content">
                <Link to={item.URL} target="_blank" className="text">
                    <div className="image _mobile" style={_style}/>
                    <span className="item__text-block" ref={e => this.wrapper = e}>
                        <span className="header font-universal__title-smallx">
                            <span className="title">Лекция</span>
                            <div className="name result-link" dangerouslySetInnerHTML={{__html: this._getNameText()}}/>
                        </span>
                        <span className="highlights font-universal__book-medium" ref={e => this.highlight = e}>{this._getHighlights()}</span>
                    </span>
                </Link>
                <div className="footer _lesson">
                    <Link to={item.Author.URL} target="_blank" className="author-name font-universal__body-medium result-link" dangerouslySetInnerHTML={{__html: this._getAuthorText()}}/>
                    <div className="course font-universal__body-medium">
                        <span className="title">Курс:</span>
                        <Link to={item.Course.URL} target="_blank" className="course-name result-link" dangerouslySetInnerHTML={{__html: this._getCourseText()}}/>
                    </div>
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

    _getAuthorText() {
        const {item} = this.props,
            _name = item.Author.Name,
            _highlightName = item.highlight.Author && item.highlight.Author.length && item.highlight.Author.find((item) => {
                let text = replaceAll(item, "<em>","")
                text = replaceAll(text, "</em>", "")

                return text === _name
            })

        return _highlightName ? _highlightName : _name
    }

    _getCourseText() {
        const {item} = this.props,
            _name = item.Course.Name,
            _highlightName = item.highlight.Course && item.highlight.Course.length && item.highlight.Course.find((item) => {
                let text = replaceAll(item, "<em>","")
                text = replaceAll(text, "</em>", "")

                return text === _name
            })

        return _highlightName ? _highlightName : _name
    }

    _getHighlights() {
        const {item} = this.props

        return item.highlight.Transcript && item.highlight.Transcript.length ?
            item.highlight.Transcript.map((transcript, index, array) => {
                const _text = ellipsisHighlightItem({item: transcript, isLastItem: index === (array.length - 1)})

                return <span className="highlights__item" dangerouslySetInnerHTML={{__html: _text}}/>
            })
            :
            item.highlight.ShortDescription && item.highlight.ShortDescription.length ?
                item.highlight.ShortDescription.map((desc, index, array) => {
                    const _text = ellipsisHighlightItem({item: desc, fullText: item.ShortDescription, isLastItem: index === (array.length - 1)})

                    return <span className="highlights__item" dangerouslySetInnerHTML={{__html: _text}}/>
                })
                :
                item.FullDescription ?
                    <span className="highlights__item" dangerouslySetInnerHTML={{__html: item.FullDescription}}/>
                    :
                    item.ShortDescription ?
                        <span className="highlights__item" dangerouslySetInnerHTML={{__html: item.ShortDescription}}/>
                        :
                        null

    }

    _getCategories() {
        return <div className="categories">
            <Link to={"#"} className="category-name font-universal__body-medium result-link _orange">#Ссылка на категрию</Link>
        </div>
    }

    _calcTextLength(html) {
        const _lineCount = $(window).width() < 899 ? 8 : 3

        if (this.highlight.innerHTML !== html) {
            this.highlight.innerHTML = html
        }

        while (this.wrapper.getClientRects().length > _lineCount) {
            let _text = trimHighlight(this.highlight.innerHTML)
            this.highlight.innerHTML = _text
        }
    }
}
