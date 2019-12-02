import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";
import {Link} from 'react-router-dom';

import UserBlock from './user-block';
import SignInBlock from './sign-in-block';
import Navigator from '../common/navigator';
import FiltersRow from './filter';

import {hideUserBlock} from "actions/app-actions";
import {setRootState} from "ducks/filters";

import './desktop-header.sass'

class DesktopHeader extends React.Component {

    constructor(props) {
        super(props)
    }

    componentWillUnmount() {
        this.props.hideUserBlock();
    }

    render() {
        const LOGO = '<use xlink:href="#logo"/>'

        return <React.Fragment>
                <div className={"page-header__wrapper js-page-header-1"}>
                    <Link to={'/'} className="logo" onClick={::this.props.setRootState}>
                        <svg width="130" height="31" dangerouslySetInnerHTML={{__html: LOGO}}/>
                    </Link>
                    <Navigator/>
                    <UserBlock/>
                    <SignInBlock/>
                </div>
                <FiltersRow/>
            </React.Fragment>
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({hideUserBlock, setRootState}, dispatch)
}

export default connect(null, mapDispatchToProps)(DesktopHeader)