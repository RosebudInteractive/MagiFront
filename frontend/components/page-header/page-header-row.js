import React from 'react';
// import Logo from './logo';
// import Navigation from './navigation';
// import LanguageBlock from './language-block';
// import SearchBlock from './search-block'
// import UserBlock from './user-block';
import {connect} from 'react-redux';
// import FiltersRow from './filters-row';
// import MenuTrigger from "./menu-trigger";
// import MenuMobile from './menu-mobile';
import * as tools from '../../tools/size-tools';
import * as svg from '../../tools/svg-paths';
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class Header extends React.Component {
    constructor(props) {
        super(props);
        this._isMobile = tools.isMobile.bind(this);
    }



    render() {
        return (
            <header className="page-header _fixed js-header">
                {this._isMobile() ? <MobileHeaderRow/> : <DesktopHeaderRow />}
            </header>
        )
    }

}

class DesktopHeaderRow extends React.Component {
    render() {
        return (
            <div className="page-header__wrapper menu-mobile row">
                <a href="#" className="logo">
                    <svg width="130" height="31">
                        {svg.logo}
                    </svg>
                </a>

                <nav className="navigation">
                    <ul>
                        <li className="current">
                            <a href="#">Курсы</a>
                        </li>
                        <li>
                            <a href="#">Календарь</a>
                        </li>
                        <li className="filter ">
                            <a href="#">
                                <span className="hidden">Фильтры</span>
                                <svg width="22" height="21">
                                    {svg.filter}
                                </svg>
                            </a>
                        </li>
                    </ul>
                </nav>

                <div className="language-block">
                    <button type="button" className="language-indicator js-language-toggle"><span>Рус</span></button>
                    <ul className="language-tooltip js-language-picker">
                        <li className="selected">
                            <a href="#" data-lang="Рус">Русский</a>
                        </li>
                        <li>
                            <a href="#" data-lang="En">English</a>
                        </li>
                        <li>
                            <a href="#" data-lang="Es">Espaniol</a>
                        </li>
                    </ul>
                </div>


                <div className="search-block">
                    <button type="button" className="search-block__trigger">
                        <svg width="20" height="21">
                            {svg.search}
                        </svg>
                    </button>
                    <form action="#" className="search-form">
                        <input type="search" className="search-form__field" placeholder="Поиск"/>
                            <button className="invisible">Найти</button>
                            <div className="search-form__close">Закрыть</div>
                    </form>
                </div>
                <div className="user-block">
                    <div className="user-block__header">
                        <p className="user-block__name">Борода Бородкин</p>
                    </div>
                    <ul className="user-tooltip">
                        <li>
                            <a href="#">История</a>
                        </li>
                        <li>
                            <a href="#">Настройки</a>
                        </li>
                        <li>
                            <a href="#" className="logout-btn">
                                <svg width="15" height="16">
                                    {svg.logout}
                                </svg>
                                <span>Выйти</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        )
    }
}

class MobileHeaderRow extends React.Component {
    render() {
        return (
            <div className="page-header__menu-mobile">
                <button type="button" className="menu-trigger"><span>Меню</span></button>
                <a href="#" className="logo-mobile">
                    <svg width="70" height="38">
                        {svg.logoMob}
                    </svg>
                </a>
                <nav className="navigation navigation-mobile">
                    <ul>
                        <li className="current">
                            <a href="#">Курсы</a>
                        </li>
                        <li>
                            <a href="#">Календарь</a>
                        </li>
                    </ul>
                </nav>
            </div>
        )
    }
}


// const PageHeaderRow = class PageHeaderRow extends React.Component {
//     render() {
//
//     }

    // render() {
    //     let {showSearchForm, showFiltersForm, showMenu} = this.props.pageHeaderState;
    //
    //     return (
    //         this._isMobile() ?
    //             <div className={'page-header page-header-s-size' + (showMenu ? ' opened' : '')}>
    //                 <div className='menu-row'>
    //                     {/*<div className='container'>*/}
    //                     <Logo isFull={this._isFullSize()}/>
    //                     <Navigation isFull={this._isFullSize()}/>
    //                     <MenuTrigger />
    //                     <MenuMobile/>
    //                     {/*</div>*/}
    //                 </div>
    //             </div>
    //             :
    //
    //             <div className='page-header'>
    //                 <div className='row'>
    //                     <div className='container'>
    //                         <Logo isFull={this._isFullSize()}/>
    //                         {!showSearchForm ? <Navigation isFull={this._isFullSize()}/> : ''}
    //                         {!showSearchForm ? <LanguageBlock/> : ''}
    //                         <SearchBlock/>
    //                         {!showSearchForm ? <UserBlock/> : ''}
    //                     </div>
    //                 </div>
    //                 {/*<ReactCSSTransitionGroup*/}
    //                     {/*transitionName="example"*/}
    //                 {/*>*/}
    //                 {
    //                     showFiltersForm ?
    //                         <FiltersRow/>
    //                         :
    //                         null
    //                 }
    //                 {/*</ReactCSSTransitionGroup>*/}
    //                 {
    //                     showMenu ?
    //                         null : null
    //
    //                 }
    //             </div>
    //             :
    //
    //     );
    // }
// };

function mapStateToProps(state) {
    return {
        pageHeaderState: state.pageHeader,
        size: state.app.size,
    }
}

export default connect(mapStateToProps)(Header);