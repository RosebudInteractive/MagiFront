import React from 'react';
import './menu.css';
import {bindActionCreators} from "redux";
import * as pageHeaderActions from "../../actions/page-header-actions";
import {connect} from "react-redux";
import FiltersRow from './filters-mobile';
import './menu.css'
import SearchBlock from './search-block';

class MenuTrigger extends React.Component{
    render() {
        return (
            <div className='menu-mobile'>
                <FiltersRow/>
                <SearchBlock/>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        showMenu: state.pageHeader.showMenu,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MenuTrigger);