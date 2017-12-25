using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Data;

using MySql.Data;
using MySql.Data.MySqlClient;

using Newtonsoft.Json;

namespace MagImport
{
    public class MagisteryToJSON
    {
        public class SysFieldsData
        {
            public string typeGuid { get; set; }
        };

        public class BaseFieldsData
        {
            public int Id { get; set; }
        };

        public class RootFieldsData : BaseFieldsData
        {
            public string Name { get; set; }
            public RootFieldsData() { Id = 1000; Name = "DataRoot"; }
        };

        public class DataObject
        {
            [JsonProperty("$sys")]
            public SysFieldsData _sys { get; set; }
            public BaseFieldsData fields { get; set; }
            public IDictionary<string, List<DataObject>> collections;
            public DataObject() { collections = new Dictionary<string, List<DataObject>>(); }
        };

        public class RootDataObject : DataObject
        {
            [JsonIgnore]
            public List<DataObject> Elems
            {
                get { return collections["DataElements"]; }
            }

            public RootDataObject(string type_guid)
            {
                _sys = new SysFieldsData { typeGuid = type_guid };
                fields = new RootFieldsData();
                collections.Add("DataElements", new List<DataObject>());
            }

            public virtual string GetClassName() { return "RootDataObject"; }

            public string ToJSONString(Formatting fmt = Formatting.None, JsonSerializerSettings settings = null)
            {
                return JsonConvert.SerializeObject(this, fmt, settings == null ? jss : settings);
            }

            public void ToJSONFile(string outFile, Formatting fmt = Formatting.None, Encoding enc = null, JsonSerializerSettings settings = null)
            {
                string json = ToJSONString(fmt, settings);
                string dir = Path.GetDirectoryName(outFile);
                string file = Path.GetDirectoryName(outFile);
                string ext = Path.GetExtension(outFile);

                if (String.IsNullOrEmpty(ext))
                {
                    file = GetClassName() + EXT_DFLT;
                    dir = outFile;
                }
                string path = Path.Combine(dir, file);
                Directory.CreateDirectory(dir);
                File.WriteAllText(path, json, enc == null ? enc_dflt : enc);
            }

            public int GetNextId() { return current_id++; }

            Encoding enc_dflt = new UTF8Encoding(false); /* UTF8 w/o BOM */
            JsonSerializerSettings jss = new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore };
            int current_id = 1;

            const string EXT_DFLT = ".json";
        };

        public class DataObjTyped<T> : DataObject where T : BaseFieldsData, new()
        {
            [JsonIgnore]
            public T Fields { get { return (T)fields; } }
            public DataObjTyped(string type_guid)
            {
                _sys = new SysFieldsData { typeGuid = type_guid };
                fields = new T();
            }
        };

        //
        // Language
        //
        public class LanguageFields : BaseFieldsData
        {
            public string Code { get; set; }
            public string Language { get; set; }
        };

        public class Language : DataObjTyped<LanguageFields>
        {
            const string CLASS_GUID = "fd4b9b70-514e-4796-9a27-eb0adf8e7944";
            public Language() : base(CLASS_GUID) { }
        };

        public class LanguageRoot : RootDataObject
        {
            const string CLASS_GUID = "36ce5c73-0976-4b9e-bbeb-caaefd13bad0";
            public override string GetClassName() { return "Language"; }
            public LanguageRoot() : base(CLASS_GUID) { }
        };

        //
        // Account
        //
        public class AccountFields : BaseFieldsData
        {
            public string Domain { get; set; }
            public int? DefLangId { get; set; }
        };

        public class Account : DataObjTyped<AccountFields>
        {
            const string CLASS_GUID = "81b276ee-a34a-4267-9f24-0fce75896c91";
            public Account() : base(CLASS_GUID) { }
        };

        public class AccountRoot : RootDataObject
        {
            const string CLASS_GUID = "3a19b68f-50fe-4fa9-923e-0f14d6272a72";
            public override string GetClassName() { return "Account"; }
            public AccountRoot() : base(CLASS_GUID) { }
        };

        //
        // AccountLng
        //
        public class AccountLngFields : BaseFieldsData
        {
            public int? AccountId { get; set; }
            public int? LanguageId { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
        };

        public class AccountLng : DataObjTyped<AccountLngFields>
        {
            const string CLASS_GUID = "a3d4d86b-aa83-4a31-b655-88a8a846e36d";
            public AccountLng() : base(CLASS_GUID) { }
        };

        public class AccountLngRoot : RootDataObject
        {
            const string CLASS_GUID = "a0399798-fb12-4080-bb8e-82cc4bc0bb2d";
            public override string GetClassName() { return "AccountLng"; }
            public AccountLngRoot() : base(CLASS_GUID) { }
        };

        //
        // Author
        //
        public class AuthorFields : BaseFieldsData
        {
            public int? AccountId { get; set; }
            public string Portrait { get; set; }
        };

        public class Author : DataObjTyped<AuthorFields>
        {
            const string CLASS_GUID = "47b13680-c656-4ba4-82e6-3bd14badfcef";
            public Author() : base(CLASS_GUID) { }
        };

        public class AuthorRoot : RootDataObject
        {
            const string CLASS_GUID = "065a0fce-be87-45db-8aa6-0581e7846c83";
            public override string GetClassName() { return "Author"; }
            public AuthorRoot() : base(CLASS_GUID) { }
        };

