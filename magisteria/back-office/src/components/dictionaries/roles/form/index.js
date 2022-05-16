import React, {useEffect, useMemo, useState} from "react";
import {Field, Form} from "react-final-form";
import "./form.sass"
import "../../editor-form.sass"
import {TextBox} from '../../../ui-kit'
import {
    cleanSelectedRight,
    permissionSchemeSelector,
    saveRightChanges,
    saveNewRight,
    currentRightsSelector,
} from "tt-ducks/access-rights-dictionary";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import Permissions from "../../../permission-tree";
import validators from "../../../../tools/validators"
import {getPermissionsFromScheme, getRoleMergeClojure} from "../../../../tools/permission-functions";
import {fetchingSelector} from "tt-ducks/access-rights-dictionary";

const RightForm = (props) => {
    const [createAction, setActionCreate] = useState(true);
    const {roleData, actions, permissionScheme, fetching} = props;

    const [formIsDirty, setFormIsDirty] = useState(false);
    const [permissionBody, setPermissionBody] = useState(null);

    useEffect(() => {
        console.log('setActionCreate' + JSON.stringify(roleData));
        setActionCreate(!(roleData && roleData.id));
    }, [roleData]);

    const closeModalForm = () => {
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

    const onChangePermission = (path, value = RoleRightsValue || undefined) => {
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
        const newRight = {...values};
        newRight.Permissions = getPermissionsFromScheme(permissionBody);
        newRight.Id = roleData.id;
        if (createAction){
            actions.saveNewRight(newRight);
        } else             
            actions.saveRightChanges(roleData.id, newRight);
    };

    const mergeRole = useMemo(() => getRoleMergeClojure(permissionScheme), [permissionScheme]);

    const mergedScheme = useMemo(() => mergeRole(roleData ? [roleData] : []), [roleData]);

    console.log(`*roleData: ${JSON.stringify(roleData)}`);

    useEffect(() => {setPermissionBody(_.cloneDeep(mergedScheme))}, [mergedScheme])

    return (
        (permissionBody &&  (!fetching)) &&
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
                            <form className='editor-form right-form' onSubmit={e => {
                                e.preventDefault();
                                applyChanges(roleForm.values);
                                closeModalForm()
                            }}>
                                <div className="editor-form__two-pane-container fields-container">
                                    <div className="left-pane with-fields-column">
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
                                                   disabled={false}
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
                                    <div className="right-pane">
                                        <Permissions scheme={permissionBody} onDirty={dirtyForm}
                                                     onChange={onChangePermission} opened={true}/>
                                    </div>
                                </div>

                                <div className="editor-form__action-buttons">
                                    <button type='submit'
                                            className="right-form__confirm-button orange-button big-button"
                                            disabled={!roleForm.valid && !formIsDirty}>
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
        roleData: currentRightsSelector(state),
        permissionScheme: permissionSchemeSelector(state),
        fetching: fetchingSelector(state)
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            cleanSelectedRight,
            saveNewRight,
            saveRightChanges
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(RightForm)

