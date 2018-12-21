import React from "react";
import {connect} from "react-redux";
import {loadingSubsInfoSelector, subscriptionInfoSelector} from "../../../ducks/profile";
import PropTypes from "prop-types";

class CardBlock extends React.Component {

    static propTypes = {
        showError: PropTypes.bool,
        parent: PropTypes.string,
    };

    _visible() {
        let {loadingSubsInfo, info} = this.props;

        return !loadingSubsInfo && info && info.get('Payment')
    }

    _getCardHeader() {
        let {info} = this.props,
            _payment = info.get('Payment');

        switch (_payment.get('type')) {
            case 'bank_card' :
                return <div className="card-block__header">
                    <input type="text" className="card-block__number" id="cardnumber"
                           value={_payment.getIn(['card', 'first6']) + ' **** **** ' + _payment.getIn(['card', 'last4'])}
                           readOnly=""/>
                </div>

            case 'yandex_money' :
                return <div className="card-block__header">
                    <input type="text" className="card-block__number" id="cardnumber"
                           value={_payment.get('account_number')}
                           readOnly=""/>
                </div>

            default :
                return null;
        }
    }

    _getCardFooter() {
        const _visa = '<use xlink:href="#visa"/>';

        let {info} = this.props,
            _payment = info.get('Payment');

        switch (_payment.get('type')) {
            case 'bank_card' : {
                let _exprDate = _payment.getIn(['card', 'expiry_month']) + "/",
                    _year = _payment.getIn(['card', 'expiry_year']);

                _year = _year.substr(_year.length - 2, 2);
                _exprDate += _year;

                return <div className="card-block__footer">
                    <input type="text" className="card-block__valid-through" id="cardvalid" value={_exprDate}
                           readOnly=""/>
                    <div className="card-block__type">
                        <svg width="32" height="10" dangerouslySetInnerHTML={{__html: _visa}}/>
                    </div>
                </div>
            }


            case 'yandex_money' :
                return <div className="card-block__footer">
                    <input type="text" className="card-block__valid-through" id="cardvalid" value=""
                           readOnly=""/>
                    <div className="card-block__type">
                        <svg width="32" height="10" dangerouslySetInnerHTML={{__html: _visa}}/>
                    </div>
                </div>

            default :
                return null;
        }
    }


    render() {
        return (this._visible()
            ?
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
            :
            null)
    }
}

function mapStateToProps(state) {
    return {
        loadingSubsInfo: loadingSubsInfoSelector(state),
        info: subscriptionInfoSelector(state),
    }
}

export default connect(mapStateToProps)(CardBlock);