import { Dropdown, InputPicker } from 'rsuite';
import React, { useMemo } from 'react';
function isArray(data) {
    return Array.isArray(data);
}
export default function Item({ permission, readonly, onChange, path, }) {
    const itemStyle = {
        padding: 0,
    };
    const inputStyle = {
        pointerEvents: readonly ? 'none' : 'auto',
        color: 'orange',
    };
    const mappedData = useMemo(() => (permission.values
        ? Object.entries(permission.values).map(([key, value]) => ({ value: key, label: value }))
        : []), [permission]);
    const valueClassName = permission.isDefault ? 'grey' : 'black';
    const cleanable = !readonly && !permission.isDefault;
    const key = path.join('-');
    const handleChange = (value, e) => {
        e.persist();
        const newValue = value === null ? undefined : parseInt(value, 10);
        onChange(path, newValue);
    };
    const inputValue = permission.isDefault
        ? permission.default.toString()
        : permission.mergedValue !== undefined && permission.mergedValue.toString();
    return (<Dropdown.Item style={itemStyle} key={key} eventKey={key}>
      <div className="permission-item">
        <div className="permission-title">{permission.title}</div>
        <div className="permission-value">
          <InputPicker menuClassName="permission-tree__menu-options" style={inputStyle} size="s" 
    // menuStyle={{ fontSize: '12px', color: 'orange !important' }}
    cleanable={cleanable} data={mappedData} renderValue={(value, item) => (<div className={`selected-option ${valueClassName}`}>
                {item && !isArray(item) ? item.label : ''}
              </div>)} value={inputValue} onChange={handleChange} defaultValue={permission.default}/>
        </div>
      </div>

    </Dropdown.Item>);
}
Item.defaultProps = {
    readonly: false,
};
