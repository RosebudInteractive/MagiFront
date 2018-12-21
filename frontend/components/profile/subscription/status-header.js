import React from "react";
import {connect} from "react-redux";
// import {switchAutoPay} from "../../../ducks/profile";
import {showBillingWindow} from "../../../ducks/billing";
import {bindActionCreators} from "redux";
import {loadingSubsInfoSelector, subscriptionInfoSelector} from "../../../ducks/profile";
import CardBlock from './card-block'

class StatusHeader extends React.Component {

    _visible() {
        let {loadingSubsInfo, info} = this.props;

        return !loadingSubsInfo && info && info.get('Error')
    }


    render() {

        return (
            this._visible()
                ?
                <div className="subscription-info__header">
                    <p className="subscription-info__period">Подписка неактивна</p>
                    <form action="#" method="post" className="subscription-form">
                        <CardBlock parent="subscription-form__card-block" showError={true}/>
                        <div className="subscription-form__actions _inactive">
                            <div className="btn btn--brown subscription-form__btn"
                                 onClick={::this.props.showBillingWindow}>Оплатить подписку
                            </div>
                        </div>
                    </form>
                </div>
                :
                null
        )
    }
}

function mapStateToProps(state) {
    return {
        loadingSubsInfo: loadingSubsInfoSelector(state),
        info: subscriptionInfoSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        showBillingWindow: bindActionCreators(showBillingWindow, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StatusHeader);