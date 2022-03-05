import React, { useMemo } from 'react';
import './permissions.sass';
import { Dropdown, Nav, Sidenav, } from 'rsuite';
import Item from './item';
export default function PermissionsTree({ scheme, onChange, readonly = false, }) {
    const dropdownStyles = {
        justifyContent: 'center',
        transition: 'height .8s ease .5s',
        minWidth: '298px',
    };
    const dropdownTitle = (title) => <div className="title-drop-d">{title}</div>;
    const changeHandle = (path, value) => {
        if (onChange) {
            onChange(path, value);
        }
    };
    const renderGroup = (group, path) => (<Dropdown style={dropdownStyles} key={path.join('-')} eventKey={path.join('-')} title={dropdownTitle(group.title)}>
      {Object.entries(group.items).map(([subkey, item]) => {
            const newPath = [...path, subkey];
            return item.type === 'group'
                ? renderGroup(item, newPath)
                : <Item permission={item} readonly={readonly} onChange={changeHandle} path={newPath} key={newPath.join('-')}/>;
        })}
    </Dropdown>);
    const renderScheme = useMemo(() => ({
        keys: Object.keys(scheme),
        elements: Object.entries(scheme).map(([key, group]) => renderGroup(group, [key])),
    }), [scheme]);
    return (<div className="permission-tree _with-custom-scroll">
      <Sidenav defaultOpenKeys={renderScheme.keys}>
        <Sidenav.Body>
          <Nav>
            {scheme && renderScheme.elements}
          </Nav>
        </Sidenav.Body>
      </Sidenav>
    </div>);
}
PermissionsTree.defaultProps = {
    readonly: false,
};
