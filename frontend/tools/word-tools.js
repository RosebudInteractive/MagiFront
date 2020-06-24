export const getCountDaysTitle = (count) => {
    return getCounterTitle(count, {single: 'день', twice: 'дня', many: 'дней'})
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

export const Tests = {
    getCountTitle: (count) => {
        return getCounterTitle(count, {single: 'тест', twice: 'теста', many: 'тестов'})
    },

    getCompletedTitle: (count) => {
        return getCounterTitle(count, {single: 'пройден', twice: 'пройдено', many: 'пройдено'})
    }
}

export const Lessons = {
    getCountTitle: (count) => {
        return getCounterTitle(count, {single: 'лекция', twice: 'лекции', many: 'лекций'})
    },

    getListenedTitle: (count) => {
        return getCounterTitle(count, {single: 'просмотрена', twice: 'просмотрено', many: 'просмотрено'})
    }
}

export const getCounterTitle = (count, {single, twice, many}) => {
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

export function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
}


