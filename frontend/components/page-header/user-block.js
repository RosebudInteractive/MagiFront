import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as userActions from '../../actions/user-actions'
import * as appActions from '../../actions/app-actions'
import {Link} from 'react-router-dom';

class UserBlock extends React.Component {

    static
    propTypes = {};

    static
    defaultProps = {};

    constructor(props){
        super(props);
    }

    _onClick(){
        if  (this.props.showUserBlock) {
            this.props.appActions.hideUserBlock()
        } else {
            this.props.appActions.showUserBlock()
        }
    }

    render(){
        const _logout = '<use xlink:href="#logout"/>'

        return(
            <div className={"user-block" + (this.props.showUserBlock ? ' opened' : '')}>
                <div className="user-block__header" onClick={::this._onClick}>
                    <p className="user-block__name">{this.props.user.DisplayName}</p>
                </div>
                <ul className="user-tooltip">
                    <li>
                        <Link to="/history">История</Link>
                    </li>
                    <li>
                        <Link to='/profile'>Настройки</Link>
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
        user: state.user.user,
        showUserBlock: state.app.showUserBlock,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserBlock);