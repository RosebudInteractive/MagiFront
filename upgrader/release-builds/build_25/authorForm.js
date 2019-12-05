'use strict';

const AUTHOR_DM_GUID = "3400220c-2293-4e47-9fd7-40574f724c32";
const AUTHOR_TREE_GUID = "95b34249-fc57-4857-a6da-0b547b907611";
const AUTHOR_LNG_SRC_GUID = "0c100b52-1889-4a77-9d1d-a93b96672971";
const AUTHOR_LIST_DM_GUID = "c6a152e6-1250-43f2-a6e7-ccc52836e53f";
const AUTHOR_LIST_TREE_GUID = "9b744a74-2eef-48ed-8685-fbee44d9f107";

const AUTHOR_LIST_FORM_RES_GUID = "a5fbbb31-7822-480a-b05f-f63a13cd00d6";
const AUTHOR_LIST_FORM_GUID = "6979ddb0-d97b-4a2d-a17f-3d8d1a94729c";
const DS_AUTHOR_LIST_GUID = "54761843-1634-4ce9-ba44-f4c4b9679cc6";

const FIELD_AUTHOR_LIST_ID_GUID = "da37db2d-dc72-4f39-9d53-2380a0667fb6";
const FIELD_AUTHOR_LIST_PORTRAIT_GUID = "09b37c49-6ec9-40b1-a7b7-a86e79cf4912";
const FIELD_AUTHOR_LIST_PORTRAITMETA_GUID = "04422ede-f7ee-4d4b-b069-4c92957e848d";
const FIELD_AUTHOR_LIST_URL_GUID = "22773a73-1a41-45ef-aa52-795dda326384";
const FIELD_AUTHOR_LIST_FIRSTNAME_GUID = "fe721232-e816-43c9-93a9-2ee236e4b218";
const FIELD_AUTHOR_LIST_LASTNAME_GUID = "5a5e4f5a-edbe-4440-9a9f-ac75b1c9d59f";
const FIELD_AUTHOR_LIST_DESCRIPTION_GUID = "624ee98d-3052-4456-a661-0b97606e8de4";

const AUTHOR_FORM_RES_GUID = "5eaa3389-fc81-4e11-ba0c-b7bf6439f762";
const AUTHOR_FORM_GUID = "c1af3bb4-95eb-4e7c-af4e-5655f3fb6dc6";
const FORM_CONTAINER_GUID = "a8efb107-d8a4-4846-9ad7-351efb728c84";
const FORM_DATA_MODEL_GUID = "ee27c8de-fbd0-4014-a30d-f1f8801b9706";
const DS_AUTHOR_GUID = "a9c9fc4b-10e8-4dba-8dcd-f941e928482c";
const DS_AUTHOR_LNG_GUID = "1e757d0a-d109-4079-83b1-282089058184";
const FIELD_AUTHOR_ID_GUID = "68bb93e9-a231-4c75-9a45-b1f97fe9c1e1";
const FIELD_AUTHOR_URL_GUID = "dbadc6c7-67f9-4342-8d04-54dfc1772f95";
const FIELD_AUTHOR_ACCOUNTID_GUID = "6cc2ddaa-9873-4bbd-a66f-98fa3ea76fcc";
const FIELD_AUTHOR_PORTRAIT_GUID = "5d3a9cac-1084-4d95-b932-cd02481bed09";
const FIELD_AUTHOR_PORTRAITMETA_GUID = "26cdcdad-aecd-4e47-b9ae-7114d9780495";
const FIELD_AUTHOR_LNG_ID_GUID = "bac39d98-dce7-471d-ad57-e59ff268deff";
const FIELD_AUTHOR_LNG_AUTHOR_ID_GUID = "12b1e1e9-39a7-4dac-931f-d15b920083e9";
const FIELD_AUTHOR_LNG_FIRSTNAME_GUID = "064c96fe-2952-4d1e-9a3d-adfecea44367";
const FIELD_AUTHOR_LNG_LASTNAME_GUID = "d909d4e4-318a-4420-a0c2-2043ad4bffc6";
const FIELD_AUTHOR_LNG_DESCRIPTION_GUID = "da040c1b-5f56-4145-a63f-4214b7c055b1";
const FIELD_AUTHOR_LNG_LANGUAGEID_GUID = "e1dba8e3-ccf1-463e-9f64-2b6a59c75a63";
const FIELD_AUTHOR_LNG_OCCUPATION_GUID = "0851602f-c02b-44d0-bcd7-57a9fd006696";
const FIELD_AUTHOR_LNG_EMPLOYMENT_GUID = "a87b7515-1da6-4dd1-b64b-4467df277215";
const FIELD_AUTHOR_LNG_SHORTDESCRIPTION_GUID = "0989a87c-fc3f-4198-baaf-59b0d3858f9a";

