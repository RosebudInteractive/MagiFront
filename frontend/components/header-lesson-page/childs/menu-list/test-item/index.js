import React from "react";
import PropTypes from "prop-types";
import {Link} from "react-router-dom";
import "./test-item.sass"
import {getCountMinutesTitle} from "tools/word-tools";


export default class TestItem extends React.Component {

    static propTypes = {
        test: PropTypes.object
    }

    render() {
        const COMPLETE_STATUS = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#complete-status"/>'

        const {test} = this.props,
            _estimatedTime = test ? this._getEstimatedTime() : 0,
            _url = test.Instance ? `/test-instance/${test.Instance.URL}` : `/test/${test.URL}`

        return test ?
            <Link to={_url} className="lectures-list__test">
                <div className={"test__complete-status " + this._getColor(test)}>
                    <svg width="18" height="18"
                         dangerouslySetInnerHTML={{__html: COMPLETE_STATUS}}/>
                </div>
                <div className="test__info-wrapper">
                    <div className="test__name"><span>{test.Name}</span></div>
                    <div className="test__time">{`≈ ${_estimatedTime} ${getCountMinutesTitle(_estimatedTime)}`}</div>
                </div>
            </Link>
            :
            null
    }

    _getColor(test) {
        if (!test.Instance) {
            return '_gray'
        } else {
            return test.Instance.IsFinished ? '_green' : '_yellow'
        }
    }

    _getEstimatedTime() {
        return Math.round(this.props.test.AnswTime / 60)
    }
}
