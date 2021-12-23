import React, {useEffect, useRef, useState} from "react";
import "./permissions.sass"
import {Dropdown, InputPicker, Nav, Sidenav} from 'rsuite';


const Permissions = (props) => {
    const {permissionScheme, onDirty, onChangeCb, readOnly} = props;

    const [permissionVals, setPermissionVals] = useState({}); // todo maybe use Map

    const [trigger, setTrigger] = useState(false);

    const refs = useRef({});

    const onChange = (value, initialValue, pItem) => {
        const pVals = permissionVals;
        pVals[pItem.permissionCode] = value !== null ? value : pItem.default;
        setPermissionVals(pVals);
        onChangeCb && onChangeCb(value !== null ? value : pItem.default, pItem);

        if(value !== null){ // todo do something to check that all permissions are dirty
            if(value !== initialValue ){
                onDirty && onDirty(true)
            }
        } else {
            onDirty && onDirty(false)
        }

    };

    const cleanable = function(permissionItem){
        if(readOnly){
            return false;
        }

        return (permissionVals && permissionVals[permissionItem.permissionCode] !== undefined ?
            (permissionVals[permissionItem.permissionCode] !== permissionItem.default && permissionVals[permissionItem.permissionCode] !== null) :
            (permissionItem.default !== permissionItem.value))
    };

    useEffect(() => {
        setTrigger(!trigger);
    },[refs.current]);

    return (
        <Sidenav defaultOpenKeys={readOnly ? [0] : []}>
            <Sidenav.Body>

                <Nav>
                    {permissionScheme &&
                    permissionScheme.map((permission, index) => {
                        return <Dropdown style={{
                            background: 'white',
                            borderRadius: '8px',
                            border:'1px #d2d2d6 solid',
                            height: 'auto',
                            maxHeight: '250px',
                            justifyContent: 'center',
                            transition: 'height .8s ease .5s',
                            maxWidth: '298px',
                            pointerEvents: readOnly ? 'none' : 'auto'
                        }
                        } key={index} eventKey={index} title={<div className={'title-drop-d'}>{permission.title}</div>}>
                            {
                                permission.items.map((permissionItem, inx) => {

                                   return <Dropdown.Item style={{padding: 0}} key={inx} eventKey={`${index}-${inx}`}>
                                       <div className='permission-item' >
                                           <div>{permissionItem.title}</div>
                                           <div>
                                               <InputPicker style={{pointerEvents: readOnly ? 'none' : 'auto'}} size="xs" menuStyle={{fontSize: '12px'}}
                                                            ref={el => refs.current[permissionItem.permissionCode] = el}
                                                            cleanable={cleanable(permissionItem)}
                                                            data={permissionItem.values}
                                                            renderValue={(v, i) => {
                                                                return <div className={`selected-option ${(v === permissionItem.default) ? 'grey' : 'black'}`} >{i.label}</div>;
                                                            }}
                                                            value={permissionVals[permissionItem.permissionCode] !== null ? permissionVals[permissionItem.permissionCode] : permissionItem.default}
                                                            onChange={val => onChange(val, permissionItem.value, permissionItem)}
                                                            defaultValue={permissionItem.value}/>
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

