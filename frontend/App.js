import React, { Component } from 'react';
import './App.css';
import './components/page-header/page-header.css';
import CoursePage from './containers/courses-page';
// import MenuMobile from './components/page-header/menu-mobile';
import PageHeaderRow from './components/page-header/page-header-row';
import PageFooter from './components/page-footer/page-footer';
import {connect} from 'react-redux';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import * as tools from './tools/size-tools';
import * as appActions from './actions/app-actions';
import {bindActionCreators} from "redux";

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
            width: 0,
            height: 0,
        };
        this._handleScroll = this._handleScroll.bind(this);
        this._narrowerThan = tools.narrowerThan.bind(this);
        this._widerThan = tools.widerThan.bind(this);
        this._widthBetween = tools.widthBetween.bind(this);
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

    _showMobileMenu() {
        let _mobileFormat = this._narrowerThan(tools.Size.s);
        return _mobileFormat && this.props.showMenu
    }

    _getMainDiv() {
        return (
            this._showMobileMenu() ? null : <CoursePage/>
        )
    }

    render() {
        return (
            <div className="App" onScroll={this._handleScroll}>
                <ReactCSSTransitionGroup
                    transitionName="example"
                >
                    {this._getHeader()}
                </ReactCSSTransitionGroup>

                { this._getMainDiv()}
                <PageFooter/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        showFiltersForm: state.pageHeader.showFiltersForm,
        showMenu: state.pageHeader.showMenu,
        size: state.app.size,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
