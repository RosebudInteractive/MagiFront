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
            _style = {backgroundImage: `url("${_cover}")`}

        return item && <div className="search-result__item course-item">
            <div className="image" style={_style}/>
            <div className="content font-universal__title-smallx">
                <div className="text-wrapper">
                    <div className="text">
                        <span className="header">
                            <span className="title">Курс</span>
                            <Link to={item.URL} target="_blank" className="name result-link" dangerouslySetInnerHTML={{__html: this._getNameText()}}/>
                        </span>
                        <span className="highlights font-universal__book-medium">{this._getHighlights()}</span>
                    </div>
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
        return Object.entries(this.props.item.Authors).map(([key, value], index, array) => {
            return <React.Fragment>
                <Link to={value.URL} target="_blank" className="author-name  result-link" dangerouslySetInnerHTML={{__html: this._getAuthorText(key)}}/>
                { (index !== (array.length - 1)) && <div className="separator">, </div> }
            </React.Fragment>
        })
    }

    _getAuthorText(authorName) {
        const {item} = this.props,
            _highlightName = item.highlight.Author && item.highlight.Author.length && item.highlight.Author.find((item) => {
                let text = replaceAll(item, "<em>","")
                text = replaceAll(text, "</em>", "")

                return text === authorName
            })

        return _highlightName ? _highlightName : authorName
    }

    _getCategories() {
        return Object.entries(this.props.item.Categories).map(([key, value], index, array) => {
            return <React.Fragment>
                <Link to={value.URL} target="_blank" className="category-name result-link _orange">{`#${key}`}</Link>
                { (index !== (array.length - 1)) && <div className="separator">, </div> }
            </React.Fragment>
        })
    }

    _getHighlights() {
        // return Object.keys(this.props.item.highlight).map((key) => {
        //     return <div className="highlights__category-group">
        //         <div className="highlights__title">{key}</div>
        //         {
        //             this.props.item.highlight[key].map((item) => {
        //                 return <div className="highlights__item" dangerouslySetInnerHTML={{__html: item}}/>
        //             })
        //         }
        //     </div>
        // })

        const {item} = this.props

        return item.highlight.Description && item.highlight.Description.length ?
            item.highlight.Description.map((item) => {
                                return <div className="highlights__item" dangerouslySetInnerHTML={{__html: item}}/>
                            })
            :
            // item.highlight.Name && item.highlight.Name.length ?
            //     <div className="highlights__item" dangerouslySetInnerHTML={{__html: item.highlight.Name[0]}}/>
            //     :
            //     item.highlight.Author && item.highlight.Author.length ?
            //         <div className="highlights__item" dangerouslySetInnerHTML={{__html: item.highlight.Author[0]}}/>
            //         :
                    null
    }
}
