import React from "react";
import {connect} from "react-redux";
import {loadingSubsInfoSelector, subscriptionInfoSelector, switchAutoPay} from "ducks/profile";
import {enabledSubscriptionSelector} from 'ducks/app'
import {bindActionCreators} from "redux";
import {getDaysBetween} from "../../../tools/time-tools";
import CardBlock from './card-block'

class AutoPayHeader extends React.Component {

    _switchAutoPay(event) {
        const data = new FormData(event.target);
        data.alter = {
            SubsAutoPay: !this.props.info.get('SubsAutoPay')
        }
        this.props.switchAutoPay(data)
    }

    _visible() {
        let {loadingSubsInfo, info} = this.props;

        return !loadingSubsInfo && info && info.get('Payment')
    }

    _getDays() {
        let {info} = this.props;
        if (info && info.get('SubsExpDate')) {
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
        let {info} = this.props;
        return info && info.get('SubsAutoPay');
    }

    render() {
        return (this._visible()
            ?
            <div className="subscription-info__header">
                {this._getDays()}
                <form action="javascript:void(0);" method="post" className="subscription-form">
                    <CardBlock parent="subscription-form__card-block"/>
                    {
                        this.props.enabledSubscription ?
                            <div className="subscription-form__actions">
                                <div className="subscription-form__check">
                                    <input type="checkbox" id="autosubscribe" className="visually-hidden"
                                           defaultChecked={this._checked()}
                                           onChange={::this._switchAutoPay}/>
                                    <label htmlFor="autosubscribe"
                                           className="subscription-form__label">Автопродление</label>
                                </div>
                            </div>
                            :
                            null
                    }
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
        enabledSubscription: enabledSubscriptionSelector(state)
    }
}

function mapDispatchToProps(dispatch) {
    return {
        switchAutoPay: bindActionCreators(switchAutoPay, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AutoPayHeader);