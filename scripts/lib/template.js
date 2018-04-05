define (
    ['lodash'],
    function(_) {

        class CTemplate {
            parseTemplate(template) {
                var i, name, names, regEx, templateBodies, templateBody, templateName, templates;

                regEx = /\<\!--\s+?template:\s+?(.+)\s?--\>/gi;
                templates = {};
                templateBodies = _.compact((function() {
                    var _i, _len, _ref, _results;

                    _ref = template.split(/\<\!--\s+?template:\s+?.+\s?--\>/gi);
                    _results = [];
                    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                        templateBody = _ref[i];
                        _results.push($.trim(templateBody));
                    }
                    return _results;
                })());
                names = (function() {
                    var _i, _len, _ref, _results;

                    _ref = template.match(regEx);
                    _results = [];
                    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                        templateName = _ref[i];
                        name = templateName.replace(/(<\!--\s+?template:\s+?)|(\s+?-->)/gi, '');
                        if (templates[name] != null) {
                            console.error('Templates collision: two equal names');
                        }
                        _results.push(templates[name] = templateBodies[i] || '');
                    }
                    return _results;
                })();
                return templates;
            }

            template(tmpl, params) {
                return _.template(tmpl, params);
            }

        };

        return new CTemplate();
    }
);