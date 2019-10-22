import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import UserBlock from './user-block';
import SignInBlock from './sign-in-block';
import Navigator from './navigator';
import FiltersRow from './filter';

import './desktop-header.sass'

export default class DesktopHeader extends React.Component {

    static propTypes = {
        currentPage: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props)
    }

    render() {
        const LOGO = '<use xlink:href="#logo"/>'

        return <React.Fragment>
                <div className={"page-header__wrapper"}>
                    <Link to={'/'} className="logo">
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