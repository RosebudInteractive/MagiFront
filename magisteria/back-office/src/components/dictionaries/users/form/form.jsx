import { Form, FormSpy } from 'react-final-form';
import React from 'react';
import Permissions from '#src/components/permission-tree';
import LeftPane from '#src/components/dictionaries/users/form/left-pane';
const UserForm = ({ onSubmit, isCreateMode, onFindUser, roles, mergedScheme, onChange, initValues, }) => {
    const handleSubmit = (data) => {
        const newData = {
            roles: data.role.reduce((acc, curr) => {
                if (curr !== 'a')
                    acc[curr] = 1;
                return acc;
            }, {}),
            isAdmin: data.role.includes('a'),
        };
        onSubmit(newData);
    };
    return (<Form initialValues={initValues} onSubmit={() => {
        }}>
      {(formData) => (<form className="editor-form user-form" onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(formData.values);
            }}>
          <div className="editor-form__two-pane-container">
            <LeftPane values={formData.values} roles={roles} isCreateMode={isCreateMode} onFindUser={onFindUser}/>
            <div className="right-pane user-permissions">
              {roles && <Permissions readonly scheme={mergedScheme}/>}
            </div>
          </div>
          <div className="editor-form__action-buttons">
            <button type="submit" className="user-form__confirm-button orange-button big-button" disabled={!formData.valid || formData.pristine}>
              Применить
            </button>
          </div>
          <FormSpy subscription={{ values: true }} onChange={({ values }) => {
                onChange(values.role);
            }}/>
        </form>)}
    </Form>);
};
export default UserForm;
