import React from 'react';
import './page-footer.css';
import * as svg from './../../svg-paths';

export default class PageFooter extends React.Component {

    render() {
        return (
            <footer className="page-footer">
                <Wrapper/>
                <Copyright/>
            </footer>
        )
    }
}

class Wrapper extends React.Component {

    render() {
        return (
            <div className="page-footer__wrapper">
                <Row/>
                <Inner/>
            </div>
        )
    }
}

class Row extends React.Component {
    render() {
        return (
            <div className="page-footer__row">
                <a href="#" className="logo-footer">
                    <svg width="70" height="43">
                        {svg.logoMob}
                    </svg>
                </a>
                <ul className="footer-actions">
                    <li>
                        <a href="#">
                            <div className="icon">
                                <svg width="24" height="24">
                                    {svg.idea}
                                </svg>
                            </div>
                            <span>Оставьте идею</span>
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <div className="icon">
                                <svg width="22" height="18">
                                    {svg.comment}
                                </svg>
                            </div>
                            <span>Напишите нам</span>
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
                    {/*<SocialBlock/>*/}
                </div>
                <div className='page-footer__col'>
                    <SubscribeBlock/>
                </div>
            </div>
        )
    }
}

// class SocialBlock extends React.Component {
//     render() {
//         return (
//             <div className="social-block-big">
//                 <h4 className="social-block-big__title">Мы в соц. сетях</h4>
//                 <div className="social-block-big__inner">
//                     <SocialLink text={'Facebook'} href={'fb'} icoWidth={18} icoHeight={18}/>
//                     <SocialLink text={'Telegram'} href={'telegram'} icoWidth={16} icoHeight={16}/>
//                     <SocialLink text={'Вконтакте'} href={'vk'} icoWidth={18} icoHeight={11}/>
//                     <SocialLink text={'Youtube'} href={'youtube'} icoWidth={16} icoHeight={12}/>
//                     <SocialLink text={'Twitter'} href={'tw'} icoWidth={18} icoHeight={15}/>
//                     <SocialLink text={'Одноклассники'} href={'ok'} icoWidth={11} icoHeight={18}/>
//                     <SocialLink text={'RSS'} href={'rss'} icoWidth={16} icoHeight={16}/>
//                 </div>
//             </div>
//         )
//     }
// }
//
// class SocialLink extends React.Component {
//     render() {
//         let {href, text, icoWidth, icoHeight} = this.props;
//         let _useHref = '<use xlink:href="#' + href + '"/>'
//
//         return (
//             <a href="#" className="social-link">
//                 <span className="social-link__icon">
//                     <svg width={icoWidth} height={icoHeight} dangerouslySetInnerHTML={{__html: _useHref}}/>
//                 </span>
//                 <span className="social-link__text">{text}</span>
//             </a>
//         )
//     }
// }

class SubscribeBlock extends React.Component {
    render() {

        return (
            <div className="subscribe-block">
                <h4 className="subscribe-block__label">Подписка</h4>
                <p className="subscribe-block__descr">Оставьте ваш e-mail и мы оповестим вас когда новые лекции появятся
                    на сайте</p>
                <form action="#" method="post" className="form subscribe-form">
                    <div className="subscribe-form__field-wrapper">
                        <input type="email" id="email" name="email-field" className="subscribe-form__field"
                               placeholder="E-mail">

                        </input>
                        <button className="subscribe-form__submit">
                            <svg width="18" height="18">
                                <svg id="next" viewBox="0 0 19 18" width="100%" height="100%">
                                    <g transform="translate(8)" fill="#2F2F2F">
                                        <path id="next-a"
                                              d="M1.414 0L0 1.414 7.586 9 0 16.586 1.414 18l9-9-9-9z"/>
                                    </g>
                                    <g transform="rotate(-180 8 5)" fill="#2F2F2F">
                                        <path id="next-b" d="M0 0h16v2H0V0z"/>
                                    </g>
                                </svg>
                            </svg>
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
