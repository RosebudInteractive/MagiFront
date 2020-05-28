import React from "react"
import PropTypes from "prop-types"
import "./result-form.sass"
import {Link} from "react-router-dom";

export default class CourseItem extends React.Component {

    static propTypes = {
        item: PropTypes.object
    }

    render() {
        const {item} = this.props

        if (!item) return null

        const _style = {backgroundImage: `url("${item.Cover}")`}

        return item && <div className="search-result__item course-item">
            <div className="image" style={_style}/>
            <div className="info">
                <div className="header">Курс: <Link to={item.URL} className="name result-link header">{item.Name}</Link></div>
                <div className="authors">{this._getAuthors()}</div>
                <div className="categories">{this._getCategories()}</div>
                <div className="pub-date">{item.PubDate}</div>
                <div className="highlights">{this._getHighlights()}</div>
            </div>
        </div>
    }

    _getAuthors() {
        return Object.entries(this.props.item.Authors).map(([key, value], index, array) => {
            return <React.Fragment>
                <Link to={value.URL} className="author-name result-link">{key}</Link>
                { (index !== (array.length - 1)) && <div className="separator">, </div> }
            </React.Fragment>
        })
    }

    _getCategories() {
        return Object.entries(this.props.item.Categories).map(([key, value], index, array) => {
            return <React.Fragment>
                <Link to={value.URL} className="category-name result-link">{key}</Link>
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