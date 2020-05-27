import React from "react";
import {Link} from "react-router-dom";
import PropTypes from "prop-types";

export default class Refs extends React.Component {

    static propTypes = {
        refs: PropTypes.array,
    };

    _getList() {
        return this.props.refs.map((ref, index) => {
            return <li key={index}>
                {ref.URL ? <Link to={ref.URL} target="_blank" rel="nofollow">{ref.Description}</Link> : ref.Description}
            </li>
        })
    }


    render() {
        return (
            <div className="literature-sources" id="recommend">
                <h3 className="literature-sources__title">Литература</h3>
                <ol className="sources-list">
                    {this._getList()}
                </ol>
            </div>
        )
    }
}