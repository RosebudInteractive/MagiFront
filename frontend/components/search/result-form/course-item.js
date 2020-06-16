import React from "react"
import PropTypes from "prop-types"
import "./result-form.sass"
import {Link} from "react-router-dom";
import {replaceAll} from "tools/word-tools";
import {ellipsisHighlightItem, trimHighlight} from "./tools";

const CROWN = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#crown"/>'

export default class CourseItem extends React.Component {

    static propTypes = {
        item: PropTypes.object
    }

    constructor(props) {
        super(props)

        this.wrapper = null
        this.highlight = null
        this.footer = null

        this.state = {
            fixedFooter: false
        }

        this._resizeHandler = () => {
            this._calcTextLength(this._highlightHTML)
            this._checkFooter()
        }
    }

    componentDidMount() {
        this._highlightHTML = this.highlight.innerHTML

        $(window).bind('resize', this._resizeHandler)
        this._resizeHandler()
    }

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler)
    }

    render() {
        const {item} = this.props

        if (!item) return null

        const _cover = item.CoverMeta && item.CoverMeta.icon ? item.CoverMeta.icon : item.Cover,
            _backgroundPosition = item.backgroundPosition  &&
                {
                    top: item.backgroundPosition.percent.top * 100 + "%",
                    left: item.backgroundPosition.percent.left * 100 + "%",
                },

            _style = {backgroundImage: `url("${_cover}")`}

        if (_backgroundPosition) {
            _style.backgroundPositionX = _backgroundPosition.left
            _style.backgroundPositionY = _backgroundPosition.top
        }

        return item && <div className="search-result__item course-item">
            <div className="content">
                    <Link to={item.URL} target="_blank" className="text">
                        <div className="image" style={_style}/>
                        {
                            item.IsPaid &&
                            <div className="crown">
                                <svg className="course-module__label-icon" width="18" height="18" fill={"#C8684C"}
                                     dangerouslySetInnerHTML={{__html: CROWN}}/>
                            </div>
                        }
                        <span className="item__text-block" ref={e => this.wrapper = e}>
                            <span className="header font-universal__title-smallx">
                                <span className="title">Курс</span>
                                <Link to={item.URL} target="_blank" className="name result-link" dangerouslySetInnerHTML={{__html: this._getNameText()}}/>
                            </span>
                            <span className="highlights font-universal__book-medium" ref={e => this.highlight = e}>{this._getHighlights()}</span>
                        </span>
                    </Link>
                <div className={"footer" + (this.state.fixedFooter ? " _fixed" : "")} ref={e => this.footer = e}>
                    <div className="categories font-universal__body-medium">{this._getCategories()}</div>
                    <div className="authors font-universal__body-medium">{this._getAuthors()}</div>

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

    _getAuthors() {
        return this.props.item.Authors.map((item, index, array) => {
            const _needSeparator = (index !== (array.length - 1))

            return <React.Fragment>
                {
                    item.Highlight ?
                        <Link to={item.URL} target="_blank" className="author-name  result-link" dangerouslySetInnerHTML={{__html: item.Highlight + (_needSeparator ? ", " : "")}}/>
                        :
                        <Link to={item.URL} target="_blank" className="author-name  result-link">{item.Name + (_needSeparator ? ", " : "")}</Link>
                }
            </React.Fragment>
        })
    }

    _getCategories() {
        return this.props.item.Categories.map((item, index, array) => {
            return <React.Fragment>
                {
                    item.Highlight ?
                        <Link to={item.URL} target="_blank" className="category-name result-link _orange">
                            <span>#</span>
                            <span dangerouslySetInnerHTML={{__html: item.Highlight}}/>
                        </Link>
                        :
                        <Link to={item.URL} target="_blank" className="category-name result-link _orange">{`#${item.Name}`}</Link>
                }
                {(index !== (array.length - 1)) && <div className="separator">, </div>}
            </React.Fragment>
        })
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
                item.highlight.Aims && item.highlight.Aims.length ?
                    item.highlight.Aims.map((item) => {
                        return <span className="highlights__item" dangerouslySetInnerHTML={{__html: item}}/>
                    })
                    :
                    item.highlight.TargetAudience && item.highlight.TargetAudience.length ?
                        item.highlight.TargetAudience.map((item) => {
                            return <span className="highlights__item" dangerouslySetInnerHTML={{__html: item}}/>
                        })
                        :
                        item.Description ?
                            <span className="highlights__item" dangerouslySetInnerHTML={{__html: item.Description}}/>
                            :
                            item.ShortDescription ?
                                <span className="highlights__item"
                                     dangerouslySetInnerHTML={{__html: item.ShortDescription}}/>
                                :
                                null
    }

    _calcTextLength(html) {
        const _lineCount = $(window).outerWidth() < 900 ? 8 : 3

        if (this.highlight.innerHTML !== html) {
            this.highlight.innerHTML = html
        }

        while (this.wrapper.getClientRects().length > _lineCount) {
            this.highlight.innerHTML = trimHighlight(this.highlight.innerHTML)
        }
    }

    _checkFooter() {
        if (!(this.footer && this.wrapper)) return

        if ((this.footer.offsetHeight + this.wrapper.offsetHeight + 10) >= 113) {
            if (this.state.fixedFooter) { this.setState({fixedFooter: false})}
        } else {
            if (!this.state.fixedFooter) { this.setState({fixedFooter: true})}
        }
    }
}
