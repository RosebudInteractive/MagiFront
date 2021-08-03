import React, {useEffect, useMemo, useRef, useState} from "react";
import {Autocomplete, Select, TextBox} from "../../../ui-kit";
import {TIMELINE_TYPES_OF_USE} from "../../../../constants/timelines";
import {Field, Form, FormSpy} from "react-final-form";
import './timeline-form.sass'
import validators, {ComposeValidators} from "../../../../tools/validators";
import Uploader from "../../../../tools/uploader/uploader";

function TimelineForm(props) {
    const [isCreate, setActionCreate] = useState(true); //todo maybu finish it later
    const [image, setImage] = useState(null);
    const {data, lessons, courses} = props;
    const [typeOfUse, setTypeOfUse] = useState(1);
    const pristineFlag = useRef(true);

    const timelineFormData = useMemo(() => ({
        timeCr: (data && data.TimeCr) ? new Date(data.TimeCr).toLocaleDateString() : new Date().toLocaleDateString(),
        typeOfUse: parseInt(data && data.TypeOfUse ? data.TypeOfUse : null),
        orderNumber: (data && data.OrderNumber && data.OrderNumber === 0) ? data.OrderNumber : data.Order ? data.Order : null,
        state: (data && data.State) ? data.State : '',
        image: (data && data.Image) ? data.Image : '',
        courseId: data.CourseId,
        lessonId: data.LessonId
    }), [data]);

    useEffect(() => {
        setActionCreate(!(data.Id));
    }, [data]);


    const closeModalForm = () => {
        //todo close form action here ot not???
    };

    function setFileInfo(dataObj) {
        if (dataObj) {
            let fileInfo = JSON.parse(dataObj);
            setImage({file: fileInfo[0].file, meta: fileInfo[0].info});
        }
    }

    const handleSubmit = (timelineInfo) => {
        //todo save logic here
    };

    const _getUseTypes = () => {
        return Object.entries(TIMELINE_TYPES_OF_USE).map(type => ({id: parseInt(type[0]), name: type[1]}))
    };

    const lessonsOptions = useMemo(() => {
        return lessons && lessons.map(lesson => ({id: parseInt(lesson.Id), name: lesson.Name}));
    }, [lessons]);

    const coursesOptions = useMemo(() => {
        return courses && courses.map(course => ({id: parseInt(course.Id), name: course.Name}));
    }, [courses]);

    return <div className="timeline-form-block">
        <Form
            initialValues={
                timelineFormData
            }
            onSubmit={values => {
            }}
            validate={values => {
            }}
            subscription={{values: true, pristine: true}}
            render={({timelineForm, submitting, pristine, values, hasValidationErrors, valid}) => (
                <form className='timeline-form' onSubmit={e => {
                    e.preventDefault();
                    handleSubmit(timelineForm.values)
                }}>
                    <div className='timeline-form__field'>
                        <Field name="typeOfUse"
                               component={Select}
                               label={"Тип использования"}
                               placeholder="Тип использования"
                               options={_getUseTypes()}
                               defaultValue={data && data.TypeOfUse ? data.TypeOfUse : ''}
                               validate={validators.required}
                               disabled={false}
                               required={true}>

                        </Field>
                    </div>

                    {(lessons && typeOfUse === 2) &&
                    <div className='timeline-form__field'>
                        <Field name="lessonId"
                               component={Autocomplete}
                               label={"Лекция"}
                               placeholder="Лекция"
                               disabled={false}
                               options={lessonsOptions}
                               validate={validators.required}
                               required={true}>
                        </Field>
                    </div>
                    }

                    {(courses && typeOfUse === 1) &&
                    <div className='timeline-form__field'>
                        <Field name="courseId"
                               component={Autocomplete}
                               label={"Курс"}
                               placeholder="Курс"
                               disabled={false}
                               options={coursesOptions}
                               validate={validators.required}
                               required={true}>
                        </Field>
                    </div>
                    }

                    <div className='timeline-form__field'>
                        <Field
                            name="timeCr"
                            component={TextBox}
                            type="text"
                            placeholder="Время создания"
                            label={"Время создания"}
                            disabled={true}
                            defaultValue={data && data.TimeCr ? new Date(data.TimeCr).toLocaleDateString() : ''}
                        />
                    </div>


                    <div className='timeline-form__field file-field'>
                        <Field
                            name={"image"}
                            type={"file"}
                            component={Select}
                            label={"Фоновое изображение"}
                            placeholder={"Фоновое изображение"}
                            disabled={false}
                            defaultValue={data.Image}
                            multiple={false} upload={'/api/adm/upload'}
                        >
                            {({input, meta}) => {
                                return (

                                    <React.Fragment>
                                        <input className="file-name" type="text"
                                               defaultValue={image && image.file ? image.file.split('/')[2] : data.Image ? data.Image.split('/')[2] : ''}/>
                                        <Uploader
                                            type={"file"}
                                            label={"Фоновое изображение"}
                                            placeholder={"Фоновое изображение"}
                                            disabled={false}
                                            multiple={false}
                                            upload={'/api/adm/upload'}
                                            buttonText={'Выбрать файл'}
                                            onUploadFile={function (val) {
                                                pristineFlag.current = !!image;
                                                setFileInfo(val);

                                                input.onChange(val);
                                            }.bind(this)}
                                        />
                                    </React.Fragment>

                                )
                            }}
                        </Field>
                    </div>

                    <div className='timeline-form__field'>
                        <Field name="orderNumber"
                               component={TextBox}
                               type={"number"}
                               label={"Номер"}
                               placeholder="Номер"
                               disabled={false}
                               defaultValue={data.OrderNumber}
                               validate={ComposeValidators(validators.min.bind(validators.min, 1))}>
                        </Field>
                    </div>


                    <FormSpy subscription={{
                        formData: true,
                        formValues: true,
                        values: true,
                        pristine: true,
                        valid: true,
                        hasValidationErrors: true,
                        formValue: true,
                        submitErrors: true
                    }}
                             onChange={({values, pristine}) => {
                                 setTypeOfUse(parseInt(values.typeOfUse));
                                 let prstn;
                                 if (!isCreate) {
                                     prstn = pristine;
                                 } else {
                                     prstn = pristine || pristineFlag.current;
                                 }

                                 const valuesIs = {
                                     ...values,
                                     image: image,
                                     courseId: null,
                                     lessonId: null
                                 };


                                 if (values.typeOfUse === 1) {
                                     if (values.courseId) {
                                         valuesIs.courseId = values.courseId;
                                     }

                                     if (values.lessonId) {
                                         valuesIs.lessonId = values.lessonId;
                                     }
                                 } else {
                                     if (values.typeOfUse === 2) {
                                         if (values.lessonId) {
                                             valuesIs.lessonId = values.lessonId;
                                         }
                                     }
                                 }
                                 setTimeout(() => props.onChangeFormCallback(prstn, {values: valuesIs}), 0);
                             }}/>
                </form>)}/>
    </div>
}

export default TimelineForm;

