import React from "react"
import PropTypes from 'prop-types'
import {TEST_TYPE} from "../../../constants/common-consts";
import {Link} from "react-router-dom";

const TITLE = {
    START: "Предварительный тест",
    FINISHED: "Тест по лекции",
    UNKNOWN: "Неизвестный",
}


export default class TestButton extends React.Component {

    static propTypes = {
        test: PropTypes.object
    }

    render() {
        const {test} = this.props

        if (!test) return null

        const COMPLETE_STATUS = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#complete-status"/>'

        const _url = test.Instance ? `/test-instance/${test.Instance.URL}` : `/test/${test.URL}`

        return <Link to={_url} className="test-button">
            <div className="test-button__icon">
                <svg width="15" height="15" dangerouslySetInnerHTML={{__html: COMPLETE_STATUS}}/>
            </div>
            <div className="test-button__caption">
                <div className="caption__title font-universal__button-default">{this._getTitle(test)}</div>
                <div className="caption__subtitle">{this._getHint(test)}</div>
            </div>
            <div className="test-button_progress _in-progress" style={{width: "calc(80% - 2px)"}}/>
        </Link>
    }

    _getTitle(test) {
        switch (test.TestTypeId) {
            case TEST_TYPE.STARTED :
                return TITLE.START

            case  TEST_TYPE.FINISHED :
                return TITLE.FINISHED

            default:
                return TITLE.UNKNOWN
        }
    }

    _getHint(test) {
        if (!test.Instance) {
            return null
        } else {
            return test.Instance.IsFinished ? "Продолжить" : "8 из 10. Пройти заново"
        }
    }


}