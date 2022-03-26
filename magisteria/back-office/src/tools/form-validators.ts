export const EMAIL_REGEXP: RegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const validateRequired = (value: any) => (value ? undefined : 'Обязательное поле');
// export const vMinValue = min => value =>
//     isNaN(value) || value >= min ? undefined : `Необходимое количество символов ${min}`;
export const validateEmail = (value: string | undefined) => (value && EMAIL_REGEXP.test(value) ? undefined : 'Не соответствует формату почты');
export const composeValidators = (...validators: any[]) => (value: any) => validators
  .reduce((error, validator) => error || validator(value), undefined);
