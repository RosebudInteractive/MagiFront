import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

import UserBlock from './user-block';
import FiltersRow from './mobile-filters';

import {pages} from "../../tools/page-tools";
import * as userActions from '../../actions/user-actions'

class DesktopHeaderRow extends React.Component {

    static propTypes = {
        filterActive: PropTypes.bool.isRequired,
        currentPage: PropTypes.object.isRequired,
        onFilterClick: PropTypes.func.isRequired,
        onBookmarkClick: PropTypes.func,
    }

    render() {
        return (
            <div className="page-header__wrapper menu-mobile">
                <Logo/>
                <Navigator {...this.props}/>
                <Languages/>
                <FiltersRow/>
                <Search/>
                {
                    this.props.authorized ?
                        <UserBlock/>
                        :
                        <SignInBlock onButtonClick={::this.props.userActions.showSignInForm}/>
                }
            </div>
        )
    }
}

class Logo extends React.Component {
    render() {
        const _logo = '<use xlink:href="#logo"/>'

        return (
            <Link to={'/'} className="logo">
                <svg width="130" height="31" dangerouslySetInnerHTML={{__html: _logo}}/>
            </Link>
        )
    }
}

class Navigator extends React.Component {

    render() {
        const _filter = '<use xlink:href="#filter"/>',
            _flagFull = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag-full"/>',
            _isCoursesPage = this.props.currentPage.name === pages.courses.name;

        return (
            <nav className="navigation">
                <ul>
                    <li className={_isCoursesPage ? "current" : ''}>
                        <Link to={pages.courses.url}>Курсы</Link>
                    </li>
                    {
                        this.props.authorized ?
                            <li className={"favorites" + (this.props.currentPage === pages.bookmarks ? ' active' : '')}
                                onClick={this.props.onBookmarkClick}>
                                <Link to={'/favorites'}>
                                    <span className="hidden">Закладки</span>
                                    <svg width="14" height="23" dangerouslySetInnerHTML={{__html: _flagFull}}/>
                                </Link>
                            </li>
                            :
                            null
                    }
                    {
                        _isCoursesPage
                            ?
                            <li className={"filter" + (this.props.filterActive ? ' active' : '')}
                                onClick={this.props.onFilterClick}>
                                <a>
                                    <span className="hidden">Фильтры</span>
                                    <svg width="22" height="21" dangerouslySetInnerHTML={{__html: _filter}}/>
                                </a>
                            </li>
                            :
                            null
                    }

                </ul>
            </nav>
        )
    }
}

class Languages extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showPicker: false
        }
    }

    _onClick() {
        let _newState = !this.state.showPicker;
        this.setState({showPicker: _newState})
    }

    render() {
        return (
            <div className={"language-block" + (this.state.showPicker ? ' opened' : '')}>
                <button type="button" className="language-indicator" onClick={::this._onClick}><span>Рус</span></button>
                {
                    this.state.showPicker ?
                        <ul className="language-tooltip js-language-picker">
                            <li className="selected">
                                <a href="#" data-lang="Рус">Русский</a>
                            </li>
                            {/*<li>*/}
                                {/*<a href="#" data-lang="En">English</a>*/}
                            {/*</li>*/}
                            {/*<li>*/}
                                {/*<a href="#" data-lang="Es">Espaniol</a>*/}
                            {/*</li>*/}
                        </ul>
                        :
                        null
                }
            </div>
        )
    }

}

class Search extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showForm: false
        }
    }

    _showForm() {
        this.setState({showForm: true})
    }

    _closeForm() {
        this.setState({showForm: false})
    }

    render() {
        const _search = '<use xlink:href="#search"/>'

        return (
            <div className={"search-block" + (this.state.showForm ? ' opened' : '')}>
                <button type="button" className="search-block__trigger" onClick={::this._showForm}>
                    <svg width="20" height="21" dangerouslySetInnerHTML={{__html: _search}}/>
                </button>
                <form action="#" className="search-form">
                    <input type="search" className="search-form__field" placeholder="Поиск"/>
                    <button className="invisible">Найти</button>
                    <div className="search-form__close" onClick={::this._closeForm}>Закрыть</div>
                </form>
            </div>
        )
    }
}

class SignInBlock extends React.Component {

    static propTypes = {
        onButtonClick: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
    }

    render() {
        const _login = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#login"/>'

        return (
            <div className="user-block">
                <button className="login-btn js-login" onClick={::this.props.onButtonClick}>
                    <svg width="15" height="16" dangerouslySetInnerHTML={{__html: _login}}/>
                    <span>Вход</span>
                </button>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        authorized: !!state.user.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DesktopHeaderRow);