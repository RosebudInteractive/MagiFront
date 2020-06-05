import React from "react"
import PropTypes from "prop-types"
import "./result-form.sass"
import {Link} from "react-router-dom";
import {getCoverPath, ImageSize} from "tools/page-tools";
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
            <div className="image" style={_style}/>
            <div className="content">
                <div className="text">
                    <span className="header font-universal__title-smallx">
                        <span className="title">Лекция</span>
                        <Link to={item.URL} target="_blank" className="name result-link" dangerouslySetInnerHTML={{__html: this._getNameText()}}/>
                    </span>
                    <span className="highlights font-universal__book-medium">{this._getHighlights()}</span>
                </div>
                <div className="footer">
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

        return item.highlight.Transcript && item.highlight.Transcript.length ?
            item.highlight.Transcript.map((item) => {
                return <span><div className="highlights__item" dangerouslySetInnerHTML={{__html: item}}/></span>
            })
            :
            item.highlight.Name && item.highlight.Name.length ?
                <div className="highlights__item" dangerouslySetInnerHTML={{__html: item.highlight.Name[0]}}/>
                :
                item.highlight.Course && item.highlight.Course.length ?
                    <div className="highlights__item" dangerouslySetInnerHTML={{__html: item.highlight.Course[0]}}/>
                    :
                    item.highlight.Author && item.highlight.Author.length ?
                        <div className="highlights__item" dangerouslySetInnerHTML={{__html: item.highlight.Author[0]}}/>
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
