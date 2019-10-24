import React from "react"
import {connect} from 'react-redux';
import "./menu.sass"
import FilterBlock from "./filter-block";
import ExtBlock from "./ext-block";
import {pages} from "tools/page-tools";
import {loadingSelector,} from "ducks/filters";
import UserBlock from "./user-block";
import SignInBlock from "./sign-in-block";
import PropTypes from "prop-types";
import PhoneUserNavigator from "./phone-navigator";

class Menu extends React.Component {

    static propTypes = {
        isPhoneViewPort: PropTypes.bool,
    };


    render() {
        const {loading, currentPage, isPhoneViewPort} = this.props,
            _isCoursesPage = currentPage.name === pages.courses.name;

        return !loading &&
            <div className="mobile-menu">
                {isPhoneViewPort && <PhoneUserNavigator/>}
                {_isCoursesPage && <FilterBlock/>}
                {_isCoursesPage && <ExtBlock/>}
                <UserBlock/>
                <SignInBlock/>
            </div>
    }

}

function mapStateToProps(state) {
    return {
        currentPage: state.pageHeader.currentPage,
        loading: loadingSelector(state),
    }
}

export default connect(mapStateToProps)(Menu)