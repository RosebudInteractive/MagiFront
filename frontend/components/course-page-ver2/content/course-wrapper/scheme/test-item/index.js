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
        const {test} = this.props

        if (!test) return null

        const COMPLETE_STATUS = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#complete-status"/>'

        const _estimatedTime = test ? this._getEstimatedTime() : 0,
            _url = test.Instance ? `/test-instance/${test.Instance.URL}` : `/test/${test.URL}`

        return <Link to={_url} className="course-scheme__test">
                <div className={"test__complete-status " + this._getColor(test)}>
                    <svg width="15" height="15"
                         dangerouslySetInnerHTML={{__html: COMPLETE_STATUS}}/>
                </div>
                <div className="test__info-wrapper">
                    <div className="test__name"><span>{test.Name}</span></div>
                    <div className="test__time">{`≈ ${_estimatedTime} ${getCountMinutesTitle(_estimatedTime)}`}</div>
                </div>
            </Link>
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
