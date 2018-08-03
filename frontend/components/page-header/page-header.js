import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";

import DesktopHeaderRow from './desktop-header';
import MobileHeaderRow from './mobile-header';
import MobileFilter from './desktop-filters';
import TranscriptMenu from '../lesson-page/lesson-transcript-menu';

import * as pageHeaderActions from "../../actions/page-header-actions";
import * as appActions from "../../actions/app-actions";
import {pages, widthLessThan900} from "../../tools/page-tools";
import $ from "jquery";

class Header extends React.Component {
    constructor(props) {
        super(props);

        this._width = window.innerWidth;
    }

    componentDidUpdate() {
        let _isCoursesPage = this.props.pageHeaderState.currentPage.name === pages.courses.name;
        if (!_isCoursesPage && this.props.pageHeaderState.showFiltersForm) {
            this.props.pageHeaderActions.hideFiltersForm()
        }

        if (widthLessThan900() && !this.props.showUserBlock) {
            this.props.appActions.showUserBlock()
        }

        if ((this._width < 900) && !widthLessThan900()) {
            this.props.appActions.hideUserBlock()
        }

        this._width = window.innerWidth;
    }

    _onClickMenuTrigger() {
        if (this.props.pageHeaderState.showMenu) {
            this.props.pageHeaderActions.hideMenu()
            $('body').removeClass('overflow');
        } else {
            this.props.pageHeaderActions.showMenu()
            $('body').addClass('overflow');
        }
    }

    _onFilterClick() {
        this.props.pageHeaderState.showFiltersForm ?
            this.props.pageHeaderActions.hideFiltersForm()
            :
            this.props.pageHeaderActions.showFiltersForm()
    }

    _onNavigateClick(page) {
        if (page.url) {
            this.props.history.push(page.url);
        }
    }

    _getLessonInfo(info) {
        if (info.object) {
            let _subLesson = info.object.Lessons;
            return !info.isSublesson ? info.object : (_subLesson[info.currentSubLesson])
        }
    }

    render() {
        let {authorized, lessonInfo, pageHeaderState, visible} = this.props,
            _menuOpened = pageHeaderState.showMenu,
            _headerClass = 'page-header' + (_menuOpened ? ' opened' : ' _fixed' + (!visible ? ' _animate' : '')),
            _showTranscriptMenu = (pageHeaderState.currentPage === pages.transcript) && lessonInfo.loaded,
            _currentLesson = this._getLessonInfo(lessonInfo)

        return (
            this.props.pageHeaderState.visibility ?
                <header className={_headerClass}>
                    <div className='page-header__row'>

                        <MobileHeaderRow onClickMenuTrigger={::this._onClickMenuTrigger}
                                         currentPage={pageHeaderState.currentPage}/>
                        <DesktopHeaderRow
                            onFilterClick={::this._onFilterClick}
                            onNavigateClick={::this._onNavigateClick}
                            currentPage={pageHeaderState.currentPage}
                            filterActive={pageHeaderState.showFiltersForm}/>
                    </div>
                    <MobileFilter/>
                    {_showTranscriptMenu ?
                        <TranscriptMenu
                            courseUrl={this.props.courseUrl}
                            courseTitle={lessonInfo.course.Name}
                            total={this.props.lessons.object.length}
                            current={_currentLesson.Number}
                            isNeedHideGallery={_currentLesson.IsAuthRequired && !authorized}
                            isNeedHideRefs={!(this.props.lessonText.refs && (this.props.lessonText.refs.length > 0))}
                            episodes={this.props.lessonText.episodes}
                            isMobileApp={this.props.isMobileApp}
                        />
                        :
                        null}

                </header>
                : null
        )
    }

}

function mapStateToProps(state, ownProps) {
    return {
        pageHeaderState: state.pageHeader,
        courseUrl: state.pageHeader.courseUrl,
        lessonUrl: state.pageHeader.lessonUrl,
        lessonInfo: state.singleLesson,
        lessonText: state.lessonText,
        lessons: state.lessons,
        authorized: !!state.user.user,
        isMobileApp: state.app.isMobileApp,
        showUserBlock: state.app.showUserBlock,
        ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);