        //
        // AuthorLng
        //
        public class AuthorLngFields : BaseFieldsData
        {
            public int? AuthorId { get; set; }
            public int? LanguageId { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string Description { get; set; }
            public string Alias { get; set; }
        };

        public class AuthorLng : DataObjTyped<AuthorLngFields>
        {
            const string CLASS_GUID = "2efeead7-684d-46fa-b11b-555ffb2da5a6";
            public AuthorLng() : base(CLASS_GUID) { }
        };

        public class AuthorLngRoot : RootDataObject
        {
            const string CLASS_GUID = "e306cc09-7c70-4dda-b428-a361eae7e1a2";
            public override string GetClassName() { return "AuthorLng"; }
            public AuthorLngRoot() : base(CLASS_GUID) { }
        };

        //
        // AuthorToCourse
        //
        public class AuthorToCourseFields : BaseFieldsData
        {
            public int? AuthorId { get; set; }
            public int? CourseId { get; set; }
        };

        public class AuthorToCourse : DataObjTyped<AuthorToCourseFields>
        {
            const string CLASS_GUID = "2f0ce749-4169-4ec0-9a87-0ffd405a4337";
            public AuthorToCourse() : base(CLASS_GUID) { }
        };

        public class AuthorToCourseRoot : RootDataObject
        {
            const string CLASS_GUID = "feebc518-1fa6-4051-b39e-7958ed30feb7";
            public override string GetClassName() { return "AuthorToCourse"; }
            public AuthorToCourseRoot() : base(CLASS_GUID) { }
        };

        //
        // Course
        //
        public class CourseFields : BaseFieldsData
        {
            public int? AccountId { get; set; }
            public string State { get; set; }
            public string Cover { get; set; }
            public int? Color { get; set; }
            public int? LanguageId { get; set; }
            public bool? OneLesson { get; set; }
            public string URL { get; set; }
        };

        public class Course : DataObjTyped<CourseFields>
        {
            const string CLASS_GUID = "5995f1c7-43dc-4367-8071-532702b94235";
            public Course() : base(CLASS_GUID) { }
        };

        public class CourseRoot : RootDataObject
        {
            const string CLASS_GUID = "f3500436-4b99-48a7-a60b-8b6d6e1a9ac8";
            public override string GetClassName() { return "Course"; }
            public CourseRoot() : base(CLASS_GUID) { }
        };

        //
        // CourseLng
        //
        public class CourseLngFields : BaseFieldsData
        {
            public int? CourseId { get; set; }
            public int? LanguageId { get; set; }
            public string State { get; set; }
            public string Cover { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
        };

        public class CourseLng : DataObjTyped<CourseLngFields>
        {
            const string CLASS_GUID = "e1f6512f-c0e4-40b1-84bf-072bb6346fcb";
            public CourseLng() : base(CLASS_GUID) { }
        };

        public class CourseLngRoot : RootDataObject
        {
            const string CLASS_GUID = "c806b489-2081-4aac-9d23-6a11204d4d4f";
            public override string GetClassName() { return "CourseLng"; }
            public CourseLngRoot() : base(CLASS_GUID) { }
        };

        //
        // Category
        //
        public class CategoryFields : BaseFieldsData
        {
            public int? AccountId { get; set; }
            public int? ParentId { get; set; }
        };

        public class Category : DataObjTyped<CategoryFields>
        {
            const string CLASS_GUID = "fa44e670-4ee6-4227-ab4d-083924a92d8a";
            public Category() : base(CLASS_GUID) { }
        };

        public class CategoryRoot : RootDataObject
        {
            const string CLASS_GUID = "6479905e-bdc3-45a8-8690-568ce3e698b9";
            public override string GetClassName() { return "Category"; }
            public CategoryRoot() : base(CLASS_GUID) { }
        };

        //
        // CategoryLng
        //
        public class CategoryLngFields : BaseFieldsData
        {
            public int? CategoryId { get; set; }
            public int? LanguageId { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
            public string Alias { get; set; }
        };

        public class CategoryLng : DataObjTyped<CategoryLngFields>
        {
            const string CLASS_GUID = "6bae1b6a-82d4-4f54-a953-080edf274588";
            public CategoryLng() : base(CLASS_GUID) { }
        };

        public class CategoryLngRoot : RootDataObject
        {
            const string CLASS_GUID = "bd317677-91f9-44b2-b449-d368e42a2b6a";
            public override string GetClassName() { return "CategoryLng"; }
            public CategoryLngRoot() : base(CLASS_GUID) { }
        };

        //
        // CourseCategory
        //
        public class CourseCategoryFields : BaseFieldsData
        {
            public int? CourseId { get; set; }
            public int? CategoryId { get; set; }
        };

        public class CourseCategory : DataObjTyped<CourseCategoryFields>
        {
            const string CLASS_GUID = "61e14112-019b-42ac-9834-073af99a1597";
            public CourseCategory() : base(CLASS_GUID) { }
        };

        public class CourseCategoryRoot : RootDataObject
        {
            const string CLASS_GUID = "6b65ee98-e1fa-4580-9f90-ad835349a8e5";
            public override string GetClassName() { return "CourseCategory"; }
            public CourseCategoryRoot() : base(CLASS_GUID) { }
        };

