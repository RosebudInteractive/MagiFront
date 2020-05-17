import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {hideReviewWindow, sendReview, loadingSelector, showReviewWindowSelector, reviewCourseNameSelector} from "ducks/message";
import Platform from "platform";
import "./review.sass"
import {getCountSimbolsTitle} from "tools/word-tools";
import Recaptcha from "react-google-invisible-recaptcha";
import {reCaptureSelector} from "ducks/app";

const MAX_REVIEW_LENGTH = 600

class ReviewWindow extends React.Component {

    constructor(props) {
        super(props)
        this.state = this._getInitState()
    }

    componentDidMount() {
        if (this.props.user) {
            this.setState({
                sender: this.props.user.DisplayName
            })
        }
    }

    _close() {
        this.props.close()
    }

    _changeMessage(e) {
        let _message = e.target.value,
            _count = MAX_REVIEW_LENGTH - _message.length

        if (_count <= 0) {
            e.preventDefault()
            _message = _message.substring(0, MAX_REVIEW_LENGTH)
            e.target.value = _message
            _count = MAX_REVIEW_LENGTH - _message.length
        }
        this.setState({
            count: _count,
            message: _message
        })

    }

    _changeSender(e) {
        this.setState({sender: e.target.value})
    }

    _changeProfile(e) {
        this.setState({profile: e.target.value})
    }

    _isSendingEnable() {
        return !this.props.loading && !!this.state.message && !!this.state.sender && !!this.props.user
    }

    componentWillReceiveProps(next) {
        if (!this.props.visible && next.visible) {
            let _state = this._getInitState()

            _state.sender = next.user && next.user.DisplayName,
            this.setState(_state)
        }
    }

    render() {
        const {user, visible, courseName} = this.props

        if (!visible) return null

        let _disabledBtn = !this._isSendingEnable(),
            _counterText = this.state.count > 0
                ?
                this.state.count === MAX_REVIEW_LENGTH
                    ?
                    `не более ${this.state.count} ${getCountSimbolsTitle(this.state.count)}`
                        :
                    `осталось ${this.state.count} ${getCountSimbolsTitle(this.state.count)}`
                :
                "Вы достигли максимального размера отзыва"


        const _isIE = Platform.name === 'IE',
            _className = "modal-overlay modal-wrapper js-modal-wrapper" + (_isIE ? ' ms-based' : '')

        const _captchaError = this.state.captchaError &&
            <p className="form__error-message" style={{display: "block"}}>Ошибка проверки captcha</p>

        return <div className={_className} data-name="donation">
            <div className="review-window modal">
                <button type="button" className="modal__close js-modal-close" onClick={::this._close}>Закрыть</button>
                <div className="modal__header font-universal__title-medium">
                    <p className="modal__headline">{`Отзыв на курс "${courseName}"`}</p>
                </div>
                <div className="modal__body">
                    <div className="form modal-form">
                        <input onChange={::this._changeSender} type="text" id="name" className="form__field font-universal__body-medium name"
                               placeholder="Ваше имя" defaultValue={user ? user.DisplayName : ''}/>

                        <textarea onChange={::this._changeMessage} onPaste={::this._pasteHandler} name="message" id="message" className="form__message font-universal__body-medium"
                                  placeholder="Ваш отзыв" autoFocus={true}/>

                        <div className={"letters-counter font-universal__body-small" + (!this.state.count ? " _warning" : "")}>{_counterText}</div>
                        <input onChange={::this._changeProfile} type="text" id="social-network" className="form__field social-network" placeholder="Ссылка на ваш профиль в одной из социальных сетей"/>
                        <Recaptcha
                            ref={ ref => this.recaptcha = ref }
                            sitekey={this.props.reCapture}
                            onResolved={ ::this._onCaptchaResolved }
                            onError={::this._onCaptchaError}/>
                        {_captchaError}

                        <div className="modal-form__row submit-button__block">
                            <div className="warning font-universal__body-small">Все отзывы проходят модерацию. Редакция оставляет за собой право  не публиковать отзыв без объяснения причин.</div>
                            <button className={"btn btn--brown" + (_disabledBtn ? ' disabled' : '')} onClick={::this._handleSubmit}>Отправить отзыв</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }

    _handleSubmit() {
        if (this._isSendingEnable()) {

            if (this.state.captchaError) {
                this.recaptcha.reset();

                this.setState({
                    captchaError: false,
                    captchaReloading: true
                })
            }

            this.recaptcha.execute();
        }
    }

    _onCaptchaResolved() {
        this.setState({
            captchaError: false,
            captchaReloading: false
        })

        this.props.send({
            UserId: this.props.user.Id,
            UserName: this.state.sender,
            Review: this.state.message,
            ProfileUrl: this.state.profile
        })
    }

    _onCaptchaError() {
        this.setState({
            captchaError: true
        })
    }

    _pasteHandler(e) {
        let _text = e.clipboardData.getData("Text"),
            _selected = this._getSelectionText(),
            _selectedLength = _selected ? _selected.length : 0,
            _count = this.state.count + _selectedLength

        if ((_count - _text.length) < 0) {
            _text = _text.substring(0, _count)

            e.preventDefault();

            window.document.execCommand('insertText', false, _text);
        }
    }

    _getSelectionText() {
        let text = "";
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type !== "Control") {
            text = document.selection.createRange().text;
        }
        return text;
    }

    _getInitState() {
        return {
            message: null,
            sender: null,
            profile: null,
            count: MAX_REVIEW_LENGTH,
            captcha: null,
            captchaError: false,
            captchaReloading: false
        }
    }
}

function mapStateToProps(state) {
    return {
        visible: showReviewWindowSelector(state),
        courseName: reviewCourseNameSelector(state),
        loading: loadingSelector(state),
        reCapture: reCaptureSelector(state),
        user: state.user.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        send: bindActionCreators(sendReview, dispatch),
        close: bindActionCreators(hideReviewWindow, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReviewWindow);