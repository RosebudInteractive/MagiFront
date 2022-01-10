import React, { useMemo, useEffect} from 'react';
import { EventsData } from '@rosebud/timeline/src/types/event'
import { Picker } from './ui-kit'

type Props = {
  events: EventsData,
  onChange?: Function,
}

export default function DataPicker(props: Props): JSX.Element | null {
  const {events, onChange} = props;

  const onChangeValue = (itemValue: number) => {
    if (onChange) {
      onChange(+itemValue);
    }
  };

  useEffect(() => {
    if (events.length) {
      onChangeValue(0);
    }
  }, []);

  const options = useMemo(() => {
    return events.map(item => item.label)
  }, [events])

  return <Picker title='Набор событий' options={options} onChange={onChangeValue}/>

}
