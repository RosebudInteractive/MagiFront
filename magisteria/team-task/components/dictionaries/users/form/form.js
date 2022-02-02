import React, {useEffect, useMemo, useState} from "react";
import {Field, Form, FormSpy} from "react-final-form";
import {USER_ROLE_STRINGS} from "../../../../constants/dictionary-users";
import "./form.sass"
import {MultipleSelect, TextBox} from '../../../ui-kit'
import {
    cleanSelectedUser,
    findUserByEmail,
    saveUserChanges,
    selectedUserSelector,
    toggleUserForm,
    userFormOpenedSelector,
} from "tt-ducks/users-dictionary";

import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {EMAIL_REGEXP} from "../../../../../common/constants/common-consts";
import {hasAdminRights} from "tt-ducks/auth";
import Permissions from "../../permissions/permissions";
import {
    fetchingSelector,
    getRights,
    permissionSchemeSelector,
    rightsDictionarySelector,
    rolesPermissionsSelector
} from "tt-ducks/access-rights-dictionary";

import roleMerger from "../../../../tools/role-merger";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";


//todo import validators
const vRequired = value => (value ? undefined : 'Обязательное поле');
const vMinValue = min => value =>
    isNaN(value) || value >= min ? undefined : `Необходимое количество символов ${min}`;
const vMustBeEmail = value => (EMAIL_REGEXP.test(value) ? undefined : 'Не соответствует формату почты');
const ComposeValidators = (...validators) => value =>
    validators.reduce((error, validator) => error || validator(value), undefined);


const UserForm = (props) => {
    const [createAction, setActionCreate] = useState(true);
    const [userRolesArray, setUserRolesArray] = useState(Object.keys(props.userData ? props.userData.PData.roles : []));
    const { userData, visible, actions, isAdmin, roles, permissionScheme, rolesPermissions, fetching} = props;

    useEffect(()=>{
        setActionCreate(!(userData && userData.Id));
    }, [userData]);

    const rolesWithNames = useMemo(() => {
        return Object.fromEntries(roles.map(role => [role.ShortCode, role.Name]));
    }, [roles]);

    const closeModalForm = () => {
        actions.toggleUserForm(false);
        actions.cleanSelectedUser();
        props.history.push(`/dictionaries/users`);
    };

    const permissionSchemeLinear = useMemo(() => {
        roleMerger.init(permissionScheme);
        return roleMerger.getMergedRolesLinearByMaxValue(rolesPermissions.filter(role => userRolesArray.includes(role.ShortCode)));
    }, [permissionScheme, roles, rolesPermissions, userRolesArray]);



    const userRoles = useMemo(() => {
        return Object.entries(USER_ROLE_STRINGS)
            .map((val) => {
                return (val !== USER_ROLE_STRINGS.a) || ((val === USER_ROLE_STRINGS) && isAdmin) ?
                    {id: val[0], name: val[1]}
                    :
                    null
            })
            .filter(item => !!item);
    }, [isAdmin]);

    const handleSubmit = (userInfo) => {
        const _oldRoles = {...userData.PData.roles}

        if (userInfo.role && (userInfo.role.length > 0)) {
            if (_oldRoles.pma) delete _oldRoles.pma
            if (_oldRoles.pms) delete _oldRoles.pms
            if (_oldRoles.pme) delete _oldRoles.pme
            if (_oldRoles.pmu) delete _oldRoles.pmu
            if (_oldRoles.a) delete _oldRoles.a

            userInfo.role.map(role => {
                _oldRoles[role] = 1
            });
        }

        const data = {...userData,
            PData: {
                roles: _oldRoles,
                isAdmin: (userInfo.role && (userInfo.role === 'a')) || (userInfo.role && userInfo.role.length > 1 && userInfo.role.includes('a'))
            }};
        actions.saveUserChanges(data);
        closeModalForm()
    };

    const findUserByEmail = (formInfo) => {
        actions.findUserByEmail(formInfo.values.email);
    };

    const userFormData = useMemo(() => ({
        displayName: (userData && userData.DisplayName) ? userData.DisplayName : '',
        email: (userData && userData.Email) ? userData.Email : '',
        role: (userData && userData.Role) ? [...userData.Role] : []
    }), [userData]);

    return (
        (visible && !fetching) &&
        <div className='outer-background'>
            <div className='inner-content'>
                <button type="button" className="modal-form__close-button" onClick={closeModalForm}>Закрыть</button>
                <div className="title">
                    <h6>
                        {createAction ? 'Создание' : 'Редактирование'} пользователя
                    </h6>
                </div>
                <Form
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
                            <form className='user-form' onSubmit={ e => {e.preventDefault(); handleSubmit(userForm.values)} }>
                                <div className={'user-form-fields'}>
                                    <div className='user-form__field email-field'>
                                        <Field name="email"
                                               component={TextBox}
                                               type="text"
                                               placeholder="Почта"
                                               label={"Почта"}
                                               validate={ComposeValidators(vRequired, vMustBeEmail)}
                                               disabled={!createAction}/>
                                        {
                                            (createAction) &&
                                            <button disabled={vMustBeEmail(userForm.values.email) !== undefined} type="button" className='search-button' onClick={() => findUserByEmail(userForm)}>
                                                Поиск
                                            </button>
                                        }
                                    </div>
                                    <div className='user-form__field'>
                                        <Field name="displayName"
                                               component={TextBox}
                                               type="text"
                                               placeholder="Имя"
                                               label={"Имя"}
                                               disabled={true}/>
                                    </div>
                                    <div className='user-form__field'>
                                        <Field name="role"
                                               component={MultipleSelect}
                                               multiple={true}
                                               label={"Роль"}
                                               required={true}
                                               options={userRoles}

                                               renderValue={(selected) => (
                                                   <Box className={'user-form__roles _with-custom-scroll'}>
                                                       {selected.map((value) => (
                                                           <Chip key={value} label={rolesWithNames[value]} />
                                                       ))}
                                                   </Box>
                                               )}
                                               validate={ComposeValidators(vRequired)}>
                                        </Field>
                                    </div>




                                    <button type='submit' className="user-form__confirm-button orange-button big-button" disabled={!userForm.valid || userForm.pristine}>
                                        Применить
                                    </button>

                                </div>

                                <div className={'user-permissions'}>
                                    {roles &&
                                    <Permissions readOnly = {true} permissionScheme={permissionSchemeLinear} onDirty={() => {}} onChangeCb = {() => {}}/>
                                    }
                                </div>

                                <FormSpy subscription={{values: true}}
                                         onChange={({values}) => {
                                             setUserRolesArray(values.role)
                                         }}/>


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
        roles: rightsDictionarySelector(state),
        rolesPermissions: rolesPermissionsSelector(state),
        fetching: fetchingSelector(state),
        userData: selectedUserSelector(state),
        visible: userFormOpenedSelector(state),
        isAdmin: hasAdminRights(state),
        permissionScheme: permissionSchemeSelector(state)
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            getRights,
            toggleUserForm,
            cleanSelectedUser,
            findUserByEmail,
            saveUserChanges
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(UserForm)

