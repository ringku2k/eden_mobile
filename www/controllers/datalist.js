/**
 * Sahana Eden Mobile - Data List Controller
 *
 * Copyright (c) 2016-2017: Sahana Software Foundation
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

// ============================================================================
/**
 * EMDataList - Data List Controller
 *
 * @class EMDataList
 * @memberof EdenMobile
 */
EdenMobile.controller("EMDataList", [
    '$scope', '$state', '$stateParams', 'emDialogs', 'emResources',
    function($scope, $state, $stateParams, emDialogs, emResources) {

        // State parameters
        var resourceName = $stateParams.resourceName,
            recordID = $stateParams.recordID,
            componentName = $stateParams.componentName;

        $scope.resourceName = resourceName;
        $scope.recordID = recordID;
        $scope.componentName = componentName;

        /**
         * Refresh the scope with resource and record data
         *
         * @param {Resource} resource - the resource
         * @param {string} query - SQL where expression to select the
         *                         records, e.g. a subset linked to a
         *                         particular master record (components)
         */
        var updateDataList = function(resource, query) {

            // Get strings
            var strings = resource.strings,
                listTitle = resource.name;
            if (strings) {
                listTitle = strings.namePlural || strings.name || listTitle;
            }
            $scope.listTitle = listTitle;

            // Get card config, determine fields to extract
            var cardConfig = resource.card,
                fields;
            if (cardConfig) {
                fields = cardConfig.fields;
            }
            $scope.cardConfig = cardConfig;

            // Apply fallbacks
            if (!fields) {
                // Get all fields
                fields = [];
                for (var fieldName in resource.fields) {
                    fields.push(fieldName);
                }
            }

            // Make sure 'id' field is loaded (required by directive)
            if (fields.indexOf('id') == -1) {
                fields.push('id');
            }

            // Select all existing records
            resource.select(fields, query, function(records, result) {
                $scope.records = records;
                $scope.$apply();
            });
        };

        /**
         * Open list of records
         */
        var openDataList = function() {

            // Open the master resource
            emResources.open(resourceName).then(function(resource) {

                if (!resource) {
                    // Undefined resource
                    emDialogs.error('Error', 'Undefined Resource',
                        function() {
                            $state.go('data.resources',
                                {location: 'replace', reload: true});
                        });
                    $scope.records = [];
                } else {

                    // Link parameters for CRUD actions
                    var linkParams = {
                            resourceName: resourceName,
                            recordID: recordID
                        };

                    if (!!componentName) {

                        // Component action links
                        linkParams.componentName = componentName;
                        $scope.parentView = $state.href('data.update', linkParams);
                        $scope.createView = $state.href('data.componentCreate', linkParams);

                        // Open component
                        resource.openComponent(recordID, componentName,
                            function(component, query) {
                                updateDataList(component, query);
                            },
                            function(error) {
                                emDialogs.error('Error', error, function() {
                                    $state.go('data.list',
                                        {resourceName: resourceName},
                                        {location: 'replace', reload: true});
                                });
                            });
                    } else {

                        // Master action links
                        $scope.parentView = $state.href('data.resources');
                        $scope.createView = $state.href('data.create', linkParams);

                        // Open master
                        updateDataList(resource);
                    }
                }
            });
        };

        $scope.$on('$ionicView.enter', openDataList);
    }
]);

// END ========================================================================
