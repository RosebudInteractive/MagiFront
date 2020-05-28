import React from "react"
import PropTypes from "prop-types"
import "./result-form.sass"
import {Link} from "react-router-dom";

export default class LessonItem extends React.Component {

    static propTypes = {
        item: PropTypes.object
    }

    render() {
        const {item} = this.props

        if (!item) return null

        const _style = {backgroundImage: `url("${item.Cover}")`}

        return item && <div className="search-result__item lesson-item">
            <div className="image" style={_style}/>
            <div className="info">
                <div className="header">Лекция: <Link to={item.URL} className="name result-link">{item.Name}</Link></div>
                <Link to={item.Author.URL} className="author-name result-link">{item.Author.Name}</Link>
                <Link to={item.Course.URL} className="course result-link">{item.Course.Name}</Link>
                <div className="pub-date">{item.PubDate}</div>
                <div className="highlights">{this._getHighlights()}</div>
            </div>
        </div>
    }

    _getAuthors() {
        return this.Author.map((item, index, array) => {
            return <React.Fragment>
                <Link to={item.URL} className="author-name result-link">{item.Name}</Link>
                { (index !== (array.length - 1)) && <div className="separator">, </div> }
            </React.Fragment>
        })
    }

    _getHighlights() {
        return Object.keys(this.props.item.highlight).map((key) => {
            return <div className="highlights__category-group">
                <div className="highlights__title">{key}</div>
                {
                    this.props.item.highlight[key].map((item) => {
                        return <div className="highlights__item" dangerouslySetInnerHTML={{__html: item}}/>
                    })
                }
            </div>
        })
    }
}