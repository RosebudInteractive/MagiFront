import React, {useState} from "react";
import "./permissions.sass"
import {Dropdown, InputPicker, Nav, Sidenav} from 'rsuite';


const Permissions = (props) => {
    const {permissionScheme, onDirty, onChangeCb, readOnly, opened} = props;
    const [permissionVals, setPermissionVals] = useState(new Map());

    const onChange = (value, pItem, ev) => {

        const pVals = new Map(permissionVals);
        const newVal = value !== null ? value : pItem.default;

        if (newVal === pItem.value) {
            if(pVals.has(pItem.permissionCode)){
                pVals.delete(pItem.permissionCode);
            }
        } else {
            pVals.set(pItem.permissionCode, newVal);
        }

        onChangeCb && onChangeCb(newVal, pItem);

        if (pVals.size === 0) {
            onDirty && onDirty(false)
        } else {
            if (value !== pItem.value) {
                onDirty && onDirty(true)
            }
        }

        setPermissionVals(pVals);
    };

    const cleanable = function (permissionItem, val) {
        if (readOnly) {
            return false;
        }

        return permissionVals.has(permissionItem.permissionCode) ?
            permissionVals.get(permissionItem.permissionCode) !== permissionItem.default : (permissionItem.default !== permissionItem.value);
    };

    return (
        <Sidenav defaultOpenKeys={(readOnly || opened) ? [0] : []}>
            <Sidenav.Body>

                <Nav>
                    {permissionScheme &&
                    permissionScheme.map((permission, index) => {
                        return <Dropdown style={{
                            background: 'white',
                            borderRadius: '8px',
                            border: '1px #d2d2d6 solid',
                            height: 'auto',
                            justifyContent: 'center',
                            transition: 'height .8s ease .5s',
                            minWidth: '298px',
                            maxWidth: '298px',
                            pointerEvents: readOnly ? 'none' : 'auto'
                        }
                        } key={index} eventKey={index} title={<div className={'title-drop-d'}>{permission.title}</div>}>
                            {
                                permission.items.map((permissionItem, inx) => {

                                    return <Dropdown.Item style={{padding: 0}} key={inx} eventKey={`${index}-${inx}`}>
                                        <div className='permission-item'>
                                            <div className='permission-title'>{permissionItem.title}</div>
                                            <div className='permission-value'>
                                                <InputPicker menuClassName={'permission-menu-options'} style={{
                                                    pointerEvents: readOnly ? 'none' : 'auto',
                                                    color: 'orange'
                                                }} size="xs" menuStyle={{fontSize: '12px', color: 'orange !important'}}
                                                             cleanable={cleanable(permissionItem, permissionVals.get(permissionItem.permissionCode))}
                                                             data={permissionItem.values}
                                                             renderValue={(v, i) => {
                                                                 return <div
                                                                     className={`selected-option ${(v === permissionItem.default || readOnly) ? 'grey' : 'black'}`}>{i.label}</div>;
                                                             }}
                                                             value={permissionVals.has(permissionItem.permissionCode) ? permissionVals.get(permissionItem.permissionCode) : permissionItem.value}
                                                             onChange={(val, ev) => onChange(val, permissionItem, ev)}
                                                             defaultValue={permissionItem.value}
                                                             />
                                            </div>
                                        </div>

                                    </Dropdown.Item>

                                })
                            }
                        </Dropdown>
                    })
                    }
                </Nav>
            </Sidenav.Body>
        </Sidenav>
    )
};

export default Permissions