        //
        // Lesson
        //
        public class LessonFields : BaseFieldsData
        {
            public int? CourseId { get; set; }
            public int? AuthorId { get; set; }
            public string LessonType { get; set; }
            public string Cover { get; set; }
            public string URL { get; set; }
        };

        public class Lesson : DataObjTyped<LessonFields>
        {
            const string CLASS_GUID = "caadef95-278b-4cad-acc9-a1e27380d6c6";
            public Lesson() : base(CLASS_GUID) { }
        };

        public class LessonRoot : RootDataObject
        {
            const string CLASS_GUID = "819bf85f-e13b-4368-98e5-561f68f90ecd";
            public override string GetClassName() { return "Lesson"; }
            public LessonRoot() : base(CLASS_GUID) { }
        };

        //
        // LessonLng
        //
        public class LessonLngFields : BaseFieldsData
        {
            public int? LessonId { get; set; }
            public int? LanguageId { get; set; }
            public string State { get; set; }
            public string Name { get; set; }
            public string ShortDescription { get; set; }
            public string FullDescription { get; set; }
        };

        public class LessonLng : DataObjTyped<LessonLngFields>
        {
            const string CLASS_GUID = "7012a967-e186-43d8-b39c-1409b7f198b1";
            public LessonLng() : base(CLASS_GUID) { }
        };

        public class LessonLngRoot : RootDataObject
        {
            const string CLASS_GUID = "4dde1122-7556-4929-a81c-5c7679a5bbee";
            public override string GetClassName() { return "LessonLng"; }
            public LessonLngRoot() : base(CLASS_GUID) { }
        };

        //
        // LessonCourse
        //
        public class LessonCourseFields : BaseFieldsData
        {
            public int? CourseId { get; set; }
            public int? LessonId { get; set; }
            public int? Number { get; set; }
            public DateTime? ReadyDate { get; set; }
            public string State { get; set; }
        };

        public class LessonCourse : DataObjTyped<LessonCourseFields>
        {
            const string CLASS_GUID = "c93aa70c-6d24-4587-a723-79dbc9e65f99";
            public LessonCourse() : base(CLASS_GUID) { }
        };

        public class LessonCourseRoot : RootDataObject
        {
            const string CLASS_GUID = "45616f57-8260-497d-9179-25eedce0ba68";
            public override string GetClassName() { return "LessonCourse"; }
            public LessonCourseRoot() : base(CLASS_GUID) { }
        };

        //
        // LessonCourse
        //
        public class ReferenceFields : BaseFieldsData
        {
            public int LessonLngId { get; set; }
            public int Number { get; set; }
            public string Description { get; set; }
            public string URL { get; set; }
            public bool Recommended { get; set; }
            public string AuthorComment { get; set; }
        };

        public class Reference : DataObjTyped<ReferenceFields>
        {
            const string CLASS_GUID = "b919a12f-5202-43b5-b1fc-481f75623659";
            public Reference() : base(CLASS_GUID) { }
        };

        public class ReferenceRoot : RootDataObject
        {
            const string CLASS_GUID = "8d5fd37d-e686-4eec-a8e8-b7df91160a92";
            public override string GetClassName() { return "Reference"; }
            public ReferenceRoot() : base(CLASS_GUID) { }
        };

        public MagisteryToJSON(string connStr)
        {
            conn_str = connStr;
        }

        public Encoding JSONEncoding { get { return enc; } set { enc = value; } }

        public Formatting JSONFormatting { get { return fmt; } set { fmt = value; } }

        public JsonSerializerSettings JSONSettings { get { return jss; } set { jss = value; } }

