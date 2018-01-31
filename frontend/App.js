import React, { Component } from 'react';
import './App.css';
import './page-header.css';
import CourseModule from './components/course/course-module'
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
                <CourseModule/>
                <CourseModule/>
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
