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
import Permissions from "./permissions";
import validators from "../../../../tools/validators"
import rightsMerger from "../rights-merger";

const RightForm = (props) => {
    const [createAction, setActionCreate] = useState(true);
    const {roleData, visible, actions, isAdmin, permissionScheme} = props;

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
        Code: (roleData && roleData.Code) ? roleData.Code : '',
        Name: (roleData && roleData.Name) ? roleData.Name : '',
        ShortCode: (roleData && roleData.ShortCode) ? roleData.ShortCode : '',
        Description: (roleData && roleData.Description) ? roleData.Description : '',
        Permissions: (roleData && roleData.Permissions) ? roleData.Permissions : '',
    }), [roleData]);

    const dirtyForm = function (value) {
       setFormIsDirty(value)
    };

    const changePermissions = function (value, pItem) {

        rightsMerger.logIt();

        const permissionObject = {
            ...permissionBody ? permissionBody : {},
            [`${pItem.parentCode}`]: {
                ...permissionBody ? permissionBody[`${pItem.parentCode}`] : {},
                [`${pItem.permissionCode}`]: value
            }
        };

        if(value === pItem.default){
            delete permissionObject[pItem.parentCode][pItem.permissionCode];
        }

        setPermissionBody(permissionObject);
    };

    const applyChanges = function (values) {
        roleData && roleData.Id && actions.saveRightChanges(roleData.Id, {
            Permissions: permissionBody,
            Code: values.Code,
            Name: values.Name,
            ShortCode: values.ShortCode,
            Description: values.Description
        });
    };

    const permissionSchemeLinear = useMemo(() => {
        rightsMerger.init(permissionScheme);

        return rightsMerger.getMergedLinearStructure(roleData);
    }, [permissionScheme, roleData]);

    return (
        visible &&
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
                                        />
                                    </div>

                                    <div className='right-form__field'>
                                        <Field name="Description"
                                               component={TextBox}
                                               type="text"
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
                                        <Permissions permissionScheme={permissionSchemeLinear} onDirty={dirtyForm} onChangeCb = {changePermissions}/>
                                    </div>
                                </div>

                                <button type='submit'
                                        className="right-form__confirm-button orange-button big-button"
                                        disabled={(!roleForm.valid || roleForm.pristine) && !formIsDirty} >
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
        roleData: selectedRightSelector(state),
        visible: rightFormOpenedSelector(state),
        isAdmin: hasAdminRights(state),
        permissionScheme: permissionSchemeSelector(state)
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