        public void StartImport(string outDir)
        {
            List<RootDataObject> allData = new List<RootDataObject>();

            LanguageRoot languages = new LanguageRoot();
            allData.Add(languages);

            Language lang = new Language();
            lang.Fields.Id = LANGUAGE_ID;
            lang.Fields.Code = "RUS";
            lang.Fields.Language = "Русский";
            languages.Elems.Add(lang);

            lang = new Language();
            lang.Fields.Id = 2;
            lang.Fields.Code = "ENG";
            lang.Fields.Language = "English";
            languages.Elems.Add(lang);

            lang = new Language();
            lang.Fields.Id = 3;
            lang.Fields.Code = "FRA";
            lang.Fields.Language = "Français";
            languages.Elems.Add(lang);

            lang = new Language();
            lang.Fields.Id = 4;
            lang.Fields.Code = "GER";
            lang.Fields.Language = "Deutsch";
            languages.Elems.Add(lang);

            AccountRoot accounts = new AccountRoot();
            allData.Add(accounts);
            Account acc = new Account();
            acc.Fields.Id = ACCOUNT_ID;
            acc.Fields.DefLangId = LANGUAGE_ID;
            acc.Fields.Domain = "pmt";
            accounts.Elems.Add(acc);

            AccountLngRoot accounts_lng = new AccountLngRoot();
            allData.Add(accounts_lng);
            AccountLng acc_lng = new AccountLng();
            acc_lng.Fields.Id = 1;
            acc_lng.Fields.AccountId = ACCOUNT_ID;
            acc_lng.Fields.LanguageId = LANGUAGE_ID;
            acc_lng.Fields.Name = "Пост Модерн Текнолоджи";
            accounts_lng.Elems.Add(acc_lng);

            MySqlConnection conn = new MySqlConnection(conn_str);
            Console.WriteLine("Connecting to MySQL...");
            conn.Open();

            //
            // Read Categories
            //
            Dictionary<int, Tuple<Category, CategoryLng>> categoriesDB = new Dictionary<int, Tuple<Category, CategoryLng>>();
            CategoryRoot categories = new CategoryRoot();
            allData.Add(categories);
            CategoryLngRoot categories_lng = new CategoryLngRoot();
            allData.Add(categories_lng);

            MySqlCommand cmd = new MySqlCommand(sql_get_category, conn);
            cmd.Parameters.AddWithValue("@TermType", "razdel");
            MySqlDataReader rdr = cmd.ExecuteReader();

            while (rdr.Read())
            {
                int db_id = rdr.GetInt32("id");
                Category cat = new Category();
                categories.Elems.Add(cat);
                cat.Fields.Id = categories.GetNextId();
                cat.Fields.AccountId = ACCOUNT_ID;

                CategoryLng cat_lng = new CategoryLng();
                categories_lng.Elems.Add(cat_lng);
                cat_lng.Fields.Id = categories_lng.GetNextId();
                cat_lng.Fields.CategoryId = cat.Fields.Id;
                cat_lng.Fields.LanguageId = LANGUAGE_ID;
                cat_lng.Fields.Name = rdr.GetString("name");
                cat_lng.Fields.Description = String.IsNullOrEmpty(rdr.GetString("description")) ? null : rdr.GetString("description");
                cat_lng.Fields.Alias = String.IsNullOrEmpty(rdr.GetString("alias")) ? null : rdr.GetString("alias");

                categoriesDB.Add(db_id, new Tuple<Category, CategoryLng>(cat, cat_lng));
            }
            rdr.Close();

            //
            // Read Authors
            //
            Dictionary<int, Tuple<Author, AuthorLng>> authorsDB = new Dictionary<int, Tuple<Author, AuthorLng>>();
            AuthorRoot authors = new AuthorRoot();
            allData.Add(authors);
            AuthorLngRoot authors_lng = new AuthorLngRoot();
            allData.Add(authors_lng);

            cmd = new MySqlCommand(sql_get_category, conn);
            cmd.Parameters.AddWithValue("@TermType", "autor");
            rdr = cmd.ExecuteReader();

            while (rdr.Read())
            {
                int db_id = rdr.GetInt32("id");
                Author au = new Author();
                authors.Elems.Add(au);
                au.Fields.Id = authors.GetNextId();
                au.Fields.AccountId = ACCOUNT_ID;

                AuthorLng au_lng = new AuthorLng();
                authors_lng.Elems.Add(au_lng);
                au_lng.Fields.Id = authors_lng.GetNextId();
                au_lng.Fields.AuthorId = au.Fields.Id;
                au_lng.Fields.LanguageId = LANGUAGE_ID;
                string[] names = rdr.GetString("name").Split((char[])null, StringSplitOptions.RemoveEmptyEntries);
                if (names.Length < 2)
                    throw new Exception(String.Format("Author name (Id={0}, name=\"{1}\") is incorrect!", db_id, rdr.GetString("name")));
                au_lng.Fields.FirstName = names[0];
                au_lng.Fields.LastName = names[1];
                au_lng.Fields.Description = String.IsNullOrEmpty(rdr.GetString("description")) ? null : rdr.GetString("description");
                au_lng.Fields.Alias = String.IsNullOrEmpty(rdr.GetString("alias")) ? null : rdr.GetString("alias");

                authorsDB.Add(db_id, new Tuple<Author, AuthorLng>(au, au_lng));
            }
            rdr.Close();

            foreach (KeyValuePair<int, Tuple<Author, AuthorLng>> pair in authorsDB)
            {
                int db_id = pair.Key;
                Author au = pair.Value.Item1;
                AuthorLng au_lng = pair.Value.Item2;

                //
                // Read author details
                //
                MySqlCommand cmd_det = new MySqlCommand(sql_get_term_det, conn);
                cmd_det.Parameters.AddWithValue("@Id", db_id);
                MySqlDataReader rdr_det = cmd_det.ExecuteReader();
                int photo_id = 0;
                while (rdr_det.Read())
                {
                    string option_name = rdr_det.GetString("meta_key");
                    if (option_name == att_author_photo_name)
                    {
                        Int32.TryParse(rdr_det.GetString("meta_value"), out photo_id);
                    }
                    else
                    if (option_name == att_author_bio_name)
                        au_lng.Fields.Description =
                            String.IsNullOrEmpty(rdr_det.GetString("meta_value")) ? null : rdr_det.GetString("meta_value");
                }
                rdr_det.Close();
                if (photo_id != 0)
                {
                    cmd_det = new MySqlCommand(sql_get_postmeta_val, conn);
                    cmd_det.Parameters.AddWithValue("@PostId", photo_id);
                    cmd_det.Parameters.AddWithValue("@MetaKey", attached_file_meta);
                    rdr_det = cmd_det.ExecuteReader();
                    if (rdr_det.Read())
                    {
                        au.Fields.Portrait = rdr_det.GetString("meta_value");
                    }
                    rdr_det.Close();
                }
            }

            //
            // Read Author to Course relationship
            //
            Dictionary<int, Tuple<Author, AuthorLng>> authorToCourseDB = new Dictionary<int, Tuple<Author, AuthorLng>>();

            cmd = new MySqlCommand(sql_get_author_to_course, conn);
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                int author_id = rdr.GetInt32("author_id");
                int course_id = rdr.GetInt32("course_id");
                Tuple<Author, AuthorLng> author;
                if (!authorsDB.TryGetValue(author_id, out author))
                    throw new Exception(String.Format("Can't find author (Id={0}) for course (Id={1}).", author_id, course_id));
                authorToCourseDB.Add(course_id, author);
            }
            rdr.Close();

