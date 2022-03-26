import { Form, FormSpy } from 'react-final-form';
import React from 'react';
import Permissions from '#src/components/permission-tree';
import {
  PData, Role, UserRoles,
} from '#types/user';
import { MergedScheme } from '#types/permissions';
import { UserFormData } from './types';
import LeftPane from '#src/components/dictionaries/users/form/left-pane';

interface UserFormsProps {
  initValues: UserFormData,
  roles: Array<Role>,
  mergedScheme: MergedScheme,
  isCreateMode: boolean,
  onSubmit: (values: PData) => void,
  onFindUser: (email: string) => void,
  onChange: (data: UserFormData) => void,
}

const UserForm = ({
  onSubmit, isCreateMode, onFindUser, roles, mergedScheme, onChange, initValues,
}: UserFormsProps) => {
  const handleSubmit = (data: UserFormData) => {
    const newData: PData = {
      roles: data.role.reduce<UserRoles>((acc, curr) => {
        if (curr !== 'a') acc[curr] = 1;
        return acc;
      }, {}),
      isAdmin: data.role.includes('a'),
    };
    onSubmit(newData);
  };

  return (
    <Form
      initialValues={initValues}
      onSubmit={() => {
      }}
    >
      {(formData) => (
        <form
          className="editor-form user-form"
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            handleSubmit(formData.values as UserFormData);
          }}
        >
          <div className="editor-form__two-pane-container">
            <LeftPane
              values={formData.values as UserFormData}
              roles={roles}
              isCreateMode={isCreateMode}
              onFindUser={onFindUser}
            />
            <div className="right-pane user-permissions">
              {roles && <Permissions readonly scheme={mergedScheme} />}
            </div>
          </div>
          <div className="editor-form__action-buttons">
            <button
              type="submit"
              className="user-form__confirm-button orange-button big-button"
              disabled={!formData.valid || formData.pristine}
            >
              Применить
            </button>
          </div>
          <FormSpy
            subscription={{ values: true }}
            onChange={({ values }) => {
              onChange(values.role);
            }}
          />
        </form>
      )}
    </Form>
  );
};

export default UserForm;
