import React, { Component } from 'react'
import {userAuthSelector, logout} from "../../ducks/auth";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";

class LogoutButton extends Component {
    render() {
        const _logout = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#logout"/>'

        return <div className="toolbar__buttons-wrapper toolbar__item">
            <button className={"toolbar__btn" + (!this.props.isUserAuthorized ? " disabled" : "")} onClick={::this.props.logout}>
                <span className="caption">Выход</span>
                <span className="icon">
                    <svg width="15" height="16" dangerouslySetInnerHTML={{__html: _logout}}/>
                </span>
            </button>
        </div>
    }
}


function mapStateToProps(state) {
    return {
        isUserAuthorized: userAuthSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        logout: bindActionCreators(logout, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LogoutButton);