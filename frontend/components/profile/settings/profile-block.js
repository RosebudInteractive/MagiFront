import React from "react";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import {userSelector, errorSelector, changePassword, clearError} from '../../../ducks/profile'
import ProfileSubForm from './profile-subform'
import ProfilePasswordSubForm from './profile-password-subform'
import {bindActionCreators} from "redux";

class ProfileBlock extends React.Component {

    static propTypes = {
        active: PropTypes.bool,
    }

    constructor(props) {
        super(props);
        this.state = {
            showNameForm: true,
            showPasswordForm: false,
        }
    }

    componentWillMount() {
    }

    componentDidMount() {
    }

    componentDidUpdate() {
    }

    _switchToPassword() {
        this.props.clearError()

        this.setState({
            showNameForm: false,
            showPasswordForm: true
        })
    }

    _switchToProfile() {
        this.props.clearError()

        this.setState({
            showNameForm: true,
            showPasswordForm: false,
        })
    }

    render() {
        let {profile, error, changePassword} = this.props;

        return (
            <div className={"profile-block__tab" + (this.props.active ? " active" : "")}>
                <div className="settings-block">
                    {
                        this.state.showNameForm ?
                            <div className={"settings-block__screen current"}>
                                <ProfileSubForm email={profile.Email} name={profile.DisplayName}
                                                serverError={error}
                                                onSubmit={changePassword}
                                                onSwitchToPassword={::this._switchToPassword}/>
                            </div>
                            :
                            null
                    }
                    {
                        this.state.showPasswordForm ?
                            <div className={"settings-block__screen current"}>
                                <ProfilePasswordSubForm onSubmit={changePassword}
                                                        onSwitchToProfile={::this._switchToProfile}
                                                        onSubmitSuccess={::this._switchToProfile}
                                                        serverError={error}/>
                            </div>
                            :
                            null
                    }

                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        profile: userSelector(state),
        error: errorSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        changePassword: bindActionCreators(changePassword, dispatch),
        clearError: bindActionCreators(clearError, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileBlock);