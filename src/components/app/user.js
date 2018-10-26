import React, { Component } from 'react'
import {userSelector} from "../../ducks/auth";
import {connect} from "react-redux";

class User extends Component {
    render() {
        const { user } = this.props
        return <div className="user-name toolbar__item">
            <p>{user ? user.DisplayName : 'Anonymous'}</p>
        </div>
    }
}

function mapStateToProps(state) {
    return {
        user: userSelector(state),
    }
}

export default connect(mapStateToProps)(User);