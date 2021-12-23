import React from "react";
import {pages} from "../tools/page-tools";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {getUserProfileFull, loadingSelector as profileLoading, paidCoursesInfoSelector} from 'ducks/profile';
import {enabledPaidCoursesSelector, fetchingSelector as appOptionsLoading} from 'ducks/app';
import {setCurrentPage} from "../actions/page-header-actions";
import {whoAmI, showSignInForm} from "../actions/user-actions";
import {refreshState} from "../actions/lesson-info-storage-actions";
import CoursesBlock from '../components/purchases/courses-block'
import {Redirect} from 'react-router';
import browserHistory from "../history";

class PurchasesPage extends React.Component {
    constructor(props) {
        super(props);

        this._redirect = false;

        this.state = {
            courses: true,
            lessons: false
        };
    }

    UNSAFE_componentWillMount() {
        this.props.whoAmI()
        this.props.getUserProfileFull();
        this.props.setCurrentPage(pages.purchases);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if ((this.props.loading) && (!nextProps.loading)) {
            window.requestAnimationFrame(() => {window.scrollTo(0, 0) });
            if (!nextProps.authorized || !nextProps.enabledPaidCourses) {
                this._redirect = true;
                this.forceUpdate();
                if (!this.props.authorized && nextProps.enabledPaidCourses) {
                    this.props.showSignInForm();
                }
            }
        }
    }

    render() {
        let {paidCoursesInfo} = this.props,
            _count = paidCoursesInfo ? paidCoursesInfo.size : 0;

        if (this._redirect) {
            this._redirect = false;
            browserHistory.push('/')
            return null
        }

        return (
            <div className="bookmarks-page">
                <div className="profile-block js-tabs">
                    <header className="profile-block__header">
                        <div className="profile-block__header-col">
                            <div className="profile-block__tab-controls">
                                <ul>
                                    <li className="profile-block__tab-control active">
                                        <span className="text">Доступные платные курсы</span>
                                        <span className="qty">{_count}</span>
                                        <span className="text">: </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </header>
                    <div className="profile-block__body">
                        <CoursesBlock active={true}/>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        paidCoursesInfo: paidCoursesInfoSelector(state),
        authorized: !!state.user.user,
        loading: state.user.loading || profileLoading(state) || appOptionsLoading(state),
        page: ownProps.location.pathname,
        enabledPaidCourses: enabledPaidCoursesSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({getUserProfileFull, refreshState, setCurrentPage, whoAmI, showSignInForm,}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(PurchasesPage);
