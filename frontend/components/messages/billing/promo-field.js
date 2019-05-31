import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import { applyPromo, promoValuesSelector,} from "ducks/billing";
import {getCurrencySign} from "../../../tools/page-tools";

const APPLY_TIMEOUT = 2000

class PromoField extends React.Component {

    static propTypes = {
        defaultValue: PropTypes.string,
        onChange: PropTypes.func,
    }

    constructor(props) {
        super(props);

        this.state = {
            error: '',
            value: props.defaultValue,
        }

        this._timer = null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.error !== prevState.error) {
            if (this.props.onChange) {
                this.props.onChange()
            }
        }
    }

    render() {
        const _checkGreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#check-no-fill"/>';

        const _errorText = this.state.error &&
            <p className="form__error-message js-error-message" style={{display: "block"}}>{this.state.error}</p>

        const _currency = getCurrencySign()


        return <div className="promo__wrapper">
            <div className="promo__field-wrapper">
                <div className="field__value-wrapper">
                    <input type="text" name="promo" defaultValue={this.props.defaultValue} id="promo" className="form__field" onBlur={::this._forceValidate} onChange={::this._onChange}/>
                    {
                        this.props.promo.checked && !this.props.promo.message ?
                            <span className="status-icon">
                                <svg className="success" width="17" height="12" style={{display: "block", fill: "#C8684C"}}
                                     dangerouslySetInnerHTML={{__html: _checkGreen}}/>
                            </span>
                            :
                            null
                    }
                    {_errorText}
                </div>
            </div>
            <span className={'promo__message-wrapper' + (this.props.promo.checked && !this.props.promo.message ? ' success' : '')}>
                {
                    this.props.promo.checked && !this.props.promo.message ?
                        <React.Fragment>
                            <span className="percent">{`Скидка ${this.props.promo.percent}% `}</span>
                            <span className="sum">{-this.props.promo.sum + _currency}</span>
                        </React.Fragment>
                        :
                        null
                }
            </span>
        </div>
    }

    _validate(e) {
        if (this._timer) {
            clearTimeout(this._timer)
        }

        const _promo = e.target.value
        if (_promo) {
            this._timer = setTimeout(() => {
                this.props.applyPromo(_promo)
            }, APPLY_TIMEOUT)
        } else {
            this._clear()
        }
    }

    _forceValidate(e) {
        if (this._timer) {
            clearTimeout(this._timer)
        }

        const _promo = e.target.value
        if (_promo) {
            this.props.applyPromo(_promo)
        } else {
            this._clear()
        }
    }

    _clear() {

    }

    _onChange(e) {
        this._validate(e)
        this.props.onChange()
    }
}

function mapStateToProps(state) {
    return {
        promo: promoValuesSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({applyPromo}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(PromoField)