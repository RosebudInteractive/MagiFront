const _rows = [
    {
        Id: 1,
        Name: 'Лекция 1',
        CourseName: 'Курс 1',
        Author : 1,
        Cover: 'https://magisteria.ru/wp-content/uploads/2016/08/unnamed-2.jpg',
        Number: '1',
        ReadyDate: '01.01.2018',
        State: 'D',
        LessonType: 'L',
        Episodes: [
            {
                Id: 1,
                Name: 'Эпизод 1',
                Number: '1',
                State: 'D',
                LanguageName: 'Русский',
                Supp: false,
            },
            {
                Id: 2,
                Name: 'Эпизод 2',
                Number: '2',
                State: 'D',
                LanguageName: 'Русский',
                Supp: false,
            },
            {
                Id: 3,
                Name: 'Эпизод 3',
                Number: '3',
                State: 'D',
                LanguageName: 'Русский',
                Supp: true,
            },
        ],
        References : [
            {
                Id: 1,
                Description: 'Источник 1',
                Number: '1',
                URL: 'http://example.com/1.txt',
                Recommended: true,
            },
            {
                Id: 2,
                Description: 'Источник 2',
                Number: '2',
                URL: 'http://example.com/2.txt',
                Recommended: false,
            },
        ],
    },
];

const LessonsService = class LessonsService {

    // getAll() {
    //     return new Promise((resolve) => {
    //         resolve(_rows);
    //     });
    // }

    get(id) {
        return new Promise((resolve) => {
            resolve(_rows[0])
        });
    }

    getAuthors(courseId) {
        return new Promise((resolve) => {
            resolve(_authors)
        })
    }

    del(id) {
        return new Promise((resolve) => {
            console.log(id);
            resolve(null);
        });
    }

    update(id, data) {
        return new Promise((resolve) => {
            console.log(id, data);
            resolve(data);
        });
    }

    insert(data) {
        return new Promise((resolve) => {
            console.log(data);
            resolve(_rows[0]);
        });
    }
};

let dbLessons = null;
exports.LessonsService = () => {
    return dbLessons ? dbLessons : dbLessons = new LessonsService();
}