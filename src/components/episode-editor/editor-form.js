import React from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {reduxForm} from "redux-form";
import SavingBlock from "../common/saving-page";
import {Prompt} from "react-router-dom";

class EpisodeEditorForm extends React.Component {

    render(){
        const {hasChanges, saving} = this.props;

        return <div className="editor course_editor">
            <SavingBlock visible={saving}/>
            <Prompt when={hasChanges}
                    message={'Есть несохраненные данные.\n Перейти без сохранения?'}/>
            <div className='editor__head'>
                <div className="tabs tabs-1" key='tab1'>

                </div>
            </div>
        </div>
    }
}


const validate = (values) => {
    const errors = {}

    if (!values.name) {
        errors.name = 'Значение не может быть пустым'
    }

    if (!values.lessonType) {
        errors.lessonType = 'Значение не может быть пустым'
    }

    if (!values.URL) {
        errors.URL = 'Значение не может быть пустым'
    }

    if (!values.authorId) {
        errors.authorId = 'Значение не может быть пустым'
    }

    if (values.fixed && !values.fixDescription) {
        errors.fixDescription = 'Значение не может быть пустым'
    }

    return errors
}

let EpisodeEditorWrapper = reduxForm({
    form: 'EpisodeEditor',
    validate,
})(EpisodeEditorForm);

function mapStateToProps(state) {
    return {}
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(EpisodeEditorWrapper)