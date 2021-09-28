import React from "react"
import {Select} from "../../../components/ui-kit";
import "./dashboard-records-header.sass"
import BackArrow from "tt-assets/svg/back-arrow.svg"
import {Field, Form, FormSpy} from "react-final-form";

//todo change to Select instead of Form

export default function DashboardRecordsHeader(props) {
    const {title} = props;

    return <div className="dashboard-header">
        <div className="dashboard-back-arrow" onClick={props.onBack}>
            <BackArrow/>
        </div>
        <div className="dashboard-header-field-name">
            <h6>{title}</h6>


            {/*<Select value={value} todo use it instead of form!*/}
            {/*        label={'Дата публикации'}*/}
            {/*        onChange={onChange}/>*/}

            <Form
                initialValues={{mode: '0'}}
                onSubmit={values => {}}
                validate={values => {}}
                subscription={{values: true, pristine: true}}
                render={({searchForm, submitting, pristine, values}) => (
                    <form onSubmit={e => {
                        e.preventDefault();
                    }}>
                        <div className='view-mode'>
                            <Field name="mode"
                                   component={Select}
                                   placeholder="Режим отображения"
                                   label={"Режим отображения"}
                                   required={true}
                                   onChange = {(val) => props.onChangeMode(val)}
                                   options={[{name: 'Неделя', id: 0},
                                       {name: 'День', id: 1},
                                       {name: 'Компактный', id: 2}]}
                                   disabled={false}
                                />
                        </div>

                        <FormSpy subscription={{values: true, pristine: true, errors: true}}
                                 onChange={({values, pristine, formValue, errors}) => {
                                    props.onChangeMode(values.mode)
                                 }}/>
                    </form>)}/>
        </div>
    </div>
}
