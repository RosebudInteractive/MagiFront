import React, { useMemo } from 'react';
import './permissions.sass';
import {
  Dropdown, Nav, Sidenav,
} from 'rsuite';
import {
  MergedItem, MergedScheme, MergedGroup, RoleRightsValue,
} from '../../@types/permissions';
import Item from './item';
import { ChangeHandler } from './types';

interface PermissionsProps {
  scheme: MergedScheme;
  onChange?: ChangeHandler;
  readonly?: boolean;
}

interface RenderedSchemeData {
  keys: Array<string>;
  elements: Array<JSX.Element>;
}

export default function PermissionsTree({
  scheme,
  onChange,
  readonly = false,
} : PermissionsProps): JSX.Element {
  const dropdownStyles: React.CSSProperties = {
    justifyContent: 'center',
    transition: 'height .8s ease .5s',
    minWidth: '298px',
  };

  const dropdownTitle = (title: string) => <div className="title-drop-d">{title}</div>;

  const changeHandle: ChangeHandler = (path: Array<string>, value: RoleRightsValue | undefined) => {
    if (onChange) { onChange(path, value); }
  };

  const renderGroup = (group: MergedGroup, path: Array<string>): JSX.Element => (
    <Dropdown
      style={dropdownStyles}
      key={path.join('-')}
      eventKey={path.join('-')}
      title={dropdownTitle(group.title)}
    >
      {
        Object.entries(group.items).map(([subkey, item]) => {
          const newPath = [...path, subkey];

          return item.type === 'group'
            ? renderGroup(item as MergedGroup, newPath)
            : <Item permission={item as MergedItem} readonly={readonly} onChange={changeHandle} path={newPath} key={newPath.join('-')} />;
        })
      }
    </Dropdown>
  );

  const renderScheme = useMemo<RenderedSchemeData>(() => ({
    keys: Object.keys(scheme),
    elements: Object.entries(scheme).map(([key, group]) => renderGroup(group, [key])),
  }), [scheme]);

  return (
    <div className="permission-tree _with-custom-scroll">
      <Sidenav defaultOpenKeys={renderScheme.keys}>
        <Sidenav.Body>
          <Nav>
            { scheme && renderScheme.elements }
          </Nav>
        </Sidenav.Body>
      </Sidenav>
    </div>
  );
}

PermissionsTree.defaultProps = {
  readonly: false,
};