const AUTHOR_SQL =
    "select a.Id, a.Portrait, a.PortraitMeta,\n" +
    "  a.URL, al.FirstName, al.LastName, al.Description\n" +
    "from Author a\n" +
    "  join AuthorLng al on al.AuthorId = a.Id";

function createAuthorForm(api) {
    let formObj =
    {
        "$sys": {
            "guid": AUTHOR_FORM_RES_GUID,
            "typeGuid": api.classGuids.ResForm
        },
        "fields": {
            "ResName": "AuthorEditForm"
        },
        "collections": {
            "Children": [
                {
                    "$sys": {
                        "guid": AUTHOR_FORM_GUID,
                        "typeGuid": api.classGuids.Form
                    },
                    "fields": {
                        "Name": "MainForm",
                        "Title": "AuthorEditForm",
                        "dbgName": "AuthorEditForm",
                        "ResElemName": "MainForm"
                    },
                    "collections": {
                        "Params": [
                            {
                                "$sys": {
                                    "guid": "23d674e0-3019-4b4a-a5c4-8e6e92e76c2a",
                                    "typeGuid": api.classGuids.FormParam
                                },
                                "fields": {
                                    "Name": "Action",
                                    "Type": "param",
                                    "Kind": "in",
                                    "Value": "",
                                    "ResElemName": "ParamAction",
                                    "OnModify": " { $authorSubEdit.paramModify(this); } "
                                },
                                "collections": {}
                            }
                        ],
                        "Children": [
                            {
                                "$sys": {
                                    "guid": FORM_CONTAINER_GUID,
                                    "typeGuid": api.classGuids.CContainer
                                },
                                "fields": {
                                    "Name": "MainContainer",
                                    "ResElemName": "MainContainer"
                                },
                                "collections": {
                                    "Children": [
                                        {
                                            "$sys": {
                                                "guid": FORM_DATA_MODEL_GUID,
                                                "typeGuid": api.classGuids.ADataModel
                                            },
                                            "fields": {
                                                "Name": "DataModel",
                                                "ResElemName": "DataModel",
                                                "OnDataInit": "{ $authorSubEdit.onDataInit(this); }"
                                            },
                                            "collections": {
                                                "Datasets": [
                                                    {
                                                        "$sys": {
                                                            "guid": DS_AUTHOR_GUID,
                                                            "typeGuid": api.classGuids.Dataset
                                                        },
                                                        "fields": {
                                                            "Name": "DatasetAuthor",
                                                            "ObjType": "5f9e649d-43c4-d1e6-2778-ff4f58cd7c53",
                                                            "Active": true,
                                                            "ResElemName": "DsAuthor"
                                                        },
                                                        "collections": {
                                                            "Fields": [
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_ID_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "Id",
                                                                        "ResElemName": "DsAuthor_Id"
                                                                    }
                                                                },
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_URL_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "URL",
                                                                        "ResElemName": "DsAuthor_URL"
                                                                    }
                                                                },
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_ACCOUNTID_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "AccountId",
                                                                        "ResElemName": "DsAuthor_AccountId"
                                                                    }
                                                                },
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_PORTRAIT_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "Portrait",
                                                                        "ResElemName": "DsAuthor_Portrait"
                                                                    }
                                                                },
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_PORTRAITMETA_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "PortraitMeta",
                                                                        "ResElemName": "DsAuthor_PortraitMeta"
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "$sys": {
                                                            "guid": DS_AUTHOR_LNG_GUID,
                                                            "typeGuid": api.classGuids.Dataset
                                                        },
                                                        "fields": {
                                                            "Name": "DatasetAuthorLng",
                                                            "ObjType": "3618f084-7f99-ebe9-3738-4af7cf53dc49",
                                                            "Active": true,
                                                            "Master": DS_AUTHOR_GUID,
                                                            "ResElemName": "DsAuthorLng"
                                                        },
                                                        "collections": {
                                                            "Fields": [
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_LNG_ID_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "Id",
                                                                        "ResElemName": "DsAuthorLng_Id"
                                                                    }
                                                                },
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_LNG_AUTHOR_ID_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "AuthorId",
                                                                        "ResElemName": "DsAuthorLng_AuthorId"
                                                                    }
                                                                },
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_LNG_FIRSTNAME_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "FirstName",
                                                                        "ResElemName": "DsAuthorLng_FirstName"
                                                                    }
                                                                },
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_LNG_LASTNAME_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "LastName",
                                                                        "ResElemName": "DsAuthorLng_LastName"
                                                                    }
                                                                },
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_LNG_DESCRIPTION_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "Description",
                                                                        "ResElemName": "DsAuthorLng_Description"
                                                                    }
                                                                },
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_LNG_LANGUAGEID_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "LanguageId",
                                                                        "ResElemName": "DsAuthorLng_LanguageId"
                                                                    }
                                                                },
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_LNG_OCCUPATION_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "Occupation",
                                                                        "ResElemName": "DsAuthorLng_Occupation"
                                                                    }
                                                                },
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_LNG_EMPLOYMENT_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "Employment",
                                                                        "ResElemName": "DsAuthorLng_Employment"
                                                                    }
                                                                },
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_LNG_SHORTDESCRIPTION_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "ShortDescription",
                                                                        "ResElemName": "DsAuthorLng_ShortDescription"
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "$sys": {
                                                "guid": "2e6c9db8-3519-42a6-8232-881eb84189d5",
                                                "typeGuid": api.classGuids.Label
                                            },
                                            "fields": {
                                                "Name": "LabelId",
                                                "Top": 40,
                                                "Left": 10,
                                                "Width": 190,
                                                "Height": 23,
                                                "Label": "Id",
                                                "ResElemName": "LabelId"
                                            }
                                        },
                                        {
                                            "$sys": {
                                                "guid": "047fc969-ddc2-427b-8439-29ea3ce7bb6e",
                                                "typeGuid": api.classGuids.DataEdit
                                            },
                                            "fields": {
                                                "Name": "DataEditId",
                                                "Top": 40,
                                                "Left": 130,
                                                "Width": 340,
                                                "Height": 23,
                                                "Dataset": DS_AUTHOR_GUID,
                                                "DataField": "Id",
                                                "ResElemName": "DataEditId"
                                            },
                                            "collections": {}
                                        },
                                        {
                                            "$sys": {
                                                "guid": "111e28f7-fafb-42e7-8223-c7e44dc26e9f",
                                                "typeGuid": api.classGuids.Label
                                            },
                                            "fields": {
                                                "Name": "LabelURL",
                                                "Top": 70,
                                                "Left": 10,
                                                "Width": 190,
                                                "Height": 23,
                                                "Label": "URL",
                                                "ResElemName": "LabelURL"
                                            }
                                        },
                                        {
                                            "$sys": {
                                                "guid": "e0b76214-223b-423b-8fc3-e432aa3b56bb",
                                                "typeGuid": api.classGuids.DataEdit
                                            },
                                            "fields": {
                                                "Name": "DataEditURL",
                                                "Top": 70,
                                                "Left": 130,
                                                "Width": 340,
                                                "Height": 23,
                                                "Dataset": DS_AUTHOR_GUID,
                                                "DataField": "URL",
                                                "ResElemName": "DataEditURL"
                                            },
                                            "collections": {}
                                        },
                                        {
                                            "$sys": {
                                                "guid": "fe821b10-e75f-44fe-8876-1a5d5ae75cd7",
                                                "typeGuid": api.classGuids.Label
                                            },
                                            "fields": {
                                                "Name": "LabelFirstName",
                                                "Top": 100,
                                                "Left": 10,
                                                "Width": 190,
                                                "Height": 23,
                                                "Label": "Имя",
                                                "ResElemName": "LabelFirstName"
                                            }
                                        },
                                        {
                                            "$sys": {
                                                "guid": "fd08e43b-4f21-4697-8180-5ea1fefbbd66",
                                                "typeGuid": api.classGuids.DataEdit
                                            },
                                            "fields": {
                                                "Name": "DataEditFirstName",
                                                "Top": 100,
                                                "Left": 130,
                                                "Width": 340,
                                                "Height": 23,
                                                "Dataset": DS_AUTHOR_LNG_GUID,
                                                "DataField": "FirstName",
                                                "ResElemName": "DataEditFirstName"
                                            },
                                            "collections": {}
                                        },
                                        {
                                            "$sys": {
                                                "guid": "b8825a2a-096a-40f2-9870-24b790a799c3",
                                                "typeGuid": api.classGuids.Label
                                            },
                                            "fields": {
                                                "Name": "LabelLastName",
                                                "Top": 130,
                                                "Left": 10,
                                                "Width": 190,
                                                "Height": 23,
                                                "Label": "Фамилия",
                                                "ResElemName": "LabelLastName"
                                            }
                                        },
                                        {
                                            "$sys": {
                                                "guid": "2f512019-452d-41e6-a486-d97790756625",
                                                "typeGuid": api.classGuids.DataEdit
                                            },
                                            "fields": {
                                                "Name": "DataEditLastName",
                                                "Top": 130,
                                                "Left": 130,
                                                "Width": 340,
                                                "Height": 23,
                                                "Dataset": DS_AUTHOR_LNG_GUID,
                                                "DataField": "LastName",
                                                "ResElemName": "DataEditLastName"
                                            },
                                            "collections": {}
                                        },
                                        {
                                            "$sys": {
                                                "guid": "5adc3c13-1ead-403b-ab7c-c31f6ea8da36",
                                                "typeGuid": api.classGuids.Label
                                            },
                                            "fields": {
                                                "Name": "LabelDescription",
                                                "Top": 160,
                                                "Left": 10,
                                                "Width": 190,
                                                "Height": 23,
                                                "Label": "Описание",
                                                "ResElemName": "LabelDescription"
                                            }
                                        },
                                        {
                                            "$sys": {
                                                "guid": "dff09cc9-ef86-4323-8d41-e28d75133283",
                                                "typeGuid": api.classGuids.DataEdit
                                            },
                                            "fields": {
                                                "Name": "DataEditDescription",
                                                "Top": 160,
                                                "Left": 130,
                                                "Width": 340,
                                                "Height": 120,
                                                "Dataset": DS_AUTHOR_LNG_GUID,
                                                "DataField": "Description",
                                                "ResElemName": "DataEditDescription"
                                            },
                                            "collections": {}
                                        },
                                        {
                                            "$sys": {
                                                "guid": "e6013a3a-cc75-4c98-8d9e-b165c657a792",
                                                "typeGuid": api.classGuids.Button
                                            },
                                            "fields": {
                                                "Name": "ButtonEdit",
                                                "Top": 290,
                                                "Left": 10,
                                                "Width": 120,
                                                "Height": 30,
                                                "Caption": "Редактировать",
                                                "OnClick": " { $authorSubEdit.clickEdit(this); }",
                                                "ResElemName": "ButtonEdit"
                                            },
                                            "collections": {}
                                        },
                                        {
                                            "$sys": {
                                                "guid": "46054b85-dfe6-4c0a-9f81-60ac75f75193",
                                                "typeGuid": api.classGuids.Button
                                            },
                                            "fields": {
                                                "Name": "ButtonCancel",
                                                "Top": 290,
                                                "Left": 140,
                                                "Width": 120,
                                                "Height": 30,
                                                "Caption": "Отменить",
                                                "OnClick": " { $authorSubEdit.clickCancel(this); }",
                                                "ResElemName": "ButtonCancel"
                                            },
                                            "collections": {}
                                        },
                                        {
                                            "$sys": {
                                                "guid": "b3a7130c-57e9-4840-8f1c-86573dc8ef99",
                                                "typeGuid": api.classGuids.Button
                                            },
                                            "fields": {
                                                "Name": "ButtonSave",
                                                "Top": 290,
                                                "Left": 270,
                                                "Width": 120,
                                                "Height": 30,
                                                "Caption": "Сохранить",
                                                "OnClick": " { $authorSubEdit.clickSave(this); }",
                                                "ResElemName": "ButtonSave"
                                            },
                                            "collections": {}
                                        }
                                    ]
                                }
                            }
                        ]
                    }

                }
            ]
        }
    };
    return api.jsonToResource(formObj);
}

