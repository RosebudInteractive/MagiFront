import { Event } from '../types/event';
import { Period } from '../types/period';
import { References } from '../types/references';

declare interface InputTimelineData {
  Events: any[],
  Periods: any[],
  References: References,
}

type TimelineData = {
  Events: Event.DataItem[],
  Periods: Period.DataItem[]
  Refs: References,
};

const convertEvents = (events: any[]): Event.DataItem[] | [] => (events ? events.map((item) => {
  const dataItem: Event.DataItem = {
    id: item.Id ? item.Id : item.id,
    year: +item.Year,
    name: item.Name,
    color: item.color ? item.color : '#FFFFFF',
  };

  if (item.ShortName) dataItem.shortName = item.ShortName;
  if (item.Description) dataItem.description = item.Description;
  if (item.Day) dataItem.day = +item.Day;
  if (item.Month) dataItem.month = +item.Month;

  return dataItem;
}) : []);

const convertPeriods = (periods: any[]): Period.DataItem[] | [] => (periods
  ? periods.map((item) => {
    const dataItem: Period.DataItem = {
      id: item.Id ? item.Id : item.id,
      startYear: +item.LbYear,
      endYear: +item.RbYear,
      name: item.Name,
      color: item.color ? item.color : '#FFFFFF',
    };

    if (item.ShortName) dataItem.shortName = item.ShortName;
    if (item.Description) dataItem.description = item.Description;
    if (item.LbDay) dataItem.startDay = +item.LbDay;
    if (item.LbMonth) dataItem.startMonth = +item.LbMonth;
    if (item.RbDay) dataItem.endDay = +item.RbDay;
    if (item.RbMonth) dataItem.endMonth = +item.RbMonth;

    return dataItem;
  }) : []);

const convertReferences = (r: References)=>{
  return {};
};

export default function convertData(data: InputTimelineData): TimelineData {
  const { Events, Periods, References } = data;
  return {
    Events: convertEvents(Events),
    Periods: convertPeriods(Periods),
    Refs: convertReferences(References),
  };
}
