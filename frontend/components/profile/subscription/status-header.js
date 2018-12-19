import React from "react";
import {connect} from "react-redux";
// import {switchAutoPay} from "../../../ducks/profile";
import {showBillingWindow} from "../../../ducks/billing";
import {bindActionCreators} from "redux";

class StatusHeader extends React.Component {

    _switchAutoPay() {
        this.props.switchAutoPay()
    }

    render() {
        const _visa = '<use xlink:href="#visa"/>';

        return <div className="subscription-info__header">
            <p className="subscription-info__period">Подписка неактивна</p>
            <form action="#" method="post" className="subscription-form">
                <div className="subscription-form__card-block card-block _error">
                    <div className="card-block__header">
                        <input type="text" className="card-block__number" id="cardnumber" value="**** **** **** 2344"
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
                <div className="subscription-form__actions _inactive">
                    <div className="btn btn--brown subscription-form__btn" onClick={::this.props.showBillingWindow}>Оплатить подписку</div>
                </div>
            </form>
        </div>
    }
}

function mapStateToProps(state) {
    return {
        // profile: userSelector(state),
        // error: errorSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        showBillingWindow: bindActionCreators(showBillingWindow, dispatch),
        // clearError: bindActionCreators(clearError, dispatch),
    }
}

export default connect(null, mapDispatchToProps)(StatusHeader);