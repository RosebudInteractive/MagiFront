import {EMAIL_REGEXP} from "#common/constants/common-consts";

const vRequired = value => (value ? undefined : 'Обязательное поле');
const vMinValue = min => value =>
    isNaN(value) || value >= min ? undefined : `Необходимое количество символов ${min}`;
const vMaxValue = max => value =>
    isNaN(value) || value <= max ? undefined : `максимальное количество символов ${max}`;
const vMustBeEmail = value => (EMAIL_REGEXP.test(value) ? undefined : 'Не соответствует формату почты');
const vPositiveInteger = value => {
    const regExp = /^\+?[1-9]\d*$/;
    return regExp.test(value) ? undefined : 'Допустимо только целое число'
};
const vLengthMin = min => value => value.toString().length >= min  ? undefined : `Количество символов должно быть от ${min}`;
const vLengthMax = max => value => value.toString().length <= max  ? undefined : `Количество символов должно быть не больше ${max}`;

export const ComposeValidators = (...validators) => value =>
    validators.reduce((error, validator) => error || validator(value), undefined);

const validators = {
    required: vRequired,
    min: vMinValue,
    max: vMaxValue,
    minLength: vLengthMin,
    maxLength: vLengthMax,
    emailType: vMustBeEmail,
    compose: ComposeValidators,
    positiveInteger: vPositiveInteger
};

export default validators;
