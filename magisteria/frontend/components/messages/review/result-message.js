import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {showReviewResultMessageSelector, hideReviewWindow} from "ducks/message";
import Platform from "platform";

const LOGO = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#review-msg"/>'

class ReviewResultMessage extends React.Component {
    render() {
        if (!this.props.visible) return null

        const _isIE = Platform.name === 'IE',
            _className = "modal-overlay modal-wrapper js-modal-wrapper" + (_isIE ? ' ms-based' : '')

        return <div className={_className} data-name="messagePopup">
            <div className="modal _message review-result__message" id="messagePopup">
                <div className="svg-header">
                    <svg width="207" height="71" dangerouslySetInnerHTML={{__html: LOGO}}/>
                </div>
                <div className="message font-universal__book-large">
                    Спасибо за участие в проекте,<br/> ваш отзыв отправлен на модерацию.
                </div>
                <div className="button _brown" onClick={::this.props.close}>Закрыть</div>
            </div>
        </div>
    }
}

function mapStateToProps(state) {
    return {
        visible: showReviewResultMessageSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        close: bindActionCreators(hideReviewWindow, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReviewResultMessage);