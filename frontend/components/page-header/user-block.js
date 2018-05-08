import React from 'react';
import {connect} from 'react-redux';
// import PropTypes from 'prop-types';

class userBlock extends React.Component {

    static
    propTypes = {};

    static
    defaultProps = {};

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
        const _logout = '<use xlink:href="#logout"/>'

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
                            <svg width="15" height="16" dangerouslySetInnerHTML={{__html: _logout}}/>
                            <span>Выйти</span>
                        </a>
                    </li>
                </ul>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        authorized: state.user.authorized,
    }
}

export default connect(mapStateToProps)(userBlock);