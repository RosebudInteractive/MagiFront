import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as userActions from '../../actions/user-actions'
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
                    <p className="user-block__name">{this.props.user.DisplayName}</p>
                </div>
                <ul className="user-tooltip">
                    <li>
                        <a href="#">История</a>
                    </li>
                    <li>
                        <a href="#">Настройки</a>
                    </li>
                    <li>
                        <div className="logout-btn" style={{cursor: 'pointer'}} onClick={::this.props.userActions.logout}>
                            <svg width="15" height="16" dangerouslySetInnerHTML={{__html: _logout}}/>
                            <span>Выйти</span>
                        </div>
                    </li>
                </ul>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        authorized: state.user.authorized,
        user: state.user.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(userBlock);