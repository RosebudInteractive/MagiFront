import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {hideFeedbackWindow, sendFeedback} from "../../ducks/message";

class FeedbackMessageBox extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            message: '',
            sender: ''
        }
    }

    _close() {
        this.props.close()
    }

    _send() {
        if (this._isSendingEnable()) {
            this.props.sendFeedback({
                sender: this.state.sender,
                message: this.state.message,
            })
        }
    }

    _changeMessage(e) {
        this.setState({message: e.target.value})
    }

    _changeSender(e) {
        this.setState({sender: e.target.value})
    }

    _isSendingEnable() {
        return (this.state.message !== '') && (this.state.sender !== '')
    }

    render() {
        let _disabledBtn = !this._isSendingEnable()

        return <div className="modal-overlay modal-wrapper js-modal-wrapper" data-name="donation">
            <div className="modal _donation" id="donation">
                <button type="button" className="modal__close js-modal-close" data-target="#donation"
                        onClick={::this._close}>Закрыть
                </button>
                <div className="modal__header">
                    <p className="modal__headline">Хотите помочь проекту?</p>
                </div>
                <div className="modal__body">
                    <form className="form modal-form">
                        <textarea onChange={::this._changeMessage} name="message" id="message" className="form__message"
                                  placeholder="Если не хотите помочь не пишите."/>
                        <div className="modal-form__row">
                            <input onChange={::this._changeSender} type="text" id="contacts" className="form__field"
                                   placeholder="Как с вами связаться?"/>
                            <button className={"btn btn--brown" + (_disabledBtn ? ' disabled' : '')} onClick={::this._send}>Отправить сообщение</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    }
}


function mapDispatchToProps(dispatch) {
    return {
        sendFeedback: bindActionCreators(sendFeedback, dispatch),
        close: bindActionCreators(hideFeedbackWindow, dispatch)
    }
}

export default connect(null, mapDispatchToProps)(FeedbackMessageBox);