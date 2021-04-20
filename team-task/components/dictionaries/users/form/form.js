import React, {useEffect, useMemo, useState} from "react";
import {Field, Form} from "react-final-form";
import {USER_ROLE_STRINGS} from "../../../../constants/dictionary-users";
import "./form.sass"
import {Select, TextBox} from '../../../ui-kit'
import {
    cleanSelectedUser,
    findUserByEmail,
    selectedUserSelector,
    toggleUserForm,
    userFormOpenedSelector
} from "tt-ducks/users-dictionary";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {EMAIL_REGEXP} from "../../../../../common/constants/common-consts";

const vRequired = value => (value ? undefined : 'Обязательное поле');
const vMinValue = min => value =>
    isNaN(value) || value >= min ? undefined : `Необходимое количество символов ${min}`;
const vMustBeEmail = value => (EMAIL_REGEXP.test(value) ? undefined : 'Не соответствует формату почты');
const ComposeValidators = (...validators) => value =>
    validators.reduce((error, validator) => error || validator(value), undefined);


const UserForm = (props) => {
    const [createAction, setActionCreate] = useState(true);
    const { userData, visible, actions} = props;

    useEffect(()=>{
        setActionCreate(!(userData && userData.Id));
    }, [userData]);

    const closeModalForm = () => {
        actions.toggleUserForm(false);
        actions.cleanSelectedUser();
    };

    const userRoles = () => {
        return Object.entries(USER_ROLE_STRINGS).map(val => ({id: val[0], name: val[1]}));
    };

    const handleSubmit = (userInfo) => {
        //save logic here
        closeModalForm()
    };

    const findUserByEmail = (formInfo) => {
        actions.findUserByEmail(formInfo.values.email);
    };

    const userFormData = useMemo(() => ({
        displayName: (userData && userData.DisplayName) ? userData.DisplayName : '',
        email: (userData && userData.Email) ? userData.Email : '',
        role: (userData && userData.Role) ? userData.Role : ''
    }), [userData]);

    return (
        visible &&
        <div className='outer-background'>
            <div className='inner-content'>
                <button type="button" className="element-editor__close-button" onClick={closeModalForm}>Закрыть</button>
                <div className="title">
                    <h6>
                        {createAction ? 'Создание' : 'Редактирование'} пользователя
                    </h6>
                </div>
                < Form
                    initialValues={
                        userFormData
                    }
                     onSubmit={values => {
                     }}
                    validate={values => {
                    }
                    }>
                    {
                        (userForm) => (
                            <form className='user-form' onSubmit={e => {e.preventDefault(); handleSubmit(userForm.values)}}>

                                <div className='user-form__field email-field'>
                                        <Field
                                            name="email"
                                            component={TextBox}
                                            type="text"
                                            placeholder="Почта"
                                            label={"Почта"}
                                            validate={ComposeValidators(vRequired, vMustBeEmail)}
                                        />

                                    {(createAction) &&
                                    <button type="button" className="search-button" onClick={() => findUserByEmail(userForm)}>
                                        Поиск
                                    </button>}
                                </div>
                                <div className='user-form__field'>
                                    <Field
                                        name="displayName"
                                        component={TextBox}
                                        type="text"
                                        placeholder="Имя"
                                        label={"Имя"}
                                    />
                                </div>
                                <div className='user-form__field'>
                                    <Field name="role"
                                           component={Select}
                                           label={"Роль"}
                                           options={userRoles()}
                                           validate={ComposeValidators(vRequired)}>
                                    </Field>
                                </div>

                                <button type='submit' className="user-form__confirm-button orange-button big-button" disabled={!userForm.valid}>
                                   Применить
                                </button>

                            </form>
                        )
                    }
                </Form>
            </div>
        </div>
    )
};

const mapState2Props = (state) => {
    return {
        userData: selectedUserSelector(state),
        visible: userFormOpenedSelector(state)
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            toggleUserForm,
            cleanSelectedUser,
            findUserByEmail
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(UserForm)

