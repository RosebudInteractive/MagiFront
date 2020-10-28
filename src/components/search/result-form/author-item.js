import React from "react"
import PropTypes from "prop-types"
import "./result-form.sass"
import {Link} from "react-router-dom";

export default class AuthorItem extends React.Component {

    static propTypes = {
        item: PropTypes.object
    }

    render() {
        const {item} = this.props

        if (!item) return null

        const _style = {backgroundImage: `url("${item.Portrait}")`}

        return item && <div className="search-result__item author-item">
            <div className="image" style={_style}/>
            <div className="info">
                <a href={item.URL} className="name result-link header">{item.Name}</a>
                <div className="pub-date">{item.PubDate}</div>
                <div className="highlights">{this._getHighlights()}</div>
            </div>
        </div>
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