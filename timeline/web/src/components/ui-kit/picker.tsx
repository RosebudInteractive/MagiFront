import React, { useState, useEffect, } from 'react';

type Props = {
  title: string,
  options: string[],
  onChange: (value: number) => void,
}

export default function Picker(props: Props): JSX.Element {
  const { title, options, onChange } = props;

  const [selectedValue, setSelectedValue] = useState<number>(0);

  const nativeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeValue(event.target.selectedIndex)
  }

  const onChangeValue = (value: number) => {
    if (value >=  0) {
      setSelectedValue(+value);
      if (onChange) {
        onChange(+value);
      }
    }
  };

  return (
    <div className='ui-container'>
      <div className='ui-container__title'>{title}</div>
      <select
        className='ui-container__select'
        value={selectedValue}
        onChange={nativeChange}
      >
        {options.map((item, index) => <option label={item} value={index} key={index}/>)}
      </select>
    </div>
  )

}
