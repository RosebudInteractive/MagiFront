const convertEvents = (events) => (events ? events.map((item) => {
    const dataItem = {
        id: item.Id ? item.Id : item.id,
        year: +item.Year,
        name: item.Name,
        color: item.color ? item.color : '#FFFFFF',
    };
    if (item.ShortName)
        dataItem.shortName = item.ShortName;
    if (item.Description)
        dataItem.description = item.Description;
    if (item.Day)
        dataItem.day = +item.Day;
    if (item.Month)
        dataItem.month = +item.Month;
    return dataItem;
}) : []);
const convertPeriods = (periods) => (periods
    ? periods.map((item) => {
        const dataItem = {
            id: item.Id ? item.Id : item.id,
            startYear: +item.LbYear,
            endYear: +item.RbYear,
            name: item.Name,
            color: item.color ? item.color : '#FFFFFF',
        };
        if (item.ShortName)
            dataItem.shortName = item.ShortName;
        if (item.Description)
            dataItem.description = item.Description;
        if (item.LbDay)
            dataItem.startDay = +item.LbDay;
        if (item.LbMonth)
            dataItem.startMonth = +item.LbMonth;
        if (item.RbDay)
            dataItem.endDay = +item.RbDay;
        if (item.RbMonth)
            dataItem.endMonth = +item.RbMonth;
        return dataItem;
    }) : []);
export default function convertData(data) {
    const { Events, Periods } = data;
    return {
        Events: convertEvents(Events),
        Periods: convertPeriods(Periods),
    };
}
