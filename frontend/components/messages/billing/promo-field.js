import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import { applyPromo, clearPromo, promoValuesSelector,} from "ducks/billing";
import {getCurrencySign} from "../../../tools/page-tools";

const APPLY_TIMEOUT = 1000

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
        const _checkGreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#check-no-fill"/>',
            _failRed = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#red-fail"/>';

        const _currency = getCurrencySign(),
            _promoState = this.props.promo.checked ?
                this.props.promo.error ? ' error' : ' success'
                :
                ''

        return <div className="promo__wrapper">
            <div className={"promo__field-wrapper" + _promoState}>
                <div className="field__value-wrapper">
                    <input type="text" name="promo" placeholder='Промокод' defaultValue={this.props.defaultValue} id="promo" className="form__field" onBlur={::this._forceValidate} onChange={::this._onChange}/>
                    {
                        this.props.promo.checked && !this.props.promo.error ?
                            <span className="status-icon">
                                <svg className="success" width="17" height="12" style={{display: "block", fill: "#C8684C"}}
                                     dangerouslySetInnerHTML={{__html: _checkGreen}}/>
                            </span>
                            :
                            null
                    }
                    {
                        this.props.promo.checked && this.props.promo.error ?
                            <span className="status-icon">
                                <svg className="fail" width="18" height="18"
                                     dangerouslySetInnerHTML={{__html: _failRed}}/>
                            </span>
                            :
                            null
                    }
                </div>
            </div>
            <span className={'promo__message-wrapper' + _promoState}>
                {
                    this.props.promo.checked && !this.props.promo.error && this.props.promo.percent?
                        <React.Fragment>
                            <span className="percent">{`Скидка ${this.props.promo.percent}% `}</span>
                            <span className="sum">{-this.props.promo.sum + _currency}</span>
                        </React.Fragment>
                        :
                        null
                }
                {
                    this.props.promo.checked && this.props.promo.error ?
                        <div className="error-message">Промокод не работает</div>
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
        }
    }

    _forceValidate(e) {
        if (this._timer) {
            clearTimeout(this._timer)
        }

        if (!this.props.promo.checked) {
            const _promo = e.target.value
            if (_promo) {
                this.props.applyPromo(_promo)
            }
        }
    }

    _onChange(e) {
        e.preventDefault()
        if (this.props.promo.checked) {
            this.props.clearPromo()
        }
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
    return bindActionCreators({applyPromo, clearPromo}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(PromoField)