            //
            // Read Courses
            //
            Dictionary<int, Tuple<Course, CourseLng, CourseCategory>> coursesDB =
                new Dictionary<int, Tuple<Course, CourseLng, CourseCategory>>();
            CourseRoot courses = new CourseRoot();
            allData.Add(courses);
            CourseLngRoot courses_lng = new CourseLngRoot();
            allData.Add(courses_lng);
            CourseCategoryRoot course_categories = new CourseCategoryRoot();
            allData.Add(course_categories);
            AuthorToCourseRoot authors_to_courses = new AuthorToCourseRoot();
            allData.Add(authors_to_courses);

            cmd = new MySqlCommand(sql_get_category, conn);
            cmd.Parameters.AddWithValue("@TermType", "category");
            rdr = cmd.ExecuteReader();

            while (rdr.Read())
            {
                int db_id = rdr.GetInt32("id");
                if (db_id == 1) // Skip 1st fake course
                    continue;
                Course course = new Course();
                courses.Elems.Add(course);
                course.Fields.Id = courses.GetNextId();
                course.Fields.AccountId = ACCOUNT_ID;
                course.Fields.LanguageId = LANGUAGE_ID;
                course.Fields.OneLesson = false;
                course.Fields.URL = String.IsNullOrEmpty(rdr.GetString("alias")) ? null : rdr.GetString("alias");
                course.Fields.State = "P";

                CourseLng course_lng = new CourseLng();
                courses_lng.Elems.Add(course_lng);
                course_lng.Fields.Id = courses_lng.GetNextId();
                course_lng.Fields.CourseId = course.Fields.Id;
                course_lng.Fields.LanguageId = LANGUAGE_ID;
                course_lng.Fields.Name = String.IsNullOrEmpty(rdr.GetString("name")) ? null : rdr.GetString("name");
                course_lng.Fields.Description = String.IsNullOrEmpty(rdr.GetString("description")) ? null : rdr.GetString("description");
                course_lng.Fields.State = "R";

                CourseCategory course_category = new CourseCategory();
                course_categories.Elems.Add(course_category);
                course_category.Fields.Id = course_categories.GetNextId();
                course_category.Fields.CourseId = course.Fields.Id;

                Tuple<Author, AuthorLng> author;
                if (!authorToCourseDB.TryGetValue(db_id, out author))
                    throw new Exception(String.Format("Course \"{0}\" (Id={1}) doesn't have an author.", course_lng.Fields.Name, db_id));

                AuthorToCourse author_to_course = new AuthorToCourse();
                authors_to_courses.Elems.Add(author_to_course);
                author_to_course.Fields.Id = authors_to_courses.GetNextId();
                author_to_course.Fields.CourseId = course.Fields.Id;
                author_to_course.Fields.AuthorId = author.Item1.Fields.Id;

                coursesDB.Add(db_id, new Tuple<Course, CourseLng, CourseCategory>(course, course_lng, course_category));
            }
            rdr.Close();

            foreach (KeyValuePair<int, Tuple<Course, CourseLng, CourseCategory>> pair in coursesDB)
            {
                int db_id = pair.Key;
                Course course = pair.Value.Item1;
                CourseLng course_lng = pair.Value.Item2;
                CourseCategory course_category = pair.Value.Item3;

                //
                // Read course details
                //
                MySqlCommand cmd_det = new MySqlCommand(sql_get_term_det, conn);
                cmd_det.Parameters.AddWithValue("@Id", db_id);
                MySqlDataReader rdr_det = cmd_det.ExecuteReader();
                int photo_id = 0;
                while (rdr_det.Read())
                {
                    string option_name = rdr_det.GetString("meta_key");
                    if (option_name == att_course_cover_name)
                    {
                        Int32.TryParse(rdr_det.GetString("meta_value"), out photo_id);
                    }
                    else
                    if (option_name == att_course_category_name)
                    {
                        int cat_id = 0;
                        if (Int32.TryParse(rdr_det.GetString("meta_value"), out cat_id))
                        {
                            Tuple<Category, CategoryLng> cat;
                            if (categoriesDB.TryGetValue(cat_id, out cat))
                                course_category.Fields.CategoryId = cat.Item1.Fields.Id;
                            else
                                throw new Exception(String.Format("Can't find category (Id={0}) for course (Id={1}).", cat_id, db_id));
                        }
                    }
                    else
                    if (option_name == att_course_color_name)
                    {
                        try
                        {
                            string color = String.IsNullOrEmpty(rdr_det.GetString("meta_value")) ? null : rdr_det.GetString("meta_value");
                            course.Fields.Color = Convert.ToInt32(color.Replace("#", null), 16);
                        }
                        catch (Exception) { }
                    }
                }
                rdr_det.Close();
                if (photo_id != 0)
                {
                    cmd_det = new MySqlCommand(sql_get_postmeta_val, conn);
                    cmd_det.Parameters.AddWithValue("@PostId", photo_id);
                    cmd_det.Parameters.AddWithValue("@MetaKey", attached_file_meta);
                    rdr_det = cmd_det.ExecuteReader();
                    if (rdr_det.Read())
                    {
                        course.Fields.Cover = rdr_det.GetString("meta_value");
                    }
                    rdr_det.Close();
                }
            }

