import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {showFeedbackWindow,} from "../../ducks/message";
import SubscribeForm from './subscribe-form'

class PageFooter extends React.Component {

    render() {
        return (
            <footer className="page-footer">
                <Wrapper {...this.props}/>
                <Copyright/>
            </footer>
        )
    }
}

class Wrapper extends React.Component {

    render() {
        return (
            <div className="page-footer__wrapper">
                <Row {...this.props}/>
                <Inner/>
            </div>
        )
    }
}

class Row extends React.Component {

    render() {
        const _logoMob = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#logo-mob"/>',
            _idea = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#idea"/>',
            _comment = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#comment"/>';

        return (
            <div className="page-footer__row">
                <a href="#" className="logo-footer">
                    <svg width="70" height="43" dangerouslySetInnerHTML={{__html: _logoMob}}/>
                </a>
                <ul className="footer-actions">
                    <li>
                        <a href="http://ideas.magisteria.ru/">
                            <div className="icon">
                                <svg width="24" height="24" dangerouslySetInnerHTML={{__html: _idea}}/>
                            </div>
                            <span>Оставьте идею</span>
                        </a>
                    </li>
                    <li>
                        <div className='footer-actions__item' onClick={::this.props.showFeedbackWindow}>
                            <div className="icon">
                                <svg width="22" height="18" dangerouslySetInnerHTML={{__html: _comment}}/>
                            </div>
                            <span>Напишите нам</span>
                        </div>
                    </li>
                    <li>
                        <a href="/about">
                            <span>О проекте</span>
                        </a>
                    </li>
                </ul>
            </div>
        )
    }
}

class Inner extends React.Component {
    render() {
        return (
            <div className='page-footer__inner'>
                <div className='page-footer__col'>
                    <SocialBlock/>
                </div>
                <div className='page-footer__col'>
                    <SubscribeForm/>
                </div>
            </div>
        )
    }
}

class SocialBlock extends React.Component {
    render() {
        return (
            <div className="social-block-big">
                <h4 className="social-block-big__title">Мы в соц. сетях</h4>
                <div className="social-block-big__inner">
                    <SocialLink text={'Facebook'} logo={'fb'} icoWidth={18} icoHeight={18} href={'https://www.facebook.com/Magisteria.ru/'}/>
                    <SocialLink text={'Telegram'} logo={'telegram'} icoWidth={16} icoHeight={16} href={'https://t.me/magisteria_ru'}/>
                    <SocialLink text={'Вконтакте'} logo={'vk'} icoWidth={18} icoHeight={11} href={'https://vk.com/magisteriaru'}/>
                    <SocialLink text={'Youtube'} logo={'youtube'} icoWidth={16} icoHeight={12} href={'https://www.youtube.com/channel/UCVTyCEHsBPD-xRD0aJekeww'}/>
                    <SocialLink text={'Twitter'} logo={'tw'} icoWidth={18} icoHeight={15} href={'https://twitter.com/MagisteriaRu'}/>
                    <SocialLink text={'Одноклассники'} logo={'ok'} icoWidth={11} icoHeight={18} href={'https://ok.ru/group/54503517782126'}/>
                    <SocialLink text={'Instagram'} logo={'ig'} icoWidth={16} icoHeight={16} href={'https://www.instagram.com/magisteria.ru/'}/>
                    <SocialLink text={'RSS'} logo={'rss'} icoWidth={16} icoHeight={16} href={'/feed/'}/>
                    <SocialLink text={'Яндекс Дзен'} logo={'yandex'} icoWidth={16} icoHeight={16} href={'https://zen.yandex.com/magisteria'}/>
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
            <a href={href} className="social-link">
                <span className="social-link__icon">
                    <svg width={icoWidth} height={icoHeight} dangerouslySetInnerHTML={{__html: _logo}}/>
                </span>
                <span className="social-link__text">{text}</span>
            </a>
        )
    }
}

class SubscribeBlock extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            email: '',
            name: ' ',
            lastName: ' ',
        }
    }

    _handleSubmit(event) {
        event.preventDefault();

        if (this._isSendingEnable()) {
            const data = new FormData(event.target);
            data.Email = this.state.email;
            data.Name = this.state.name;
            data.LastName = this.state.lastName;

            this.props.subscribe(data)
        }
    }

    _changeEmail(e) {
        this.setState({email: e.target.value})
    }

    _isSendingEnable() {
        return (this.state.email !== '') && (this.state.name !== '') && (this.state.lastName !== '')
    }


    render() {
        const _next = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#next"/>';
        let _disabledBtn = !this._isSendingEnable()

        return (
            <div className="subscribe-block">
                <h4 className="subscribe-block__label">Подписка</h4>
                <p className="subscribe-block__descr">Оставьте ваш e-mail и мы оповестим вас когда новые лекции появятся
                    на сайте</p>
                <form className="form subscribe-form" onSubmit={::this._handleSubmit}>
                    <div className="subscribe-form__field-wrapper">
                        <input type="email" id="email" name="email-field" className="subscribe-form__field"
                               placeholder="E-mail" onChange={::this._changeEmail}/>
                        <button className={"subscribe-form__submit" + (_disabledBtn ? ' disabled' : '')} type='submit'>
                            <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _next}}/>
                        </button>
                    </div>
                </form>
            </div>
        )
    }
}

class Copyright extends React.Component {
    render() {
        return (
            <div className="page-footer__copyright">
                <div className="page-footer__wrapper">
                    <p>© Magisteria 2016 - 2017. All rights reserved.
                        <div>
                            <a>Политика конфиденциальности</a> / <a>Пользовательское соглашение</a>
                        </div>
                    </p>
                </div>
            </div>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return {
        showFeedbackWindow: bindActionCreators(showFeedbackWindow, dispatch),
    }
}

export default connect(null, mapDispatchToProps) (PageFooter)
