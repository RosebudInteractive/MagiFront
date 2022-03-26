import { Field } from 'react-final-form';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import React, { useMemo } from 'react';
import { composeValidators, validateEmail, validateRequired } from '#src/tools/form-validators';
import { SelectOptions } from '#types/common';
import { Role } from '#types/user';
import { UserFormData } from './types';
import { MultipleSelect, TextBox } from '#src/components/ui-kit';

interface LeftPaneProps {
  values: UserFormData,
  roles: Array<Role>,
  isCreateMode: boolean,
  onFindUser: (email: string) => void,
}

type RoleShortCodeName = Record<string, string>;

const LeftPane = ({
  values, isCreateMode, onFindUser, roles,
}: LeftPaneProps) => {
  const options: SelectOptions = useMemo(() => roles.map((role) => ({
    id: role.ShortCode,
    name: role.Name,
  })), [roles]);

  const shortCodeNameMap = useMemo(() => roles.reduce<RoleShortCodeName>((acc, role) => {
    acc[role.ShortCode] = role.Name;
    return acc;
  }, {}), [roles]);

  return (
    <div className="left-pane with-fields-column">
      <div className="user-form__field email-field">
        <Field
          name="email"
                    // @ts-ignore
          component={TextBox}
          type="text"
          placeholder="Почта"
          label="Почта"
          validate={composeValidators(validateRequired, validateEmail)}
          disabled={!isCreateMode}
        />
        {
            (isCreateMode) && (
            <button
              disabled={validateEmail(values.email) !== undefined}
              type="button"
              className="search-button"
              onClick={() => onFindUser(values.email)}
            >
              Поиск
            </button>
            )
        }
      </div>
      <div className="user-form__field">
        <Field
          name="displayName"
                    // @ts-ignore
          component={TextBox}
          type="text"
          placeholder="Имя"
          label="Имя"
          disabled
        />
      </div>
      <div className="user-form__field">
        <Field
          name="role"
          component={MultipleSelect}
          multiple
          label="Роль"
          required
          options={options}
          renderValue={(selected: Array<string>) => (
            <Box className="user-form__roles _with-custom-scroll">
              {selected.map((value) => (
                <Chip key={value} label={shortCodeNameMap[value]} />
              ))}
            </Box>
          )}
          validate={composeValidators(validateRequired)}
        />
      </div>
    </div>
  );
};

export default LeftPane;
