import {EMAIL_REGEXP} from "../../common/constants/common-consts";

const vRequired = value => (value ? undefined : 'Обязательное поле');
const vMinValue = min => value =>
    isNaN(value) || value >= min ? undefined : `Необходимое количество символов ${min}`;
const vMustBeEmail = value => (EMAIL_REGEXP.test(value) ? undefined : 'Не соответствует формату почты');

export const ComposeValidators = (...validators) => value =>
    validators.reduce((error, validator) => error || validator(value), undefined);

const validators = {
    required: vRequired,
    minValue: vMinValue,
    emailType: vMustBeEmail,
    compose: ComposeValidators
};

export default validators;
