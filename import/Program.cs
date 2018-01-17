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
            public string PortraitMeta { get; set; }
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
            public string CoverMeta { get; set; }
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
            public string CoverMeta { get; set; }
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
            public string AudioMeta { get; set; }
            public string RawAudioMeta { get; set; }
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
            public string RawMetaData { get; set; }
            public string MetaData { get; set; }
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

            public PictureResourceDescriptionObj(JSObject js_obj)
            {
                size = new Dictionary<string, int>();
                content = new Dictionary<string, string>();

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
                    Dictionary<string, string> file_desc = getFileDecription(photo_id);
                    string fn;
                    if (file_desc.TryGetValue("FileName", out fn))
                        au.Fields.Portrait = fn;
                    if (file_desc.TryGetValue("MetaData", out fn))
                        au.Fields.PortraitMeta = fn;
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
                    Dictionary<string, string> file_desc = getFileDecription(photo_id);
                    string fn;
                    if (file_desc.TryGetValue("FileName", out fn))
                        course.Fields.Cover = fn;
                    if (file_desc.TryGetValue("MetaData", out fn))
                        course.Fields.CoverMeta = fn;
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
                    EpisodeLng, EpisodeLesson, CourseLng>(lesson, lesson_lng, lesson_course, episode,
                        episode_lng, episode_lsn, curr_course.Item2));
            }
            rdr.Close();

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

                if (lesson_prop_value.TryGetValue(att_lsn_readydate_name, out val))
                {
                    if (!String.IsNullOrEmpty(val))
                    {
                        lesson_course.Fields.ReadyDate = _monthYearToDate(val);
                    }
                }
                if (lesson_course.Fields.ReadyDate.HasValue)
                {
                    lesson_course.Fields.State = "D";
                    lesson_lng.Fields.State = "D";
                    episode_lng.Fields.State = "D";
                    pair.Value.Item7.Fields.State = "D"; // CourseLng
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
                        episode_lng.Fields.AudioMeta = audio_dsc.ToJSONString();
                    }
                }

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
                                        Dictionary<string, string> file_desc = getFileDecription(picture_id,out meta);
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
                                            if (file_desc.TryGetValue("MetaData", out fn))
                                            {
                                                res_lng.Fields.RawMetaData = fn;
                                                PictureResourceDescriptionObj pict = new PictureResourceDescriptionObj(meta);
                                                res_lng.Fields.MetaData = pict.ToJSONString();
                                            }

                                            resourcesDB.Add(picture_id, new Tuple<Resource, ResourceLng>(resource, res_lng));
                                        }
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

                // Cover
                //
                if (photo_id != 0)
                {
                    Dictionary<string, string> file_desc = getFileDecription(photo_id);
                    string fn;
                    if (file_desc.TryGetValue("FileName", out fn))
                        lesson.Fields.Cover = fn;
                    if (file_desc.TryGetValue("MetaData", out fn))
                        lesson.Fields.CoverMeta = fn;
                }
            }

            conn.Close();

            //
            // Export to JSON files
            //
            foreach (RootDataObject root in allData)
                root.ToJSONFile(outDir, JSONFormatting, JSONEncoding, JSONSettings);

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
            Dictionary<string, string> res = new Dictionary<string, string>();
            raw_meta = null;
            MySqlCommand cmd = new MySqlCommand(sql_get_file_desc, conn);
            cmd.Parameters.AddWithValue("@PostId", obj_id);
            rdr = cmd.ExecuteReader();
            bool is_first = true;
            while (rdr.Read())
            {
                if (is_first)
                {
                    res["ExtDescription"] = String.IsNullOrEmpty(rdr.GetString("ext_desc")) ? null : rdr.GetString("ext_desc");
                    res["Description"] = rdr.GetString("desc");
                    res["Name"] = rdr.GetString("name");
                    is_first = false;
                }
                string meta_key = rdr.GetString("meta_key");
                if (meta_key == attached_file_meta)
                    res["FileName"] = rdr.GetString("meta_value");
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

        const string sql_get_postmeta_val =
            "select `m`.`meta_value` from `wp_posts` `p`\n" +
            "  join `wp_postmeta` `m` on `m`.`post_id` = `p`.`id`\n" +
            "where `p`.`id` = @PostId and `m`.`meta_key` = @MetaKey";

        const string sql_get_file_desc =
            "select `p`.`post_content` as `ext_desc`, `p`.`post_title` as `desc`, `p`.`post_name` as `name`,\n"+
            "  `m`.`meta_value`, `m`.`meta_key` from `wp_posts` `p`\n" +
            "  left join `wp_postmeta` `m` on `m`.`post_id` = `p`.`id`\n" +
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
        const string att_lsn_readydate_name = "предполагаемая_дата_публикации";

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

            //string pjson = File.ReadAllText("mag_json.txt", Encoding.UTF8);
            //MagisteryToJSON.JSObject obj = MagisteryToJSON.MagJSONParse(pjson);
            //string ss = obj.ToJSON();

            MagisteryToJSON mag = new MagisteryToJSON(connStr);
            mag.JSONFormatting = Formatting.Indented;
            mag.StartImport("..\\..\\data");
        }
    }
}
