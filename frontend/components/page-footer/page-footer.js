import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {showFeedbackWindow,} from "ducks/message";
import SubscribeForm from './subscribe-form'
import {Link} from 'react-router-dom';
import StoreButton, {STORE_BUTTON_TYPE} from "../messages/top-message/store-popup/store-button";
import "./page-footer.sass"
import {popupSelector} from "ducks/version";
import {localSettingsSelector} from "ducks/app";
import PropTypes from "prop-types";
import {STORE_POPUP_MODE} from "../../constants/common-consts";

function PageFooter(props) {
    return <footer className="page-footer">
        <div className="page-footer__wrapper">
            <Row showFeedbackWindow={props.showFeedbackWindow}/>
            <Inner config={props.config.storePopup} confirmedMode={props.localSettings.popup.storePopupConfirmedMode}/>
        </div>
        <Copyright/>
    </footer>
}


function Row(props) {

    const _logoMob = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#logo-mob"/>',
        _idea = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#idea"/>',
        _comment = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#comment"/>';

    return <div className="page-footer__row">
        <a href="#" className="logo-footer">
            <svg width="70" height="43" dangerouslySetInnerHTML={{__html: _logoMob}}/>
        </a>
        <ul className="footer-actions">
            <li>
                <a href="http://ideas.magisteria.ru/" target="_blank" rel="nofollow">
                    <div className="icon">
                        <svg width="24" height="24" dangerouslySetInnerHTML={{__html: _idea}}/>
                    </div>
                    <span>Оставьте идею</span>
                </a>
            </li>
            <li>
                <div className='footer-actions__item' onClick={props.showFeedbackWindow}>
                    <div className="icon">
                        <svg width="22" height="18" dangerouslySetInnerHTML={{__html: _comment}}/>
                    </div>
                    <span>Напишите нам</span>
                </div>
            </li>
            <li>
                <Link to="/about">
                    <span>О проекте</span>
                </Link>
            </li>
        </ul>
    </div>
}

Row.propTypes = {
    showFeedbackWindow: PropTypes.func
}

function Inner(props) {

    const {config,} = props
    const [mode, setMode] = useState(STORE_POPUP_MODE.NONE)

    useEffect(() => {
        const _mode = (config.ios.visible && config.android.visible) ?
            STORE_POPUP_MODE.BOTH
            :
            (config.ios.visible && !config.android.visible) ?
                STORE_POPUP_MODE.ONLY_IOS
                :
                STORE_POPUP_MODE.NONE

        setMode(_mode)
    }, [config])

    return <div className={'page-footer__inner' + ((mode !== STORE_POPUP_MODE.NONE) ? " _with-store-buttons" : "")}>
        <div className='page-footer__col'>
            <SocialBlock/>
        </div>
        <div className='page-footer__col _subscribe-block-wrapper'>
            <SubscribeForm/>
            {
                mode !== STORE_POPUP_MODE.NONE ?
                    <div className="store-buttons-block">
                        <div className="font-universal__title-smallx _title">Мобильное приложение</div>
                        <div className="_buttons">
                            <StoreButton type={STORE_BUTTON_TYPE.APPLE} link={config.ios.link}/>
                            <StoreButton type={STORE_BUTTON_TYPE.ANDROID} link={config.android.link}
                                         disabled={mode !== STORE_POPUP_MODE.BOTH}/>
                        </div>
                    </div>
                    :
                    null
            }

        </div>
    </div>
}

Inner.propTypes = {
    confirmedMode: PropTypes.number,
    config: PropTypes.object,
}

class SocialBlock extends React.Component {
    render() {
        return (
            <div className="social-block-big">
                <h4 className="social-block-big__title font-universal__title-smallx">Мы в соц. сетях</h4>
                <div className="social-block-big__inner">
                    <SocialLink text={'Facebook'} logo={'fb'} icoWidth={18} icoHeight={18}
                                href={'https://www.facebook.com/Magisteria.ru/'}/>
                    <SocialLink text={'Telegram'} logo={'telegram'} icoWidth={16} icoHeight={16}
                                href={'https://t.me/magisteria_ru'}/>
                    <SocialLink text={'Вконтакте'} logo={'vk'} icoWidth={18} icoHeight={11}
                                href={'https://vk.com/magisteriaru'}/>
                    <SocialLink text={'Youtube'} logo={'youtube'} icoWidth={16} icoHeight={12}
                                href={'https://www.youtube.com/channel/UCVTyCEHsBPD-xRD0aJekeww'}/>
                    <SocialLink text={'Twitter'} logo={'tw'} icoWidth={18} icoHeight={15}
                                href={'https://twitter.com/MagisteriaRu'}/>
                    <SocialLink text={'Одноклассники'} logo={'ok'} icoWidth={11} icoHeight={18}
                                href={'https://ok.ru/group/54503517782126'}/>
                    <SocialLink text={'Instagram'} logo={'ig'} icoWidth={16} icoHeight={16}
                                href={'https://www.instagram.com/magisteria.ru/'}/>
                    <SocialLink text={'RSS'} logo={'rss'} icoWidth={16} icoHeight={16} href={'/feed/'}/>
                    <SocialLink text={'Яндекс Дзен'} logo={'yandex'} icoWidth={16} icoHeight={16}
                                href={'https://zen.yandex.com/magisteria'}/>
                </div>
            </div>
        )
    }
}

class SocialLink extends React.Component {
    render() {
        let {logo, href, text, icoWidth, icoHeight} = this.props;

        const _logo = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#' + logo + '"/>';

        return (
            <a href={href} target="_blank" className="social-link" rel="nofollow">
                <span className="social-link__icon">
                    <svg width={icoWidth} height={icoHeight} dangerouslySetInnerHTML={{__html: _logo}}/>
                </span>
                <span className="social-link__text">{text}</span>
            </a>
        )
    }
}

class Copyright extends React.Component {
    render() {
        return (
            <div className="page-footer__copyright">
                <div className="page-footer__wrapper ">
                    <p>{'© Magisteria 2016 - 2020. All rights reserved. '}
                        <Link to={'/doc/privacy.pdf'} target="_blank">Политика конфиденциальности</Link>
                        {" / "}
                        <Link to={'/doc/terms.pdf'} target="_blank">Пользовательское соглашение</Link>
                        {" / "}
                        <Link to={'/doc/oferta.pdf'} target="_blank">Публичная оферта</Link>
                    </p>
                </div>
            </div>
        )
    }
}

const mapState2Props = (state) => {
    return {
        config: popupSelector(state),
        localSettings: localSettingsSelector(state)
    }
}

function mapDispatchToProps(dispatch) {
    return {
        showFeedbackWindow: bindActionCreators(showFeedbackWindow, dispatch),
    }
}

export default connect(mapState2Props, mapDispatchToProps)(PageFooter)
