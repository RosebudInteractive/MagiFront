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

            public string ToJSONFile(string outFile, Formatting fmt = Formatting.None, Encoding enc = null, JsonSerializerSettings settings = null)
            {
                string json = ToJSONString(fmt, settings);
                string dir = Path.GetDirectoryName(outFile);
                string file = Path.GetFileName(outFile);
                string ext = Path.GetExtension(outFile);

                if (String.IsNullOrEmpty(ext))
                {
                    file = GetClassName() + EXT_DFLT;
                    dir = outFile;
                }
                string path = Path.Combine(dir, file);
                Directory.CreateDirectory(dir);
                File.WriteAllText(path, json, enc == null ? enc_dflt : enc);
                return dir;
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
            public string LangTag { get; set; }
            public string ShortName { get; set; }
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
            public string PortraitMeta { get; set; }
            public string RawPortraitMeta { get; set; }
            public string URL { get; set; }
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
            public string CoverMeta { get; set; }
            public string RawCoverMeta { get; set; }
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
            public string URL { get; set; }
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
            public string CoverMeta { get; set; }
            public string RawCoverMeta { get; set; }
            public bool IsAuthRequired { get; set; }
            public bool IsSubsRequired { get; set; }
            public DateTime? FreeExpDate { get; set; }
            public string URL { get; set; }
            public LessonFields()
            {
                IsAuthRequired = false;
                IsSubsRequired = false;
            }
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
            public string SnPost { get; set; }
            public string SnName { get; set; }
            public string SnDescription { get; set; }
            public int? Duration { get; set; }
            public string DurationFmt { get; set; }
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
        // Reference
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
        // LessonMetaImage
        //
        public class LessonMetaImageFields : BaseFieldsData
        {
            public int LessonLngId { get; set; }
            public string Type { get; set; }
            public string URL { get; set; }
            public int ResourceId { get; set; }
        };

        public class LessonMetaImage : DataObjTyped<LessonMetaImageFields, LessonMetaImageRoot>
        {
            const string CLASS_GUID = "0eba67e3-ff9f-4c81-87f4-72e95816bc05";
            public LessonMetaImage() : base(CLASS_GUID) { }
        };

        public class LessonMetaImageRoot : RootDataObject
        {
            const string CLASS_GUID = "84ba5f1d-29d6-49f7-9884-03171320957d";
            public override string GetClassName() { return "LessonMetaImage"; }
            public LessonMetaImageRoot() : base(CLASS_GUID) { }
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
            public string AudioMeta { get; set; }
            public string RawAudioMeta { get; set; }
            public string Structure { get; set; }
            public int? Duration { get; set; }
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
            public int? ResLanguageId { get; set; }
            public string ResType { get; set; }
            public string FileName { get; set; }
            public bool? ShowInGalery { get; set; }
            public string RawMetaData { get; set; }
            public string MetaData { get; set; }
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
            public string AltAttribute { get; set; }
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
            [JsonIgnore]
            public EpisodeContentObj contentObj { get; set; }
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

        //
        // Role
        //
        public class RoleFields : BaseFieldsData
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public char ShortCode { get; set; }
            public string Description { get; set; }
        };

        public class Role : DataObjTyped<RoleFields, RoleRoot>
        {
            const string CLASS_GUID = "e788831c-6f91-4bf6-ae6f-a21f0243d670";
            public Role() : base(CLASS_GUID) { }
        };

        public class RoleRoot : RootDataObject
        {
            const string CLASS_GUID = "b23a3900-6f89-4df4-b4e4-ca6d475b3d60";
            public override string GetClassName() { return "Role"; }
            public RoleRoot() : base(CLASS_GUID) { }
        };

        //
        // SNetProvider
        //
        public class SNetProviderFields : BaseFieldsData
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string URL { get; set; }
        };

        public class SNetProvider : DataObjTyped<SNetProviderFields, SNetProviderRoot>
        {
            const string CLASS_GUID = "fc1d1d24-7d61-4d38-a963-c617a022560e";
            public SNetProvider() : base(CLASS_GUID) { }
        };

        public class SNetProviderRoot : RootDataObject
        {
            const string CLASS_GUID = "0f0b2dfb-6899-413a-8af5-644598bbef6b";
            public override string GetClassName() { return "SNetProvider"; }
            public SNetProviderRoot() : base(CLASS_GUID) { }
        };

        //
        // SNetProfile
        //
        public class SNetProfileFields : BaseFieldsData
        {
            public int UserId { get; set; }
            public int ProviderId { get; set; }
            public string Identifier { get; set; }
            public string URL { get; set; }
            public string WebSite { get; set; }
            public string PhotoUrl { get; set; }
            public string DisplayName { get; set; }
            public string Description { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string Gender { get; set; }
            public string Language { get; set; }
            public int? Age { get; set; }
            public int? DayOfBirth { get; set; }
            public int? MonthOfBirth { get; set; }
            public int? YearOfBirth { get; set; }
            public string Email { get; set; }
            public string EmailVerified { get; set; }
            public string Phone { get; set; }
            public string Address { get; set; }
            public string Country { get; set; }
            public string Region { get; set; }
            public string City { get; set; }
            public string Zip { get; set; }
            public bool IsOld { get; set; }
            public bool IsUpdated { get; set; }
            public SNetProfileFields()
            {
                IsOld = true;
                IsUpdated = false;
            }
        };

        public class SNetProfile : DataObjTyped<SNetProfileFields, SNetProfileRoot>
        {
            const string CLASS_GUID = "54c9008e-4916-4972-a5f3-7325d229df68";
            public SNetProfile() : base(CLASS_GUID) { }
        };

        public class SNetProfileRoot : RootDataObject
        {
            const string CLASS_GUID = "45d677c1-9784-426a-b255-024eaa6f1ebc";
            public override string GetClassName() { return "SNetProfile"; }
            public SNetProfileRoot() : base(CLASS_GUID) { }
        };

        //
        // ProductType
        //
        public class ProductTypeFields : BaseFieldsData
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
        };

        public class ProductType : DataObjTyped<ProductTypeFields, ProductTypeRoot>
        {
            const string CLASS_GUID = "a226321b-04fa-40c8-8c53-6efff100fb1f";
            public ProductType() : base(CLASS_GUID) { }
        };

        public class ProductTypeRoot : RootDataObject
        {
            const string CLASS_GUID = "fae9c1e4-b735-4241-a06e-a56333762e0b";
            public override string GetClassName() { return "ProductType"; }
            public ProductTypeRoot() : base(CLASS_GUID) { }
        };

        //
        // Currency
        //
        public class CurrencyFields : BaseFieldsData
        {
            public string Code { get; set; }
            public string Symbol { get; set; }
            public string Name { get; set; }
        };

        public class Currency : DataObjTyped<CurrencyFields, CurrencyRoot>
        {
            const string CLASS_GUID = "8f5503e0-ce9d-447b-9b9b-e0ca03c5c376";
            public Currency() : base(CLASS_GUID) { }
        };

        public class CurrencyRoot : RootDataObject
        {
            const string CLASS_GUID = "e00b80e3-0fbe-48c1-847c-8fbffe1e6cb4";
            public override string GetClassName() { return "Currency"; }
            public CurrencyRoot() : base(CLASS_GUID) { }
        };

        //
        // VATType
        //
        public class VATTypeExtFields : JSONSerializable
        {
            public int yandexKassaCode { get; set; }
        }

        public class VATTypeFields : BaseFieldsData
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
            public string ExtFields { get; set; }
        };

        public class VATType : DataObjTyped<VATTypeFields, VATTypeRoot>
        {
            const string CLASS_GUID = "c0c9f48b-d057-4139-aa48-0761a92e239b";
            public VATType() : base(CLASS_GUID) { }
        };

        public class VATTypeRoot : RootDataObject
        {
            const string CLASS_GUID = "ec912725-a333-4f5d-93d1-bf6c1ec2babd";
            public override string GetClassName() { return "VATType"; }
            public VATTypeRoot() : base(CLASS_GUID) { }
        };

        //
        // VATRate
        //
        public class VATRateFields : BaseFieldsData
        {
            public int VATTypeId { get; set; }
            public double Rate { get; set; }
            public string ExtFields { get; set; }
            public DateTime FirstDate { get; set; }
            public DateTime? LastDate { get; set; }
        };

        public class VATRate : DataObjTyped<VATRateFields, VATRateRoot>
        {
            const string CLASS_GUID = "dfd5a184-7595-44d9-9dd1-64e8e10b02d9";
            public VATRate() : base(CLASS_GUID) { }
        };

        public class VATRateRoot : RootDataObject
        {
            const string CLASS_GUID = "9ede10eb-10f4-400f-a51e-52ec9aa707ec";
            public override string GetClassName() { return "VATRate"; }
            public VATRateRoot() : base(CLASS_GUID) { }
        };

        //
        // Product
        //
        public class ProductExtFields : JSONSerializable
        {
            public string units { get; set; }
            public int duration { get; set; }
        }

        public class ProductFields : BaseFieldsData
        {
            public int ProductTypeId { get; set; }
            public int VATTypeId { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Picture { get; set; }
            public string PictureMeta { get; set; }
            public string Description { get; set; }
            public bool Discontinued { get; set; }
            public string ExtFields { get; set; }
        };

        public class Product : DataObjTyped<ProductFields, ProductRoot>
        {
            const string CLASS_GUID = "76e0b31d-899b-4806-8272-95fa283e7cdb";
            public Product() : base(CLASS_GUID) { }
        };

        public class ProductRoot : RootDataObject
        {
            const string CLASS_GUID = "ab6d0779-1a8f-4486-a428-697fcd10f7fe";
            public override string GetClassName() { return "Product"; }
            public ProductRoot() : base(CLASS_GUID) { }
        };

        //
        // PriceList
        //
        public class PriceListFields : BaseFieldsData
        {
            public int CurrencyId { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
        };

        public class PriceList : DataObjTyped<PriceListFields, PriceListRoot>
        {
            const string CLASS_GUID = "aed10527-ed66-4a5b-864f-05463edba73c";
            public PriceList() : base(CLASS_GUID) { }
        };

        public class PriceListRoot : RootDataObject
        {
            const string CLASS_GUID = "414407d4-01f6-44cc-b9f7-c2cb21bb7f4f";
            public override string GetClassName() { return "PriceList"; }
            public PriceListRoot() : base(CLASS_GUID) { }
        };

        //
        // Price
        //
        public class PriceFields : BaseFieldsData
        {
            public int PriceListId { get; set; }
            public int ProductId { get; set; }
            public double Price { get; set; }
            public DateTime FirstDate { get; set; }
            public DateTime? LastDate { get; set; }
        };

        public class Price : DataObjTyped<PriceFields, PriceRoot>
        {
            const string CLASS_GUID = "ff0e3c29-b8a9-4bb2-a764-d1ba308188be";
            public Price() : base(CLASS_GUID) { }
        };

        public class PriceRoot : RootDataObject
        {
            const string CLASS_GUID = "e67b1a90-073e-4d2d-81c4-ac13ec6caa5f";
            public override string GetClassName() { return "Price"; }
            public PriceRoot() : base(CLASS_GUID) { }
        };

        //
        // InvoiceType
        //
        public class InvoiceTypeFields : BaseFieldsData
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
        };

        public class InvoiceType : DataObjTyped<InvoiceTypeFields, InvoiceTypeRoot>
        {
            const string CLASS_GUID = "fff2ecf1-b5be-4d00-b102-fbaebb1d7f5f";
            public InvoiceType() : base(CLASS_GUID) { }
        };

        public class InvoiceTypeRoot : RootDataObject
        {
            const string CLASS_GUID = "5f592dd0-24e1-41f0-9ad0-e4cb6ccfbe7f";
            public override string GetClassName() { return "InvoiceType"; }
            public InvoiceTypeRoot() : base(CLASS_GUID) { }
        };

        //
        // InvoiceState
        //
        public class InvoiceStateFields : BaseFieldsData
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
        };

        public class InvoiceState : DataObjTyped<InvoiceStateFields, InvoiceStateRoot>
        {
            const string CLASS_GUID = "61914e17-649c-49e3-a64c-1fd282eeda5e";
            public InvoiceState() : base(CLASS_GUID) { }
        };

        public class InvoiceStateRoot : RootDataObject
        {
            const string CLASS_GUID = "70e22c90-2523-4ec8-9c21-a7214812667b";
            public override string GetClassName() { return "InvoiceState"; }
            public InvoiceStateRoot() : base(CLASS_GUID) { }
        };

        //
        // ChequeType
        //
        public class ChequeTypeFields : BaseFieldsData
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
        };

        public class ChequeType : DataObjTyped<ChequeTypeFields, ChequeTypeRoot>
        {
            const string CLASS_GUID = "111c7c08-3fef-47a8-9fde-59d8c10559e4";
            public ChequeType() : base(CLASS_GUID) { }
        };

        public class ChequeTypeRoot : RootDataObject
        {
            const string CLASS_GUID = "f5c2521c-cfc4-425b-bd07-309ffc2b6f73";
            public override string GetClassName() { return "ChequeType"; }
            public ChequeTypeRoot() : base(CLASS_GUID) { }
        };

        //
        // ChequeState
        //
        public class ChequeStateFields : BaseFieldsData
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
        };

        public class ChequeState : DataObjTyped<ChequeStateFields, ChequeStateRoot>
        {
            const string CLASS_GUID = "b2562862-8fb2-4f82-ba2a-dc36676c1be6";
            public ChequeState() : base(CLASS_GUID) { }
        };

        public class ChequeStateRoot : RootDataObject
        {
            const string CLASS_GUID = "5098f53c-01a0-4439-b7a9-df230347f782";
            public override string GetClassName() { return "ChequeState"; }
            public ChequeStateRoot() : base(CLASS_GUID) { }
        };

        //
        // UserRole
        //
        public class UserRoleFields : BaseFieldsData
        {
            public int AccountId { get; set; }
            public int UserId { get; set; }
            public int RoleId { get; set; }
        };

        public class UserRole : DataObjTyped<UserRoleFields, UserRoleRoot>
        {
            const string CLASS_GUID = "86e022dd-13d9-4c9d-811c-76b2ac807cff";
            public UserRole() : base(CLASS_GUID) { }
        };

        public class UserRoleRoot : RootDataObject
        {
            const string CLASS_GUID = "87c43f07-15f7-47d3-9309-263c14d71959";
            public override string GetClassName() { return "UserRole"; }
            public UserRoleRoot() : base(CLASS_GUID) { }
        };

        //
        // User
        //
        public class UserAccessRights : JSONSerializable
        {
            public bool isAdmin { get; set; }
            public Dictionary<string, int> roles = new Dictionary<string, int>();
            public UserAccessRights() { isAdmin = false; }
        }

        public class UserFields : JSONSerializable
        {
            public int Id { get; set; }
            public int? OwnedAccount { get; set; }
            public string Name { get; set; }
            public string DisplayName { get; set; }
            public string Email { get; set; }
            public string URL { get; set; }
            public string Phone { get; set; }
            public DateTime? RegDate { get; set; }
            public DateTime? ExpDate { get; set; }
            public DateTime? SubsExpDate { get; set; }
            public string ActivationKey { get; set; }
            public int? Status { get; set; }
            public bool? IsOld { get; set; }
            public string PData { get { return _PData == null ? null : _PData.ToJSONString(); } }
            public string PwdHashOld { get; set; }
            [JsonIgnore]
            public UserAccessRights _PData= new UserAccessRights();
            public UserFields()
            {
                IsOld = true;
                Status = 1;
            }
        }

        public class User : JSONSerializable
        {
            private static Random random = new Random();
            public static string RandomString(int length)
            {
                const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
                //return new string(Enumerable.Repeat(chars, length)
                //  .Select(s => s[random.Next(s.Length)]).ToArray());
                return new string(Enumerable.Range(1, length).Select(_ => chars[random.Next(chars.Length)]).ToArray());
            }
            public string login { get; set; }
            public string pwd { get; set; }
            public UserFields fields;
            public User()
            {
                fields = new UserFields();
                pwd = User.RandomString(15);
            }
        }

        public class Users : JSONSerializable
        {
            public string model { get { return "User"; } }
            public List<User> data = new List<User>();
            public Users() { }
            public User newUser()
            {
                User user = new User();
                user.fields.Id = ++_counter;
                data.Add(user);
                return user;
            }
            int _counter = 0;
        };


        public class AudioFileDescriptionObj: JSONSerializable
        {
            public string title { get; set; }
            public string dataformat { get; set; }
            public int bitrate { get; set; }
            public int filesize { get; set; }
            [JsonProperty("mime-type")]
            public string mime_type { get; set; }
            public int length { get; set; }
            public string length_formatted { get; set; }

            public AudioFileDescriptionObj(JSObject js_obj)
            {
                Tuple<JSObject.FieldType, bool, int, string, double, JSObject> data;
                if (js_obj.obj.TryGetValue("album", out data) && (data.Item1 == JSObject.FieldType.String))
                    title = String.IsNullOrEmpty(data.Item4) ? null : data.Item4;

                if (js_obj.obj.TryGetValue("dataformat", out data) && (data.Item1 == JSObject.FieldType.String))
                    dataformat = data.Item4;
                else
                    throw new Exception(String.Format(csIncorrectFieldErr, "dataformat"));

                if (js_obj.obj.TryGetValue("mime_type", out data) && (data.Item1 == JSObject.FieldType.String))
                    mime_type = data.Item4;
                else
                    throw new Exception(String.Format(csIncorrectFieldErr, "mime_type"));

                if (js_obj.obj.TryGetValue("length_formatted", out data) && (data.Item1 == JSObject.FieldType.String))
                    length_formatted = data.Item4;
                else
                    throw new Exception(String.Format(csIncorrectFieldErr, "length_formatted"));

                if (js_obj.obj.TryGetValue("bitrate", out data) && ((data.Item1 == JSObject.FieldType.Int) || (data.Item1 == JSObject.FieldType.String)))
                {
                    if (data.Item1 == JSObject.FieldType.String)
                    {
                        int val;
                        if(!Int32.TryParse(data.Item4,out val))
                            throw new Exception(String.Format(csIncorrectFieldErr, "bitrate"));
                        bitrate = val;
                    }
                    else
                        bitrate = data.Item3;
                }
                else
                    throw new Exception(String.Format(csIncorrectFieldErr, "bitrate"));

                if (js_obj.obj.TryGetValue("filesize", out data) && ((data.Item1 == JSObject.FieldType.Int) || (data.Item1 == JSObject.FieldType.String)))
                {
                    if (data.Item1 == JSObject.FieldType.String)
                    {
                        int val;
                        if (!Int32.TryParse(data.Item4, out val))
                            throw new Exception(String.Format(csIncorrectFieldErr, "filesize"));
                        filesize = val;
                    }
                    else
                        filesize = data.Item3;
                }
                else
                    throw new Exception(String.Format(csIncorrectFieldErr, "filesize"));

                if (js_obj.obj.TryGetValue("length", out data) && ((data.Item1 == JSObject.FieldType.Int) || (data.Item1 == JSObject.FieldType.String)))
                {
                    if (data.Item1 == JSObject.FieldType.String)
                    {
                        int val;
                        if (!Int32.TryParse(data.Item4, out val))
                            throw new Exception(String.Format(csIncorrectFieldErr, "length"));
                        length = val;
                    }
                    else
                        length = data.Item3;
                }
                else
                    throw new Exception(String.Format(csIncorrectFieldErr, "length"));
            }

            const string csIncorrectFieldErr = "PictureResourceDescriptionObj: Incorrect or missing field \"{0}\"";
        };

        public class PictureResourceDescriptionObj : JSONSerializable
        {
            public string path { get; set; }
            [JsonProperty("mime-type")]
            public string mime_type { get; set; }
            public Dictionary<string, int> size { get; set; }
            public Dictionary<string, string> content { get; set; }
            public string icon { get; set; }
            public string name { get; set; }
            public string description { get; set; }

            public PictureResourceDescriptionObj(JSObject js_obj, string pict_name = null, string pict_desc = null)
            {
                size = new Dictionary<string, int>();
                content = new Dictionary<string, string>();

                if (!String.IsNullOrEmpty(pict_name))
                    name = pict_name;
                if (!String.IsNullOrEmpty(pict_name))
                    description = pict_desc;

                Tuple<JSObject.FieldType, bool, int, string, double, JSObject> data;
                if (js_obj.obj.TryGetValue("width", out data) && (data.Item1 == JSObject.FieldType.Int))
                    size.Add("width", data.Item3);
                else
                    throw new Exception(String.Format(csIncorrectFieldErr, "width"));
                if (js_obj.obj.TryGetValue("height", out data) && (data.Item1 == JSObject.FieldType.Int))
                    size.Add("height", data.Item3);
                else
                    throw new Exception(String.Format(csIncorrectFieldErr, "height"));
                path = "";
                string file;
                mime_type = null;
                if (js_obj.obj.TryGetValue("file", out data) && (data.Item1 == JSObject.FieldType.String))
                {
                    file = data.Item4;
                    path = Path.GetDirectoryName(file).Replace("\\","/");
                    path += path.Length > 0 ? "/" : "";
                }
                else
                    throw new Exception(String.Format(csIncorrectFieldErr, "file"));
                icon = null;
                if (js_obj.obj.TryGetValue("sizes", out data) && (data.Item1 == JSObject.FieldType.Obj))
                {
                    JSObject sizes = data.Item6;
                    if (sizes.obj.TryGetValue("thumbnail", out data) && (data.Item1 == JSObject.FieldType.Obj))
                    {
                        JSObject obj = data.Item6;
                        if (obj.obj.TryGetValue("file", out data) && (data.Item1 == JSObject.FieldType.String))
                            icon = data.Item4;
                        if ((mime_type == null) && obj.obj.TryGetValue("mime-type", out data) && (data.Item1 == JSObject.FieldType.String))
                            mime_type = data.Item4;
                    }
                    if (icon == null)
                        icon = file;
                    if (sizes.obj.TryGetValue("img_1366", out data) && (data.Item1 == JSObject.FieldType.Obj))
                    {
                        JSObject obj = data.Item6;
                        if (obj.obj.TryGetValue("file", out data) && (data.Item1 == JSObject.FieldType.String))
                            content.Add("l", data.Item4);
                        if ((mime_type == null) && obj.obj.TryGetValue("mime-type", out data) && (data.Item1 == JSObject.FieldType.String))
                            mime_type = data.Item4;
                    }
                    if (sizes.obj.TryGetValue("img_768", out data) && (data.Item1 == JSObject.FieldType.Obj))
                    {
                        JSObject obj = data.Item6;
                        if (obj.obj.TryGetValue("file", out data) && (data.Item1 == JSObject.FieldType.String))
                            content.Add("m", data.Item4);
                        if ((mime_type == null) && obj.obj.TryGetValue("mime-type", out data) && (data.Item1 == JSObject.FieldType.String))
                            mime_type = data.Item4;
                    }
                    if (sizes.obj.TryGetValue("img_360", out data) && (data.Item1 == JSObject.FieldType.Obj))
                    {
                        JSObject obj = data.Item6;
                        if (obj.obj.TryGetValue("file", out data) && (data.Item1 == JSObject.FieldType.String))
                            content.Add("s", data.Item4);
                        if ((mime_type == null) && obj.obj.TryGetValue("mime-type", out data) && (data.Item1 == JSObject.FieldType.String))
                            mime_type = data.Item4;
                    }
                }
                else
                    throw new Exception(String.Format(csIncorrectFieldErr, "sizes"));
                if (mime_type == null)
                    throw new Exception(String.Format(csIncorrectFieldErr, "mime-type"));
            }

            const string csIncorrectFieldErr = "PictureResourceDescriptionObj: Incorrect or missing field \"{0}\"";
        };

        public class EpisodeContentObj : JSONSerializable
        {
            public string title { get; set; }
            public string title2 { get; set; }
            public int track { get; set; }
            public double duration { get; set; }
            public EpisodeContentObj()
            {
                track = 1;
                duration = 0;
            }
        };

        public class JSObject
        {
            public enum FieldType { Bool, Int, String, Double, Obj };
            public Dictionary<string, Tuple<FieldType, bool, int, string, double, JSObject>> obj;

            public JSObject()
            {
                obj = new Dictionary<string, Tuple<FieldType, bool, int, string, double, JSObject>>();
            }

            public string ToJSON() { return _toJSON(this); }
            string _toJSON(JSObject val)
            {
                StringBuilder sb = new StringBuilder("{");
                bool is_first = true;
                foreach (KeyValuePair<string, Tuple<FieldType, bool, int, string, double, JSObject>> pair in val.obj)
                {
                    if(!is_first)
                        sb.Append(",");
                    sb.Append("\"" + pair.Key + "\":");
                    is_first = false;
                    switch (pair.Value.Item1)
                    {
                        case FieldType.Bool:
                            sb.Append(pair.Value.Item2 ? "true" : "false");
                            break;

                        case FieldType.Int:
                            sb.Append(pair.Value.Item3);
                            break;

                        case FieldType.String:
                            sb.Append("\"" + pair.Value.Item4.Replace("\"", "\\\"").Replace("\n","\\n").Replace("\r", null) + "\"");
                            break;

                        case FieldType.Double:
                            sb.Append(pair.Value.Item5);
                            break;

                        case FieldType.Obj:
                            sb.Append(_toJSON(pair.Value.Item6));
                            break;
                    }
                }
                sb.Append("}");
                return sb.ToString();
            }
        }

        public static JSObject MagJSONParse(string inp_str, Encoding enc = null)
        {
            StringBuilder sb = new StringBuilder(inp_str);
            int curr_pos = 0;
            _getTokenType(sb, ref curr_pos, 'a');
            return _JSONParse(sb, ref curr_pos, enc == null ? Encoding.UTF8 : enc);
        }

        public Encoding JSONEncoding { get { return enc; } set { enc = value; } }

        public Formatting JSONFormatting { get { return fmt; } set { fmt = value; } }

        public JsonSerializerSettings JSONSettings { get { return jss; } set { jss = value; } }

        public MagisteryToJSON(string connStr)
        {
            conn_str = connStr;
        }

        public void StartImport(string outDir)
        {
            List<RootDataObject> allData = new List<RootDataObject>();

            Language.AllData = allData;
            Language lang = new Language();
            lang.Fields.Id = LANGUAGE_ID;
            lang.Fields.Code = "RUS";
            lang.Fields.LangTag = "ru-RU";
            lang.Fields.ShortName = "Рус";
            lang.Fields.Language = "Русский";

            lang = new Language();
            lang.Fields.Code = "ENG";
            lang.Fields.LangTag = "en-GB";
            lang.Fields.ShortName = "Eng";
            lang.Fields.Language = "English";

            lang = new Language();
            lang.Fields.Code = "FRA";
            lang.Fields.LangTag = "fr-FR";
            lang.Fields.ShortName = "Fra";
            lang.Fields.Language = "Français";

            lang = new Language();
            lang.Fields.Code = "GER";
            lang.Fields.LangTag = "de-DE";
            lang.Fields.ShortName = "Deu";
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

            Dictionary<string, SNetProvider> providers = new Dictionary<string, SNetProvider>();
            SNetProvider.AllData = allData;
            SNetProvider provider = new SNetProvider();
            provider.Fields.Code = "facebook";
            provider.Fields.Name = "FaceBook";
            provider.Fields.URL = "https://www.facebook.com";
            providers.Add(provider.Fields.Code, provider);

            provider = new SNetProvider();
            provider.Fields.Code = "google";
            provider.Fields.Name = "Google+";
            provider.Fields.URL = "https://plus.google.com";
            providers.Add(provider.Fields.Code, provider);

            provider = new SNetProvider();
            provider.Fields.Code = "mailru";
            provider.Fields.Name = "MailRu";
            provider.Fields.URL = "https://my.mail.ru";
            providers.Add(provider.Fields.Code, provider);

            provider = new SNetProvider();
            provider.Fields.Code = vk_code;
            provider.Fields.Name = "VKontakte";
            provider.Fields.URL = "http://vk.com";
            providers.Add(provider.Fields.Code, provider);

            provider = new SNetProvider();
            provider.Fields.Code = "yandex";
            provider.Fields.Name = "Yandex";
            provider.Fields.URL = "https://www.yandex.ru";
            providers.Add(provider.Fields.Code, provider);

            provider = new SNetProvider();
            provider.Fields.Code = "odnoklassniki";
            provider.Fields.Name = "Odnoklassniki";
            provider.Fields.URL = "https://www.ok.ru";
            providers.Add(provider.Fields.Code, provider);

            Dictionary<string, Role> roles = new Dictionary<string, Role>();
            Role.AllData = allData;
            Role role = new Role();
            role.Fields.Code = "ADM";
            role.Fields.Name = "Administrator";
            role.Fields.ShortCode = 'a';
            roles.Add("a:1:{s:13:\"administrator\";b:1;}", role);

            role = new Role();
            role.Fields.Code = "EDT";
            role.Fields.Name = "Editor";
            role.Fields.ShortCode = 'e';
            roles.Add("a:1:{s:6:\"editor\";b:1;}", role);

            role = new Role();
            role.Fields.Code = "SBS";
            role.Fields.Name = "Subscriber";
            role.Fields.ShortCode = 's';
            roles.Add("a:1:{s:10:\"subscriber\";b:1;}", role);

            role = new Role();
            role.Fields.Code = "PND";
            role.Fields.Name = "Pending";
            role.Fields.ShortCode = 'p';
            roles.Add("a:1:{s:7:\"pending\";b:1;}", role);

            Users users = new Users();
            User user = users.newUser();
            user.login = "admin";
            user.pwd = "admin";
            user.fields.DisplayName = user.fields.Name = "Admin";
            user.fields.Email = "admin@magisteria.ru";
            user.fields.IsOld = false;
            user.fields._PData.isAdmin = true;
            user.fields.RegDate = DateTime.Now;

            Currency.AllData = allData;
            Currency curr = new Currency();
            curr.Fields.Id = 1;
            curr.Fields.Code = "RUB";
            curr.Fields.Symbol = "ք";
            curr.Fields.Name = "Российский рубль";
            int currId = curr.Fields.Id;

            curr = new Currency();
            curr.Fields.Id = 2;
            curr.Fields.Code = "USD";
            curr.Fields.Symbol = "$";
            curr.Fields.Name = "Доллар США";

            curr = new Currency();
            curr.Fields.Id = 3;
            curr.Fields.Code = "EUR";
            curr.Fields.Symbol = "€";
            curr.Fields.Name = "Евро";

            ProductType.AllData = allData;
            ProductType prodType = new ProductType();
            prodType.Fields.Id = 1;
            prodType.Fields.Code = "SUBS";
            prodType.Fields.Name = "Подписка на лекции";
            int subsTypeId = prodType.Fields.Id;

            prodType = new ProductType();
            prodType.Fields.Id = 2;
            prodType.Fields.Code = "BOOK";
            prodType.Fields.Name = "Печатные книги";

            prodType = new ProductType();
            prodType.Fields.Id = 3;
            prodType.Fields.Code = "AUDIOBOOK";
            prodType.Fields.Name = "Аудио книги";

            prodType = new ProductType();
            prodType.Fields.Id = 4;
            prodType.Fields.Code = "EBOOK";
            prodType.Fields.Name = "Электронные книги";

            VATType.AllData = allData;
            VATRate.AllData = allData;
            VATType vtype = new VATType();
            vtype.Fields.Code = "VAT18";
            vtype.Fields.Name = "НДС 18%";
            vtype.Fields.ExtFields = (new VATTypeExtFields() { yandexKassaCode = 4 }).ToJSONString();
            int subsVTypeId = vtype.Fields.Id;
            VATRate vrate = new VATRate();
            vrate.Fields.VATTypeId = vtype.Fields.Id;
            vrate.Fields.Rate = 18.0;
            vrate.Fields.ExtFields = (new VATTypeExtFields() { yandexKassaCode = 4 }).ToJSONString();
            vrate.Fields.FirstDate = new DateTime(2018, 9, 1);

            vtype = new VATType();
            vtype.Fields.Code = "VAT10";
            vtype.Fields.Name = "НДС 10%";
            vtype.Fields.ExtFields = (new VATTypeExtFields() { yandexKassaCode = 3 }).ToJSONString();
            vrate = new VATRate();
            vrate.Fields.VATTypeId = vtype.Fields.Id;
            vrate.Fields.Rate = 10.0;
            vrate.Fields.ExtFields = (new VATTypeExtFields() { yandexKassaCode = 3 }).ToJSONString();
            vrate.Fields.FirstDate = new DateTime(2018, 9, 1);

            PriceList.AllData = allData;
            PriceList main = new PriceList();
            main.Fields.CurrencyId = currId;
            main.Fields.Code = "MAIN";
            main.Fields.Name= "Основной прайс-лист";
            int priceListId = main.Fields.Id;

            Product.AllData = allData;
            Price.AllData = allData;
            Product prod = new Product();
            Price price = new Price();
            prod.Fields.ProductTypeId = subsTypeId;
            prod.Fields.VATTypeId = subsVTypeId;
            prod.Fields.Code = "SUBSFREE1M";
            prod.Fields.Name = "Бесплатная подписка на 1 мес.";
            prod.Fields.Discontinued = false;
            prod.Fields.ExtFields = (new ProductExtFields() { units = "m", duration = 1 }).ToJSONString();
            price.Fields.PriceListId = priceListId;
            price.Fields.ProductId = prod.Fields.Id;
            price.Fields.Price = 0;
            price.Fields.FirstDate = new DateTime(2018, 9, 1);

            prod = new Product();
            price = new Price();
            prod.Fields.ProductTypeId = subsTypeId;
            prod.Fields.VATTypeId = subsVTypeId;
            prod.Fields.Code = "SUBSFREE3M";
            prod.Fields.Name = "Бесплатная подписка на 3 мес.";
            prod.Fields.Discontinued = false;
            prod.Fields.ExtFields = (new ProductExtFields() { units = "m", duration = 3 }).ToJSONString();
            price.Fields.PriceListId = priceListId;
            price.Fields.ProductId = prod.Fields.Id;
            price.Fields.Price = 0;
            price.Fields.FirstDate = new DateTime(2018, 9, 1);

            prod = new Product();
            price = new Price();
            prod.Fields.ProductTypeId = subsTypeId;
            prod.Fields.VATTypeId = subsVTypeId;
            prod.Fields.Code = "SUBS1M";
            prod.Fields.Name = "Подписка на 1 мес.";
            prod.Fields.Discontinued = false;
            prod.Fields.ExtFields = (new ProductExtFields() { units = "m", duration = 1 }).ToJSONString();
            price.Fields.PriceListId = priceListId;
            price.Fields.ProductId = prod.Fields.Id;
            price.Fields.Price = 200;
            price.Fields.FirstDate = new DateTime(2018, 9, 1);

            prod = new Product();
            price = new Price();
            prod.Fields.ProductTypeId = subsTypeId;
            prod.Fields.VATTypeId = subsVTypeId;
            prod.Fields.Code = "SUBS3M";
            prod.Fields.Name = "Подписка на 3 мес.";
            prod.Fields.Discontinued = false;
            prod.Fields.ExtFields = (new ProductExtFields() { units = "m", duration = 3 }).ToJSONString();
            price.Fields.PriceListId = priceListId;
            price.Fields.ProductId = prod.Fields.Id;
            price.Fields.Price = 550;
            price.Fields.FirstDate = new DateTime(2018, 9, 1);

            prod = new Product();
            price = new Price();
            prod.Fields.ProductTypeId = subsTypeId;
            prod.Fields.VATTypeId = subsVTypeId;
            prod.Fields.Code = "SUBS6M";
            prod.Fields.Name = "Подписка на 6 мес.";
            prod.Fields.Discontinued = false;
            prod.Fields.ExtFields = (new ProductExtFields() { units = "m", duration = 6 }).ToJSONString();
            price.Fields.PriceListId = priceListId;
            price.Fields.ProductId = prod.Fields.Id;
            price.Fields.Price = 900;
            price.Fields.FirstDate = new DateTime(2018, 9, 1);

            prod = new Product();
            price = new Price();
            prod.Fields.ProductTypeId = subsTypeId;
            prod.Fields.VATTypeId = subsVTypeId;
            prod.Fields.Code = "SUBS1Y";
            prod.Fields.Name = "Подписка на 1 год";
            prod.Fields.Discontinued = false;
            prod.Fields.ExtFields = (new ProductExtFields() { units = "y", duration = 1 }).ToJSONString();
            price.Fields.PriceListId = priceListId;
            price.Fields.ProductId = prod.Fields.Id;
            price.Fields.Price = 1500;
            price.Fields.FirstDate = new DateTime(2018, 9, 1);

            InvoiceType.AllData = allData;
            InvoiceType invType = new InvoiceType();
            invType.Fields.Code = "PURCHASE";
            invType.Fields.Id = 1;
            invType.Fields.Name = "Заказ";

            invType = new InvoiceType();
            invType.Fields.Id = 2;
            invType.Fields.Code = "REFUND";
            invType.Fields.Name = "Возврат";

            InvoiceState.AllData = allData;
            InvoiceState invState = new InvoiceState();
            invState.Fields.Id = 1;
            invState.Fields.Code = "DRAFT";
            invState.Fields.Name = "Черновик";

            invState = new InvoiceState();
            invState.Fields.Id = 2;
            invState.Fields.Code = "APPROVED";
            invState.Fields.Name = "Подтвержден";

            invState = new InvoiceState();
            invState.Fields.Id = 3;
            invState.Fields.Code = "PAYED";
            invState.Fields.Name = "Оплачен";

            invState = new InvoiceState();
            invState.Fields.Id = 4;
            invState.Fields.Code = "CANCELED";
            invState.Fields.Name = "Отменен";

            ChequeType.AllData = allData;
            ChequeType chqType = new ChequeType();
            chqType.Fields.Id = 1;
            chqType.Fields.Code = "PAYMENT";
            chqType.Fields.Name = "Оплата";

            chqType = new ChequeType();
            chqType.Fields.Id = 2;
            chqType.Fields.Code = "REFUND";
            chqType.Fields.Name = "Возврат";

            ChequeState.AllData = allData;
            ChequeState chqState = new ChequeState();
            chqState.Fields.Id = 1;
            chqState.Fields.Code = "DRAFT";
            chqState.Fields.Name = "Черновик";

            chqState = new ChequeState();
            chqState.Fields.Id = 2;
            chqState.Fields.Code = "PENDING";
            chqState.Fields.Name = "Ожидание действий пользователя";

            chqState = new ChequeState();
            chqState.Fields.Id = 3;
            chqState.Fields.Code = "WFCAPTURE";
            chqState.Fields.Name = "Ожидание подтверждения";

            chqState = new ChequeState();
            chqState.Fields.Id = 4;
            chqState.Fields.Code = "SUCCEEDED";
            chqState.Fields.Name = "Успешно завершен";

            chqState = new ChequeState();
            chqState.Fields.Id = 5;
            chqState.Fields.Code = "CANCELED";
            chqState.Fields.Name = "Отменен";

            conn = new MySqlConnection(conn_str);
            Console.WriteLine("Connecting to MySQL...");
            conn.Open();

            //
            // Read Users & their profiles
            //
            MySqlCommand cmd = new MySqlCommand(sql_users_profile, conn);
            rdr = cmd.ExecuteReader();

            Dictionary<int, User> users_mag = new Dictionary<int, User>();
            int curr_id = -1;
            user = null;
            bool isFirstTime = true;
            Dictionary<int, SNetProvider> curr_providers = new Dictionary<int, SNetProvider>();

            while (rdr.Read())
            {
                int db_id = rdr.GetInt32("ID");
                if (db_id != curr_id)
                {
                    curr_providers.Clear();
                    user = users.newUser();
                    users_mag.Add(db_id, user);

                    user.login = String.IsNullOrEmpty(rdr.GetString("user_login")) ? null : rdr.GetString("user_login");
                    user.fields.Name = String.IsNullOrEmpty(rdr.GetString("user_nicename")) ? null : rdr.GetString("user_nicename");
                    user.fields.Email = String.IsNullOrEmpty(rdr.GetString("user_email")) ? null : rdr.GetString("user_email");
                    if (user.fields.Email == null)
                        throw new Exception(String.Format("User email (Id={0}) is empty!", db_id));
                    user.fields.PwdHashOld = String.IsNullOrEmpty(rdr.GetString("user_pass")) ? null : rdr.GetString("user_pass");
                    if (user.fields.PwdHashOld == null)
                        throw new Exception(String.Format("User password (Id={0}) is empty!", db_id));
                    user.fields.URL = String.IsNullOrEmpty(rdr.GetString("user_url")) ? null : rdr.GetString("user_url");
                    user.fields.RegDate = null;
                    if (!rdr.IsDBNull(rdr.GetOrdinal("user_registered")))
                        user.fields.RegDate = rdr.GetDateTime("user_registered");
                    //user.fields.Status = rdr.GetInt32("user_status");
                    user.fields.DisplayName = String.IsNullOrEmpty(rdr.GetString("display_name")) ? null : rdr.GetString("display_name");
                    curr_id = db_id;
                }
                if (!rdr.IsDBNull(rdr.GetOrdinal("user_id")))
                {
                    string provider_code = String.IsNullOrEmpty(rdr.GetString("provider")) ? null : rdr.GetString("provider").ToLower();
                    SNetProvider curr_provider = null;
                    if (!providers.TryGetValue(provider_code, out curr_provider))
                        throw new Exception(String.Format("Unknown provider \"{0}\" for user (Id={1})!", curr_provider, curr_id));

                    SNetProvider tmp_provider = null;
                    if (!curr_providers.TryGetValue(curr_provider.Fields.Id, out tmp_provider))
                    {
                        curr_providers.Add(curr_provider.Fields.Id, tmp_provider);

                        if (isFirstTime)
                        {
                            SNetProfile.AllData = allData;
                            isFirstTime = false;
                        }

                        SNetProfile profile = new SNetProfile();
                        profile.Fields.UserId = user.fields.Id;
                        profile.Fields.ProviderId = curr_provider.Fields.Id;
                        profile.Fields.Identifier = String.IsNullOrEmpty(rdr.GetString("identifier")) ? null : rdr.GetString("identifier");
                        profile.Fields.URL = String.IsNullOrEmpty(rdr.GetString("profileurl")) ? null : rdr.GetString("profileurl");
                        profile.Fields.WebSite = String.IsNullOrEmpty(rdr.GetString("websiteurl")) ? null : rdr.GetString("websiteurl");
                        profile.Fields.PhotoUrl = String.IsNullOrEmpty(rdr.GetString("photourl")) ? null : rdr.GetString("photourl");
                        profile.Fields.DisplayName = String.IsNullOrEmpty(rdr.GetString("displayname")) ? null : rdr.GetString("displayname");
                        profile.Fields.Description = String.IsNullOrEmpty(rdr.GetString("description")) ? null : rdr.GetString("description");
                        profile.Fields.FirstName = String.IsNullOrEmpty(rdr.GetString("firstname")) ? null : rdr.GetString("firstname");
                        if (profile.Fields.FirstName != null)
                            profile.Fields.FirstName = profile.Fields.FirstName.Length > 50 ? profile.Fields.FirstName.Substring(0, 50) : profile.Fields.FirstName;
                        profile.Fields.LastName = String.IsNullOrEmpty(rdr.GetString("lastname")) ? null : rdr.GetString("lastname");
                        profile.Fields.Gender = String.IsNullOrEmpty(rdr.GetString("gender")) ? null : rdr.GetString("gender");
                        profile.Fields.Language = String.IsNullOrEmpty(rdr.GetString("language")) ? null : rdr.GetString("language");
                        if (!rdr.IsDBNull(rdr.GetOrdinal("age")))
                        {
                            int age;
                            if (Int32.TryParse(rdr.GetString("age"), out age))
                                profile.Fields.Age = age;
                        }
                        if (!rdr.IsDBNull(rdr.GetOrdinal("birthday")))
                            profile.Fields.Age = rdr.GetInt32("birthday");
                        if (!rdr.IsDBNull(rdr.GetOrdinal("birthday")))
                            profile.Fields.DayOfBirth = rdr.GetInt32("birthday");
                        if (!rdr.IsDBNull(rdr.GetOrdinal("birthmonth")))
                            profile.Fields.MonthOfBirth = rdr.GetInt32("birthmonth");
                        if (!rdr.IsDBNull(rdr.GetOrdinal("birthyear")))
                            profile.Fields.YearOfBirth = rdr.GetInt32("birthyear");
                        profile.Fields.Email = String.IsNullOrEmpty(rdr.GetString("email")) ? null : rdr.GetString("email");
                        profile.Fields.EmailVerified = String.IsNullOrEmpty(rdr.GetString("emailverified")) ? null : rdr.GetString("emailverified");
                        profile.Fields.Phone = String.IsNullOrEmpty(rdr.GetString("phone")) ? null : rdr.GetString("phone");
                        profile.Fields.Address = String.IsNullOrEmpty(rdr.GetString("address")) ? null : rdr.GetString("address");
                        profile.Fields.Country = String.IsNullOrEmpty(rdr.GetString("country")) ? null : rdr.GetString("country");
                        profile.Fields.Region = String.IsNullOrEmpty(rdr.GetString("region")) ? null : rdr.GetString("region");
                        profile.Fields.City = String.IsNullOrEmpty(rdr.GetString("city")) ? null : rdr.GetString("city");
                        profile.Fields.Zip = String.IsNullOrEmpty(rdr.GetString("zip")) ? null : rdr.GetString("zip");

                        if (String.Compare(provider_code, vk_code, true) == 0)
                        {
                            if ((profile.Fields.Identifier != null) && (user.fields.DisplayName != null))
                            {
                                if (String.Compare("id" + profile.Fields.Identifier, user.fields.DisplayName) == 0)
                                    if ((profile.Fields.FirstName != null) && (profile.Fields.LastName != null))
                                        user.fields.DisplayName = profile.Fields.FirstName + " " + profile.Fields.LastName;
                            }
                        }
                    }
                }
            }
            rdr.Close();

            //
            // Read Users Roles
            //

            cmd = new MySqlCommand(sql_users_roles, conn);
            rdr = cmd.ExecuteReader();

            curr_id = -1;
            user = null;
            isFirstTime = true;

            while (rdr.Read())
            {
                int db_id = rdr.GetInt32("user_id");
                if (db_id != curr_id)
                {
                    if(!users_mag.TryGetValue(db_id,out user))
                        throw new Exception(String.Format("User (Id={0}) doesn't exist!", db_id));
                    curr_id = db_id;
                }
                string role_data = String.IsNullOrEmpty(rdr.GetString("meta_value")) ? null : rdr.GetString("meta_value");
                if (!roles.TryGetValue(role_data, out role))
                    throw new Exception(String.Format("Can't find role \"{0}\"!", role_data));

                if (isFirstTime)
                {
                    UserRole.AllData = allData;
                    isFirstTime = false;
                }
                UserRole ur = new UserRole();
                ur.Fields.AccountId = ACCOUNT_ID;
                ur.Fields.UserId = user.fields.Id;
                ur.Fields.RoleId = role.Fields.Id;
                string role_code = "" + role.Fields.ShortCode;
                switch (role.Fields.ShortCode)
                {
                    case 'a':
                        user.fields._PData.isAdmin = true;
                        break;

                    default:
                        if (role.Fields.ShortCode == 'p')
                            role_code = "s"; // Change "pending" to "subscribe"
                        user.fields._PData.roles[role_code] = 1;
                        break;
                }
            }
            rdr.Close();

            //
            // Read Categories
            //

            Category.AllData = allData;
            CategoryLng.AllData = allData;
            Dictionary<int, Tuple<Category, CategoryLng>> categoriesDB = new Dictionary<int, Tuple<Category, CategoryLng>>();

            cmd = new MySqlCommand(sql_get_category, conn);
            cmd.Parameters.AddWithValue("@TermType", "razdel");
            rdr = cmd.ExecuteReader();

            while (rdr.Read())
            {
                int db_id = rdr.GetInt32("id");
                Category cat = new Category();
                cat.Fields.AccountId = ACCOUNT_ID;
                cat.Fields.URL = String.IsNullOrEmpty(rdr.GetString("alias")) ? null : rdr.GetString("alias");

                CategoryLng cat_lng = new CategoryLng();
                cat_lng.Fields.CategoryId = cat.Fields.Id;
                cat_lng.Fields.LanguageId = LANGUAGE_ID;
                cat_lng.Fields.Name = rdr.GetString("name");
                cat_lng.Fields.Description = String.IsNullOrEmpty(rdr.GetString("description")) ? null : rdr.GetString("description");

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
                au.Fields.URL = String.IsNullOrEmpty(rdr.GetString("alias")) ? null : rdr.GetString("alias");

                AuthorLng au_lng = new AuthorLng();
                au_lng.Fields.AuthorId = au.Fields.Id;
                au_lng.Fields.LanguageId = LANGUAGE_ID;
                string[] names = rdr.GetString("name").Split((char[])null, StringSplitOptions.RemoveEmptyEntries);
                if (names.Length < 2)
                    throw new Exception(String.Format("Author name (Id={0}, name=\"{1}\") is incorrect!", db_id, rdr.GetString("name")));
                au_lng.Fields.FirstName = names[0];
                au_lng.Fields.LastName = "";
                for (int i = 1; i < names.Length; i++)
                    au_lng.Fields.LastName += (i > 1 ? " " : "") + names[i];
                au_lng.Fields.Description = String.IsNullOrEmpty(rdr.GetString("description")) ? null : rdr.GetString("description");

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
                    JSObject meta = null;
                    Dictionary<string, string> file_desc = getFileDecription(photo_id, out meta);
                    string fn;
                    if (file_desc.TryGetValue("FileName", out fn))
                        au.Fields.Portrait = fn;
                    if (file_desc.TryGetValue("MetaData", out fn))
                    {
                        au.Fields.RawPortraitMeta = fn;

                        string name = null;
                        string description = null;
                        file_desc.TryGetValue("Description", out name);
                        file_desc.TryGetValue("ExtDescription", out description);

                        PictureResourceDescriptionObj pict = new PictureResourceDescriptionObj(meta, name, description);
                        au.Fields.PortraitMeta = pict.ToJSONString();
                    }
                }
            }

            //
            // Read Author to Course relationship
            //
            Dictionary<int, Dictionary<int, Tuple<Author, AuthorLng>>> authorToCourseDB = new Dictionary<int, Dictionary<int, Tuple<Author, AuthorLng>>>();

            cmd = new MySqlCommand(sql_get_author_to_course, conn);
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                int author_id = rdr.GetInt32("author_id");
                int course_id = rdr.GetInt32("course_id");
                Tuple<Author, AuthorLng> author;
                if (!authorsDB.TryGetValue(author_id, out author))
                    throw new Exception(String.Format("Can't find author (Id={0}) for course (Id={1}).", author_id, course_id));
                Dictionary<int, Tuple<Author, AuthorLng>> authors;
                if (!authorToCourseDB.TryGetValue(course_id, out authors))
                {
                    authors = new Dictionary<int, Tuple<Author, AuthorLng>>();
                    authorToCourseDB.Add(course_id, authors);
                }
                authors.Add(author_id, author);
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

                Dictionary<int, Tuple<Author, AuthorLng>> authors;
                if (!authorToCourseDB.TryGetValue(db_id, out authors))
                    throw new Exception(String.Format("Course \"{0}\" (Id={1}) doesn't have an author.", course_lng.Fields.Name, db_id));

                foreach (KeyValuePair<int, Tuple<Author, AuthorLng>> kv in authors)
                {
                    AuthorToCourse author_to_course = new AuthorToCourse();
                    author_to_course.Fields.CourseId = course.Fields.Id;
                    author_to_course.Fields.AuthorId = kv.Value.Item1.Fields.Id;
                }

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
                    JSObject meta = null;
                    Dictionary<string, string> file_desc = getFileDecription(photo_id, out meta);
                    string fn;
                    if (file_desc.TryGetValue("FileName", out fn))
                        course.Fields.Cover = fn;
                    if (file_desc.TryGetValue("MetaData", out fn))
                    {
                        course.Fields.RawCoverMeta = fn;

                        string name = null;
                        string description = null;
                        file_desc.TryGetValue("Description", out name);
                        file_desc.TryGetValue("ExtDescription", out description);

                            PictureResourceDescriptionObj pict = new PictureResourceDescriptionObj(meta, name, description);
                        course.Fields.CoverMeta = pict.ToJSONString(); ;
                    }
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
            Dictionary<int, Tuple<Lesson, LessonLng, LessonCourse, Episode, EpisodeLng, EpisodeLesson, CourseLng>> lessonsDB =
                new Dictionary<int, Tuple<Lesson, LessonLng, LessonCourse, Episode, EpisodeLng, EpisodeLesson, CourseLng>>();

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
                //lesson_course.Fields.ReadyDate = rdr.GetDateTime("post_modified").Date;
                lesson_course.Fields.ReadyDate = rdr.GetDateTime("post_date").Date;
                
                Episode episode = new Episode();
                episode.Fields.LessonId = lesson.Fields.Id;
                episode.Fields.EpisodeType = "L";

                EpisodeLng episode_lng = new EpisodeLng();
                episode_lng.Fields.EpisodeId = episode.Fields.Id;
                episode_lng.Fields.LanguageId = LANGUAGE_ID;
                episode_lng.Fields.State = "R";
                episode_lng.Fields.Name = lesson_lng.Fields.Name;
                episode_lng.Fields.Transcript =
                    setParagraph(String.IsNullOrEmpty(rdr.GetString("post_content")) ? null : rdr.GetString("post_content"));

                EpisodeLesson episode_lsn = new EpisodeLesson();
                episode_lsn.Fields.EpisodeId = episode.Fields.Id;
                episode_lsn.Fields.LessonId = lesson.Fields.Id;
                episode_lsn.Fields.Number = 1;
                episode_lsn.Fields.Supp = false;

                lessonsDB.Add(db_id, new Tuple<Lesson, LessonLng, LessonCourse, Episode,
                    EpisodeLng, EpisodeLesson, CourseLng>(lesson, lesson_lng, lesson_course, episode,
                        episode_lng, episode_lsn, curr_course.Item2));
            }
            rdr.Close();

            LessonMetaImage.AllData = allData;
            Reference.AllData = allData;
            EpisodeToc.AllData = allData;
            EpisodeTocLng.AllData = allData;

            Resource.AllData = allData;
            ResourceLng.AllData = allData;
            EpisodeContent.AllData = allData;

            foreach (KeyValuePair<int, Tuple<Lesson, LessonLng, LessonCourse, Episode, EpisodeLng, EpisodeLesson, CourseLng>> pair in lessonsDB)
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

                // SEO data
                if (lesson_prop_value.TryGetValue(att_lsn_seo_name, out val))
                    if (!String.IsNullOrEmpty(val))
                        lesson_lng.Fields.SnName = val;
                if (lesson_prop_value.TryGetValue(att_lsn_seo_description, out val))
                    if (!String.IsNullOrEmpty(val))
                        lesson_lng.Fields.SnDescription = val;
                if (lesson_prop_value.TryGetValue(att_lsn_seo_post, out val))
                    if (!String.IsNullOrEmpty(val))
                        lesson_lng.Fields.SnPost = val;

                if (lesson_prop_value.TryGetValue(att_lsn_readydate_name, out val))
                {
                    if (!String.IsNullOrEmpty(val))
                    {
                        lesson_course.Fields.ReadyDate = _monthYearToDate(val);
                        lesson_course.Fields.State = "D";
                        lesson_lng.Fields.State = "D";
                        episode_lng.Fields.State = "D";
                        pair.Value.Item7.Fields.State = "D"; // CourseLng
                    }
                }

                if (lesson.HasParent)
                {
                    lesson.Fields.ParentId = null;
                    int parent_db = 0;
                    if (lesson_prop_value.TryGetValue(att_lsn_parent_id_name, out val))
                        Int32.TryParse(val, out parent_db);
                    if (parent_db == 0)
                        throw new Exception(String.Format("Lesson \"{0}\" (Id={1}): Invalid value of attr \"{2}\".",
                            lesson_lng.Fields.Name, db_id, att_lsn_parent_id_name));
                    Tuple<Lesson, LessonLng, LessonCourse, Episode, EpisodeLng, EpisodeLesson, CourseLng> parent = null;
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

                // Audio file
                //
                int audio_duration = 0;
                string audio_duration_fmt = "00:00";
                if (audio_id != 0)
                {
                    JSObject meta = null;
                    Dictionary<string, string> file_desc = getFileDecription(audio_id, out meta);
                    string fn;
                    if (file_desc.TryGetValue("FileName", out fn))
                        episode_lng.Fields.Audio = fn;
                    if (file_desc.TryGetValue("MetaData", out fn))
                    {
                        episode_lng.Fields.RawAudioMeta = fn;
                        AudioFileDescriptionObj audio_dsc = new AudioFileDescriptionObj(meta);
                        audio_duration = audio_dsc.length;
                        audio_duration_fmt = audio_dsc.length_formatted;
                        episode_lng.Fields.AudioMeta = audio_dsc.ToJSONString();
                    }
                }

                lesson_lng.Fields.Duration = audio_duration;
                lesson_lng.Fields.DurationFmt = audio_duration_fmt;
                episode_lng.Fields.Duration = audio_duration;

                // Pictures
                //
                Dictionary<int, Tuple<Resource, ResourceLng>> resourcesDB = new Dictionary<int, Tuple<Resource, ResourceLng>>();
                if (lesson_prop_value.TryGetValue(att_lsn_rc_name, out val))
                    if (Int32.TryParse(val, out int_val))
                    {
                        SortedDictionary<int, List<EpisodeContent>> ordered_picts = new SortedDictionary<int, List<EpisodeContent>>();
                        List<EpisodeContent> lst;
                        for (int i = 0; i < int_val; i++)
                        {
                            string att_id = String.Format(att_lsn_rc_id_name, i);
                            string att_time = String.Format(att_lsn_rc_tm_name, i);
                            string att_time_ms = String.Format(att_lsn_rc_tms_name, i);
                            string att_show_flag = String.Format(att_lsn_rc_show_name, i);

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
                                        JSObject meta = null;
                                        Dictionary<string, string> file_desc = getFileDecription(picture_id, out meta);
                                        createResource(file_desc, meta, picture_id, lesson, lesson_prop_value,
                                            resourcesDB, att_show_flag, out resource, out res_lng);
                                    }
                                    if ((resource != null) && (res_lng != null))
                                    {
                                        EpisodeContent epi_content = new EpisodeContent();
                                        epi_content.Fields.EpisodeLngId = episode_lng.Fields.Id;
                                        epi_content.Fields.ResourceId = resource.Fields.Id;
                                        epi_content.Fields.CompType = "PIC";
                                        epi_content.Fields.contentObj =
                                            (
                                                new EpisodeContentObj
                                                {
                                                    title = res_lng.Fields.Name,
                                                    title2 = res_lng.Fields.Description,
                                                    track = 1
                                                }
                                            );
                                        epi_content.Fields.Duration = 0;
                                        epi_content.Fields.StartTime = 0;
                                        int tms = 0;
                                        if (lesson_prop_value.TryGetValue(att_time_ms, out val))
                                            Int32.TryParse(val, out tms);
                                        if (lesson_prop_value.TryGetValue(att_time, out val))
                                        {
                                            epi_content.Fields.StartTime = stringToSec(val) * 1000 + tms;
                                            if (ordered_picts.TryGetValue(epi_content.Fields.StartTime, out lst))
                                                lst.Add(epi_content);
                                            else
                                                ordered_picts.Add(epi_content.Fields.StartTime,
                                                    new List<EpisodeContent>() { epi_content });
                                        }
                                    }
                                }
                            }
                        }

                        List<EpisodeContent> lst_prev = null;
                        int curr_time = 0;
                        foreach (KeyValuePair<int, List<EpisodeContent>> p in ordered_picts)
                        {
                            curr_time = p.Value[0].Fields.StartTime;
                            if (lst_prev != null)
                            {
                                foreach (EpisodeContent epc in lst_prev)
                                {
                                    epc.Fields.Duration = curr_time - epc.Fields.StartTime;
                                    epc.Fields.contentObj.duration = (double)epc.Fields.Duration / 1000;
                                    epc.Fields.Content = epc.Fields.contentObj.ToJSONString();
                                }
                            }
                            lst_prev = p.Value;
                        }
                        if (lst_prev != null)
                            foreach (EpisodeContent epc in lst_prev)
                            {
                                epc.Fields.Duration = audio_duration * 1000 - epc.Fields.StartTime;
                                epc.Fields.contentObj.duration = (double)epc.Fields.Duration / 1000.0;
                                epc.Fields.Content = epc.Fields.contentObj.ToJSONString();
                            }
                    }

                // Social network pictures
                //
                {
                    JSObject meta = null;
                    Resource resource = null;
                    ResourceLng res_lng = null;
                    int picture_id = -1;

                    // Open Graph
                    if (lesson_prop_value.TryGetValue(att_lsn_seo_og_image, out val))
                        if (!String.IsNullOrEmpty(val))
                        {
                            Dictionary<string, string> file_desc = getFileDecription(val, out meta, out picture_id);
                            createResource(file_desc, meta, picture_id, lesson, lesson_prop_value,
                                resourcesDB, null, out resource, out res_lng);
                            if ((resource != null) && (res_lng != null))
                            {
                                LessonMetaImage img = new LessonMetaImage();
                                img.Fields.LessonLngId= lesson_lng.Fields.Id;
                                img.Fields.Type = "og";
                                img.Fields.ResourceId = resource.Fields.Id;
                            }
                            else
                                throw new Exception(String.Format("\"Open Graph\" image ( url = {0} ) is missing.", val));
                        }

                    // Twitter
                    if (lesson_prop_value.TryGetValue(att_lsn_seo_tw_image, out val))
                        if (!String.IsNullOrEmpty(val))
                        {
                            Dictionary<string, string> file_desc = getFileDecription(val, out meta, out picture_id);
                            createResource(file_desc, meta, picture_id, lesson, lesson_prop_value,
                                resourcesDB, null, out resource, out res_lng);
                            if ((resource != null) && (res_lng != null))
                            {
                                LessonMetaImage img = new LessonMetaImage();
                                img.Fields.LessonLngId = lesson_lng.Fields.Id;
                                img.Fields.Type = "tw";
                                img.Fields.ResourceId = resource.Fields.Id;
                            }
                            else
                                throw new Exception(String.Format("\"Twitter\" image ( url = {0} ) is missing.", val));
                        }
                }

                // Cover
                //
                if (photo_id != 0)
                {
                    JSObject meta = null;
                    Dictionary<string, string> file_desc = getFileDecription(photo_id, out meta);
                    string fn;
                    if (file_desc.TryGetValue("FileName", out fn))
                        lesson.Fields.Cover = fn;
                    if (file_desc.TryGetValue("MetaData", out fn))
                    {
                        lesson.Fields.RawCoverMeta = fn;

                        string name = null;
                        string description = null;
                        file_desc.TryGetValue("Description", out name);
                        file_desc.TryGetValue("ExtDescription", out description);

                        PictureResourceDescriptionObj pict = new PictureResourceDescriptionObj(meta, name, description);
                        lesson.Fields.CoverMeta = pict.ToJSONString();
                    }
                }
            }

            conn.Close();

            //
            // Export to JSON files
            //
            string root_path= Path.GetDirectoryName(outDir);
            foreach (RootDataObject root in allData)
                root_path = root.ToJSONFile(outDir, JSONFormatting, JSONEncoding, JSONSettings);

            users.ToJSONFile(Path.Combine(root_path, "users", "users.json"), JSONFormatting, JSONEncoding, JSONSettings);
        }

        void createResource(Dictionary<string, string> file_desc, JSObject meta, int picture_id, Lesson lesson,
            Dictionary<string, string> lesson_prop_value, Dictionary<int, Tuple<Resource, ResourceLng>> resourcesDB,
            string att_show_flag, out Resource resource, out ResourceLng res_lng)
        {
            string fn;
            string val;
            resource = null;
            res_lng = null;

            if (file_desc.TryGetValue("FileName", out fn))
            {
                resource = new Resource();
                resource.Fields.LessonId = lesson.Fields.Id;
                resource.Fields.ResType = "P";
                resource.Fields.FileName = fn;
                int show_flag = 0;
                if (!String.IsNullOrEmpty(att_show_flag))
                    if (lesson_prop_value.TryGetValue(att_show_flag, out val))
                        Int32.TryParse(val, out show_flag);
                resource.Fields.ShowInGalery = show_flag == 1;
                if (file_desc.TryGetValue("MetaData", out fn))
                {
                    resource.Fields.RawMetaData = fn;
                    PictureResourceDescriptionObj pict = new PictureResourceDescriptionObj(meta);
                    resource.Fields.MetaData = pict.ToJSONString();
                }

                res_lng = new ResourceLng();
                res_lng.Fields.ResourceId = resource.Fields.Id;
                res_lng.Fields.LanguageId = LANGUAGE_ID;
                if (file_desc.TryGetValue("Description", out fn))
                    res_lng.Fields.Name = fn;
                else
                    throw new Exception(String.Format("Picture (Id={0}): Description is empty.", picture_id));
                if (file_desc.TryGetValue("ExtDescription", out fn))
                    res_lng.Fields.Description = fn;
                if (file_desc.TryGetValue("AltAttribute", out fn))
                    res_lng.Fields.AltAttribute = fn;

                resourcesDB.Add(picture_id, new Tuple<Resource, ResourceLng>(resource, res_lng));
            }
        }

        static string ErrInvSymbolExpMsg = "MagisteryToJSON::_JSONParse: Invalid symbol \"{0}\" at position {1}. Expected one is \"{2}\".";
        static string ErrInvIntMsg = "MagisteryToJSON::_JSONParse: Invalid integer value \"{0}\" at position {1}.";
        static string ErrInvDblMsg = "MagisteryToJSON::_JSONParse: Invalid double value \"{0}\" at position {1}.";
        static string ErrInvBoolMsg = "MagisteryToJSON::_JSONParse: Invalid bool value \"{0}\" at position {1}.";
        static string ErrInvTokTpMsg = "MagisteryToJSON::_JSONParse: Invalid token type \"{0}\" at position {1}.";
        static string ErrEOLMsg = "MagisteryToJSON::_JSONParse: Unexpected EOL at position {0}.";
        static string DfltSeps = ";";

        static char _getNext(StringBuilder sb, ref int curr_pos, char ch_expected = '\0')
        {
            if (curr_pos >= sb.Length)
                throw new Exception(String.Format(ErrEOLMsg, curr_pos));
            char ch = sb[curr_pos];
            if ((ch_expected != '\0') && (ch != ch_expected))
                throw new Exception(String.Format(ErrInvSymbolExpMsg, ch, curr_pos, ch_expected));
            curr_pos++;
            return ch;
        }

        static string _getSeparated(StringBuilder sb, ref int curr_pos, string seps_val = null)
        {
            string seps = seps_val == null ? DfltSeps : seps_val;
            StringBuilder res = new StringBuilder();
            while (true)
            {
                char ch = _getNext(sb, ref curr_pos);
                bool isDone = false;
                for (int i = 0; i < seps.Length; i++)
                    if (ch == seps[i])
                    {
                        isDone = true;
                        break;
                    }
                if (isDone)
                    break;
                res.Append(ch);
            }
            return res.ToString();
        }

        static int _getInt(StringBuilder sb, ref int curr_pos, string seps_val = null)
        {
            int start_pos = curr_pos;
            string int_str = _getSeparated(sb, ref curr_pos, seps_val);
            int val;
            if (!Int32.TryParse(int_str, out val))
                throw new Exception(String.Format(ErrInvIntMsg, int_str, start_pos));
            return val;
        }

        static string _getString(StringBuilder sb, ref int curr_pos, Encoding enc, bool is_quoted = true)
        {
            StringBuilder res = new StringBuilder();
            int str_len_in_bytes = _getInt(sb, ref curr_pos, ":");

            char[] ch = new char[1] { '"' };
            int quotation_len = enc.GetByteCount(ch);
            str_len_in_bytes = is_quoted ? str_len_in_bytes + 2 * quotation_len : str_len_in_bytes;

            for (int i = 0; i < str_len_in_bytes; i += enc.GetByteCount(ch))
            {
                if (is_quoted && ((i == 0) || (i == (str_len_in_bytes - quotation_len))))
                    ch[0] = _getNext(sb, ref curr_pos, '"');
                else
                    res.Append(ch[0] = _getNext(sb, ref curr_pos));
            }
            _getNext(sb, ref curr_pos, ';');
            return res.ToString();
        }

        static bool _getBool(StringBuilder sb, ref int curr_pos, string seps_val = null)
        {
            int start_pos = curr_pos;
            int val = _getInt(sb, ref curr_pos, seps_val);
            if ((val < 0) || (val > 1))
                throw new Exception(String.Format(ErrInvBoolMsg, val, start_pos));
            return val > 0;
        }

        static double _getDouble(StringBuilder sb, ref int curr_pos, string seps_val = null)
        {
            int start_pos = curr_pos;
            string dbl_str = _getSeparated(sb, ref curr_pos, seps_val);
            double val;
            if (!Double.TryParse(dbl_str, out val))
                throw new Exception(String.Format(ErrInvDblMsg, dbl_str, start_pos));
            return val;
        }

        static char _getTokenType(StringBuilder sb, ref int curr_pos, char ch_expected = '\0')
        {
            int start_pos = curr_pos;
            string attr_tp = _getSeparated(sb, ref curr_pos, ":");
            if (attr_tp.Length != 1)
                throw new Exception(String.Format(ErrInvTokTpMsg, attr_tp, start_pos));
            if ((ch_expected != '\0') && (attr_tp[0] != ch_expected))
                throw new Exception(String.Format(ErrInvTokTpMsg, attr_tp, start_pos));
            return attr_tp[0];
        }

        static JSObject _JSONParse(StringBuilder sb, ref int curr_pos, Encoding enc)
        {
            JSObject res = new JSObject();
            int n_attrs = _getInt(sb, ref curr_pos, ":");
            _getNext(sb, ref curr_pos, '{');
            for (int i = 0; i < n_attrs; i++)
            {
                char token_tp = _getTokenType(sb, ref curr_pos);
                string attr_name;
                int start_pos = curr_pos;
                switch (token_tp)
                {
                    case 's':
                        attr_name = _getString(sb, ref curr_pos, enc);
                        break;

                    case 'i':
                        attr_name = _getInt(sb, ref curr_pos).ToString();
                        break;

                    default:
                        throw new Exception(String.Format(ErrInvTokTpMsg, token_tp, start_pos));
                };

                switch (_getTokenType(sb, ref curr_pos))
                {
                    case 's':
                        string str_val = _getString(sb, ref curr_pos, enc);
                        res.obj.Add(attr_name,
                            new Tuple<JSObject.FieldType, bool, int, string, double, JSObject>(
                                JSObject.FieldType.String, false, 0, str_val, 0, null));
                        break;

                    case 'i':
                        int int_val = _getInt(sb, ref curr_pos);
                        res.obj.Add(attr_name,
                            new Tuple<JSObject.FieldType, bool, int, string, double, JSObject>(
                                JSObject.FieldType.Int, false, int_val, null, 0, null));
                        break;

                    case 'd':
                        double dbl_val = _getDouble(sb, ref curr_pos);
                        res.obj.Add(attr_name,
                            new Tuple<JSObject.FieldType, bool, int, string, double, JSObject>(
                                JSObject.FieldType.Double, false, 0, null, dbl_val, null));
                        break;

                    case 'b':
                        bool bool_val = _getBool(sb, ref curr_pos);
                        res.obj.Add(attr_name,
                            new Tuple<JSObject.FieldType, bool, int, string, double, JSObject>(
                                JSObject.FieldType.Bool, bool_val, 0, null, 0, null));
                        break;

                    case 'a':
                        JSObject obj_val = _JSONParse(sb, ref curr_pos, enc);
                        res.obj.Add(attr_name,
                            new Tuple<JSObject.FieldType, bool, int, string, double, JSObject>(
                                JSObject.FieldType.Obj, false, 0, null, 0, obj_val));
                        break;
                }
            }
            _getNext(sb, ref curr_pos, '}');
            return res;
        }

        string setParagraph(string in_str) {
            const string PARAGRAPH_SEP = "\r\n\r\n";
            int PARAGRAPH_SEP_LEN = PARAGRAPH_SEP.Length;
            string rc = null;
            if (in_str != null)
            {
                StringBuilder sb = new StringBuilder();
                int curr_pos = 0;
                int length = in_str.Length;
                bool is_opened = false;
                while (curr_pos < length)
                {
                    int pos = in_str.IndexOf(PARAGRAPH_SEP, curr_pos);
                    if (pos >= 0)
                    {
                        if (pos > curr_pos)
                            sb.Append(in_str, curr_pos, pos - curr_pos);
                        if (is_opened)
                            sb.Append("</p>");
                        is_opened = true;
                        sb.Append("<p>");
                        curr_pos = pos + PARAGRAPH_SEP_LEN;
                    }
                    else
                    {
                        sb.Append(in_str, curr_pos, length - curr_pos);
                        curr_pos = length;
                    }
                }
                if (is_opened)
                    sb.Append("</p>");
                rc = sb.ToString();
            }
            return rc;
        }

        Dictionary<string, int> monthes = new Dictionary<string, int>()
        {
            {"январь",0 },
            {"февраль",1 },
            {"март",2 },
            {"апрель",3 },
            {"май",4 },
            {"июнь",5 },
            {"июль",6 },
            {"август",7 },
            {"сентябрь",8 },
            {"октябрь",9 },
            {"ноябрь",10 },
            {"декабрь",11 }
        };

        DateTime? _monthYearToDate(string month_year)
        {
            DateTime? dt = null;
            string[] date_strs = month_year.Split((char[])null, StringSplitOptions.RemoveEmptyEntries);
            if (date_strs.Length == 2)
            {
                int month;
                if (monthes.TryGetValue(date_strs[0], out month))
                {
                    month = (month + 1) % 12;
                    int year;
                    if (Int32.TryParse(date_strs[1], out year))
                        dt = (new DateTime(year, month + 1, 1)).AddDays(-1);
                }
            }
            return dt;
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
            JSObject raw_meta = null;
            return getFileDecription(obj_id, out raw_meta);
        }

        Dictionary<string, string> getFileDecription(int obj_id, out JSObject raw_meta)
        {
            MySqlCommand cmd = new MySqlCommand(sql_get_file_desc, conn);
            cmd.Parameters.AddWithValue("@PostId", obj_id);
            int id;
            return _getFileDecription(cmd, out raw_meta, out id);
        }

        Dictionary<string, string> getFileDecription(string url, out JSObject raw_meta, out int id)
        {
            MySqlCommand cmd = new MySqlCommand(sql_get_file_desc_by_url, conn);
            cmd.Parameters.AddWithValue("@Guid", url);
            return _getFileDecription(cmd, out raw_meta, out id);
        }

        Dictionary<string, string> _getFileDecription(MySqlCommand cmd, out JSObject raw_meta, out int id)
        {
            Dictionary<string, string> res = new Dictionary<string, string>();
            raw_meta = null;
            id = -1;
            rdr = cmd.ExecuteReader();
            bool is_first = true;
            while (rdr.Read())
            {
                if (is_first)
                {
                    id = rdr.GetInt32("id");
                    res["ExtDescription"] = String.IsNullOrEmpty(rdr.GetString("ext_desc")) ? null : rdr.GetString("ext_desc");
                    res["Description"] = rdr.GetString("desc");
                    res["Name"] = rdr.GetString("name");
                    is_first = false;
                }
                string meta_key = rdr.GetString("meta_key");
                if (meta_key == attached_file_meta)
                    res["FileName"] = rdr.GetString("meta_value");
                else
                    if (meta_key == attachment_image_alt)
                        res["AltAttribute"] = rdr.GetString("meta_value");
                    else
                        if (meta_key == attachment_metadata)
                        {
                            raw_meta = MagisteryToJSON.MagJSONParse(rdr.GetString("meta_value"));
                            res["MetaData"] = raw_meta.ToJSON();
                        }
            }
            rdr.Close();
            return res;
        }

        const int LANGUAGE_ID = 1;
        const int ACCOUNT_ID = 1;
        string conn_str;

        const string vk_code = "vkontakte";
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
        const string attachment_metadata = "_wp_attachment_metadata";
        const string attachment_image_alt = "_wp_attachment_image_alt";

        const string sql_get_postmeta_val =
            "select `m`.`meta_value` from `wp_posts` `p`\n" +
            "  join `wp_postmeta` `m` on `m`.`post_id` = `p`.`id`\n" +
            "where `p`.`id` = @PostId and `m`.`meta_key` = @MetaKey";

        const string sql_get_file_desc =
            "select `p`.`id`, `p`.`post_content` as `ext_desc`, `p`.`post_title` as `desc`, `p`.`post_name` as `name`,\n" +
            "  `m`.`meta_value`, `m`.`meta_key` from `wp_posts` `p`\n" +
            "  left join `wp_postmeta` `m` on `m`.`post_id` = `p`.`id`\n" +
            "where `p`.`id` = @PostId";

        const string sql_get_file_desc_by_url =
            "select `p`.`id`, `p`.`post_content` as `ext_desc`, `p`.`post_title` as `desc`, `p`.`post_name` as `name`,\n" +
            "  `m`.`meta_value`, `m`.`meta_key` from `wp_posts` `p`\n" +
            "  left join `wp_postmeta` `m` on `m`.`post_id` = `p`.`id`\n" +
            "where `p`.`guid` = @Guid";

        const string sql_get_author_to_course =
            "select distinct `t`.`term_id` as `author_id`, `t`.`name` as `author_name`, `tc`.`term_id` as `course_id`, `tc`.`name` as `course_name` from `wp_terms` `t`\n" +
            "  join `wp_term_taxonomy` `m` on `t`.`term_id` = `m`.`term_id` and `m`.`taxonomy` = 'autor'\n" +
            "  join `wp_term_relationships` `r` on `r`.`term_taxonomy_id` = `m`.`term_taxonomy_id`\n" +
            "  join `wp_posts` `p` on `p`.`id` = `r`.`object_id`\n" +
            "  join `wp_term_relationships` `rc` on `rc`.`object_id` = `r`.`object_id`\n" +
            "  join `wp_term_taxonomy` `mc` on `rc`.`term_taxonomy_id` = `mc`.`term_taxonomy_id` and `mc`.`taxonomy` = 'category'\n" +
            "  join `wp_terms` `tc` on `tc`.`term_id` = `mc`.`term_id`\n" +
            "order by `t`.`term_id`, `tc`.`term_id`";

        const string sql_users_profile =
            "select u.`ID`, u.`user_login`, u.`user_nicename`, u.`user_pass`, u.`user_email`, u.`user_url`, u.`user_registered`,\n" +
            "  u.`user_status`, u.`display_name`,\n" +
            "  p.`user_id`, p.`provider`, p.`identifier`, p.`profileurl`, p.`websiteurl`,\n" +
            "  p.`photourl`, p.`displayname`, p.`description`, p.`firstname`, p.`lastname`, p.`gender`,\n" +
            "  p.`language`, p.`age`, p.`birthday`, p.`birthmonth`, p.`birthyear`, p.`email`, p.`emailverified`,\n" +
            "  p.`phone`, p.`address`, p.`country`, p.`region`, p.`city`, p.`zip`\n" +
            "from `wp_users` u\n" +
            "  left join `wp_wslusersprofiles` p on p.user_id = u.id\n" +
            "order by u.`ID`, p.`id` desc";

        const string sql_users_roles =
            "select `user_id`, `meta_value` from wp_usermeta\n" +
            "where meta_key = 'wp_capabilities'\n" +
            "order by user_id";

        const string att_lsn_number_name = "номер_сортировки";
        const string att_lsn_cover_name = "картинка_лекции";
        const string att_lsn_descr_name = "краткое_описание";
        const string att_lsn_ext_name = "dop_lecture_bool";
        const string att_lsn_parent_id_name = "main_lecture";
        const string att_lsn_audio_name = "audio";
        const string att_lsn_readydate_name = "предполагаемая_дата_публикации";
        const string att_lsn_seo_name = "_yoast_wpseo_opengraph-title";
        const string att_lsn_seo_description = "_yoast_wpseo_opengraph-description";
        const string att_lsn_seo_og_image = "_yoast_wpseo_opengraph-image";
        const string att_lsn_seo_tw_image = "_yoast_wpseo_twitter-image";
        const string att_lsn_seo_post = "text_post_social";
        
        const string att_lsn_toc_name = "оглавление";
        const string att_lsn_toc_dsc_name = "оглавление_{0}_название";
        const string att_lsn_toc_tm_name = "оглавление_{0}_время";
        const string att_lsn_toc_tms_name = "оглавление_{0}_время_миллисекунды";

        const string att_lsn_rc_name = "иллюстрации_лекции_(слайды)";
        const string att_lsn_rc_id_name = "иллюстрации_лекции_(слайды)_{0}_картинка";
        const string att_lsn_rc_tm_name = "иллюстрации_лекции_(слайды)_{0}_время";
        const string att_lsn_rc_tms_name = "иллюстрации_лекции_(слайды)_{0}_время_миллисекунды";
        const string att_lsn_rc_show_name = "иллюстрации_лекции_(слайды)_{0}_выводить_в_галереи";

        const string sql_get_lessons =
            "select `t`.`term_id` as `author_id`, `t`.`name` as `author_name`, `tc`.`term_id` as `course_id`, `tc`.`name` as `course_name`,\n" +
            "  `p`.`id` as `lesson_id`, coalesce(`pm`.`meta_value`,'0') `is_ext`, `p`.`post_title` as `lesson_name`, `p`.`post_content`, `p`.`post_excerpt`,\n" +
            "  `p`.`post_status`, `p`.`comment_status`, `p`.`ping_status`, `p`.`post_name`, `p`.`post_modified`, `p`.`post_date` from `wp_terms` `t`\n" +
            "  join `wp_term_taxonomy` `m` on `t`.`term_id` = `m`.`term_id` and `m`.`taxonomy` = 'autor'\n" +
            "  join `wp_term_relationships` `r` on `r`.`term_taxonomy_id` = `m`.`term_taxonomy_id`\n" +
            "  join `wp_posts` `p` on `p`.`id` = `r`.`object_id`\n" +
            "  join `wp_term_relationships` `rc` on `rc`.`object_id` = `r`.`object_id`\n" +
            "  join `wp_term_taxonomy` `mc` on `rc`.`term_taxonomy_id` = `mc`.`term_taxonomy_id` and `mc`.`taxonomy` = 'category'\n" +
            "  join `wp_terms` `tc` on `tc`.`term_id` = `mc`.`term_id`\n" +
            "  join (select `post_id` from `wp_postmeta` where `meta_key` = '_access_user') `xx` on `xx`.`post_id` = `p`.`id`\n" +
            "  left join (select `post_id`, `meta_value` from `wp_postmeta` where `meta_key` = 'dop_lecture_bool') `pm` on `pm`.`post_id` = `p`.`id`\n" +
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

            //string pjson = File.ReadAllText("mag_json.txt", Encoding.UTF8);
            //MagisteryToJSON.JSObject obj = MagisteryToJSON.MagJSONParse(pjson);
            //string ss = obj.ToJSON();

            MagisteryToJSON mag = new MagisteryToJSON(connStr);
            mag.JSONFormatting = Formatting.Indented;
            mag.StartImport("..\\..\\data");
        }
    }
}
