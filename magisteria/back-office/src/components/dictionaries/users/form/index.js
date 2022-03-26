import React, {useEffect, useMemo, useState} from "react";
import "./form.sass"
import "../../editor-form.sass"
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
import {hasAdminRights} from "tt-ducks/auth";
import {
    fetchingSelector,
    getRights,
    permissionSchemeSelector,
    rightsDictionarySelector,
    rolesPermissionsSelector
} from "tt-ducks/access-rights-dictionary";

import {getRoleMergeClojure} from "#src/tools/permission-functions";
import UserForm from "./form.jsx";

const FormWrapper = (props) => {
    const [createAction, setActionCreate] = useState(true);
    const [userRolesArray, setUserRolesArray] = useState(props.userData ? Object.keys(props.userData.PData.roles) : []);
    const {userData, visible, fetching, actions, roles, permissionScheme, rolesPermissions} = props;

    useEffect(() => {
        setActionCreate(!(userData && userData.Id));
    }, [userData]);

    const closeModalForm = () => {
        actions.toggleUserForm(false);
        actions.cleanSelectedUser();
        props.history.push(`/dictionaries/users`);
    };

    const mergeRole = useMemo(() => permissionScheme ? getRoleMergeClojure(permissionScheme) : null, [permissionScheme]);

    const mergedScheme = useMemo(() => {
        if (!mergeRole) return

        const roles = Array.isArray(rolesPermissions)
            ? rolesPermissions.filter(role => userRolesArray.includes(role.shortCode))
            : [];
        return mergeRole(roles);
    }, [rolesPermissions, userRolesArray]);

    const handleSubmit = (data) => {
        actions.saveUserChanges({Id: userData.Id, PData: data});
        closeModalForm()
    };

    const findUserByEmail = (email) => {
        actions.findUserByEmail(email);
    };

    const userFormData = useMemo(() => ({
        displayName: (userData && userData.DisplayName) ? userData.DisplayName : '',
        email: (userData && userData.Email) ? userData.Email : '',
        role: (userData && userData.Role) ? [...userData.Role] : []
    }), [userData]);

    return (
        (visible && !fetching && !!mergedScheme) &&
        <div className='outer-background'>
            <div className='inner-content'>
                <button type="button" className="modal-form__close-button" onClick={closeModalForm}>Закрыть</button>
                <div className="title">
                    <h6>
                        {createAction ? 'Создание' : 'Редактирование'} пользователя
                    </h6>
                </div>
                <UserForm initValues={userFormData}
                          roles={roles}
                          mergedScheme={mergedScheme}
                          isCreateMode={createAction}
                          onSubmit={handleSubmit}
                          onFindUser={findUserByEmail}
                          onChange={setUserRolesArray}/>
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

export default connect(mapState2Props, mapDispatch2Props)(FormWrapper)

