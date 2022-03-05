export function getAuthorAndCategory() {
    const {course} = this.props

    let _author = 'unknown',
        _category = 'unknown';

    if (course.hasOwnProperty("AuthorsObj")) {
        _author = course.AuthorsObj && course.AuthorsObj[0] ? course.AuthorsObj[0].FirstName + " " + course.AuthorsObj[0].LastName : ''
    } else if (course.hasOwnProperty("authors")) {
        _category = course.categories && course.categories[0] ? course.categories[0].Name : ''
    } else if (course.hasOwnProperty("Authors")) {
        _author = course.Authors && course.Authors[0] ? course.Authors[0].FirstName + " " + course.Authors[0].LastName : ''
    }  else if (course.hasOwnProperty("author")) {
        _author = course.author
    }

    if (course.hasOwnProperty("CategoriesObj")) {
        _category = course.CategoriesObj && course.CategoriesObj[0] ? course.CategoriesObj[0].Name : '';
    } else if (course.hasOwnProperty("categories")) {
        _category = course.categories && course.categories[0] ? course.categories[0].Name : ''
    } else if (course.hasOwnProperty("Categories")) {
        _category = course.Categories && course.Categories[0] ? course.Categories[0].Name : ''
    }

    return {author: _author, category: _category}
}