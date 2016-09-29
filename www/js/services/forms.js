/**
 * Sahana Eden Mobile - Form Builder
 *
 * Copyright (c) 2016: Sahana Software Foundation
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

"use strict";

EdenMobile.factory('$emForm', [function () {

    var createWidget = function(field, attr) {

        var fieldType = field.type,
            widgetType;

        // @todo: ability to override the widget

        switch(fieldType) {
            case 'date':
                widgetType = '<em-date-widget>';
                break;
            default:
                widgetType = '<em-text-widget>';
                break;
        }

        var widget = angular.element(widgetType);

        if (attr) {
            for (var a in attr) {
                widget.attr(a, attr[a]);
            }
        }

        return widget;
    }


    /**
     * Form API
     */
    function Form(schema, fields) {

        var self = this;
        self.schema = schema;
        self.fields = fields;

        self.render = function(scopeName) {

            if (!scopeName) {
                scopeName = 'form';
            }

            var form = angular.element('<div class="list">'),
                fields = self.fields,
                schema = self.schema;

            for (var i=0, len=fields.length; i<len; i++) {

                var fieldName = fields[i],
                    fieldParameters = schema[fieldName],
                    widget = null;

                if (fieldParameters) {
                    var fieldAttr = {
                        'label': fieldParameters.label,
                        'ng-model': scopeName + '.' + fieldName
                    };

                    widget = createWidget(fieldParameters, fieldAttr);
                }
                if (widget) {
                    form.append(widget);
                }
            }
            return form;

        }

    }

    /**
     * Expose API
     */
    var api = {

        form: function(schema, fields) {
            return new Form(schema, fields);
        },

    };
    return api;

}]);

/**
 * Directive for data form
 */
EdenMobile.directive("emDataForm", [
    '$compile', '$emdb', '$emForm',
    function($compile, $emdb, $emForm) {

        var renderForm = function($scope, elem, attr) {

            var formName = attr.formName;

            $emdb.table(formName).then(function(table) {

                var form = $emForm.form(
                    table.schema,

                    // @todo: still hardcoded,
                    //        lookup "_fields" in schema,
                    //        fall back to all readable fields in schema
                    ["first_name", "last_name", "date_of_birth"]
                );

                // Compile the form HTML against the scope,
                // then render it in place of the directive
                var compiled = $compile(form.render('form'))($scope);
                elem.replaceWith(compiled);
            });
        };

        return {
            link: renderForm
        };
    }
]);
