import {ANSWER_TYPES} from "../constants/common-consts";

export const isAnswerCorrect = (question, answer) => {
    switch (question.AnswType) {

        case ANSWER_TYPES.BOOL:
            return answer === question.AnswBool

        case ANSWER_TYPES.SELECT: {
            const _answerItem = question.Answers.find((item) => {
                return answer && Array.isArray(answer) && (item.Id === answer[0])
            })

            return !!_answerItem && _answerItem.IsCorrect
        }

        case ANSWER_TYPES.MULTI_SELECT: {
            const _correctAnswers = question.Answers
                .filter((item) => {
                    return item.IsCorrect
                })
                .map(item => item.Id)

            if (!(answer && Array.isArray(answer))) { return false }

            const _firstStepCheck = answer.every(item => _correctAnswers.includes(item))

            const _secondStepCheck = _correctAnswers.every(item => answer.includes(item))

            return _firstStepCheck && _secondStepCheck
        }

        default:
            return false
    }
}

export const isAnswerPartCorrect = (question, answer) => {
    if (question.AnswType === ANSWER_TYPES.MULTI_SELECT) {
        const _correctAnswers = question.Answers
            .filter((item) => {
                return item.IsCorrect
            })
            .map(item => item.Id)

        const _firstStepCheck = answer.every(item => _correctAnswers.includes(item))

        const _secondStepCheck = !_correctAnswers.every(item => answer.includes(item))

        return _firstStepCheck && _secondStepCheck
    } else {
        return false
    }
}