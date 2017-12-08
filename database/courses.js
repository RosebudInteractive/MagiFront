const _rows = [
    {
        Id : 1,
        Name : 'Курс 1',
        State: 'D',
        Cover : 'http://example.com/course1.jpg',
        Color : '#ccaabb',
        LanguageId : 1,
        LanguageName : 'Русский',
        URL: '/i_do_not_know',
        Description:'Описание курса 1',
        Lessons : [],
    },
    {
        Id : 2,
        Name : 'Курс 2',
        State: 'P',
        Cover : 'http://example.com/course2.jpg',
        Color : '#99aaff',
        LanguageId : 2,
        LanguageName : 'English',
        URL: '/i_do_not_know',
        Description:'Описание курса 3',
        Lessons : [],
    },
    {
        Id : 3,
        Name : 'Курс 3',
        State: 'A',
        Cover : 'http://example.com/course3.jpg',
        Color : '#ffaa22',
        LanguageId : 2,
        LanguageName : 'English',
        URL: '/i_do_not_know',
        Description:'Описание курса 3',
        Lessons : [],
    },
];

const CoursesService = class CoursesService {

    getAll() {
        return new Promise((resolve) => {
            resolve(_rows);
        });
    }

    get(id) {
        return new Promise((resolve) => {
            resolve(_rows[0])
        });
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

let dbCourses = null;
exports.CoursesService = () => {
    return dbCourses ? dbCourses : dbCourses = new CoursesService();
}