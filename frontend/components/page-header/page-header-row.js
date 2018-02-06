import React from 'react';
import Logo from './logo';
import Navigation from './navigation';
import LanguageBlock from './language-block';
import SearchBlock from './search-block'
import UserBlock from './user-block';
import {connect} from 'react-redux';
import FiltersRow from './filters-row';
import MenuTrigger from "./menu-trigger";
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

const PageHeaderRow = class PageHeaderRow extends React.Component {

    constructor() {
        super();
        this.state = {
            width: 800,
            height: 182
        }
    }

    /**
     * Calculate & Update state of new dimensions
     */
    updateDimensions() {
        if (window.innerWidth < 500) {
            this.setState({width: 450, height: 102});
        } else {
            let update_width = window.innerWidth;
            let update_height = Math.round(update_width / 4.4);
            this.setState({width: update_width, height: update_height});
        }
    }

    /**
     * Add event listener
     */
    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions.bind(this));
    }

    /**
     * Remove event listener
     */
    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions.bind(this));
    }

    _isFullSize() {
        return this.state.width > 900;
    }

    _isSmallSize() {
        return this.state.width < 480;
    }

    render() {
        let {showSearchForm, showFiltersForm, showMenu} = this.props. pageHeaderState;

        return (
            this._isFullSize() ?

                <div className='page-header'>
                    <div className='row'>
                        <div className='container'>
                            <Logo isFull={this._isFullSize()}/>
                            {!showSearchForm ? <Navigation isFull={this._isFullSize()}/> : ''}
                            {!showSearchForm ? <LanguageBlock/> : ''}
                            <SearchBlock/>
                            {!showSearchForm ? <UserBlock/> : ''}
                        </div>
                    </div>
                    {/*<ReactCSSTransitionGroup*/}
                        {/*transitionName="example"*/}
                    {/*>*/}
                    {
                        showFiltersForm ?
                            <FiltersRow/>
                            :
                            null
                    }
                    {/*</ReactCSSTransitionGroup>*/}
                    {
                        showMenu ?
                            null : null

                    }
                </div>
                :
                <div className={'page-header page-header-s-size' + (showMenu ? ' opened' : '')}>
                    <div className='menu-mobile'>
                        {/*<div className='container'>*/}
                        <Logo isFull={this._isFullSize()}/>
                        <Navigation isFull={this._isFullSize()}/>
                        <MenuTrigger />
                        {/*</div>*/}
                    </div>
                </div>
        );
    }
};

function mapStateToProps(state) {
    return {
        pageHeaderState: state.pageHeader,
    }
}

export default connect(mapStateToProps)(PageHeaderRow);