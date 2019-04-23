import React from "react";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {loadingSubsInfoSelector, subscriptionInfoSelector, clearStoredCard} from "ducks/profile";
import PropTypes from "prop-types";

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
                           readOnly=""/>
                </div>
            }


            case 'yandex_money' :
                return <div className="card-block__header">
                    <input type="text" className="card-block__number" id="cardnumber"
                           defaultValue={_payment.get('account_number')}
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
                    <input type="text" className="card-block__valid-through" id="cardvalid" defaultValue={_exprDate}
                           readOnly=""/>
                    <div className="card-block__type">
                        <svg width="32" height="10" dangerouslySetInnerHTML={{__html: _visa}}/>
                    </div>
                </div>
            }


            case 'yandex_money' :
                return <div className="card-block__footer">
                    <input type="text" className="card-block__valid-through" id="cardvalid" defaultValue=""
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