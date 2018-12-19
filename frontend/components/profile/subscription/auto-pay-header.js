import React from "react";
import {connect} from "react-redux";
import {loadingSubsInfoSelector, subscriptionInfoSelector, switchAutoPay} from "../../../ducks/profile";
import {bindActionCreators} from "redux";
import {getDaysBetween} from "../../../tools/time-tools";

class AutoPayHeader extends React.Component {

    _switchAutoPay() {
        this.props.switchAutoPay()
    }

    _visible() {
        let {loadingSubsInfo, info} = this.props;

        return !loadingSubsInfo && info && info.get('Payment')
    }

    _getDays() {
        let {loadingSubsInfo, info} = this.props;
        if (!loadingSubsInfo && info && info.get('SubsExpDate')) {
            let _expDate = info.get('SubsExpDate'),
                _days = getDaysBetween(new Date(), _expDate)
            return (_days > 0) ?
                <p className="subscription-info__period"><span className="days">{_days}</span> дня осталось</p>
                :
                null
        } else {
            return null
        }
    }

    _checked() {
        let {loadingSubsInfo, info} = this.props,
            _value = !loadingSubsInfo && info && info.get('SubsAutoPay');

        return _value.toString();
    }


    render() {
        const _visa = '<use xlink:href="#visa"/>';

        return (this._visible()
                ?
                <div className="subscription-info__header">
                    {this._getDays()}
                    <form action="#" method="post" className="subscription-form">
                        <div className="subscription-form__card-block card-block">
                            <div className="card-block__header">
                                <input type="text" className="card-block__number" id="cardnumber"
                                       value="**** **** **** 2344"
                                       readOnly=""/>
                            </div>
                            <p className="card-block__error">Ошибка оплаты</p>
                            <div className="card-block__footer">
                                <input type="text" className="card-block__valid-through" id="cardvalid" value="03/25"
                                       readOnly=""/>
                                <div className="card-block__type">
                                    <svg width="32" height="10" dangerouslySetInnerHTML={{__html: _visa}}/>
                                </div>
                            </div>
                        </div>
                        <div className="subscription-form__actions">
                            <div className="subscription-form__check">
                                <input type="checkbox" id="autosubscribe" className="visually-hidden" checked={this._checked()}
                                       onClick={::this._switchAutoPay}/>
                                <label htmlFor="autosubscribe"
                                       className="subscription-form__label">Автопродление</label>
                            </div>
                        </div>
                    </form>
                </div>
                :
                null)
    }
}

function mapStateToProps(state) {
    return {
        loadingSubsInfo: loadingSubsInfoSelector(state),
        info: subscriptionInfoSelector(state),
        // profile: userSelector(state),
        // error: errorSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        switchAutoPay: bindActionCreators(switchAutoPay, dispatch),
        // clearError: bindActionCreators(clearError, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AutoPayHeader);