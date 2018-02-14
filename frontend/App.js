import './App.css';

import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";
import {Switch, Route, withRouter,} from 'react-router-dom'

import CoursePage from './containers/courses-page';
import SingleCoursePage from './containers/single-course-page';

import PageHeader from './components/page-header/page-header';
import PageFooter from './components/page-footer/page-footer';

import * as tools from './tools/page-tools';
import * as appActions from './actions/app-actions';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            direction: '',
            lastScrollPos: 0,
            showHeader: true,
            width: 0,
            height: 0,
        };
        this._handleScroll = this._handleScroll.bind(this);
        // this._narrowerThan = tools.narrowerThan.bind(this);
        // this._widerThan = tools.widerThan.bind(this);
        // this._widthBetween = tools.widthBetween.bind(this);
    }

    get width() {
        return this.state.width
    }

    set width(value) {
        this.state.width = value
    }

    get size() {
        return this.props.size
    }

    updateDimensions() {
        this.width = window.innerWidth;
        let _size = tools.getSize(this.width);
        if (_size !== this.size) {
            this.props.appActions.switchSizeTo(_size);
        }
    }

    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions.bind(this));
        window.addEventListener('scroll', this._handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this._handleScroll);
        window.removeEventListener("resize", this.updateDimensions.bind(this));
    }

    _handleScroll(event) {
        if (this.state.lastScrollPos > event.target.scrollingElement.scrollTop) {
            this.setState({
                direction: 'top',
                showHeader: true,
                lastScrollPos: event.target.scrollingElement.scrollTop
            });
        } else if (this.state.lastScrollPos < event.target.scrollingElement.scrollTop) {
            this.setState({
                direction: 'bottom',
                showHeader: false,
                lastScrollPos: event.target.scrollingElement.scrollTop
            });
        }
    }

    _getMainDiv() {
        let _homePath = '/';

        return (
            // this._showMobileMenu() ? null :
            <Switch>
                {/*<PageHeader visible={this.state.showHeader}/>*/}
                <Route exact path={_homePath} component={CoursePage}/>
                <Route path={_homePath + 'category/:url'} component={SingleCoursePage}/>
            </Switch>
        )
    }

    render() {
        return (
            <div className="App global-wrapper" onScroll={this._handleScroll}>
                <PageHeader visible={this.state.showHeader}/>
                {this._getMainDiv()}
                <PageFooter/>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        showFiltersForm: state.pageHeader.showFiltersForm,
        // showMenu: state.pageHeader.showMenu,
        size: state.app.size,
        ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App))
