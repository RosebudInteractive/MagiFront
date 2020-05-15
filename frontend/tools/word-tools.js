export const getCountLessonTitle = (count) => {
    return getCounterTitle(count, {single: 'лекция', twice: 'лекции', many: 'лекций'})
}

export const getCountHoursTitle = (count) => {
    return getCounterTitle(count, {single: 'час', twice: 'часа', many: 'часов'})
}

export const getCountMinutesTitle = (count) => {
    return getCounterTitle(count, {single: 'минута', twice: 'минуты', many: 'минут'})
}

export const getQuestionsTitle = (count) => {
    return getCounterTitle(count, {single: 'вопрос', twice: 'вопроса', many: 'вопросов'})
}

export const getCountSubsTitle = (count) => {
    return getCounterTitle(count, {single: 'доп.эпизод', twice: 'доп.эпизода', many: 'доп.эпизодов'})
}

export const getCountSimbolsTitle = (count) => {
    return getCounterTitle(count, {single: 'символ', twice: 'символа', many: 'символов'})
}

export const getCountReviewsTitle = (count) => {
    return getCounterTitle(count, {single: 'отзыв', twice: 'отзыва', many: 'отзывов'})
}

const getCounterTitle = (count, {single, twice, many}) => {
    switch (count % 10) {
        case 1: {
            return count !== 11 ? single : many
        }

        case 2:
        case 3:
        case 4: {
            return (count > 10) && (count < 20) ? many : twice
        }

        default:
            return many
    }
}

export const getCountListenedTitle = (count) => {
    return getCounterTitle(count, {single: 'прослушана', twice: 'прослушаны', many: 'прослушано'})
}