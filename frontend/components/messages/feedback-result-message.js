import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {errorMessageSelector, hideFeedbackResultMessage} from "../../ducks/message";

class FeedbackResultMessage extends React.Component {
    render() {
        let {error} = this.props,
            _header = error ? 'При отправке возникла ошибка' : 'Сообщение отправлено',
            _message = error ? error.message : 'Спасибо за Ваше сообщение. Оно успешно отправлено.'

        return <div className="modal-overlay modal-wrapper js-modal-wrapper" data-name="messagePopup">
            <div className="modal _message" id="messagePopup">
                <button type="button" className="modal__close js-modal-close" data-target="#messagePopup" onClick={::this.props.close}>Закрыть
                </button>
                <div className="modal__header">
                    <p className="modal__headline">{_header}</p>
                </div>
                <div className="modal__body">
                    <div className="modal__message">
                        <p>{_message}</p>
                        <button className="btn btn--brown js-modal-close" data-target="#messagePopup" onClick={::this.props.close}>Закрыть</button>
                    </div>
                </div>
            </div>
        </div>
    }
}

function mapStateToProps(state) {
    return {
        error: errorMessageSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        close: bindActionCreators(hideFeedbackResultMessage, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackResultMessage);