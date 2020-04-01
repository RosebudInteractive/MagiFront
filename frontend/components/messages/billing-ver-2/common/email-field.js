import React from 'react'
import PropTypes from 'prop-types'

export default class EmailField extends React.Component {

    static propTypes = {
        defaultValue: PropTypes.string,
        onChange: PropTypes.func,
        promoEnable: PropTypes.bool,
    }

    static defaultProps = {
        promoEnable: false
    }

    constructor(props) {
        super(props);

        this.state = {
            error: '',
            value: props.defaultValue,
        }
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


        return <div className="email__wrapper">
            <div className="email__field-wrapper">
                <div className="field__value-wrapper">
                    <input type="email" name="email" defaultValue={this.props.defaultValue} id="email" className="form__field" onBlur={::this._validate} onChange={::this._onChange}/>
                    {
                        !this.state.error && this.state.value ?
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
            {
                this.props.promoEnable
                    ?
                    <span className='email__info font-universal__body-small secondary-dark'>Введите ваш e-mail для получения <span
                        className="main-dark">промокода</span> и фискального чека</span>
                    :
                    <span className='email__info font-universal__body-small secondary-dark'>Введите адрес вашей электронной почты для получения фискального чека</span>
            }
        </div>
    }

    _validate(e) {
        if (!e.target.value) {
            this.setState({error : 'Required'})
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(e.target.value)) {
            this.setState({error :  'Invalid email address'})
        } else {
            this.setState({error: '', value: e.target.value})
        }
    }

    _onChange(e) {
        this._validate(e)
        this.props.onChange()
    }
}