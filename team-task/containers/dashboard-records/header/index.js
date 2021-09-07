import React from "react"
import {Select} from "../../../components/ui-kit";
import "./dashboard-records-header.sass"
import BackArrow from "tt-assets/svg/back-arrow.svg"
import {Field, Form, FormSpy} from "react-final-form";


export default function DashboardRecordsHeader(props) {
    const {title} = props;

    // const VIEW_MODES = {
    //
    // }


    return <div className="dashboard-header">
        <div className="dashboard-back-arrow" onClick={props.onBack}>
            <BackArrow/>
        </div>
        <div className="dashboard-header-field-name">
            <h6>{title}</h6>
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
                                     console.log('values', values);
                                    props.onChangeMode(values.mode)
                                 }}/>
                    </form>)}/>

            {/*<Field component={TitleTextBox} disable={true} name={"Name"} label={title} extClass="_grey100 page-title"/>*/}
        </div>
    </div>
}
