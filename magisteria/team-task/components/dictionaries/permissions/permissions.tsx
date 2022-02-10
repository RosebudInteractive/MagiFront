import React, { useMemo, useState } from 'react';
import './permissions.sass';
import {
  Dropdown, InputPicker, Nav, Sidenav,
} from 'rsuite';
import {
  SchemeGroup, SchemeItem, MergedItem, MergedScheme, MergedGroup,
} from '../../../@types/permissions';

interface PermissionsProps {
  scheme: MergedScheme;
  onDirty: (value: boolean) => void;
  onChangeCb: Function;
  readOnly: boolean;
}

type ItemClassName = 'black' | 'grey';

interface RenderedSchemeData {
  keys: Array<string>;
  elements: Array<JSX.Element>;
}

export default function PermissionsTree({
  scheme,
  onDirty,
  onChangeCb,
  readOnly,
} : PermissionsProps): JSX.Element {
  const [values, setValues] = useState(new Map());

  const onChange = (value: any, pItem: any, ev: any) => {
    ev.persist();

    const isClean: boolean = ev.target.classList.contains('rs-picker-toggle-clean');

    const pVals = new Map(values);
    const newVal = value !== null ? value : pItem.default;

    let valType = 1;

    if (isClean) {
      if (value === null) {
        valType = 0;
      }
    } else {
      valType = 1;
    }

    if (newVal === pItem.value && !isClean) {
      pVals.set(pItem.permissionCode, { value: newVal, type: valType });

      pVals.set(pItem.permissionCode, { value: newVal, type: valType });
    } else {
      // 0 - default(grey), 1(black) - set by hand
      pVals.set(pItem.permissionCode, { value: newVal, type: valType });
    }

    if (onChangeCb) onChangeCb(newVal, pItem, valType);

    if (pVals.size === 0) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      onDirty && onDirty(false);
    } else if (value !== pItem.value) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      onDirty && onDirty(true);
    } else if (pItem.fromScheme && !values.has(pItem.permissionCode)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      onDirty && onDirty(true);
    }

    setValues(pVals);
  };

  const cleanable = (permissionItem: any) => {
    if (readOnly) {
      return false;
    }

    return values.has(permissionItem.permissionCode)
      ? values.get(permissionItem.permissionCode).type !== 0
      : (permissionItem.default !== permissionItem.value
        || (!permissionItem.fromScheme && permissionItem.default === permissionItem.value));
  };

  const dropdownStyles: React.CSSProperties = {
    background: 'white',
    borderRadius: '8px',
    border: '1px #d2d2d6 solid',
    height: 'auto',
    justifyContent: 'center',
    transition: 'height .8s ease .5s',
    minWidth: '298px',
    // pointerEvents: readOnly ? 'none' : 'auto',
  };

  const dropdownTitle = (title: string) => <div className="title-drop-d">{title}</div>;

  const getClassName = (item: MergedItem): ItemClassName => (item.isDefault ? 'grey' : 'black');

  const renderItem = (item: MergedItem): JSX.Element => (
    <div className="permission-item">
      {item.title}
    </div>
  );

  const renderGroup = (group: MergedGroup, key: string): JSX.Element => (
    <Dropdown
      style={dropdownStyles}
      key={group.alias}
      eventKey={key}
      title={dropdownTitle(group.title)}
    >
      {
        Object.entries(group.items).map(([subkey, item]) => (item.type === 'group'
          ? renderGroup(item as MergedGroup, subkey)
          : renderItem(item as MergedItem)))
      }
    </Dropdown>
  );

  const renderScheme = useMemo<RenderedSchemeData>(() => ({
    keys: Object.keys(scheme),
    elements: Object.entries(scheme).map(([key, group]) => renderGroup(group, key)),
  }), [scheme]);

  const getItems = (items: Array<SchemeGroup | SchemeItem>, index: number) => items
    .map((permissionItem, inx) => (
    // eslint-disable-next-line react/no-array-index-key
      <Dropdown.Item style={{ padding: 0 }} key={inx} eventKey={`${index}-${inx}`}>
        <div className="permission-item">
          <div className="permission-title">{permissionItem.title}</div>
          <div className="permission-value">
            <InputPicker
              menuClassName="permission-menu-options"
              style={{
                pointerEvents: readOnly ? 'none' : 'auto',
                color: 'orange',
              }}
              size="xs"
              menuStyle={{ fontSize: '12px', color: 'orange !important' }}
              cleanable={cleanable(permissionItem, values.get(permissionItem.permissionCode))}
              data={permissionItem.values}
              renderValue={(v, i) => (
                <div
                  className={`selected-option ${getClassName(permissionItem, v)}`}
                >
                  {i.label}
                </div>
              )}
              value={values.has(permissionItem.permissionCode)
                ? values.get(permissionItem.permissionCode).value
                : permissionItem.value}
              onChange={(val, ev) => onChange(val, permissionItem, ev)}
              defaultValue={permissionItem.value}
            />
          </div>
        </div>

      </Dropdown.Item>
    ));

  return (
    // <Sidenav defaultOpenKeys={['1', '2', '3', '4']}>
    <Sidenav defaultOpenKeys={renderScheme.keys}>
      <Sidenav.Body>
        <Nav>
          { scheme && renderScheme.elements }
        </Nav>
      </Sidenav.Body>
    </Sidenav>
  );
}
