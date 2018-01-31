import React, { Component } from 'react';
import './App.css';
import './page-header.css';
import CoursePage from './containers/courses-page'
import PageHeaderRow from './components/page-header/page-header-row';
import {connect} from 'react-redux';
// import FiltersRow from './components/page-header/filters-row';
// import { bindActionCreators } from 'redux'
// import { connect } from 'react-redux'

// function browserSelector({browser}) {
//     return {browser}
// }

// @connect(browserSelector)
class App extends Component {


    render() {
        return (
            <div className="App">
                <PageHeaderRow/>
                <CoursePage/>
                {/*<CourseModule/>*/}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        showFiltersForm: state.pageHeader.showFiltersForm,
    }
}

export default connect(mapStateToProps)(App);
