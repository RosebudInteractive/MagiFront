import React from 'react';
import * as svg from '../../tools/svg-paths';

export class DesktopLogo extends React.Component {
    render() {
        return (
            <a className="logo">
                <svg width="130" height="31">
                    {svg.logo}
                </svg>
            </a>
        )
    }
}

export class DesktopNavigator extends  React.Component {
    render() {
        return(
            <nav className="navigation">
                <ul>
                    <li className="current">
                        <a>Курсы</a>
                    </li>
                    <li>
                        <a>Календарь</a>
                    </li>
                    <li className="filter ">
                        <a>
                            <span className="hidden">Фильтры</span>
                            <svg width="22" height="21">
                                {svg.filter}
                            </svg>
                        </a>
                    </li>
                </ul>
            </nav>
        )
    }

}

export class DesktopLanguages extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            showPicker : false
        }
    }

    _onClick(){
        let _newState = !this.state.showPicker;
        this.setState({showPicker : _newState})
    }

    render () {
        return (
            <div className={"language-block" + (this.state.showPicker ? ' opened' : '')}>
                <button type="button" className="language-indicator" onClick={::this._onClick}><span>Рус</span></button>
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
        )
    }

}

export class DesktopSearch extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            showForm : false
        }
    }

    _showForm(){
        this.setState({showForm : true})
    }

    _closeForm() {
        this.setState({showForm : false})
    }

    render() {
        return(
            <div className={"search-block" + (this.state.showForm ? ' opened' : '')}>
                {
                    this.state.showForm ?
                        <form action="#" className="search-form">
                            <input type="search" className="search-form__field" placeholder="Поиск"/>
                            <button className="invisible">Найти</button>
                            <div className="search-form__close" onClick={::this._closeForm}>Закрыть</div>
                        </form>
                        :
                        <button type="button" className="search-block__trigger" onClick={::this._showForm}>
                            <svg width="20" height="21">
                                {svg.search}
                            </svg>
                        </button>
                }
            </div>
        )
    }
}

export class DesktopUser extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            showForm : false
        }
    }

    _onClick(){
        let _newState = !this.state.showForm;
        this.setState({showForm : _newState})
    }

    render(){
        return(
            <div className={"user-block" + (this.state.showForm ? ' opened' : '')}>
                <div className="user-block__header" onClick={::this._onClick}>
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
        )
    }
}