import React from "react"
import PropTypes from "prop-types"
import "./result-form.sass"
import {Link} from "react-router-dom";
import {replaceAll} from "tools/word-tools";

const CROWN = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#crown"/>'

export default class CourseItem extends React.Component {

    static propTypes = {
        item: PropTypes.object
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
            <Link to={item.URL} target="_blank" className="image _desktop" style={_style}/>
            <div className="content font-universal__title-smallx">
                <div className="text-wrapper">
                    <Link to={item.URL} target="_blank" className="text">
                        <div to={item.URL} target="_blank" className="image _mobile" style={_style}/>
                        <span className="item__text-block">
                            <span className="header">
                                <span className="title">Курс</span>
                                <Link to={item.URL} target="_blank" className="name result-link" dangerouslySetInnerHTML={{__html: this._getNameText()}}/>
                            </span>
                            <span className="highlights font-universal__book-medium">{this._getHighlights()}</span>
                        </span>
                    </Link>
                    {
                        item.IsPaid &&
                        <div className="crown">
                            <svg className="course-module__label-icon" width="18" height="18" fill={"#C8684C"}
                                 dangerouslySetInnerHTML={{__html: CROWN}}/>
                        </div>
                    }
                </div>
                <div className="footer">
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
            return <React.Fragment>
                {
                    item.Highlight ?
                        <Link to={item.URL} target="_blank" className="author-name  result-link" dangerouslySetInnerHTML={{__html: item.Highlight}}/>
                        :
                        <Link to={item.URL} target="_blank" className="author-name  result-link">{item.Name}</Link>
                }
                { (index !== (array.length - 1)) && <div className="separator">, </div> }
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
            item.highlight.Description.map((item) => {
                return <div className="highlights__item" dangerouslySetInnerHTML={{__html: item}}/>
            })
            :
            item.highlight.ShortDescription && item.highlight.ShortDescription.length ?
                item.highlight.ShortDescription.map((item) => {
                    return <div className="highlights__item" dangerouslySetInnerHTML={{__html: item}}/>
                })
                :
                item.highlight.Aims && item.highlight.Aims.length ?
                    item.highlight.Aims.map((item) => {
                        return <div className="highlights__item" dangerouslySetInnerHTML={{__html: item}}/>
                    })
                    :
                    item.highlight.TargetAudience && item.highlight.TargetAudience.length ?
                        item.highlight.TargetAudience.map((item) => {
                            return <div className="highlights__item" dangerouslySetInnerHTML={{__html: item}}/>
                        })
                        :
                        item.Description ?
                            <div className="highlights__item" dangerouslySetInnerHTML={{__html: item.Description}}/>
                            :
                            item.ShortDescription ?
                                <div className="highlights__item"
                                     dangerouslySetInnerHTML={{__html: item.ShortDescription}}/>
                                :
                                null
    }
}