            //
            // Read Lessons
            //
            Dictionary<int, Tuple<Lesson, LessonLng, LessonCourse>> lessonsDB =
                new Dictionary<int, Tuple<Lesson, LessonLng, LessonCourse>>();
            LessonRoot lessons = new LessonRoot();
            allData.Add(lessons);
            LessonLngRoot lessons_lng = new LessonLngRoot();
            allData.Add(lessons_lng);
            LessonCourseRoot lessons_courses = new LessonCourseRoot();
            allData.Add(lessons_courses);

            cmd = new MySqlCommand(sql_get_lessons, conn);
            rdr = cmd.ExecuteReader();

            while (rdr.Read())
            {
                int db_id = rdr.GetInt32("lesson_id");
                Tuple<Course, CourseLng, CourseCategory> curr_course = null;
                if (!coursesDB.TryGetValue(rdr.GetInt32("course_id"), out curr_course))
                    throw new Exception(String.Format("Can't find course (Id={0}) for lesson (Id={1}).", rdr.GetInt32("course_id"), db_id));

                Tuple<Author, AuthorLng> curr_author;
                if (!authorsDB.TryGetValue(rdr.GetInt32("author_id"), out curr_author))
                    throw new Exception(String.Format("Can't find author (Id={0}) for lesson (Id={1}).", rdr.GetInt32("author_id"), db_id));

                // Child lessons are currently not processed ! 
                //
                if (String.Compare(rdr.GetString("is_ext"), "1") == 0)
                    continue;

                Lesson lesson = new Lesson();
                lessons.Elems.Add(lesson);
                lesson.Fields.Id = lessons.GetNextId();
                lesson.Fields.AuthorId = curr_author.Item1.Fields.Id;
                lesson.Fields.CourseId = curr_course.Item1.Fields.Id;
                lesson.Fields.LessonType = "L";

                LessonLng lesson_lng = new LessonLng();
                lessons_lng.Elems.Add(lesson_lng);
                lesson_lng.Fields.Id = lessons_lng.GetNextId();
                lesson_lng.Fields.LessonId = lesson.Fields.Id;
                lesson_lng.Fields.LanguageId = LANGUAGE_ID;
                lesson_lng.Fields.Name = rdr.GetString("lesson_name");
                lesson_lng.Fields.FullDescription = String.IsNullOrEmpty(rdr.GetString("post_content")) ? null : rdr.GetString("post_content");
                lesson_lng.Fields.State = "R";

                LessonCourse lesson_course = new LessonCourse();
                lessons_courses.Elems.Add(lesson_course);
                lesson_course.Fields.Id = lessons_courses.GetNextId();
                lesson_course.Fields.LessonId = lesson.Fields.Id;
                lesson_course.Fields.CourseId = curr_course.Item1.Fields.Id;
                lesson_course.Fields.State = "R";

                lessonsDB.Add(db_id, new Tuple<Lesson, LessonLng, LessonCourse>(lesson, lesson_lng, lesson_course));
            }
            rdr.Close();

