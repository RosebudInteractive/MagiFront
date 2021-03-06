import React, {useEffect, useMemo,} from "react";
import {Autocomplete, Checkbox, Select, TextBox, TitleTextBox} from "../../ui-kit";
import {TIMELINE_STATE} from "../../../constants/states";
import './timeline-editor-header.sass'
import './timeline-form.sass'
import {Field, getFormValues, reduxForm} from "redux-form";
import {TIMELINE_TYPES_OF_USE} from "../../../constants/timelines";
import {compose} from "redux";
import {connect} from "react-redux";
import CoverUploader from "./cover-uploader";
import copyToClipboard from "../../../containers/timelines/editor/copy-to-clipboard";

export const EDITOR_NAME = "TIMELINE_EDITOR_HEADER"

type Props = {
    timeline: any,
    lessons: Array,
    courses: Array,
    onSave: Function
}

function TimelineHeader(props: Props) {
    const {timeline, lessons, courses, onSave, invalid, dirty, editorValues, onLevelsChanged, onMinLineWidthChanged} = props

    useEffect(() => {
        if (timeline) {
            const _initValues = {
                ...timeline,
                TypeOfUse: parseInt(timeline.TypeOfUse ? timeline.TypeOfUse : null),
                Image: {
                    file: timeline.Image,
                    meta: timeline.ImageMeta,
                },
                Order: timeline.Order ? +timeline.Order : null,
                EventLevel: timeline.EventLevel ? timeline.EventLevel : null,
                PeriodLevel: timeline.PeriodLevel ? timeline.PeriodLevel : null,
                PeriodsOverAxis: timeline.PeriodsOverAxis ? timeline.PeriodsOverAxis : null,
                MinLineWidth: timeline.MinLineWidth ? timeline.MinLineWidth : 1000
            };

            props.initialize(_initValues)
        }
    }, [timeline]);

    const _getUseTypes = () => {
        return Object.entries(TIMELINE_TYPES_OF_USE).map(type => ({id: parseInt(type[0]), name: type[1]}))
    };

    const lessonsOptions = useMemo(() => {
        return lessons && lessons.map(lesson => ({id: parseInt(lesson.Id), name: lesson.Name}));
    }, [lessons]);

    const coursesOptions = useMemo(() => {
        return courses && courses.map(course => ({id: parseInt(course.Id), name: course.Name}));
    }, [courses]);

    const _state = useMemo(() => {
        const result = Object.values(TIMELINE_STATE).find(item => item.value === timeline.State);
        return result ? result : {label: "????????????", css: "_error"}
    }, [timeline]);

    const _onSaveClick = () => {
        onSave(editorValues)
    }

    const copyTimeline = () => {
        if (!!timeline) copyToClipboard(JSON.stringify(timeline))
    }

    return <form className="timeline-editor-header__form" onSubmit={e => e.preventDefault()}>
        <div className="timeline-editor-header">
            <div className='timeline-editor__field-name'>
                <Field name="Name" component={TitleTextBox} label={"???????????????? ??????????????????"}
                       placeholder="???????????????? ??????????????????" extClass="_grey100 page-title"/>
            </div>
            <div className={"header__timeline-state font-body-s " + _state.css}>{_state.label}</div>
            <button className='timeline-editor-header__copy-button grey-button big-button' onClick={copyTimeline}>Copy
                to clipboard
            </button>
            <button className="timeline-editor-header__save-button orange-button big-button"
                    disabled={invalid || !dirty}
                    onClick={_onSaveClick}>
                ??????????????????
            </button>
        </div>
        <div className="timeline-form-block">
            <div className="timeline-form">
                <Field name="TypeOfUse" component={Select} label={"?????? ??????????????????????????"} placeholder="?????? ??????????????????????????"
                       options={_getUseTypes()} required={true}/>
                {
                    (lessons && editorValues && editorValues.TypeOfUse === 2) &&
                    <Field name="LessonId" component={Autocomplete} label={"????????????"} placeholder="????????????"
                           options={lessonsOptions} required={true}/>
                }
                {
                    (courses && editorValues && editorValues.TypeOfUse === 1) &&
                    <Field name="CourseId" component={Autocomplete} label={"????????"} placeholder="????????"
                           options={coursesOptions} required={true}/>
                }
                <Field name="Order" component={TextBox} type={"number"} label={"??????????"} placeholder="??????????"/>

                <Field name="Image" component={CoverUploader}/>

                <div className={'timeline-form-options'}>
                    <Field name="EventLevel"
                           inputProps={{min: 0}}
                           required={false}
                           minValue={0}
                           component={TextBox}
                           type={"number"}
                           label={"???????????? ??????????????"}
                           placeholder="???????????? ??????????????"
                           onChange={(val) => {
                               val.target.value.length > 0 && val.target.value >= 0 && onLevelsChanged({events: +val.target.value})
                           }}/>
                    <Field name="PeriodLevel"
                           inputProps={{min: 0}}
                           required={false}
                           minValue={0}
                           component={TextBox}
                           type={"number"}
                           label={"???????????? ????????????????"}
                           placeholder="???????????? ????????????????"
                           onChange={(val) => {
                               val.target.value.length > 0 && val.target.value >= 0 && onLevelsChanged({periods: +val.target.value});
                           }}/>

                    <Field name="MinLineWidth"
                           inputProps={{min: 500}}
                           required={false}
                           minValue={500}
                           component={TextBox}
                           type={"number"}
                           label={"??????.????????????"}
                           placeholder="??????.????????????"
                           onChange={(val) => {
                               val.target.value.length > 0 && val.target.value >= 0 && onMinLineWidthChanged( +val.target.value);
                           }}/>
                    <Field name="PeriodsOverAxis" component={Checkbox} label={"?????????????? ?????? ????????"}
                           placeholder="???????????????????? ?????????????? ?????? ????????"/>
                </div>


            </div>
        </div>
    </form>
}


const validate = (values) => {
    const errors = {}

    if (!values.Name) {
        errors.Name = "???????????????????????? ????????"
    }

    if ((values.TypeOfUse === 1) && (!values.CourseId)) {
        errors.CourseId = "???????????????????????? ????????"
    }

    if ((values.TypeOfUse === 2) && (!values.LessonId)) {
        errors.LessonId = "???????????????????????? ????????"
    }

    if ((values.Order !== null) && (values.Order < 1)) {
        errors.Order = "???????????? 0"
    }

    if ((values.EventLevel !== null) && (+values.EventLevel < 0)) {
        errors.EventLevel = "???? 0"
    }

    if ((values.PeriodLevel !== null) && (+values.PeriodLevel < 0)) {
        errors.PeriodLevel = "???? 0"
    }

    return errors
};

const mapState2Props = (state) => {
    return {
        editorValues: getFormValues(EDITOR_NAME)(state),
    }
}

const enhance = compose(
    reduxForm({form: EDITOR_NAME, validate}),
    connect(mapState2Props,)
)

export default enhance(TimelineHeader)
