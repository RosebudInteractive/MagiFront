import React from "react";
import PropTypes from "prop-types";
import {Link} from "react-router-dom";
import "./test-item.sass"
import {getCountMinutesTitle} from "tools/word-tools";

export default class TestItem extends React.Component {

    static propTypes = {
        test: PropTypes.object,
        activeTestId: PropTypes.number
    }

    render() {
        const {test, activeTestId} = this.props

        if (!test) return null

        const COMPLETE_STATUS = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#complete-status"/>'

        const _estimatedTime = test ? this._getEstimatedTime() : 0,
            _preTimeChar = _estimatedTime ? "≈" : "<",
            _time = _estimatedTime ? _estimatedTime : 1,
            _title = _estimatedTime ? getCountMinutesTitle(_time) : "минуты",
            _url = test.Instance ? `/test-instance/${test.Instance.URL}` : `/test/${test.URL}`,
            _isActive = activeTestId && (activeTestId === test.Id)

        return test ?
            <Link to={_url} className={"lectures-list__test" + (_isActive ? ' active' : '')} id={'test-' + test.Id}>
                <div className={"test__complete-status " + this._getColor(test)}>
                    <svg width="18" height="18"
                         dangerouslySetInnerHTML={{__html: COMPLETE_STATUS}}/>
                </div>
                <div className="test__info-wrapper">
                    <div className="test__name"><span>Тест: {test.Name}</span></div>
                    <div className="test__time">{`${_preTimeChar} ${_time} ${_title}`}</div>
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
