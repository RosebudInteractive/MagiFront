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
        public class JSONSerializable
        {
            public virtual string GetClassName()
            {
                return this.GetType().Name;
            }

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

            Encoding enc_dflt = new UTF8Encoding(false); /* UTF8 w/o BOM */
            JsonSerializerSettings jss = new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore };

            const string EXT_DFLT = ".json";
        }

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

        public class DataObject: JSONSerializable
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

            public override string GetClassName() { return "RootDataObject"; }

            public int GetNextId() { return current_id++; }
            int current_id = 1;

        };

        public class DataObjTyped<T, R> : DataObject where T : BaseFieldsData, new() where R : RootDataObject, new()
        {
            [JsonIgnore]
            public static List<RootDataObject> AllData
            {
                get { return all_data; }
                set
                {
                    if (all_data != value)
                    {
                        all_data = value;
                        if ((Root != null) && (all_data != null))
                            all_data.Add(Root);
                    }
                }
            }
            [JsonIgnore]
            public static R Root = null;

            [JsonIgnore]
            public T Fields { get { return (T)fields; } }
            public DataObjTyped(string type_guid)
            {
                _sys = new SysFieldsData { typeGuid = type_guid };
                fields = new T();
                if (Root == null)
                {
                    Root = new R();
                    if (AllData != null)
                        AllData.Add(Root);
                }
                fields.Id = Root.GetNextId();
                Root.Elems.Add(this);
            }
            static List<RootDataObject> all_data = null;
        };

        //
        // Language
        //
        public class LanguageFields : BaseFieldsData
        {
            public string Code { get; set; }
            public string Language { get; set; }
        };

        public class Language : DataObjTyped<LanguageFields, LanguageRoot>
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

        public class Account : DataObjTyped<AccountFields, AccountRoot>
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

        public class AccountLng : DataObjTyped<AccountLngFields, AccountLngRoot>
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

        public class Author : DataObjTyped<AuthorFields, AuthorRoot>
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

        public class AuthorLng : DataObjTyped<AuthorLngFields, AuthorLngRoot>
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

        public class AuthorToCourse : DataObjTyped<AuthorToCourseFields, AuthorToCourseRoot>
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

        public class Course : DataObjTyped<CourseFields, CourseRoot>
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

        public class CourseLng : DataObjTyped<CourseLngFields, CourseLngRoot>
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

        public class Category : DataObjTyped<CategoryFields, CategoryRoot>
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

        public class CategoryLng : DataObjTyped<CategoryLngFields, CategoryLngRoot>
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

        public class CourseCategory : DataObjTyped<CourseCategoryFields, CourseCategoryRoot>
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
            public int CourseId { get; set; }
            public int AuthorId { get; set; }
            public int? ParentId { get; set; }
            public string LessonType { get; set; }
            public string Cover { get; set; }
            public string URL { get; set; }
        };

        public class Lesson : DataObjTyped<LessonFields, LessonRoot>
        {
            const string CLASS_GUID = "caadef95-278b-4cad-acc9-a1e27380d6c6";
            public bool HasParent { get; set; }
            public Lesson() : base(CLASS_GUID) { HasParent = false; }
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

        public class LessonLng : DataObjTyped<LessonLngFields, LessonLngRoot>
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
            public int CourseId { get; set; }
            public int LessonId { get; set; }
            public int? ParentId { get; set; }
            public int Number { get; set; }
            public DateTime? ReadyDate { get; set; }
            public string State { get; set; }
        };

        public class LessonCourse : DataObjTyped<LessonCourseFields, LessonCourseRoot>
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

        public class Reference : DataObjTyped<ReferenceFields, ReferenceRoot>
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

        //
        // Episode
        //
        public class EpisodeFields : BaseFieldsData
        {
            public int LessonId { get; set; }
            public string EpisodeType { get; set; }
        };

        public class Episode : DataObjTyped<EpisodeFields, EpisodeRoot>
        {
            const string CLASS_GUID = "0299e4f3-280d-4622-82ca-8090966fcef6";
            public Episode() : base(CLASS_GUID) { }
        };

        public class EpisodeRoot : RootDataObject
        {
            const string CLASS_GUID = "82466573-53fb-44e5-aec8-dc339d1a2fd8";
            public override string GetClassName() { return "Episode"; }
            public EpisodeRoot() : base(CLASS_GUID) { }
        };

        //
        // EpisodeLng
        //
        public class EpisodeLngFields : BaseFieldsData
        {
            public int EpisodeId { get; set; }
            public int LanguageId { get; set; }
            public string State { get; set; }
            public string Name { get; set; }
            public string Transcript { get; set; }
            public string Audio { get; set; }
            public string Structure { get; set; }
        };

        public class EpisodeLng : DataObjTyped<EpisodeLngFields, EpisodeLngRoot>
        {
            const string CLASS_GUID = "e9a4a681-b2d9-48fe-8c82-cb2201d5ef77";
            public EpisodeLng() : base(CLASS_GUID) { }
        };

        public class EpisodeLngRoot : RootDataObject
        {
            const string CLASS_GUID = "f24fb64f-1e2f-4412-9380-9646181fdbe6";
            public override string GetClassName() { return "EpisodeLng"; }
            public EpisodeLngRoot() : base(CLASS_GUID) { }
        };

        //
        // EpisodeLesson
        //
        public class EpisodeLessonFields : BaseFieldsData
        {
            public int LessonId { get; set; }
            public int EpisodeId { get; set; }
            public int Number { get; set; }
            public bool Supp { get; set; }
        };

        public class EpisodeLesson : DataObjTyped<EpisodeLessonFields, EpisodeLessonRoot>
        {
            const string CLASS_GUID = "94d10a1d-d902-489b-8243-5c2dfea57174";
            public EpisodeLesson() : base(CLASS_GUID) { }
        };

        public class EpisodeLessonRoot : RootDataObject
        {
            const string CLASS_GUID = "83abc96a-5184-4ed2-a9f2-ccd64733a22e";
            public override string GetClassName() { return "EpisodeLesson"; }
            public EpisodeLessonRoot() : base(CLASS_GUID) { }
        };

        //
        // EpisodeToc
        //
        public class EpisodeTocFields : BaseFieldsData
        {
            public int EpisodeId { get; set; }
            public int Number { get; set; }
        };

        public class EpisodeToc : DataObjTyped<EpisodeTocFields, EpisodeTocRoot>
        {
            const string CLASS_GUID = "3936efa7-f575-4de0-80ae-c92ab90f39ae";
            public EpisodeToc() : base(CLASS_GUID) { }
        };

        public class EpisodeTocRoot : RootDataObject
        {
            const string CLASS_GUID = "55fbcaae-b627-4227-944a-ed166b739c6f";
            public override string GetClassName() { return "EpisodeToc"; }
            public EpisodeTocRoot() : base(CLASS_GUID) { }
        };

        //
        // EpisodeTocLng
        //
        public class EpisodeTocLngFields : BaseFieldsData
        {
            public int EpisodeTocId { get; set; }
            public int LanguageId { get; set; }
            public string Topic { get; set; }
            public int StartTime { get; set; }
        };

        public class EpisodeTocLng : DataObjTyped<EpisodeTocLngFields, EpisodeTocLngRoot>
        {
            const string CLASS_GUID = "fdf9eaf6-38b4-4c08-96b7-11ceee183318";
            public EpisodeTocLng() : base(CLASS_GUID) { }
        };

        public class EpisodeTocLngRoot : RootDataObject
        {
            const string CLASS_GUID = "3866b984-ed0b-4dfc-8567-de00401d5c95";
            public override string GetClassName() { return "EpisodeTocLng"; }
            public EpisodeTocLngRoot() : base(CLASS_GUID) { }
        };

        //
        // Resource
        //
        public class ResourceFields : BaseFieldsData
        {
            public int LessonId { get; set; }
            public int? EntityId { get; set; }
            public int? LanguageId { get; set; }
            public string ResType { get; set; }
            public string FileName { get; set; }
        };

        public class Resource : DataObjTyped<ResourceFields, ResourceRoot>
        {
            const string CLASS_GUID = "89e7a678-5414-498f-b635-b172bf402816";
            public Resource() : base(CLASS_GUID) { }
        };

        public class ResourceRoot : RootDataObject
        {
            const string CLASS_GUID = "5c605246-56ff-4b40-9c27-242e678899e4";
            public override string GetClassName() { return "Resource"; }
            public ResourceRoot() : base(CLASS_GUID) { }
        };

        //
        // ResourceLng
        //
        public class ResourceLngFields : BaseFieldsData
        {
            public int ResourceId { get; set; }
            public int LanguageId { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
        };

        public class ResourceLng : DataObjTyped<ResourceLngFields, ResourceLngRoot>
        {
            const string CLASS_GUID = "08fc5411-e11e-48be-bbb4-b7638a600f71";
            public ResourceLng() : base(CLASS_GUID) { }
        };

        public class ResourceLngRoot : RootDataObject
        {
            const string CLASS_GUID = "4f1238b4-c65c-4c19-bea8-b67413d724aa";
            public override string GetClassName() { return "ResourceLng"; }
            public ResourceLngRoot() : base(CLASS_GUID) { }
        };

        //
        // EpisodeContent
        //
        public class EpisodeContentFields : BaseFieldsData
        {
            public int EpisodeLngId { get; set; }
            public int ResourceId { get; set; }
            public string CompType { get; set; }
            public int StartTime { get; set; }
            public int Duration { get; set; }
            public string Content { get; set; }
        };

        public class EpisodeContent : DataObjTyped<EpisodeContentFields, EpisodeContentRoot>
        {
            const string CLASS_GUID = "b6b2fbd3-57e6-48c1-aa8b-7751daa2bfed";
            public EpisodeContent() : base(CLASS_GUID) { }
        };

        public class EpisodeContentRoot : RootDataObject
        {
            const string CLASS_GUID = "1996d0fc-a93f-420f-b1c3-627fef86bb60";
            public override string GetClassName() { return "EpisodeContent"; }
            public EpisodeContentRoot() : base(CLASS_GUID) { }
        };

        public class ResourceDescription: JSONSerializable
        {
            public string Name { get; set; }
            public string Description { get; set; }

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

            Language.AllData = allData;
            Language lang = new Language();
            lang.Fields.Id = LANGUAGE_ID;
            lang.Fields.Code = "RUS";
            lang.Fields.Language = "Русский";

            lang = new Language();
            lang.Fields.Code = "ENG";
            lang.Fields.Language = "English";

            lang = new Language();
            lang.Fields.Code = "FRA";
            lang.Fields.Language = "Français";

            lang = new Language();
            lang.Fields.Code = "GER";
            lang.Fields.Language = "Deutsch";

            Account.AllData = allData;
            Account acc = new Account();
            acc.Fields.Id = ACCOUNT_ID;
            acc.Fields.DefLangId = LANGUAGE_ID;
            acc.Fields.Domain = "pmt";

            AccountLng.AllData = allData;
            AccountLng acc_lng = new AccountLng();
            acc_lng.Fields.AccountId = ACCOUNT_ID;
            acc_lng.Fields.LanguageId = LANGUAGE_ID;
            acc_lng.Fields.Name = "Пост Модерн Текнолоджи";

            conn = new MySqlConnection(conn_str);
            Console.WriteLine("Connecting to MySQL...");
            conn.Open();

            //
            // Read Categories
            //
            Category.AllData = allData;
            CategoryLng.AllData = allData;
            Dictionary<int, Tuple<Category, CategoryLng>> categoriesDB = new Dictionary<int, Tuple<Category, CategoryLng>>();

            MySqlCommand cmd = new MySqlCommand(sql_get_category, conn);
            cmd.Parameters.AddWithValue("@TermType", "razdel");
            rdr = cmd.ExecuteReader();

            while (rdr.Read())
            {
                int db_id = rdr.GetInt32("id");
                Category cat = new Category();
                cat.Fields.AccountId = ACCOUNT_ID;

                CategoryLng cat_lng = new CategoryLng();
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
            Author.AllData = allData;
            AuthorLng.AllData = allData;
            Dictionary<int, Tuple<Author, AuthorLng>> authorsDB = new Dictionary<int, Tuple<Author, AuthorLng>>();

            cmd = new MySqlCommand(sql_get_category, conn);
            cmd.Parameters.AddWithValue("@TermType", "autor");
            rdr = cmd.ExecuteReader();

            while (rdr.Read())
            {
                int db_id = rdr.GetInt32("id");
                Author au = new Author();
                au.Fields.AccountId = ACCOUNT_ID;

                AuthorLng au_lng = new AuthorLng();
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
                rdr = cmd_det.ExecuteReader();
                int photo_id = 0;
                while (rdr.Read())
                {
                    string option_name = rdr.GetString("meta_key");
                    if (option_name == att_author_photo_name)
                    {
                        Int32.TryParse(rdr.GetString("meta_value"), out photo_id);
                    }
                    else
                    if (option_name == att_author_bio_name)
                        au_lng.Fields.Description =
                            String.IsNullOrEmpty(rdr.GetString("meta_value")) ? null : rdr.GetString("meta_value");
                }
                rdr.Close();
                if (photo_id != 0)
                {
                    cmd_det = new MySqlCommand(sql_get_postmeta_val, conn);
                    cmd_det.Parameters.AddWithValue("@PostId", photo_id);
                    cmd_det.Parameters.AddWithValue("@MetaKey", attached_file_meta);
                    rdr = cmd_det.ExecuteReader();
                    if (rdr.Read())
                    {
                        au.Fields.Portrait = rdr.GetString("meta_value");
                    }
                    rdr.Close();
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
            Course.AllData = allData;
            CourseLng.AllData = allData;
            CourseCategory.AllData = allData;
            AuthorToCourse.AllData = allData;

            Dictionary<int, Tuple<Course, CourseLng, CourseCategory>> coursesDB =
                new Dictionary<int, Tuple<Course, CourseLng, CourseCategory>>();

            cmd = new MySqlCommand(sql_get_category, conn);
            cmd.Parameters.AddWithValue("@TermType", "category");
            rdr = cmd.ExecuteReader();

            while (rdr.Read())
            {
                int db_id = rdr.GetInt32("id");
                if (db_id == 1) // Skip 1st fake course
                    continue;
                Course course = new Course();
                course.Fields.AccountId = ACCOUNT_ID;
                course.Fields.LanguageId = LANGUAGE_ID;
                course.Fields.OneLesson = false;
                course.Fields.URL = String.IsNullOrEmpty(rdr.GetString("alias")) ? null : rdr.GetString("alias");
                course.Fields.State = "P";

                CourseLng course_lng = new CourseLng();
                course_lng.Fields.CourseId = course.Fields.Id;
                course_lng.Fields.LanguageId = LANGUAGE_ID;
                course_lng.Fields.Name = String.IsNullOrEmpty(rdr.GetString("name")) ? null : rdr.GetString("name");
                course_lng.Fields.Description = String.IsNullOrEmpty(rdr.GetString("description")) ? null : rdr.GetString("description");
                course_lng.Fields.State = "R";

                CourseCategory course_category = new CourseCategory();
                course_category.Fields.CourseId = course.Fields.Id;

                Tuple<Author, AuthorLng> author;
                if (!authorToCourseDB.TryGetValue(db_id, out author))
                    throw new Exception(String.Format("Course \"{0}\" (Id={1}) doesn't have an author.", course_lng.Fields.Name, db_id));

                AuthorToCourse author_to_course = new AuthorToCourse();
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
                rdr = cmd_det.ExecuteReader();
                int photo_id = 0;
                while (rdr.Read())
                {
                    string option_name = rdr.GetString("meta_key");
                    if (option_name == att_course_cover_name)
                    {
                        Int32.TryParse(rdr.GetString("meta_value"), out photo_id);
                    }
                    else
                    if (option_name == att_course_category_name)
                    {
                        int cat_id = 0;
                        if (Int32.TryParse(rdr.GetString("meta_value"), out cat_id))
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
                            string color = String.IsNullOrEmpty(rdr.GetString("meta_value")) ? null : rdr.GetString("meta_value");
                            course.Fields.Color = Convert.ToInt32(color.Replace("#", null), 16);
                        }
                        catch (Exception) { }
                    }
                }
                rdr.Close();
                if (photo_id != 0)
                {
                    cmd_det = new MySqlCommand(sql_get_postmeta_val, conn);
                    cmd_det.Parameters.AddWithValue("@PostId", photo_id);
                    cmd_det.Parameters.AddWithValue("@MetaKey", attached_file_meta);
                    rdr = cmd_det.ExecuteReader();
                    if (rdr.Read())
                    {
                        course.Fields.Cover = rdr.GetString("meta_value");
                    }
                    rdr.Close();
                }
            }

            //
            // Read Lessons
            //
            Lesson.AllData = allData;
            LessonLng.AllData = allData;
            LessonCourse.AllData = allData;
            Episode.AllData = allData;
            EpisodeLng.AllData = allData;
            EpisodeLesson.AllData = allData;
            Dictionary<int, Tuple<Lesson, LessonLng, LessonCourse, Episode, EpisodeLng, EpisodeLesson>> lessonsDB =
                new Dictionary<int, Tuple<Lesson, LessonLng, LessonCourse, Episode, EpisodeLng, EpisodeLesson>>();

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

                Lesson lesson = new Lesson();
                lesson.Fields.AuthorId = curr_author.Item1.Fields.Id;
                lesson.Fields.CourseId = curr_course.Item1.Fields.Id;
                lesson.Fields.LessonType = "L";
                lesson.Fields.URL= rdr.GetString("post_name");
                lesson.HasParent = String.Compare(rdr.GetString("is_ext"), "1") == 0;

                LessonLng lesson_lng = new LessonLng();
                lesson_lng.Fields.LessonId = lesson.Fields.Id;
                lesson_lng.Fields.LanguageId = LANGUAGE_ID;
                lesson_lng.Fields.Name = rdr.GetString("lesson_name");
                lesson_lng.Fields.State = "R";

                LessonCourse lesson_course = new LessonCourse();
                lesson_course.Fields.LessonId = lesson.Fields.Id;
                lesson_course.Fields.CourseId = curr_course.Item1.Fields.Id;
                lesson_course.Fields.State = "R";

                Episode episode = new Episode();
                episode.Fields.LessonId = lesson.Fields.Id;
                episode.Fields.EpisodeType = "L";

                EpisodeLng episode_lng = new EpisodeLng();
                episode_lng.Fields.EpisodeId = episode.Fields.Id;
                episode_lng.Fields.LanguageId = LANGUAGE_ID;
                episode_lng.Fields.State = "R";
                episode_lng.Fields.Name = lesson_lng.Fields.Name;
                episode_lng.Fields.Transcript = String.IsNullOrEmpty(rdr.GetString("post_content")) ? null : rdr.GetString("post_content");

                EpisodeLesson episode_lsn = new EpisodeLesson();
                episode_lsn.Fields.EpisodeId = episode.Fields.Id;
                episode_lsn.Fields.LessonId = lesson.Fields.Id;
                episode_lsn.Fields.Number = 1;
                episode_lsn.Fields.Supp = false;

                lessonsDB.Add(db_id, new Tuple<Lesson, LessonLng, LessonCourse, Episode,
                    EpisodeLng, EpisodeLesson>(lesson, lesson_lng, lesson_course, episode, episode_lng, episode_lsn));
            }
            rdr.Close();

            Reference.AllData = allData;
            EpisodeToc.AllData = allData;
            EpisodeTocLng.AllData = allData;

            Resource.AllData = allData;
            ResourceLng.AllData = allData;
            EpisodeContent.AllData = allData;

            foreach (KeyValuePair<int, Tuple<Lesson, LessonLng, LessonCourse, Episode, EpisodeLng, EpisodeLesson>> pair in lessonsDB)
            {
                int db_id = pair.Key;
                Lesson lesson = pair.Value.Item1;
                LessonLng lesson_lng = pair.Value.Item2;
                LessonCourse lesson_course = pair.Value.Item3;
                Episode episode = pair.Value.Item4;
                EpisodeLng episode_lng = pair.Value.Item5;
                EpisodeLesson episode_lsn = pair.Value.Item6;

                //
                // Read lesson details
                //
                MySqlCommand cmd_det = new MySqlCommand(sql_get_post_det, conn);
                cmd_det.Parameters.AddWithValue("@Id", db_id);
                rdr = cmd_det.ExecuteReader();

                Dictionary<string, string> lesson_prop_value = new Dictionary<string, string>();

                string val;
                while (rdr.Read())
                    if (!lesson_prop_value.TryGetValue(rdr.GetString("meta_key"), out val))
                        lesson_prop_value.Add(rdr.GetString("meta_key"), rdr.GetString("meta_value"));
                    else
                        lesson_prop_value[rdr.GetString("meta_key")] = rdr.GetString("meta_value");
                rdr.Close();

                int int_val = 0;

                if (lesson.HasParent)
                {
                    lesson.Fields.ParentId = null;
                    int parent_db = 0;
                    if (lesson_prop_value.TryGetValue(att_lsn_parent_id_name, out val))
                        Int32.TryParse(val, out parent_db);
                    if (parent_db == 0)
                        throw new Exception(String.Format("Lesson \"{0}\" (Id={1}): Invalid value of attr \"{2}\".",
                            lesson_lng.Fields.Name, db_id, att_lsn_parent_id_name));
                    Tuple<Lesson, LessonLng, LessonCourse, Episode, EpisodeLng, EpisodeLesson> parent = null;
                    if (!lessonsDB.TryGetValue(parent_db, out parent))
                        throw new Exception(String.Format("Lesson \"{0}\" (Id={1}): Can't find parent (DbId={2}).",
                            lesson_lng.Fields.Name, db_id, parent_db));

                    Lesson parent_lesson = parent.Item1;
                    lesson.Fields.ParentId = parent_lesson.Fields.Id;

                    LessonCourse lesson_course_parent = parent.Item3;
                    lesson_course.Fields.ParentId = lesson_course_parent.Fields.Id;
                }

                if (lesson_prop_value.TryGetValue(att_lsn_number_name, out val))
                    if (Int32.TryParse(val, out int_val))
                        lesson_course.Fields.Number = int_val;

                int photo_id = 0;
                if (lesson_prop_value.TryGetValue(att_lsn_cover_name, out val))
                    Int32.TryParse(val, out photo_id);

                int audio_id = 0;
                if (lesson_prop_value.TryGetValue(att_lsn_audio_name, out val))
                    Int32.TryParse(val, out audio_id);

                if (lesson_prop_value.TryGetValue(att_lsn_descr_name, out val))
                    lesson_lng.Fields.ShortDescription = val;

                // References
                //
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
                            Reference reference = new Reference();
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

                // Table of content
                //
                if (lesson_prop_value.TryGetValue(att_lsn_toc_name, out val))
                    if (Int32.TryParse(val, out int_val))
                    {
                        for (int i = 0; i < int_val; i++)
                        {
                            string att_topic = String.Format(att_lsn_toc_dsc_name, i);
                            string att_time = String.Format(att_lsn_toc_tm_name, i);
                            string att_time_ms = String.Format(att_lsn_toc_tms_name, i);
                            if (lesson_prop_value.TryGetValue(att_topic, out val))
                            {
                                EpisodeToc epi_toc = new EpisodeToc();
                                epi_toc.Fields.EpisodeId = episode.Fields.Id;
                                epi_toc.Fields.Number = i + 1;
                                EpisodeTocLng epi_toc_lng = new EpisodeTocLng();
                                epi_toc_lng.Fields.EpisodeTocId = epi_toc.Fields.Id;
                                epi_toc_lng.Fields.LanguageId = LANGUAGE_ID;
                                epi_toc_lng.Fields.Topic = val;
                                epi_toc_lng.Fields.StartTime = 0;
                                int tms = 0;
                                if (lesson_prop_value.TryGetValue(att_time_ms, out val))
                                    Int32.TryParse(val, out tms);
                                 if (lesson_prop_value.TryGetValue(att_time, out val))
                                {
                                    epi_toc_lng.Fields.StartTime = stringToSec(val) * 1000 + tms;
                                    //epi_toc_lng.Fields.Topic += String.Format(" {0}.{1}", val, tms);
                                }
                            }
                        }
                    }

                // Pictures
                //
                Dictionary<int, Tuple<Resource, ResourceLng>> resourcesDB = new Dictionary<int, Tuple<Resource, ResourceLng>>();
                if (lesson_prop_value.TryGetValue(att_lsn_rc_name, out val))
                    if (Int32.TryParse(val, out int_val))
                    {
                        EpisodeContent epi_content_prev = null;
                        for (int i = 0; i < int_val; i++)
                        {
                            string att_id = String.Format(att_lsn_rc_id_name, i);
                            string att_time = String.Format(att_lsn_rc_tm_name, i);
                            string att_time_ms = String.Format(att_lsn_toc_tms_name, i);
                            int picture_id;
                            if (lesson_prop_value.TryGetValue(att_id, out val))
                            {
                                if (Int32.TryParse(val, out picture_id))
                                {
                                    Resource resource = null; ;
                                    ResourceLng res_lng = null;
                                    Tuple<Resource, ResourceLng> res_reslng = null;
                                    if (resourcesDB.TryGetValue(picture_id, out res_reslng))
                                    {
                                        resource = res_reslng.Item1;
                                        res_lng = res_reslng.Item2;
                                    }
                                    else
                                    {
                                        Dictionary<string, string> file_desc = getFileDecription(picture_id);
                                        string fn;
                                        if (file_desc.TryGetValue("FileName", out fn))
                                        {
                                            resource = new Resource();
                                            resource.Fields.LessonId = lesson.Fields.Id;
                                            resource.Fields.ResType = "P";
                                            resource.Fields.FileName = fn;
                                            res_lng = new ResourceLng();
                                            res_lng.Fields.ResourceId = resource.Fields.Id;
                                            res_lng.Fields.LanguageId = LANGUAGE_ID;
                                            if (file_desc.TryGetValue("Description", out fn))
                                                res_lng.Fields.Name = fn;
                                            else
                                                throw new Exception(String.Format("Picture (Id={0}): Description is empty.", picture_id));
                                            if (file_desc.TryGetValue("ExtDescription", out fn))
                                                res_lng.Fields.Description = fn;

                                            resourcesDB.Add(picture_id, new Tuple<Resource, ResourceLng>(resource, res_lng));
                                        }
                                    }
                                    if ((resource != null) && (res_lng != null))
                                    {
                                        EpisodeContent epi_content = new EpisodeContent();
                                        epi_content.Fields.EpisodeLngId = episode_lng.Fields.Id;
                                        epi_content.Fields.ResourceId = resource.Fields.Id;
                                        epi_content.Fields.CompType = "PIC";
                                        epi_content.Fields.Content =
                                            (
                                                new ResourceDescription
                                                {
                                                    Name = res_lng.Fields.Name,
                                                    Description = res_lng.Fields.Description
                                                }
                                            )
                                            .ToJSONString();
                                        epi_content.Fields.Duration = 0;
                                        epi_content.Fields.StartTime = 0;
                                        int tms = 0;
                                        if (lesson_prop_value.TryGetValue(att_time_ms, out val))
                                            Int32.TryParse(val, out tms);
                                        if (lesson_prop_value.TryGetValue(att_time, out val))
                                        {
                                            epi_content.Fields.StartTime = stringToSec(val) * 1000 + tms;
                                            if (epi_content_prev != null)
                                                epi_content_prev.Fields.Duration =
                                                    epi_content.Fields.StartTime - epi_content_prev.Fields.StartTime;
                                        }
                                        epi_content_prev = epi_content;
                                    }
                                }
                            }
                        }
                    }

                // Cover
                //
                if (photo_id != 0)
                {
                    cmd_det = new MySqlCommand(sql_get_postmeta_val, conn);
                    cmd_det.Parameters.AddWithValue("@PostId", photo_id);
                    cmd_det.Parameters.AddWithValue("@MetaKey", attached_file_meta);
                    rdr = cmd_det.ExecuteReader();
                    if (rdr.Read())
                        lesson.Fields.Cover = rdr.GetString("meta_value");
                    rdr.Close();
                }

                // Audio file
                //
                if (audio_id != 0)
                {
                    cmd_det = new MySqlCommand(sql_get_postmeta_val, conn);
                    cmd_det.Parameters.AddWithValue("@PostId", audio_id);
                    cmd_det.Parameters.AddWithValue("@MetaKey", attached_file_meta);
                    rdr = cmd_det.ExecuteReader();
                    if (rdr.Read())
                        episode_lng.Fields.Audio = rdr.GetString("meta_value");
                    rdr.Close();
                }
            }

            conn.Close();

            //
            // Export to JSON files
            //
            foreach (RootDataObject root in allData)
                root.ToJSONFile(outDir, JSONFormatting, JSONEncoding, JSONSettings);

        }

        int stringToSec(string time)
        {
            int res = 0;
            char[] sep = { ':' };
            string[] vals = time.Split(sep, StringSplitOptions.RemoveEmptyEntries);
            for (int i = vals.Length - 1, mult = 1, val = 0; i >= 0; i--, mult *= 60)
                if (Int32.TryParse(vals[i], out val))
                    res += val * mult;
            return res;
        }

        Dictionary<string, string> getFileDecription(int obj_id)
        {
            Dictionary<string, string> res = new Dictionary<string, string>();
            MySqlCommand cmd = new MySqlCommand(sql_get_file_desc, conn);
            cmd.Parameters.AddWithValue("@PostId", obj_id);
            rdr = cmd.ExecuteReader();
            if (rdr.Read())
            {
                res["ExtDescription"] = rdr.GetString("ext_desc");
                res["Description"] = rdr.GetString("desc");
                res["Name"] = rdr.GetString("name");
                res["FileName"] = rdr.GetString("file_name");
            }
            rdr.Close();
            return res;
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

        const string sql_get_file_desc =
            "select `p`.`post_content` as `ext_desc`, `p`.`post_title` as `desc`, `p`.`post_name` as `name`,\n"+
            "  `m`.`meta_value` as `file_name` from `wp_posts` `p`\n" +
            "  left join `wp_postmeta` `m` on `m`.`post_id` = `p`.`id` and `m`.`meta_key` = '_wp_attached_file'\n" +
            "where `p`.`id` = @PostId";

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
        const string att_lsn_ext_name = "dop_lecture_bool";
        const string att_lsn_parent_id_name = "main_lecture";
        const string att_lsn_audio_name = "audio";

        const string att_lsn_toc_name = "оглавление";
        const string att_lsn_toc_dsc_name = "оглавление_{0}_название";
        const string att_lsn_toc_tm_name = "оглавление_{0}_время";
        const string att_lsn_toc_tms_name = "оглавление_{0}_время_миллисекунды";

        const string att_lsn_rc_name = "иллюстрации_лекции_(слайды)";
        const string att_lsn_rc_id_name = "иллюстрации_лекции_(слайды)_{0}_картинка";
        const string att_lsn_rc_tm_name = "иллюстрации_лекции_(слайды)_{0}_время";
        const string att_lsn_rc_tms_name = "иллюстрации_лекции_(слайды)_{0}_время_миллисекунды";

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

        MySqlConnection conn;
        MySqlDataReader rdr;
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
