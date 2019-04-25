import React from 'react'
import PropTypes from 'prop-types'

export default class EmailField extends React.Component {

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
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.error !== prevState.error) {
            if (this.props.onChange) {
                this.props.onChange()
            }
        }
    }

    render() {
        const _errorText = this.state.error &&
            <p className="form__error-message js-error-message" style={{display: "block"}}>{this.state.error}</p>


        return <div className="email__wrapper">
            <span className='email__info'>Введите адрес электронной почты для получения фискального чека, в соответствии с требованием действующего законодательства</span>
            <div className="email__field-wrapper">
                <label htmlFor="email" className="form__field-label">E-mail</label>
                <div className="field__value-wrapper">
                    <input type="email" name="email" defaultValue={this.props.defaultValue} id="email" className="form__field" onBlur={::this._validate} onChange={::this._onChange}/>
                    {_errorText}
                </div>
            </div>
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