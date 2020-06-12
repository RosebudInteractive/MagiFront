import React from "react"
import PropTypes from "prop-types"
import "./result-form.sass"
import {Link} from "react-router-dom";
import {replaceAll} from "tools/word-tools";

export default class LessonItem extends React.Component {

    static propTypes = {
        item: PropTypes.object
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
                    <span className="header font-universal__title-smallx">
                        <span className="title">Лекция</span>
                        <div className="name result-link" dangerouslySetInnerHTML={{__html: this._getNameText()}}/>
                    </span>
                    <span className="highlights font-universal__book-medium">{this._getHighlights()}</span>
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
            item.highlight.Transcript.map((item) => {
                return <span><div className="highlights__item" dangerouslySetInnerHTML={{__html: item}}/></span>
            })
            :
            item.highlight.ShortDescription && item.highlight.ShortDescription.length ?
                <div className="highlights__item" dangerouslySetInnerHTML={{__html: item}}/>
                :
                item.FullDescription ?
                    <div className="highlights__item" dangerouslySetInnerHTML={{__html: item.FullDescription}}/>
                    :
                    item.ShortDescription ?
                        <div className="highlights__item" dangerouslySetInnerHTML={{__html: item.ShortDescription}}/>
                        :
                        null

    }

    _getCategories() {
        // return Object.entries(this.props.item.Categories).map(([key, value], index, array) => {
        //     return <React.Fragment>
        //         <Link to={value.URL} className="category-name result-link">{key}</Link>
        //         { (index !== (array.length - 1)) && <div className="separator">, </div> }
        //     </React.Fragment>
        // })

        return <div className="categories">
            <Link to={"#"} className="category-name font-universal__body-medium result-link _orange">#Ссылка на категрию</Link>
        </div>
    }
}
