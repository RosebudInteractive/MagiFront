import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {hideFeedbackWindow, sendFeedback, loadingSelector} from "ducks/message";
import Platform from "platform";
import {Field, getFormValues, isValid, reduxForm} from "redux-form";

let FeedbackForm = class FeedbackMessageBox extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            message: '',
        }
    }

    componentDidMount() {
        this.props.initialize({
            email: this.props.user ? this.props.user.Email : ''
        })
    }

    _close() {
        this.props.close()
    }

    _handleSubmit(event) {
        event.preventDefault();

        if (this._isSendingEnable()) {
            const data = new FormData(event.target);
            data.sender = this.props.editorValues.email;
            data.message = this.state.message;

            this.props.sendFeedback(data)
        }
    }


    _changeMessage(e) {
        this.setState({message: e.target.value})
    }

    _isSendingEnable() {
        return !this.props.loading && (this.state.message !== '') && (this.props.editorValid)
    }

    render() {
        let _disabledBtn = !this._isSendingEnable()
        const {user} = this.props

        const _isIE = Platform.name === 'IE',
            _className = "modal-overlay modal-wrapper js-modal-wrapper" + (_isIE ? ' ms-based' : '')

        return <div className={_className} data-name="donation">
            <div className="modal _donation" id="donation">
                <button type="button" className="modal__close js-modal-close" data-target="#donation"
                        onClick={::this._close}>Закрыть
                </button>
                <div className="modal__header">
                    <p className="modal__headline">Напишите нам, если у Вас есть вопросы или пожелания</p>
                </div>
                <div className="modal__body">
                    <form className="form modal-form" onSubmit={::this._handleSubmit}>
                        <textarea onChange={::this._changeMessage} name="message" id="message" className="form__message"
                                  placeholder="Ваше сообщение" autoFocus={true}/>
                        <div className="modal-form__row">
                            <Field name="email" component={EMail}/>
                            <button className={"btn btn--brown" + (_disabledBtn ? ' disabled' : '')} type='submit'>Отправить сообщение</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    }
}

const EMail = (props) => {
    const _errorText = props.meta.touched && props.meta.error &&
        <p className="form__error-message" style={{display: "block"}}>{props.meta.error}</p>

    return <div style={{flexGrow: 1, width: "100%"}}>
        <input {...props.input} type="text" id="contacts" className="form__field" placeholder="Ваш email"/>
        {_errorText}
    </div>
}

const validate = values => {
    const errors = {}

    if (!values.email) {
        errors.email = 'Поле является обязательным для заполнения'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Некорректный email'
    }
    return errors
}

FeedbackForm = reduxForm({
    form: 'feedback-form',
    validate
})(FeedbackForm);

function mapStateToProps(state) {
    return {
        loading: loadingSelector(state),
        user: state.user.user,

        editorValues: getFormValues('feedback-form')(state),
        editorValid: isValid('feedback-form')(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        sendFeedback: bindActionCreators(sendFeedback, dispatch),
        close: bindActionCreators(hideFeedbackWindow, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackForm);
