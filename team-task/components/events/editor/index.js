import React, {useEffect, useMemo, useState} from "react";
import {TIMELINE_TYPES_OF_USE} from "../../../constants/timelines";
import {Field, Form, FormSpy} from "react-final-form";
import {Select, TextBox} from "../../ui-kit";
import validators, {ComposeValidators} from "../../../tools/validators";
import Uploader from "../../../tools/uploader/uploader";

const [createAction, setActionCreate] = useState(true); //finish it later
const [image, setImage] = useState(null);
const {data, lessons, courses} = props;

const timelineFormData = useMemo(() => ({
    name: (data && data.Name) ? data.Name : '',
    timeCr: (data && data.TimeCr) ? new Date(data.TimeCr).toLocaleDateString() : new Date().toLocaleDateString(),
    typeOfUse: (data && data.TypeOfUse) ? data.TypeOfUse : '',
    orderNumber: (data && data.OrderNumber && data.OrderNumber === 0) ? data.OrderNumber : '',
    state: (data && data.State) ? data.State : '',
    role: (data && data.Role) ? data.Role : '',
    image: (data && data.Image) ? data.Image : '',
    courseId: data.CourseId,
    lessonId: data.LessonId
}), [data]);

useEffect(() => {
    setActionCreate(!(data));
}, [data]);

const closeModalForm = () => {
    //todo close form action here

    // actions.toggleUserForm(false);
    // actions.cleanSelectedUser();
    // props.history.push(`/dictionaries/users`);
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
    return Object.entries(TIMELINE_TYPES_OF_USE).map(type => ({id: type[0], name: type[1]}))
};

const lessonsOptions = useMemo(() => {
    return lessons && lessons.map(lesson => ({id: lesson.Id, name: lesson.Name}));
}, [lessons]);

const coursesOptions = useMemo(() => {
    return courses && courses.map(course => ({id: course.Id, name: course.Name}));
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
        render={({timelineForm, submitting, pristine, values}) => (
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
                           disabled={true}>
                    </Field>
                </div>

                {(lessons && values.typeOfUse === 2) &&
                <div className='timeline-form__field'>
                    <Field name="lessonId"
                           component={Select}
                           label={"Лекция"}
                           placeholder="Лекция"
                           disabled={false}
                           options={lessonsOptions}
                           validate={validators.required}
                    >
                    </Field>
                </div>
                }

                {(courses && values.typeOfUse === 1) &&
                <div className='timeline-form__field'>
                    <Field name="lessonId"
                           component={Select}
                           label={"Курс"}
                           placeholder="Курс"
                           disabled={false}
                           options={coursesOptions}
                           validate={validators.required}>
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
                        multiple={false} upload={'/api/adm/upload'}>
                        {({input, meta}) => {
                            return (

                                <React.Fragment>
                                    <input className="file-name" type="text"
                                           defaultValue={image && image.file ? image.file.split('/')[2] : ''}/>
                                    <Uploader
                                        type={"file"}
                                        label={"Фоновое изображение"}
                                        placeholder={"Фоновое изображение"}
                                        disabled={false}
                                        multiple={false}
                                        upload={'/api/adm/upload'}
                                        buttonText={'Выбрать файл'}
                                        onUploadFile={function (val) {
                                            setFileInfo(val);
                                            input.onChange(val)
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
                           label={"Порядковый номер"}
                           placeholder="Порядковый номер"
                           disabled={false}
                           defaultValue={data.OrderNumber}
                           validate={ComposeValidators(validators.required, validators.min.bind(validators.min, 1))}>
                    </Field>
                </div>


                <FormSpy subscription={{values: true, pristine: true}}
                         onChange={({pristine, values}) => {
                             const valuesIs = {
                                 ...values,
                                 image: image
                             };
                             setTimeout(() => props.onChangeFormCallback(pristine, {values: valuesIs}), 0);
                         }}/>
            </form>)}/>
</div>
