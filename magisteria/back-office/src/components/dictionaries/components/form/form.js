import React, {useEffect, useMemo, useState} from "react";
import {Field, Form} from "react-final-form";
import "./form.sass"
import {Select, TextBox} from '../../../ui-kit'
import {
    cleanSelectedComponent,
    componentFormOpenedSelector,
    getComponents,
    saveComponentChanges,
    selectedComponentSelector,
    toggleComponentForm
} from "tt-ducks/components-dictionary";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {componentOwnersSelector} from "tt-ducks/dictionary";

const ComponentForm = (props) => {
    const [createAction, setActionCreate] = useState(true);
    const { componentData, visible, actions, componentOwners} = props;

    useEffect(()=>{
        setActionCreate(!(componentData && componentData.Id));
    }, [componentData]);

    const closeModalForm = () => {
        actions.toggleComponentForm(false);
        actions.cleanSelectedComponent();
        props.history.push(`/dictionaries/components`);
    };

    const responsibles = useMemo(() => {
        if(componentOwners.length > 0 && componentOwners.some(sup => sup.hasOwnProperty('Id'))){
            return componentOwners.map(sup => ({id: sup.Id, name: sup.DisplayName}))
        }
    }, [componentOwners]);

    const handleSubmit = (componentInfo) => {
        const newComponentData = {...componentData,
            SupervisorId: componentInfo.supervisorId,
            Name: componentInfo.name,
            };
        if(createAction){
            //create new component logic
        } else {
            actions.saveComponentChanges(componentData.Id, newComponentData);
            actions.getComponents();
        }

        closeModalForm()
    };

    const componentFormData = useMemo(() => ({
        name: (componentData && componentData.Name) ? componentData.Name : '',
        supervisorId: (componentData && componentData.SupervisorId) ? componentData.SupervisorId : '',
        structName: (componentData && componentData.StructName) ? componentData.StructName : ''
    }), [componentData]);

    return (
        (visible && (componentOwners && componentOwners.length > 0)) &&
        <div className='outer-background components__editor-form'>
            <div className='inner-content'>
                <button type="button" className="modal-form__close-button" onClick={closeModalForm}>??????????????</button>
                <div className="title">
                    <h6>
                        {createAction ? '????????????????' : '????????????????????????????'} ????????????????????
                    </h6>
                </div>
                < Form
                    initialValues={
                        componentFormData
                    }
                     onSubmit={values => {
                     }}
                    validate={values => {
                    }
                    }>
                    {
                        (componentForm) => (
                            <form className='component-form' onSubmit={e => {e.preventDefault(); handleSubmit(componentForm.values)}}>
                                <div className='component-form__field email-field'>
                                        <Field
                                            name="name"
                                            component={TextBox}
                                            type="text"
                                            placeholder="?????? ????????????????????"
                                            label={"?????? ????????????????????"}
                                            disabled={true}
                                        />
                                </div>
                                <div className='component-form__field'>
                                    <Field
                                        name="supervisorId"
                                        component={Select}
                                        placeholder="??????????????????????????"
                                        label={"??????????????????????????"}
                                        options = {responsibles}
                                        defaultValue={componentData && componentData.SupervisorId ? componentData.SupervisorId : ''}
                                        multiple={false}
                                        />
                                </div>
                                <div className='component-form__field'>
                                    <Field name="structName"
                                           component={TextBox}
                                           label={"?????????????????? ??????????????"}
                                           placeholder="?????????????????? ??????????????"
                                           disabled={true}>
                                    </Field>
                                </div>

                                <button type='submit' className="component-form__confirm-button orange-button big-button" disabled={!componentForm.valid || componentForm.pristine}>
                                   ??????????????????
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
        componentData: selectedComponentSelector(state),
        visible: componentFormOpenedSelector(state),
        componentOwners: componentOwnersSelector(state)
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            toggleComponentForm,
            cleanSelectedComponent,
            saveComponentChanges,
            getComponents
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(ComponentForm)

