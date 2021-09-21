import {DateRangePicker} from "rsuite";
import React, {useMemo} from "react";
import {addDays, addMonths} from 'date-fns'

export default function DateRangeField(props) {
    const {placeholder, name, value, onClean, onChange} = props;

    const renderProps = useMemo(() => {
        const result = {
            placeholder,
            searchable: false,
            defaultCalendarValue: [new Date(), new Date()],
            ranges: [{
                label: 'Неделя',
                value: [new Date(), addDays(new Date(), 6)]
            }, {
                label: 'Месяц',
                value: [new Date(), addMonths(new Date(), 1)]
            }, {
                label: '3 месяца',
                value: [new Date(), addMonths(new Date(), 3)]
            }],
            onChange: (value) => {
                onChange({field: name, value})
            },
            onClean: () => {
                if (onClean) onClean(name)
            }
        };

        const hasValue = props.value && Array.isArray(props.value);
        if (hasValue) result.value = value;

        return result
    }, [props]);


    return <DateRangePicker className="filter-row__field-input _autocomplete" {...renderProps} />
}
