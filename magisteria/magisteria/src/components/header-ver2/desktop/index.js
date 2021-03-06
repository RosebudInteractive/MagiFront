import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";
import {Link} from 'react-router-dom';

import UserBlock from './user-block';
import SignInBlock from './sign-in-block';
import Navigator from '../common/navigator';
import FiltersRow from './filter';

import {hideUserBlock} from "actions/app-actions";
import {setInitialState} from "ducks/filters";

import './desktop-header.sass'
import DiscountButton from "../discounts/button";
import DiscountMenu from "../discounts/menu";

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
                <div className={"page-header__wrapper js-page-header-1 main-row"}>
                    <Link to={'/'} className="logo" onClick={::this.props.setInitialState}>
                        <svg width="130" height="31" dangerouslySetInnerHTML={{__html: LOGO}}/>
                    </Link>
                    <Navigator/>
                    <DiscountButton/>
                    <DiscountMenu/>
                    <UserBlock/>
                    <SignInBlock/>
                </div>
                <FiltersRow/>
            </React.Fragment>
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({hideUserBlock, setInitialState}, dispatch)
}

export default connect(null, mapDispatchToProps)(DesktopHeader)
