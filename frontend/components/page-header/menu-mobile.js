import React from 'react';

import FiltersRow from './mobile-filters';

import * as svg from '../../tools/svg-paths';

export default class MenuMobile extends React.Component{
    render() {
        return (
            <div className='menu-mobile'>
                <FiltersRow/>
                <SearchBlock/>
                <UserBlock/>
            </div>
        )
    }
}

class SearchBlock extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            showForm : false
        }
    }

    _showForm(){
        this.setState({showForm : true})
    }

    _hideForm() {
        this.setState({showForm : false})
    }

    render() {
        let _className = 'search-block' + (this.state.showForm ? ' opened' : '');

        return (
            <div className={_className} >
                <div type="button" className="search-block__trigger">
                    <div width="20" height="21">
                        <svg width="20" height="21" onClick={::this._showForm}>
                            {svg.search}
                        </svg>
                    </div>
                </div>
                <form className="search-form">
                    <input type="search" className="search-form__field" placeholder="Поиск"/>
                    <button className="invisible" onClick={this._hideForm.bind(this)}>Найти</button>
                    <div className="search-form__close" onClick={this._hideForm.bind(this)}>Закрыть</div>
                </form>
            </div>
        )
    }
}

class UserBlock extends React.Component {
    render() {
        return(
            <div className="user-block">
                <a href="#" className="login-btn">
                    <svg width="15" height="16">
                        {svg.logout}
                    </svg>
                    <span>Вход</span>
                </a>
            </div>
        )
    }
}