function createAuthorListForm(api) {
    let formObj =
    {
        "$sys": {
            "guid": AUTHOR_LIST_FORM_RES_GUID,
            "typeGuid": api.classGuids.ResForm
        },
        "fields": {
            "ResName": "AuthorListForm"
        },
        "collections": {
            "Children": [
                {
                    "$sys": {
                        "guid": AUTHOR_LIST_FORM_GUID,
                        "typeGuid": api.classGuids.Form
                    },
                    "fields": {
                        "Name": "MainForm",
                        "Title": "AuthorListForm",
                        "dbgName": "AuthorListForm",
                        "ResElemName": "MainForm"
                    },
                    "collections": {
                        "Children": [
                            {
                                "$sys": {
                                    "guid": "0fd485a1-3245-407f-b95c-4e062fae7b58",
                                    "typeGuid": api.classGuids.CContainer
                                },
                                "fields": {
                                    "Name": "MainContainer",
                                    "ResElemName": "MainContainer"
                                },
                                "collections": {
                                    "Children": [
                                        {
                                            "$sys": {
                                                "guid": "ecf4f25c-b968-4e8e-9a9c-16e56cc32159",
                                                "typeGuid": api.classGuids.ADataModel
                                            },
                                            "fields": {
                                                "Name": "DataModel",
                                                "ResElemName": "DataModel"
                                            },
                                            "collections": {
                                                "Datasets": [
                                                    {
                                                        "$sys": {
                                                            "guid": DS_AUTHOR_LIST_GUID,
                                                            "typeGuid": api.classGuids.Dataset
                                                        },
                                                        "fields": {
                                                            "Name": "DatasetAuthorList",
                                                            "ObjType": "5f9e649d-43c4-d1e6-2778-ff4f58cd7c53",
                                                            "Active": true,
                                                            "ResElemName": "DsAuthorList",
                                                            "OnMoveCursor": " { $authorList.onMoveCursor(this, newVal); } ",
                                                        },
                                                        "collections": {
                                                            "Fields": [
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_LIST_ID_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "Id",
                                                                        "ResElemName": "DsAuthorList_Id"
                                                                    }
                                                                },
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_LIST_PORTRAIT_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "Portrait",
                                                                        "ResElemName": "DsAuthorList_Portrait"
                                                                    }
                                                                },
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_LIST_PORTRAITMETA_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "PortraitMeta",
                                                                        "ResElemName": "DsAuthorList_PortraitMeta"
                                                                    }
                                                                },
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_LIST_URL_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "URL",
                                                                        "ResElemName": "DsAuthorList_URL"
                                                                    }
                                                                },
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_LIST_FIRSTNAME_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "FirstName",
                                                                        "ResElemName": "DsAuthorList_FirstName"
                                                                    }
                                                                },
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_LIST_LASTNAME_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "LastName",
                                                                        "ResElemName": "DsAuthorList_LastName"
                                                                    }
                                                                },
                                                                {
                                                                    "$sys": {
                                                                        "guid": FIELD_AUTHOR_LIST_DESCRIPTION_GUID,
                                                                        "typeGuid": api.classGuids.DataField
                                                                    },
                                                                    "fields": {
                                                                        "Name": "Description",
                                                                        "ResElemName": "DsAuthorList_Description"
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "$sys": {
                                                "guid": "9e517b01-6558-4af7-a431-6e2790b9ec73",
                                                "typeGuid": api.classGuids.DataGrid
                                            },
                                            "fields": {
                                                "Name": "DataGridAuthorList",
                                                "Top": "50",
                                                "Left": "10",
                                                "Width": 680,
                                                "Height": 240,
                                                "Dataset": DS_AUTHOR_LIST_GUID,
                                                "ResElemName": "DataGridAuthorList"
                                            },
                                            "collections": {
                                                "Columns": [
                                                    {
                                                        "$sys": {
                                                            "guid": "c0eacd4a-42d9-4f80-9bd1-d4b21d367893",
                                                            "typeGuid": api.classGuids.DataColumn
                                                        },
                                                        "fields": {
                                                            "Name": "DataGridAuthorListId",
                                                            "Label": "Id",
                                                            "Width": 7,
                                                            "Field": FIELD_AUTHOR_LIST_ID_GUID,
                                                            "ResElemName": "DataGridAuthorListId"
                                                        }
                                                    },
                                                    {
                                                        "$sys": {
                                                            "guid": "adc4a264-2bcd-452d-8910-91852b838313",
                                                            "typeGuid": api.classGuids.DataColumn
                                                        },
                                                        "fields": {
                                                            "Name": "DataGridAuthorListFirstName",
                                                            "Label": "Имя",
                                                            "Width": 20,
                                                            "Field": FIELD_AUTHOR_LIST_FIRSTNAME_GUID,
                                                            "ResElemName": "DataGridAuthorListFirstName"
                                                        }
                                                    },
                                                    {
                                                        "$sys": {
                                                            "guid": "0556b437-6f2e-4ac5-9e15-2bc0d2c9f4b4",
                                                            "typeGuid": api.classGuids.DataColumn
                                                        },
                                                        "fields": {
                                                            "Name": "DataGridAuthorListLastName",
                                                            "Label": "Фамилия",
                                                            "Width": 30,
                                                            "Field": FIELD_AUTHOR_LIST_LASTNAME_GUID,
                                                            "ResElemName": "DataGridAuthorListLastName"
                                                        }
                                                    },
                                                    {
                                                        "$sys": {
                                                            "guid": "b2ffa2fa-5a13-4451-8e1d-d0e959149f05",
                                                            "typeGuid": api.classGuids.DataColumn
                                                        },
                                                        "fields": {
                                                            "Name": "DataGridAuthorListURL",
                                                            "Label": "URL",
                                                            "Width": 30,
                                                            "Field": FIELD_AUTHOR_LIST_URL_GUID,
                                                            "ResElemName": "DataGridAuthorListURL"
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "$sys": {
                                                "guid": "fed58df7-f06d-4b08-9a65-3b32b71d00ff",
                                                "typeGuid": api.classGuids.Button
                                            },
                                            "fields": {
                                                "Name": "ButtonNew",
                                                "Top": 10,
                                                "Left": 10,
                                                "Width": 80,
                                                "Height": 30,
                                                "Caption": "Создать",
                                                "OnClick": " { $authorList.clickNewTask1(); }",
                                                "ResElemName": "ButtonNew"
                                            },
                                            "collections": {}
                                        },
                                        {
                                            "$sys": {
                                                "guid": "d4d75c41-e399-4100-8bd2-1dc636e39fcb",
                                                "typeGuid": api.classGuids.Button
                                            },
                                            "fields": {
                                                "Name": "ButtonDelete",
                                                "Top": 10,
                                                "Left": 100,
                                                "Width": 110,
                                                "Height": 30,
                                                "Caption": "Удалить",
                                                "OnClick": " { $authorList.clickNewTask2(); }",
                                                "ResElemName": "ButtonDelete"
                                            },
                                            "collections": {}
                                        },
                                        {
                                            "$sys": {
                                                "guid": "2c806bbe-4aa8-4acf-b5de-921b22a82180",
                                                "typeGuid": api.classGuids.FormContainer
                                            },
                                            "fields": {
                                                "Name": "SubForm",
                                                "ResElemName": "SubForm",
                                                "Top": "50",
                                                "Left": "700",
                                                "Width": 500,
                                                "Height": 570,
                                                "OnFormClose": "{ $authorList.formClosed(e, this); }"
                                            },
                                            "collections": {}
                                        }
                                    ]
                                }
                            }
                        ]
                    }

                }
            ]
        }
    };
    return api.jsonToResource(formObj);
}

