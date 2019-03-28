import React from 'react'
import {Field} from 'redux-form'
import {CheckBox} from "../../common/input-controls";
import Datepicker from "../../common/date-time-control";
import PropTypes from "prop-types";
import {connect} from "react-redux";

class SubscriptionTab extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
    }

    render() {
        return <div className={"tab-wrapper controls-wrapper" + (this.props.visible ? '' : ' hidden')}>
            <Field component={CheckBox} name="isAuthRequired" label="Требуется авторизация"/>
            <Field component={CheckBox} name="isSubsRequired" label="Требуется подписка на лекцию"/>
            <Field component={Datepicker} name="freeExpDate" label="Дата окончания бесплатного периода"/>
            <Field component={CheckBox} name="isFreeInPaidCourse" label="Бесплатная лекция"/>
        </div>
    }
}

function mapStateToProps(state) {
    return {
        authors: state.courseAuthorsList.authors,
    }
}

export default connect(mapStateToProps,)(SubscriptionTab)