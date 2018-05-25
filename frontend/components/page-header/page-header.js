import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";

import DesktopHeaderRow from './desktop-header';
import MobileHeaderRow from './mobile-header';
import FilterRow from './desktop-filters';
import MenuMobile from './menu-mobile';
import TranscriptMenu from '../lesson-page/lesson-transcript-menu';

import * as tools from '../../tools/page-tools';

import * as pageHeaderActions from "../../actions/page-header-actions";
import {pages} from "../../tools/page-tools";

class Header extends React.Component {
    constructor(props) {
        super(props);
        this._isMobile = tools.isMobile.bind(this);
    }

    componentDidUpdate() {
        let _isCoursesPage = this.props.pageHeaderState.currentPage.name === tools.pages.courses.name;
        if (!_isCoursesPage && this.props.pageHeaderState.showFiltersForm) {
            this.props.pageHeaderActions.hideFiltersForm()
        }
    }

    _onClickMenuTrigger() {
        this.props.pageHeaderState.showMenu ? this.props.pageHeaderActions.hideMenu() : this.props.pageHeaderActions.showMenu();
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

    _getLessonInfo(info){
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
                    {this._isMobile() ?
                        <div>
                            <MobileHeaderRow onClickMenuTrigger={::this._onClickMenuTrigger} currentPage={pageHeaderState.currentPage}/>
                            <MenuMobile/>
                        </div>
                        :
                        <div>
                            <DesktopHeaderRow
                                onFilterClick={::this._onFilterClick}
                                onNavigateClick={::this._onNavigateClick}
                                currentPage={pageHeaderState.currentPage}
                                filterActive={pageHeaderState.showFiltersForm}/>
                            <FilterRow/>
                        </div>
                    }
                    {_showTranscriptMenu ?
                        <TranscriptMenu
                            courseUrl={this.props.courseUrl}
                            courseTitle={lessonInfo.course.Name}
                            total={this.props.lessons.object.length}
                            current={_currentLesson.Number}
                            isNeedHideGallery={_currentLesson.IsAuthRequired && !authorized}
                            episodes={this.props.lessonText.episodes}
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
        size: state.app.size,
        courseUrl: state.pageHeader.courseUrl,
        lessonUrl: state.pageHeader.lessonUrl,
        lessonInfo: state.singleLesson,
        lessonText: state.lessonText,
        lessons: state.lessons,
        authorized: !!state.user.user,
        ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);