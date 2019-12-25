'use strict';

const AUTHOR_DM_GUID = "7d80abc1-d6a9-4940-a525-684fb54fd0b5";
const AUTHOR_TREE_GUID = "1d6edd60-82a1-4285-bc35-c83794e7a855";
const AUTHOR_LNG_SRC_GUID = "0c4858f4-51ed-491a-99b6-470ce8c5f93f";

const AUTHOR_FORM_RES_GUID = "09cf96d9-3772-4cfb-839e-406a9a4718ce";
const AUTHOR_FORM_GUID = "3fd42b1d-7354-4edf-beb8-acf274535821";
const FORM_CONTAINER_GUID = "b3399543-84cd-4e6b-8fe6-0e33cd36cdb8";
const FORM_DATA_MODEL_GUID = "eca6a742-112d-4237-9662-c6b9e72cca05";
const DS_AUTHOR_GUID = "7f6c5b86-c42f-4c63-a66b-eb9bee4ab636";
const DS_AUTHOR_LNG_GUID = "bfd0c064-8c6a-492f-8f6d-d733acd28526";
const FIELD_AUTHOR_ID_GUID = "dfb0691a-a089-4816-bdb7-49046da2acfe";
const FIELD_AUTHOR_URL_GUID = "ba81498a-454e-4378-abb4-190210191779";
const FIELD_AUTHOR_LNG_ID_GUID = "891f7ca9-3124-4fec-aa12-bfb5163ebb94";
const FIELD_AUTHOR_LNG_AUTHOR_ID_GUID = "c3887971-62dc-4192-8eb7-9b679cac77df";
const FIELD_AUTHOR_LNG_FIRSTNAME_GUID = "d629a7f0-aa47-4d77-9a0c-1d6367341fc3";
const FIELD_AUTHOR_LNG_LASTNAME_GUID = "90e52941-4040-4b8b-9b5f-d2c175ac0250";