module.exports = async (api) => {
    let vmAuthorList = await api.getResByName("VirtualAuthorList", api.classGuids.MetaModel);
    if (!vmAuthorList)
        vmAuthorList = api.schema.addVirtualModel("VirtualAuthorList", "cdc15803-a36d-41ef-b9ec-84d12260d4d1", "RootVAuthorList", "a4d757ba-7257-4ae0-8a28-018b146e5ee4")
            .setDefaultSQL(AUTHOR_SQL)
            .addField("Id", { type: "int" }, api.meta.Field.PrimaryKey)
            .addField("Portrait", { type: "string", length: 255 })
            .addField("PortraitMeta", { type: "string" })
            .addField("URL", { type: "string", length: 255 })
            .addField("FirstName", { type: "string", length: 255 })
            .addField("LastName", { type: "string", length: 255 })
            .addField("Description", { type: "string" })
            .addBinding("Id", api.schema.getModel("Author").getClassField("Id"))
            .addBinding("Portrait", api.schema.getModel("Author").getClassField("Portrait"))
            .addBinding("PortraitMeta", api.schema.getModel("Author").getClassField("PortraitMeta"))
            .addBinding("URL", api.schema.getModel("Author").getClassField("URL"))
            .addBinding("FirstName", api.schema.getModel("AuthorLng").getClassField("FirstName"))
            .addBinding("LastName", api.schema.getModel("AuthorLng").getClassField("LastName"))
            .addBinding("Description", api.schema.getModel("AuthorLng").getClassField("Description"));

    let dm_list = await api.getResByName("DMAuthorList", api.classGuids.DataModel);
    let treeAuthorList;
    if (!dm_list)
        treeAuthorList = api.schema.addDataModel("DMAuthorList", AUTHOR_LIST_DM_GUID)
            .addDbTreeModel("AuthorListTree", { resName: "VirtualAuthorList" }, AUTHOR_LIST_TREE_GUID)
    else
        treeAuthorList = dm_list.getTreeRoot("AuthorListTree");

    let datamodel = await api.getResByName("DMAuthorFiltered", api.classGuids.DataModel);
    let treeAuthor;
    if (!datamodel) {
        treeAuthor = api.schema.addDataModel("DMAuthorFiltered", AUTHOR_DM_GUID)
            .addDbTreeModel("AuthorTree", { resName: "Author" }, AUTHOR_TREE_GUID)
            .addDataSource({
                guid: AUTHOR_LNG_SRC_GUID,
                model: { resName: "AuthorLng" },
                field: {
                    resName: "AuthorLng",
                    elemName: "AuthorId",
                }
            });
        let filter = treeAuthor.getFilter();
        filter.addParameter({ name: "ObjId", ptype: "int" });
        filter.addCondition({ leftExp: { field: "Id" }, op: "=", rightExp: { param: "ObjId" } });
        treeAuthor.setParameter("ObjId", -1);
}
    else
        treeAuthor = datamodel.getTreeRoot("AuthorTree");
    let srcAuthorLng = treeAuthor.getDataSource("AuthorLng");

    let formList = await api.getResByName("AuthorListForm", api.classGuids.ResForm);
    if (!formList)
        formList = createAuthorListForm(api);

    let dsAuthorList = formList.getDB().getObjByRoot(formList.getRoot(), DS_AUTHOR_LIST_GUID);
    dsAuthorList.objectTree(treeAuthorList);

    let form = await api.getResByName("AuthorEditForm", api.classGuids.ResForm);
    if (!form) {
        form = createAuthorForm(api);
    }

    let dsAuthor = form.getDB().getObjByRoot(form.getRoot(), DS_AUTHOR_GUID);
    let dsAuthorLng = form.getDB().getObjByRoot(form.getRoot(), DS_AUTHOR_LNG_GUID);
    dsAuthor.objectTree(treeAuthor);
    dsAuthorLng.objectTree(srcAuthorLng);
};
