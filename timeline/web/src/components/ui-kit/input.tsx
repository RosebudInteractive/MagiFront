import React, { useState, } from 'react';

// export type InputType = typeof INPUT_TYPES;

type Props = {
  title: string,
  type: string,
  value: string | number,
  className?: string,
  onChange: (value: string) => void,
}

export default function Input({ title, type = 'text', onChange, value, className = '' }: Props): JSX.Element {

  const [currentValue, setCurrentValue] = useState<string | number>(value);

  const nativeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChangeValue(event.target.value)
  }

  const onChangeValue = (value: string) => {
    if (value !== currentValue) {
      setCurrentValue(value);
      if (onChange) {
        onChange(value);
      }
    }
  };

  return (
    <div className='ui-container'>
      <div className='ui-container__title'>{title}</div>
      <input
        type={type}
        className={`ui-container__edit ui-container__input ${className}`}
        value={currentValue}
        onChange={nativeChange}
      />
    </div>
  )
}
