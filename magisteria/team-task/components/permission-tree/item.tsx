import { Dropdown, InputPicker } from 'rsuite';
import React, { SyntheticEvent, useMemo } from 'react';
import { ItemDataType } from 'rsuite/lib/@types/common';
import { MergedItem, RoleRightsValue } from '../../@types/permissions';

interface ItemProps {
  permission: MergedItem;
  readonly?: boolean;
  onChange: (path: Array<string>, value: RoleRightsValue | undefined) => void;
  path: Array<string>
}

type PickerOptions = Array<ItemDataType>;
type ItemClassName = 'black' | 'grey';

function isArray(data: ItemDataType | ItemDataType[]): data is ItemDataType[] {
  return Array.isArray(data);
}

export default function Item({
  permission, readonly, onChange, path,
}: ItemProps): JSX.Element {
  const itemStyle: React.CSSProperties = {
    padding: 0,
  };

  const inputStyle: React.CSSProperties = {
    pointerEvents: readonly ? 'none' : 'auto',
    color: 'orange',
  };

  const mappedData = useMemo<PickerOptions>(() => (permission.values
    ? Object.entries(permission.values).map(([key, value]) => ({ value: key, label: value }))
    : []), [permission]);

  const valueClassName: ItemClassName = permission.isDefault ? 'grey' : 'black';

  const cleanable = !readonly && !permission.isDefault;

  const key = path.join('-');

  const handleChange = (value: string, e: SyntheticEvent) => {
    e.persist();
    const newValue = value === null ? undefined : parseInt(value, 10);
    onChange(path, newValue);
  };

  const inputValue = permission.isDefault
    ? permission.default.toString()
    : permission.mergedValue !== undefined && permission.mergedValue.toString();

  return (
    <Dropdown.Item style={itemStyle} key={key} eventKey={key}>
      <div className="permission-item">
        <div className="permission-title">{permission.title}</div>
        <div className="permission-value">
          <InputPicker
            menuClassName="permission-tree__menu-options"
            style={inputStyle}
            size="s"
            // menuStyle={{ fontSize: '12px', color: 'orange !important' }}
            cleanable={cleanable}
            data={mappedData}
            renderValue={(value, item) => (
              <div
                className={`selected-option ${valueClassName}`}
              >
                { item && !isArray(item) ? item.label : ''}
              </div>
            )}
            value={inputValue}
            onChange={handleChange}
            defaultValue={permission.default}
          />
        </div>
      </div>

    </Dropdown.Item>
  );
}

Item.defaultProps = {
  readonly: false,
};
