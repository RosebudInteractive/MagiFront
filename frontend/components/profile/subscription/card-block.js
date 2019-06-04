import React from "react";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {loadingSubsInfoSelector, subscriptionInfoSelector, clearStoredCard} from "ducks/profile";
import PropTypes from "prop-types";

const PAYMENT_SYSTEM_NAME = {
    MASTERCARD: "MasterCard",
    MAESTRO: "Maestro",
    VISA: "Visa",
    VISA_ELECTRON: "VisaElectron",
    AMERICAN_EXPRESS: "AmericanExpress",
    JCB: "JCB",
    DINERS_CLUB: "DinersClub",
    MIR: "Mir",
    UNION_PAY: "UnionPay",
}

class CardBlock extends React.Component {

    static propTypes = {
        showError: PropTypes.bool,
        parent: PropTypes.string,
        showButton: PropTypes.bool,
    };

    static defaultProps = {
        showButton: false,
    }

    _visible() {
        let {loadingSubsInfo, info} = this.props;

        return !loadingSubsInfo && info && info.get('Payment')
    }

    _getCardHeader() {
        let {info} = this.props,
            _payment = info.get('Payment');

        switch (_payment.get('type')) {
            case 'bank_card' : {
                let _start = _payment.getIn(['card', 'first6']);
                _start = [_start.slice(0, 4), ' ', _start.slice(4)].join('');

                return <div className="card-block__header">
                    <input type="text" className="card-block__number" id="cardnumber"
                           defaultValue={_start + '** **** ' + _payment.getIn(['card', 'last4'])}
                           disabled/>
                </div>
            }


            case 'yandex_money' :
                return <div className="card-block__header">
                    <input type="text" className="card-block__number" id="cardnumber"
                           defaultValue={_payment.get('account_number')}
                           disabled/>
                </div>

            default :
                return null;
        }
    }

    _getIcon(systemName) {
        const _american_express = '<use xlink:href="#american-express"/>',
            _diners_club = '<use xlink:href="#diners-club"/>',
            _jcb = '<use xlink:href="#jcb-logo"/>',
            _maestro = '<use xlink:href="#maestro"/>',
            _mastercard = '<use xlink:href="#mastercard"/>',
            _mir = '<use xlink:href="#mir-logo"/>',
            _union_pay = '<use xlink:href="#union-pay"/>',
            _visa = '<use xlink:href="#visa"/>',
            _default = '<use xlink:href="#default-card"/>';

        switch (systemName) {
            case PAYMENT_SYSTEM_NAME.AMERICAN_EXPRESS:
                return <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _american_express}}/>

            case PAYMENT_SYSTEM_NAME.DINERS_CLUB:
                return <svg width="20" height="17" dangerouslySetInnerHTML={{__html: _diners_club}}/>

            case PAYMENT_SYSTEM_NAME.JCB:
                return <svg width="20" height="15" dangerouslySetInnerHTML={{__html: _jcb}}/>

            case PAYMENT_SYSTEM_NAME.MAESTRO:
                return <svg width="17" height="10" dangerouslySetInnerHTML={{__html: _maestro}}/>

            case PAYMENT_SYSTEM_NAME.MIR:
                return <svg width="16" height="5" dangerouslySetInnerHTML={{__html: _mir}}/>

            case PAYMENT_SYSTEM_NAME.MASTERCARD :
                return <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _mastercard}}/>

            case PAYMENT_SYSTEM_NAME.UNION_PAY:
                return <svg width="20" height="13" dangerouslySetInnerHTML={{__html: _union_pay}}/>

            case PAYMENT_SYSTEM_NAME.VISA:
            case PAYMENT_SYSTEM_NAME.VISA_ELECTRON:
                return <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _visa}}/>

            default:
                return <svg width="19" height="12" dangerouslySetInnerHTML={{__html: _default}}/>
        }
    }

    _getCardFooter() {
        const _yandex_money = '<use xlink:href="#yandex-money"/>';

        let {info} = this.props,
            _payment = info.get('Payment');

        switch (_payment.get('type')) {
            case 'bank_card' : {
                let _exprDate = _payment.getIn(['card', 'expiry_month']) + "/",
                    _year = _payment.getIn(['card', 'expiry_year']),
                    _cardType = _payment.getIn(['card', 'card_type']);

                _year = _year.substr(_year.length - 2, 2);
                _exprDate += _year;

                return <div className="card-block__footer">
                    <input type="text" className="card-block__valid-through" id="cardvalid" defaultValue={_exprDate}
                           disabled/>
                    <div className="card-block__type">
                        {this._getIcon(_cardType)}
                    </div>
                </div>
            }


            case 'yandex_money' :
                return <div className="card-block__footer">
                    <input type="text" className="card-block__valid-through" id="cardvalid" defaultValue=""
                           disabled/>
                    <div className="card-block__type">
                        <svg width="16" height="19" dangerouslySetInnerHTML={{__html: _yandex_money}}/>
                    </div>
                </div>

            default :
                return null;
        }
    }


    render() {
        return this._visible()
            ?
            this.props.showButton ?
                this._getCardBlockWithButton()
                :
                this._getCardBlock()
            :
            null
    }

    _getCardBlockWithButton() {
        return <React.Fragment>
            <div className="form__row">
                <div className={this.props.parent + " card-block" + (this.props.showError ? " _error" : "")}>
                    {this._getCardHeader()}
                    {
                        this.props.showError && (this.props.info.get('Error') !== null)
                            ?
                            <p className="card-block__error">Ошибка оплаты</p>
                            :
                            null
                    }
                    {this._getCardFooter()}
                </div>
            </div>
            <div className="form__row">
                <button className="form__submit btn btn--brown" onClick={::this._clearCard}>Больше не использовать
                </button>
            </div>
        </React.Fragment>
    }

    _clearCard() {
        this.props.clearStoredCard()
    }

    _getCardBlock() {
        return <div className={this.props.parent + " card-block" + (this.props.showError ? " _error" : "")}>
            {this._getCardHeader()}
            {
                this.props.showError && (this.props.info.get('Error') !== null)
                    ?
                    <p className="card-block__error">Ошибка оплаты</p>
                    :
                    null
            }
            {this._getCardFooter()}
        </div>
    }
}

function mapStateToProps(state) {
    return {
        loadingSubsInfo: loadingSubsInfoSelector(state),
        info: subscriptionInfoSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {clearStoredCard: bindActionCreators(clearStoredCard, dispatch)}
}

export default connect(mapStateToProps, mapDispatchToProps)(CardBlock);