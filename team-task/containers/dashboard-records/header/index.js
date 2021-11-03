import React, {useMemo} from "react"
import {Select} from "../../../components/ui-kit";
import "./dashboard-records-header.sass"
import BackArrow from "tt-assets/svg/back-arrow.svg"
import {getCountSubsTitle, Lessons} from "tools/word-tools";

export default function DashboardRecordsHeader(props) {
    const {title, dateRange, mode, additionalInfo} = props;

    const infoString = useMemo(() => {
        return `${additionalInfo.lessonsCount} ${Lessons.getCountTitle(additionalInfo.lessonsCount)}, 
        ${additionalInfo.additionalEpisodesCount} ${getCountSubsTitle(additionalInfo.additionalEpisodesCount)}, ${additionalInfo.allCount} всего`
    }, [additionalInfo])

    return <div className="dashboard-header">
        <div className="dashboard-back-arrow" onClick={props.onBack}>
            <BackArrow/>
        </div>
        <div className="dashboard-header-field-name">
            <div>
                <h6>{title} {dateRange} </h6>
                <p>{infoString}</p>
            </div>



            <div className="view-mode">
                <Select value={mode}
                        onChange={(val) => {
                            props.onChangeMode(val.target.value)
                        }}
                        options={[{name: 'Неделя', id: 0},
                                    {name: 'День', id: 1},
                                    {name: 'Компактный', id: 2}]}
                        placeholder="Режим отображения"
                        label={"Режим отображения"}
                        required={true}
                />
            </div>
        </div>
    </div>
}
