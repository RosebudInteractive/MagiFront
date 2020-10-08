import React from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {Field, getFormValues, isDirty, isValid, reduxForm, reset} from "redux-form";
import SavingBlock from "../common/saving-page";
import {Prompt} from "react-router-dom";
import BottomControls from "../bottom-contols/buttons";
import {TextBox} from "../common/input-controls";
import TextArea from "../common/text-area";
import Cover from "../common/cover-control";
import {save} from "../../actions/authorActions"
import {EDIT_MODE_EDIT, EDIT_MODE_INSERT} from "../../constants/Common";
import history from "../../history";

const EDITOR_NAME = "AuthorEditor"

class AuthorEditorForm extends React.Component {

    UNSAFE_componentWillMount() {
        this._init()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.author !== this.props.author) {
            this._init()
        }
    }

    render() {
        const {hasChanges, saving} = this.props

        return <React.Fragment>
            <SavingBlock visible={saving}/>
            <Prompt when={hasChanges}
                    message={'Есть несохраненные данные.\n Перейти без сохранения?'}/>
            <div className="editor review_editor">
                <div className="editor__main-area">
                    <div className="main-area__container">
                        <form className={"form-wrapper non-webix-form"} action={"javascript:void(0)"}>
                            <div className="controls-wrapper no-tabs-form">
                                <Field component={TextBox} name="firstName" label="Имя" placeholder="Укажите имя"/>
                                <Field component={TextBox} name="lastName" label="Фамилия"
                                       placeholder="Укажите фамилию"/>
                                <Field component={Cover} name="portrait" label="Портрет автора"/>
                                <Field component={TextBox} name="occupation" label="Профессия"
                                       placeholder="Укажите професию"/>
                                <Field component={TextBox} name="employment" label="Место работы"
                                       placeholder="Укажите место работы"/>
                                <Field component={TextBox} name="url" label="URL" placeholder="Введите URL"/>

                                <Field component={TextArea} name="shortDescription" label="Краткое описание"
                                       enableHtml={true} id={"short-description"}/>
                                <Field component={TextArea} name="description" label="Описание" enableHtml={true}
                                       id={"description"}/>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="editor__footer">
                    <BottomControls hasChanges={hasChanges} enableApplyChanges={this._enableApplyChanges()}
                                    onAccept={::this._save} onCancel={::this._cancel} onBack={::this._goBack}/>
                </div>
            </div>
        </React.Fragment>
    }

    _init() {
        const {author} = this.props

        if (author) {
            this.props.initialize({
                authorId: author.Id,
                firstName: author.FirstName,
                lastName: author.LastName,
                url: author.URL,
                portrait: {
                    file: author.Portrait,
                    meta: author.PortraitMeta,
                },
                description: author.Description,
                shortDescription: author.ShortDescription,
                occupation: author.Occupation,
                employment: author.Employment
            })
        }
    }

    _enableApplyChanges() {
        return this.props.editorValid
    }

    _save() {
        let {editorValues, editorValid, author} = this.props;

        if (!editorValid) {
            return
        }

        let _obj = {
            Id: author.Id ? author.Id : -1,
            id: author.Id ? author.Id : -1,
            FirstName: editorValues.firstName,
            LastName: editorValues.lastName,
            URL: editorValues.url,
            Portrait: editorValues.portrait.file,
            PortraitMeta: editorValues.portrait.meta,
            Description: editorValues.description,
            ShortDescription: editorValues.shortDescription ? editorValues.shortDescription : "",
            Occupation: editorValues.occupation,
            Employment: editorValues.employment
        }

        if (this.props.editMode) {
            this.props.actions.save(_obj, EDIT_MODE_EDIT);
        } else {
            this.props.actions.save(_obj, EDIT_MODE_INSERT);
        }
    }

    _cancel() {
        this.props.actions.resetReduxForm(EDITOR_NAME)
    }

    _goBack() {
        history.push('/adm/authors')
    }
}

const validate = (values) => {
    const errors = {}

    if (!values.firstName) {
        errors.firstName = 'Значение не может быть пустым'
    }

    if (!values.lastName) {
        errors.lastName = 'Значение не может быть пустым'
    }

    if (!values.url) {
        errors.url = 'Значение не может быть пустым'
    }

    if (!values.occupation) {
        errors.occupation = 'Значение не может быть пустым'
    }


    return errors
}

let AuthorEditorWrapper = reduxForm({
    form: EDITOR_NAME,
    validate,
})(AuthorEditorForm)

const mapStateToProps = (state) => {
    return {
        author: state.author.current,

        hasChanges: isDirty(EDITOR_NAME)(state),
        editorValues: getFormValues(EDITOR_NAME)(state),
        editorValid: isValid(EDITOR_NAME)(state),

        saving: state.author.saving,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({save, resetReduxForm: reset}, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthorEditorWrapper)