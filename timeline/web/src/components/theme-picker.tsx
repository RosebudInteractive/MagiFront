import React, { useEffect, useMemo } from 'react';
import { Themes } from '@rosebud/timeline/src';
import { Picker } from "./ui-kit";

type Props = {
  onChange?: Function,
}

export default function ThemePicker(props: Props): JSX.Element {

  const onChange = (itemValue: number) => {
    if (props.onChange) {
      props.onChange(+itemValue);
    }
  };

  useEffect(() => {
    if (Themes.themes.length) {
      onChange(0);
    }
  }, []);

  const options = useMemo(() => {
    return Themes.themes.map(item => item.title)
  }, [])

  return <Picker title={'Тема'} options={options} onChange={onChange}/>
}
