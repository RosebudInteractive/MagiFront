export const EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const validateRequired = (value) => (value ? undefined : 'Обязательное поле');
// export const vMinValue = min => value =>
//     isNaN(value) || value >= min ? undefined : `Необходимое количество символов ${min}`;
export const validateEmail = (value) => (value && EMAIL_REGEXP.test(value) ? undefined : 'Не соответствует формату почты');
export const composeValidators = (...validators) => (value) => validators
    .reduce((error, validator) => error || validator(value), undefined);