            ReferenceRoot references = null;
            foreach (KeyValuePair<int, Tuple<Lesson, LessonLng, LessonCourse>> pair in lessonsDB)
            {
                int db_id = pair.Key;
                Lesson lesson = pair.Value.Item1;
                LessonLng lesson_lng = pair.Value.Item2;
                LessonCourse lesson_course = pair.Value.Item3;

                //
                // Read course details
                //
                MySqlCommand cmd_det = new MySqlCommand(sql_get_post_det, conn);
                cmd_det.Parameters.AddWithValue("@Id", db_id);
                MySqlDataReader rdr_det = cmd_det.ExecuteReader();

                Dictionary<string, string> lesson_prop_value = new Dictionary<string, string>();

                string val;
                while (rdr_det.Read())
                    if (!lesson_prop_value.TryGetValue(rdr_det.GetString("meta_key"), out val))
                        lesson_prop_value.Add(rdr_det.GetString("meta_key"), rdr_det.GetString("meta_value"));
                    else
                        lesson_prop_value[rdr_det.GetString("meta_key")] = rdr_det.GetString("meta_value");
                rdr_det.Close();

                int int_val = 0;

                if (lesson_prop_value.TryGetValue(att_lsn_number_name, out val))
                    if (Int32.TryParse(val, out int_val))
                        lesson_course.Fields.Number = int_val;

                int photo_id = 0;
                if (lesson_prop_value.TryGetValue(att_lsn_cover_name, out val))
                    Int32.TryParse(val, out photo_id);

                if (lesson_prop_value.TryGetValue(att_lsn_descr_name, out val))
                    lesson_lng.Fields.ShortDescription = val;

                bool flag = false;
                Dictionary<string, string> ref_attrs = ref_attrs_v1;
                if (lesson_prop_value.TryGetValue(ref_attrs["counter"], out val))
                    flag = Int32.TryParse(val, out int_val);

                if (!flag)
                {
                    ref_attrs = ref_attrs_v2;
                    if (lesson_prop_value.TryGetValue(ref_attrs["counter"], out val))
                        flag = Int32.TryParse(val, out int_val);
                }

                if (flag)
                {
                    for (int i = 0; i < int_val; i++)
                    {
                        string att_ref_name = String.Format(ref_attrs["att_ref_name"], i);
                        if (lesson_prop_value.TryGetValue(att_ref_name, out val))
                        {
                            if (references == null)
                            {
                                references = new ReferenceRoot();
                                allData.Add(references);
                            }
                            Reference reference = new Reference();
                            references.Elems.Add(reference);
                            reference.Fields.Id = references.GetNextId();
                            reference.Fields.LessonLngId = lesson_lng.Fields.Id;
                            reference.Fields.Number = i + 1;
                            reference.Fields.Description = val;
                            reference.Fields.Recommended = false;
                            string att_ref_url_name = String.Format(ref_attrs["att_ref_url_name"], i);
                            if (lesson_prop_value.TryGetValue(att_ref_url_name, out val))
                                reference.Fields.URL = String.IsNullOrEmpty(val) ? null : val;
                        }
                    }
                }

                if (photo_id != 0)
                {
                    cmd_det = new MySqlCommand(sql_get_postmeta_val, conn);
                    cmd_det.Parameters.AddWithValue("@PostId", photo_id);
                    cmd_det.Parameters.AddWithValue("@MetaKey", attached_file_meta);
                    rdr_det = cmd_det.ExecuteReader();
                    if (rdr_det.Read())
                        lesson.Fields.Cover = rdr_det.GetString("meta_value");
                    rdr_det.Close();
                }
            }

            conn.Close();

            //
            // Export to JSON files
            //
            foreach (RootDataObject root in allData)
                root.ToJSONFile(outDir, JSONFormatting, JSONEncoding, JSONSettings);

        }

        const int LANGUAGE_ID = 1;
        const int ACCOUNT_ID = 1;
        string conn_str;

        const string sql_get_category =
            "select `t`.`term_id` as `id`, `t`.`name`, `m`.`description`, `t`.`slug` as `alias` from `wp_term_taxonomy` `m`\n" +
            "  join `wp_terms` `t` on `t`.`term_id`=`m`.`term_id`\n" +
            "where `m`.`taxonomy` = @TermType";

        const string sql_get_auth_det =
            "select `option_name`, `option_value` from `wp_options`\n" +
            "  where `option_name` like @Author";

        const string att_author_photo_name = "фото";
        const string att_author_bio_name = "краткая_биография";

        const string att_course_cover_name = "иллюстрация_курса";
        const string att_course_category_name = "раздел";
        const string att_course_color_name = "color";

        const string att_ext_lsn_name = "dop_lecture_bool";
        const string att_parent_lsn_id_name = "main_lecture";

        Dictionary<string, string> ref_attrs_v1 = new Dictionary<string, string>
        {
            { "counter", "список_литературы_v2" },
            { "att_ref_name", "список_литературы_v2_{0}_название_список литературы_v2" },
            { "att_ref_url_name", "список_литературы_v2_{0}_url_список литературы_v2" }
        };
        Dictionary<string, string> ref_attrs_v2 = new Dictionary<string, string>
        {
            { "counter", "список_литературы" },
            { "att_ref_name", "список_литературы_{0}_название" },
            { "att_ref_url_name", "список_литературы_{0}_url" }
        };
        const string sql_get_term_det =
            "select `meta_key`, `meta_value` from `wp_termmeta`\n" +
            "  where `term_id` = @Id";

        const string sql_get_post_det =
            "select `meta_key`, `meta_value` from `wp_postmeta`\n" +
            "  where `post_id` = @Id";

        const string attached_file_meta = "_wp_attached_file";
        const string sql_get_postmeta_val =
            "select `m`.`meta_value` from `wp_posts` `p`\n" +
            "  join `wp_postmeta` `m` on `m`.`post_id` = `p`.`id`\n" +
            "where `p`.`id` = @PostId and `m`.`meta_key` = @MetaKey";

        const string sql_get_author_to_course =
            "select distinct `t`.`term_id` as `author_id`, `t`.`name` as `author_name`, `tc`.`term_id` as `course_id`, `tc`.`name` as `course_name` from `wp_terms` `t`\n" +
            "  join `wp_term_taxonomy` `m` on `t`.`term_id` = `m`.`term_id` and `m`.`taxonomy` = 'autor'\n" +
            "  join `wp_term_relationships` `r` on `r`.`term_taxonomy_id` = `m`.`term_taxonomy_id`\n" +
            "  join `wp_posts` `p` on `p`.`id` = `r`.`object_id`\n" +
            "  join `wp_term_relationships` `rc` on `rc`.`object_id` = `r`.`object_id`\n" +
            "  join `wp_term_taxonomy` `mc` on `rc`.`term_taxonomy_id` = `mc`.`term_taxonomy_id` and `mc`.`taxonomy` = 'category'\n" +
            "  join `wp_terms` `tc` on `tc`.`term_id` = `mc`.`term_id`\n" +
            "order by `t`.`term_id`, `tc`.`term_id`";

