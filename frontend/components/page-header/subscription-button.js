import React from 'react';
import {connect} from 'react-redux';
import {showBillingWindow} from "../../ducks/billing";
import {bindActionCreators} from "redux";
import {getDaysBetween} from "../../tools/time-tools";
import PropTypes from "prop-types";

class SubscriptionButton extends React.Component {

    static propTypes = {
        isMobile: PropTypes.bool,
    }

    _getButtonVisible() {
        let {user, authorized, enabledBilling,} = this.props;

        return enabledBilling &&
            (!authorized || (
                    !user.SubsExpDateExt || (getDaysBetween(new Date(), user.SubsExpDateExt) > 7)
                )
            )
    }

    _onClick() {
        this.props.showBillingWindow()
    }

    render() {
        let _className = this.props.isMobile ? 'page-header__btn page-header__btn--mobile btn btn--brown js-modal' :
            'page-header__btn btn btn--brown js-modal'


        return this._getButtonVisible() ?
            <div className={_className} onClick={::this._onClick}>
                Подписка
            </div>
            :
            null
    }
}

function mapStateToProps(state) {
    return {
        authorized: !!state.user.user,
        user: state.user.user,
        enabledBilling: state.app.enabledBilling,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        showBillingWindow: bindActionCreators(showBillingWindow, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubscriptionButton);