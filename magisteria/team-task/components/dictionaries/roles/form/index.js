import React, {useEffect, useMemo, useState} from "react";
import {Field, Form} from "react-final-form";
import "./form.sass"
import {TextBox} from '../../../ui-kit'
import {
    cleanSelectedRight,
    permissionSchemeSelector,
    rightFormOpenedSelector,
    saveRightChanges,
    selectedRightSelector,
    toggleRightForm,
} from "tt-ducks/access-rights-dictionary";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {hasAdminRights} from "tt-ducks/auth";
import Permissions from "../../../permission-tree";
import validators from "../../../../tools/validators"
import {getPermissionsFromScheme, getRoleMergeClojure} from "../../../../tools/permission-functions";
import {fetchingSelector} from "tt-ducks/access-rights-dictionary";
import {RoleRightsValue} from "../../../../@types/permissions";

const RightForm = (props) => {
    const [createAction, setActionCreate] = useState(true);
    const {roleData, visible, actions, isAdmin, permissionScheme, fetching} = props;

    const [formIsDirty, setFormIsDirty] = useState(false);
    const [permissionBody, setPermissionBody] = useState(null);

    useEffect(() => {

        setActionCreate(!(roleData && roleData.Id));
    }, [roleData]);

    const closeModalForm = () => {
        actions.toggleRightForm(false);
        actions.cleanSelectedRight();
        props.history.push(`/dictionaries/rights`);
    };

    const roleFormData = useMemo(() => ({
        Code: (roleData && roleData.code) ? roleData.code : '',
        Name: (roleData && roleData.name) ? roleData.name : '',
        ShortCode: (roleData && roleData.shortCode) ? roleData.shortCode : '',
        Description: (roleData && roleData.description) ? roleData.description : '',
        Permissions: (roleData && roleData.permissions) ? roleData.permissions : '',
    }), [roleData]);

    const dirtyForm = function (value) {
        setFormIsDirty(value)
    };

    const onChangePermission = (path: Array<string>, value: RoleRightsValue | undefined) => {
        const newPermissions = {...permissionBody};

        const permission = path.reduce((current, key) => current
            ? current.type === 'group' ? current.items[key] : current[key]
            : null, newPermissions);

        if (permission) {
            permission.mergedValue = value;
            permission.isDefault = value === undefined;
            setPermissionBody(newPermissions);
        }
    };

    useEffect(() => {
        setFormIsDirty(!_.isEqual(mergedScheme, permissionBody))
    }, [permissionBody])

    const applyChanges = function (values) {
        roleData && roleData.id && actions.saveRightChanges(roleData.id, {
            Permissions: getPermissionsFromScheme(permissionBody),
            Code: values.code,
            Name: values.name,
            ShortCode: values.shortCode,
            Description: values.description
        });
    };

    const mergeRole = useMemo(() => getRoleMergeClojure(permissionScheme), [permissionScheme]);

    const mergedScheme = useMemo(() => mergeRole(roleData ? [roleData] : []), [roleData]);

    useEffect(() => {setPermissionBody(_.cloneDeep(mergedScheme))}, [mergedScheme])

    return (
        (visible && !fetching) &&
        <div className='outer-background'>
            <div className='inner-content'>
                <button type="button" className="modal-form__close-button" onClick={closeModalForm}>Закрыть</button>
                <div className="title">
                    <h6>
                        {createAction ? 'Создание' : 'Редактирование'} прав
                    </h6>
                </div>
                <Form
                    initialValues={
                        roleFormData
                    }
                    onSubmit={values => {
                    }}
                    validate={values => {
                    }
                    }>
                    {
                        (roleForm) => (
                            <form className='right-form' onSubmit={e => {
                                e.preventDefault();
                                applyChanges(roleForm.values);
                                closeModalForm()
                            }}>
                                <div className="fields-container">
                                    <div className="left-side">
                                        <div className='right-form__field email-field'>
                                            <Field name="Code"
                                                   component={TextBox}
                                                   type="text"
                                                   placeholder="Код"
                                                   label={"Код"}
                                                   validate={validators.required}
                                                   disabled={!createAction}/>
                                        </div>
                                        <div className='right-form__field'>
                                            <Field name="Name"
                                                   component={TextBox}
                                                   type="text"
                                                   placeholder="Название"
                                                   validate={validators.required}
                                                   label={"Название"}
                                            />
                                        </div>

                                        <div className='right-form__field'>
                                            <Field name="ShortCode"
                                                   component={TextBox}
                                                   type="text"
                                                   placeholder="Краткое название"
                                                   validate={validators.required}
                                                   label={"Краткое название"}
                                                   disabled={true}
                                            />
                                        </div>

                                        <div className='right-form__field role-description'>
                                            <Field name="Description"
                                                   component={TextBox}
                                                   multiline
                                                // todo @deprecated Use `maxRows` instead. Change on v5
                                                   rowsMax={4}
                                                   type="text"
                                                   extClass={'_with-custom-scroll'}
                                                   validate={validators.required}
                                                   placeholder="Описание"
                                                   label={"Описание"}
                                            />
                                        </div>

                                        <div className='right-form__field permissions'>
                                            <Field name="Permissions"
                                                   hidden
                                                   component={TextBox}
                                                   type="text"
                                                   placeholder="Разрешения"
                                                   label={"Разрешения"}
                                            />
                                        </div>


                                    </div>
                                    <div className="right-side">
                                        <div className='right-form__field'>
                                            <Permissions scheme={permissionBody} onDirty={dirtyForm}
                                                         onChange={onChangePermission} opened={true}/>
                                        </div>
                                    </div>
                                </div>

                                <div className="action-buttons">
                                    <button type='submit'
                                            className="right-form__confirm-button orange-button big-button"
                                            disabled={(!roleForm.valid || roleForm.pristine) && !formIsDirty}>
                                        Применить
                                    </button>
                                </div>


                            </form>
                        )
                    }
                </Form>
            </div>
        </div>
    );
};

const mapState2Props = (state) => {
    return {
        roleData: selectedRightSelector(state),
        visible: rightFormOpenedSelector(state),
        isAdmin: hasAdminRights(state),
        permissionScheme: permissionSchemeSelector(state),
        fetching: fetchingSelector(state)
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            toggleRightForm,
            cleanSelectedRight,
            saveRightChanges
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(RightForm)