        const string att_lsn_number_name = "номер_сортировки";
        const string att_lsn_cover_name = "картинка_лекции";
        const string att_lsn_descr_name = "краткое_описание";

        const string sql_get_lessons =
            "select `t`.`term_id` as `author_id`, `t`.`name` as `author_name`, `tc`.`term_id` as `course_id`, `tc`.`name` as `course_name`,\n" +
            "  `p`.`id` as `lesson_id`, coalesce(`pm`.`meta_value`,'0') `is_ext`, `p`.`post_title` as `lesson_name`, `p`.`post_content`, `p`.`post_excerpt`,\n" +
            "  `p`.`post_status`, `p`.`comment_status`, `p`.`ping_status`, `p`.`post_name` from `wp_terms` `t`\n" +
            "  join `wp_term_taxonomy` `m` on `t`.`term_id` = `m`.`term_id` and `m`.`taxonomy` = 'autor'\n" +
            "  join `wp_term_relationships` `r` on `r`.`term_taxonomy_id` = `m`.`term_taxonomy_id`\n" +
            "  join `wp_posts` `p` on `p`.`id` = `r`.`object_id`\n" +
            "  join `wp_term_relationships` `rc` on `rc`.`object_id` = `r`.`object_id`\n" +
            "  join `wp_term_taxonomy` `mc` on `rc`.`term_taxonomy_id` = `mc`.`term_taxonomy_id` and `mc`.`taxonomy` = 'category'\n" +
            "  join `wp_terms` `tc` on `tc`.`term_id` = `mc`.`term_id`\n" +
            "  left join(select `post_id`, `meta_value` from `wp_postmeta` where `meta_key` = 'dop_lecture_bool') `pm` on `pm`.`post_id` = `p`.`id`\n" +
            "order by `t`.`term_id`, `tc`.`term_id`, `p`.`id`";

        Encoding enc = new UTF8Encoding(false); // UTF8 w/o BOM 
        JsonSerializerSettings jss = new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore };
        Formatting fmt = Formatting.None;

    };

    class Program
    {
        static void Main(string[] args)
        {
            const string csDfltErrFileName = "Err.txt";
            const string csDfltServer = "localhost";
            const string csDfltDB = "magisteria";
            const int ciStartId = 0;
            const int ciDfltPort = 3306;
            const string csDfltUser = "sa";
            const string csDfltPwd = "system";

            string server_name = csDfltServer;
            string db_name = csDfltDB;
            string errFileName = csDfltErrFileName;
            int startId = ciStartId;
            string user_name = csDfltUser;
            string pwd = csDfltPwd;
            int server_port = ciDfltPort;

            bool is_server_next = false, is_db_next = false;
            bool is_start_id_next = false;
            bool is_fname_next = false;
            bool is_user_next = false, is_pwd_next = false;
            bool is_port_next = false;

            for (int i = 0; i < args.Length; i++)
            {
                if (is_server_next)
                    server_name = args[i];
                else
                    if (is_db_next)
                    db_name = args[i];
                else
                    if (is_user_next)
                    user_name = args[i];
                else
                    if (is_pwd_next)
                    pwd = args[i];
                else
                    if (is_fname_next)
                    errFileName = args[i];
                else
                    if (is_start_id_next)
                    startId = Int32.Parse(args[i]);
                else
                    if (is_port_next)
                    server_port = Int32.Parse(args[i]);
                else
                    switch (args[i])
                    {
                        case "-s":
                        case "-S":
                            is_server_next = true;
                            continue;

                        case "-b":
                        case "-B":
                            is_db_next = true;
                            continue;

                        case "-u":
                        case "-U":
                            is_user_next = true;
                            continue;

                        case "-p":
                        case "-P":
                            is_pwd_next = true;
                            continue;

                        case "-f":
                        case "-F":
                            is_fname_next = true;
                            continue;

                        case "-i":
                        case "-I":
                            is_start_id_next = true;
                            continue;

                        case "-t":
                        case "-T":
                            is_port_next = true;
                            continue;
                    };
                is_server_next = false;
                is_db_next = false;
                is_user_next = false;
                is_pwd_next = false;
                is_fname_next = false;
                is_start_id_next = false;
                is_port_next = false;
            };

            Console.WriteLine(String.Format("Server: {0}:{1}", server_name, server_port));
            Console.WriteLine("Data Base: " + db_name);
            Console.WriteLine("User: " + user_name);
            Console.WriteLine("Err file: " + errFileName);
            Console.WriteLine("Start ID: " + startId);

            string connStr = String.Format("server={0};user={2};database={1};password={3};port={4}",
                server_name, db_name, user_name, pwd, server_port);

            MagisteryToJSON mag = new MagisteryToJSON(connStr);
            mag.JSONFormatting = Formatting.Indented;
            mag.StartImport("..\\..\\data");
        }
    }
}