function createAuthorForm(api) {
    let formObj =
    {
        "$sys": {
            "guid": AUTHOR_FORM_RES_GUID,
            "typeGuid": api.classGuids.ResForm
        },
        "fields": {
            "ResName": "AuthorForm"
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
                        "Title": "AuthorForm",
                        "dbgName": "AuthorForm",
                        "ResElemName": "MainForm"
                    },
                    "collections": {
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
                                                "ResElemName": "DataModel"
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
                                                "Name": "DataGridAuthor",
                                                "Top": "67",
                                                "Left": "10",
                                                "Width": 380,
                                                "Height": 240,
                                                "Dataset": DS_AUTHOR_GUID,
                                                "ResElemName": "DataGridAuthor"
                                            },
                                            "collections": {
                                                "Columns": [
                                                    {
                                                        "$sys": {
                                                            "guid": "1cabbafb-fbd9-4343-95e5-c59bf4bd5fc5",
                                                            "typeGuid": api.classGuids.DataColumn
                                                        },
                                                        "fields": {
                                                            "Name": "DataGridAuthorId",
                                                            "Label": "ID",
                                                            "Width": 10,
                                                            "Field": FIELD_AUTHOR_ID_GUID,
                                                            "ResElemName": "DataGridAuthorId"
                                                        }
                                                    },
                                                    {
                                                        "$sys": {
                                                            "guid": "857045db-efcd-4ceb-b0c0-7907d4457644",
                                                            "typeGuid": api.classGuids.DataColumn
                                                        },
                                                        "fields": {
                                                            "Name": "DataGridAuthorURL",
                                                            "Label": "URL",
                                                            "Width": 90,
                                                            "Field": FIELD_AUTHOR_URL_GUID,
                                                            "ResElemName": "DataGridAuthorURL"
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "$sys": {
                                                "guid": "4b6c7042-3137-43e3-9f9a-b0245cf794df",
                                                "typeGuid": api.classGuids.DataGrid
                                            },
                                            "fields": {
                                                "Name": "DataGridAuthorLng",
                                                "Top": "67",
                                                "Left": "390",
                                                "Width": 660,
                                                "Height": 240,
                                                "Dataset": DS_AUTHOR_LNG_GUID,
                                                "ResElemName": "DataGridAuthorLng",
                                                "Editable": true
                                            },
                                            "collections": {
                                                "Columns": [
                                                    {
                                                        "$sys": {
                                                            "guid": "070d368f-d2fa-4c5e-ab97-e9e248bdeb4f",
                                                            "typeGuid": api.classGuids.DataColumn
                                                        },
                                                        "fields": {
                                                            "Name": "DataGridAuthorLngId",
                                                            "Label": "Id",
                                                            "Width": 10,
                                                            "Field": FIELD_AUTHOR_LNG_ID_GUID,
                                                            "ResElemName": "DataGridAuthorLngId"
                                                        }
                                                    },
                                                    {
                                                        "$sys": {
                                                            "guid": "3cb08b58-977a-441c-96cf-f9f36ddf757a",
                                                            "typeGuid": api.classGuids.DataColumn
                                                        },
                                                        "fields": {
                                                            "Name": "DataGridAuthorLngAuthorId",
                                                            "Label": "AuthorId",
                                                            "Width": 20,
                                                            "Field": FIELD_AUTHOR_LNG_AUTHOR_ID_GUID,
                                                            "ResElemName": "DataGridAuthorLngAuthorId"
                                                        }
                                                    },
                                                    {
                                                        "$sys": {
                                                            "guid": "dac3006d-3f05-42c1-8054-4b401c49f868",
                                                            "typeGuid": api.classGuids.DataColumn
                                                        },
                                                        "fields": {
                                                            "Name": "DataGridAuthorLngFirstName",
                                                            "Label": "Имя",
                                                            "Width": 20,
                                                            "Field": FIELD_AUTHOR_LNG_FIRSTNAME_GUID,
                                                            "ResElemName": "DataGridAuthorLngFirstName"
                                                        }
                                                    },
                                                    {
                                                        "$sys": {
                                                            "guid": "92f915a3-1607-48fc-aa43-d0d46666c412",
                                                            "typeGuid": api.classGuids.DataColumn
                                                        },
                                                        "fields": {
                                                            "Name": "DataGridAuthorLngLastName",
                                                            "Label": "Фамилия",
                                                            "Width": 20,
                                                            "Field": FIELD_AUTHOR_LNG_LASTNAME_GUID,
                                                            "ResElemName": "DataGridAuthorLngLastName"
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "$sys": {
                                                "guid": "047fc969-ddc2-427b-8439-29ea3ce7bb6e",
                                                "typeGuid": api.classGuids.DataEdit
                                            },
                                            "fields": {
                                                "Name": "DataEditId",
                                                "Top": "440",
                                                "Left": "10",
                                                "Width": 190,
                                                "Height": 23,
                                                "Dataset": DS_AUTHOR_GUID,
                                                "DataField": "Id",
                                                "ResElemName": "DataEditId"
                                            },
                                            "collections": {}
                                        },
                                        {
                                            "$sys": {
                                                "guid": "e0b76214-223b-423b-8fc3-e432aa3b56bb",
                                                "typeGuid": api.classGuids.DataEdit
                                            },
                                            "fields": {
                                                "Name": "DataEditURL",
                                                "Top": "470",
                                                "Left": "10",
                                                "Width": 190,
                                                "Height": 23,
                                                "Dataset": DS_AUTHOR_GUID,
                                                "DataField": "URL",
                                                "ResElemName": "DataEditURL"
                                            },
                                            "collections": {}
                                        },
                                        {
                                            "$sys": {
                                                "guid": "e14956ee-487b-40c9-80f1-78448441e900",
                                                "typeGuid": api.classGuids.Button
                                            },
                                            "fields": {
                                                "Name": "EditButton",
                                                "Top": 320,
                                                "Left": 10,
                                                "Caption": "EDIT",
                                                "OnClick": " { $authorEdit.clickEdit(); }",
                                                "Enabled": true,
                                                "ResElemName": "EditButton"
                                            },
                                            "collections": {}
                                        },
                                        {
                                            "$sys": {
                                                "guid": "cad7c8cd-4973-46a4-8e43-beaa161ed763",
                                                "typeGuid": api.classGuids.Button
                                            },
                                            "fields": {
                                                "Name": "NextButton",
                                                "Top": 350,
                                                "Left": 66,
                                                "Caption": "NEXT",
                                                "OnClick": " { $authorEdit.clickNext(); }",
                                                "Enabled": true,
                                                "ResElemName": "NextButton"
                                            },
                                            "collections": {}
                                        },
                                        {
                                            "$sys": {
                                                "guid": "7e842339-e7d1-4081-ab02-87e838546022",
                                                "typeGuid": api.classGuids.Button
                                            },
                                            "fields": {
                                                "Name": "PrevButton",
                                                "Top": 350,
                                                "Left": 10,
                                                "Caption": "PREV",
                                                "OnClick": " { $authorEdit.clickPrev(); }",
                                                "Enabled": true,
                                                "ResElemName": "PrevButton"
                                            },
                                            "collections": {}
                                        },
                                        {
                                            "$sys": {
                                                "guid": "41d36d45-302a-425d-9216-53b87dcbe88c",
                                                "typeGuid": api.classGuids.Button
                                            },
                                            "fields": {
                                                "Name": "SaveButton",
                                                "Top": 380,
                                                "Left": 10,
                                                "Caption": "SAVE",
                                                "OnClick": " { $authorEdit.clickSave(); }",
                                                "Enabled": false,
                                                "ResElemName": "SaveButton"
                                            },
                                            "collections": {}
                                        },
                                        {
                                            "$sys": {
                                                "guid": "bc316acb-9e6b-46b9-aae0-8f70d7c6398b",
                                                "typeGuid": api.classGuids.Button
                                            },
                                            "fields": {
                                                "Name": "CancelButton",
                                                "Top": 380,
                                                "Left": 65,
                                                "Caption": "CANCEL",
                                                "OnClick": " { $authorEdit.clickCancel(); }",
                                                "Enabled": false,
                                                "ResElemName": "CancelButton"
                                            },
                                            "collections": {}
                                        },
                                        {
                                            "$sys": {
                                                "guid": "30654f98-508c-432d-9b22-5b0a550bfabb",
                                                "typeGuid": api.classGuids.Button
                                            },
                                            "fields": {
                                                "Name": "NewButton",
                                                "Top": 410,
                                                "Left": 10,
                                                "Caption": "NEW",
                                                "OnClick": " { $authorEdit.clickNew(); }",
                                                "Enabled": true,
                                                "ResElemName": "NewButton"
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

    let userForm = await api.getResByName("UserForm", api.classGuids.ResForm);
    if (!userForm)
        userForm = api.jsonToResource(require('./userInfoForm'));

    let datamodel = await api.getResByName("DMAuthor", api.classGuids.DataModel);
    let treeAuthor;
    if (!datamodel)
        treeAuthor = api.schema.addDataModel("DMAuthor", AUTHOR_DM_GUID)
            .addDbTreeModel("AuthorTree", { resName: "Author" }, AUTHOR_TREE_GUID)
            .addDataSource({
                guid: AUTHOR_LNG_SRC_GUID,
                model: { resName: "AuthorLng" },
                field: {
                    resName: "AuthorLng",
                    elemName: "AuthorId",
                }
            })
    else
        treeAuthor = datamodel.getTreeRoot("AuthorTree");
    let srcAuthorLng = treeAuthor.getDataSource("AuthorLng");

    let form = await api.getResByName("AuthorForm", api.classGuids.ResForm);
    if (!form) {
        form = createAuthorForm(api);
    }

    let dsAuthor = form.getDB().getObjByRoot(form.getRoot(), DS_AUTHOR_GUID);
    let dsAuthorLng = form.getDB().getObjByRoot(form.getRoot(), DS_AUTHOR_LNG_GUID);
    dsAuthor.objectTree(treeAuthor);
    dsAuthorLng.objectTree(srcAuthorLng);
};
