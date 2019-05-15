import React from 'react'
import {Field, formValueSelector, clearFields, untouch, change as changeFieldValue} from 'redux-form'
import {CheckBox} from "../../common/input-controls";
import Datepicker from "../../common/date-time-control";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import './subcription-tab.sass';
import {enableButtonsSelector, billingModeSelector} from "adm-ducks/app";
import {bindActionCreators} from "redux";

class SubscriptionTab extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isSubsRequired !== this.props.isSubsRequired) {
            if (nextProps.isSubsRequired && !nextProps.isAuthRequired) {
                this.props.changeFieldValue('LessonEditor', 'isAuthRequired', true);
            }
        }
    }

    render() {
        let {isSubsRequired, enableButtons, billingMode} = this.props;

        let _disabled = !enableButtons,
            _enableSubscription = !!billingMode.subscription;

        return <div className={"tab-wrapper controls-wrapper lesson-subscription-tab" + (this.props.visible ? '' : ' hidden')}>
            <Field component={CheckBox} name="isAuthRequired" label="Требуется авторизация" disabled={_disabled || isSubsRequired}/>
            <Field component={CheckBox} name="isSubsRequired" label="Требуется подписка на лекцию" disabled={_disabled || !_enableSubscription}/>
            <Field component={Datepicker} name="freeExpDate" label="Дата окончания бесплатного периода" disabled={_disabled || !isSubsRequired || !_enableSubscription}/>
            <Field component={CheckBox} name="isFreeInPaidCourse" label="Бесплатная лекция в рамках платного курса" disabled={_disabled}/>
        </div>
    }
}


const selector = formValueSelector('LessonEditor')

const _SubscriptionTab = connect(state => {
    return {
        isSubsRequired: selector(state, 'isSubsRequired'),
        isAuthRequired: selector(state, 'isAuthRequired'),
    }
})(SubscriptionTab)

function mapStateToProps(state) {
    return {
        authors: state.courseAuthorsList.authors,
        enableButtons: enableButtonsSelector(state),
        billingMode: billingModeSelector(state)
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({changeFieldValue, clearFields, untouch}, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(_SubscriptionTab)