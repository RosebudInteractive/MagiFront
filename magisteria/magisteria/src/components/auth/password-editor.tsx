import React, { useEffect, useMemo } from 'react';
import { WrappedFieldProps } from 'redux-form/lib/Field';
import CheckGreen from '#assets/svg/check-green.svg';
import Failure from '#assets/svg/failure.svg';

const hidingChar: string = '●';

const realPasswordMapper: { [key: string]: Array<string> } = {};
const tmpPasswordMapper: { [key: string]: string } = {};
const passwordLenMapper: { [key: string]: number } = {};

interface EditorProps extends WrappedFieldProps {
  id?: string,
  disabled?: boolean,
  hidden?: boolean,
  extClass?: string | null,
}

export default function PasswordEditor({
  input, meta, id, disabled, hidden, extClass,
}: EditorProps) {
  useEffect(() => {
    input.onChange({ hiddenValue: '', realPassword: '' });
  }, []);

  const inputId = useMemo<string>(() => id || Math.random().toString(36).substring(5), [id]);

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.currentTarget;

    if (!realPasswordMapper[target.id]) {
      realPasswordMapper[target.id] = [];
    }

    const tmpPassword = target.value;
    const passwordLen = tmpPassword.length;

    tmpPasswordMapper[target.id] = tmpPassword;
    passwordLenMapper[target.id] = tmpPassword.length;

    // Get current keyup character position.
    const currKeyupPos: number = target.selectionStart || 0;

    const realPasswordArray = realPasswordMapper[target.id];

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < passwordLen; i++) {
      if (tmpPassword[i] !== hidingChar) {
        realPasswordArray[i] = tmpPassword[i];
      }
    }

    if (passwordLen < realPasswordArray.length) {
      const diff = realPasswordArray.length - passwordLen;

      const key = e.code;

      // Check if last keypress was backspace or delete
      if (key === 'Backspace' || key === 'Delete') {
        realPasswordArray.splice(currKeyupPos, diff);
      } else {
        realPasswordArray.splice(currKeyupPos - 1, diff + 1);
        realPasswordArray.splice(currKeyupPos - 1, 0, tmpPassword[currKeyupPos - 1]);
      }
    }

    input.onChange({
      hiddenValue: tmpPassword.replace(/./g, hidingChar),
      realPassword: realPasswordArray.join(''),
    });
  };

  const { error, touched } = meta;

  const fieldClassName = `form__field register-form__field${extClass ? ` ${extClass}` : ''}`;

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    input.onChange({
      hiddenValue: e.currentTarget.value,
      realPassword: input.value.realPassword,
    });
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const realPassword = realPasswordMapper[event.target.id];
    const tmpPassword = tmpPasswordMapper[event.target.id];

    const newVal = {
      hiddenValue: tmpPassword && tmpPassword.replace(/./g, hidingChar),
      realPassword: realPassword && realPassword.join(''),
    };
    input.onBlur(newVal);
    event.preventDefault();
  };

  const errorText = useMemo(() => touched && error
            && <p className="form__error-message js-error-message" style={{ display: 'block' }}>{error}</p>, [touched, error]);

  return (
    <div className="form__field-wrapper register-form__field-wrapper" style={hidden ? { display: 'none' } : {}}>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label htmlFor={inputId} className="form__field-label register-form__field-label">Пароль</label>
      {
        disabled
          ? <input {...input} id={inputId} type="text" className={fieldClassName} placeholder="Пароль" disabled />
          : (
            <input
              {...input}
              onKeyUp={handleKeyUp}
              onChange={handleChange}
              onBlur={handleBlur}
              id={inputId}
              type="text"
              className={fieldClassName}
              placeholder="Пароль"
              value={input.value.hiddenValue}
            />
          )
      }

      {
        touched
          ? (
            <span className="status-icon">
              {error ? <Failure /> : <CheckGreen />}
            </span>
          )
          : null
        }
      {errorText}
    </div>
  );
}
