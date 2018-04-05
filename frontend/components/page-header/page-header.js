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
        let _subLesson = info.object.Lessons;
        return !info.isSublesson ? info.object : (_subLesson[info.currentSubLesson])
    }

    render() {
        let _menuOpened = this.props.pageHeaderState.showMenu;
        let _headerClass = 'page-header' + (_menuOpened ? ' opened' : ' _fixed' + (!this.props.visible ? ' _animate' : ''));
        const _showTranscriptMenu = (this.props.pageHeaderState.currentPage === pages.transcript) && this.props.lessonInfo.loaded;

        return (
            this.props.pageHeaderState.visibility ?
                <header className={_headerClass}>
                    {this._isMobile() ?
                        <div>
                            <MobileHeaderRow onClickMenuTrigger={::this._onClickMenuTrigger} currentPage={this.props.pageHeaderState.currentPage}/>
                            <MenuMobile/>
                        </div>
                        :
                        <div>
                            <DesktopHeaderRow
                                onFilterClick={::this._onFilterClick}
                                onNavigateClick={::this._onNavigateClick}
                                currentPage={this.props.pageHeaderState.currentPage}
                                filterActive={this.props.pageHeaderState.showFiltersForm}/>
                            <FilterRow/>
                        </div>
                    }
                    {_showTranscriptMenu ?
                        <TranscriptMenu
                            courseUrl={this.props.courseUrl}
                            courseTitle={this.props.lessonInfo.course.Name}
                            total={this.props.lessons.object.length}
                            current={::this._getLessonInfo(this.props.lessonInfo).Number}
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
        ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);