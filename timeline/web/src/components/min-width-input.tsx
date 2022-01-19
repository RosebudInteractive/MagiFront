import React from 'react';
import { Input } from "./ui-kit";

type Props = {
  value: number,
  onChange?: (value: number) => void;
}

export default function MinWidthInput(props: Props): JSX.Element {
  const { value, onChange } = props;

  const changeHandler = (newValue: string) => {
    if (value !== +newValue) {
      if (onChange) {
        onChange(+newValue);
      }
    }
  };

  return <Input className={'min-width-input'} title={'Мин.ширина'} type={'number'} value={value} onChange={changeHandler}/>
}
