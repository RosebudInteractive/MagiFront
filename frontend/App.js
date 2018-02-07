import React, { Component } from 'react';
import './App.css';
import './components/page-header/page-header.css';
import CoursePage from './containers/courses-page'
import PageHeaderRow from './components/page-header/page-header-row';
import PageFooter from './components/page-footer/page-footer';
import {connect} from 'react-redux';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';


// import FiltersRow from './components/page-header/filters-row';
// import { bindActionCreators } from 'redux'
// import { connect } from 'react-redux'

// function browserSelector({browser}) {
//     return {browser}
// }

// @connect(browserSelector)
class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            direction:'',
            lastScrollPos:0,
            showHeader: true,
        };
        this._handleScroll = this._handleScroll.bind(this);
    }

    componentDidMount() {
        window.addEventListener('scroll', this._handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this._handleScroll);
    }

    _handleScroll(event){
        if(this.state.lastScrollPos > event.target.scrollingElement.scrollTop) {
            this.setState({
                direction:'top',
                showHeader: true,
                lastScrollPos:event.target.scrollingElement.scrollTop
            });
            console.log('top');
        } else if(this.state.lastScrollPos < event.target.scrollingElement.scrollTop) {
            this.setState({
                direction:'bottom',
                showHeader: false,
                lastScrollPos:event.target.scrollingElement.scrollTop
            });
            console.log('bottom');
        }
    }

    _getHeader() {
        return this.state.showHeader ?
            <PageHeaderRow/>
            :
            null
    }

    render() {
        return (
            <div className="App" onScroll={this._handleScroll}>
                <ReactCSSTransitionGroup
                    transitionName="example"
                >
                    {this._getHeader()}
                </ReactCSSTransitionGroup>
                <CoursePage/>
                {/*<CourseModule/>*/}
                <PageFooter/>
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
