import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

class FeedbackResultMessage extends React.Component {
    render() {
        return <div className="modal-overlay modal-wrapper js-modal-wrapper" data-name="messagePopup">
            <div className="modal _message" id="messagePopup">
                <button type="button" className="modal__close js-modal-close" data-target="#messagePopup">Закрыть
                </button>
                <div className="modal__header">
                    <p className="modal__headline">Сообщение отправлено</p>
                </div>
                <div className="modal__body">
                    <div className="modal__message">
                        <p>Спасибо за Ваше сообщение. Оно успешно отправлено.</p>
                        <button className="btn btn--brown js-modal-close" data-target="#messagePopup" onClick={}>Закрыть</button>
                    </div>
                </div>
            </div>
        </div>
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(null, mapDispatchToProps)(FeedbackResultMessage);