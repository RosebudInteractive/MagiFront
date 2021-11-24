'use strict';
const { ProcessService } = require('../../../services/pm/process-api');
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 46]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("PmLsnProcess")
        .addField("TestURL", { type: "string", allowNull: true });
};

exports.scriptUpgrade = async (options) => {
    let opts = options || {};
    let id = null;

    const PROCESS_STRUCT_EXPRESSION = {
        expr: {
            model: {
                name: "PmProcessStruct",
                childs: [
                    {
                        dataObject: {
                            name: "PmElement"
                        }
                    }
                ]
            }
        }
    };

    const STRUCT_NAME = "Lesson Process Proto ver. 8.0";

    await opts.simpleEditWrapper(PROCESS_STRUCT_EXPRESSION, { field: "Name", op: "=", value: STRUCT_NAME },
        async (root_obj) => {
            let collection = root_obj.getCol("DataElements");
            if (collection.count() === 1) {
                let ps_obj = collection.get(0);
                id = ps_obj.id();
                let fields = JSON.parse(ps_obj.processFields());
                fields["TestURL"] = {
                    "caption": "Тест",
                    "type": "string"
                }
                ps_obj.processFields(JSON.stringify(fields));
                let root_elems = ps_obj.getDataRoot("PmElement");
                let ecol = root_elems.getCol("DataElements");
                let efields = {
                    Index: ecol.count() + 1,
                    Name: "Тест",
                    ViewFields: JSON.stringify([
                        "TestURL"
                    ]),
                    WriteFields: JSON.stringify({
                        "Сдать готовый тест": [
                            "TestURL"
                        ]
                    })
                };
                await root_elems.newObject({
                    fields: efields
                }, {});
            }
            else
                throw new HttpError(HttpCode.ERR_NOT_FOUND, `Описание структуры процесса "${STRUCT_NAME}" не найдено.`);
        }, {});

    if (id)
        await ProcessService().deleteStructFromCache(id);
};
