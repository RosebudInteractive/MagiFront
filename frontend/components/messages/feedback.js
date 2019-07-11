import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {hideFeedbackWindow, sendFeedback, loadingSelector} from "ducks/message";
import Platform from "platform";

class FeedbackMessageBox extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            message: '',
            sender: ''
        }
    }

    componentDidMount() {
        if (this.props.user) {
            this.setState({
                sender: this.props.user.Email
            })
        }
    }

    _close() {
        this.props.close()
    }

    _handleSubmit(event) {
        event.preventDefault();

        if (this._isSendingEnable()) {
            const data = new FormData(event.target);
            data.sender = this.state.sender;
            data.message = this.state.message;

            this.props.sendFeedback(data)
        }
    }


    _changeMessage(e) {
        this.setState({message: e.target.value})
    }

    _changeSender(e) {
        this.setState({sender: e.target.value})
    }

    _isSendingEnable() {
        return !this.props.loading && (this.state.message !== '') && (this.state.sender !== '')
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
                                  placeholder="Ваше сообщение"/>
                        <div className="modal-form__row">
                            <input onChange={::this._changeSender} type="text" id="contacts" className="form__field"
                                   placeholder="Как с вами связаться?" defaultValue={user ? user.Email : ''}/>
                            <button className={"btn btn--brown" + (_disabledBtn ? ' disabled' : '')} type='submit'>Отправить сообщение</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    }
}

function mapStateToProps(state) {
    return {
        loading: loadingSelector(state),
        user: state.user.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        sendFeedback: bindActionCreators(sendFeedback, dispatch),
        close: bindActionCreators(hideFeedbackWindow, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackMessageBox);