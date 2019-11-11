import React from "react";
import PropTypes from "prop-types";

export default class ItemInfo extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        author: PropTypes.object,
        showAuthor: PropTypes.bool,
    };

    render() {
        return (
            <div className="lectures-list__item-info">
                <h3 className="lectures-list__item-title"><span>{this.props.title}</span></h3>
                {
                    this.props.showAuthor ?
                        <p className="lectures-list__item-author">{this.props.author.FirstName + ' ' + this.props.author.LastName}</p>
                        :
                        null
                }
            </div>
        )
    }
}