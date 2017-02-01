/**
 * @namespace  app
 * @type {Object}
 * @description Angular app. Binds events to Angular DOM elements. 
 */
var app = angular.module('app', [])

app.service('Data', ['$rootScope', '$http', function($rootScope, $http) {
    /**
     * @namespace  service
     * @memberOf  app
     * @description Angular service. Provides global data binding tools.
     * @property mapDatasource {@link globalDatasourceMap}
     * @property {Array} dataQueue Collection of unique URL strings. Used to prevent duplicate data loading from the same URL.
     * @property {Function} addToDataQueue {@link app.addToDataQueue}
     * @property {Function} retrieveData {@link app.retrieveData}
     * @property {Function} getData {@link app.getData}
     * @property {Function} getAllData {@link app.getAllData}
     */
    var service = {
            mapDatasource: globalDatasourceMap,
            dataQueue: [],
            //TODO: Test this
            /**
             * @memberOf app
             * @function addToDataQueue
             * @description Adds URL string to {@link dataQueue} if it doesn't already exist.
             * @param {String} s URL string.
             */
            addToDataQueue: function(s) {
                if (this.dataQueue.indexOf(s) < 0) {
                    this.dataQueue.push(s);
                }
            },
            /**
             * @memberOf app
             * @function retrieveData
             * @description Performs an $http GET request on the specified URL, then calls the callback function upon completion.
             * @param {String} datasource URL string.
             * @param {String} cb Callback function after the $http request has completed.
             */
            retrieveData: function(datasource, cb) {
                if (datasource) {
                    if (verbose) console.log("Getting " + datasource + " data...");
                    
                    //TODO: Test. Tried this on an API, denied access due to the wrong headers. But both ends managed to connect. 
                    var url = "";
                    if (!this.mapDatasource[datasource]) {
                        url = datasource;
                    } else {
                        url = this.mapDatasource[datasource].url;
                    }
                    $http({
                        method: 'GET',
                        url: url
                    }).then(function(res) {
                        if (verbose) console.log("Got " + datasource + " data!");
                        cb(res);
                    });
                }
            },
            /**
             * @memberOf app
             * @function getData
             * @description Calls {@link app.retrieveData} with specified callback that broadcasts to all visualization listeners that the data has been retrieved.
             * @param {String} datasource URL string.
             * @returns {Object} Data of GET request.
             */
            getData: function(datasource) {
                var that = this;
                this.retrieveData(datasource, function(res) {
                    that.mapDatasource[datasource].data = res.data;
                    if (verbose) console.log("Broadcasting: " + datasource + " updated.");
                    $rootScope.$broadcast(datasource + '.update', res.data);
                    that.mapDatasource[datasource].dataPrepared = true;
                    return res.data;
                })
            },
            /**
             * @memberOf app
             * @function getAllData
             * @description Calls {@link app.getData} on all queued sources.
             */
            getAllData: function() {
                var that = this;
                this.dataQueue.forEach(function(d, i) {
                    that.getData(d);
                })
            }
        }
        //Maps attributes before processing. 
    Object.keys(service.mapDatasource).map(function(d, i) {
        service.mapDatasource[d].data = {};
        service.mapDatasource[d].dataPrepared = false;
    });
    return service;
}])


app.directive('ngCnsVisual', ['$rootScope', 'Data', function($rootScope, Data) {
    /**
     * @namespace  ngCnsVisual
     * @memberOf  app
     * @description Angular directive. Binds visualization functions and data to Angular DOM elements.
     * @property {Function} link {@link app.link}
     */
    return {
        restrict: "A",
        controller: ['$scope', '$http', function($scope, $http) {}],
        /**
         * @memberOf app
         * @object link
         * @description Functions ran before and after DOM binding. 
         * @property {Object} pre {@link app.pre}
         * @property {Object} post {@link app.post}
         */
        link: {
            /**
             * @memberOf app
             * @function pre
             * @description Creates new visualization class, stores visualization class and instance, and prepares instance. Adds Angular listeners and broadcasters. If the visualization has the (ng-component-for) attribute, it will listen for the parent to be ready. If the visualization is a parent, it will broadcast it's completion to all component listeners.
             * @param {Object} scope Angular scope.
             * @param {Object} elem Angular DOM element.
             * @param {Object} attrs Angular attributes from DOM.
             * @param {Object} ctrl Angular controller.
             */
            pre: function(scope, elem, attrs, ctrl) {
                if (verbose) console.log("Visual pre link for: " + attrs.ngIdentifier);
                Data.addToDataQueue(attrs.ngDataField);
                visualizations[attrs.ngIdentifier] = new VisualizationClass();
                visualizations[attrs.ngIdentifier].Vis = visualizationFunctions[attrs.ngVisType];

                visualizations[attrs.ngIdentifier].SetAngularElement(elem);
                visualizations[attrs.ngIdentifier].SetAngularOpts(attrs);
                if (attrs.ngComponentFor) {
                    scope.$watch(attrs.ngComponentFor + '.created', function() {
                        visualizations[attrs.ngComponentFor].Children.push(attrs.ngIdentifier);
                    })
                } else {
                    $rootScope.$broadcast(attrs.ngIdentifier + '.created')
                }
            },
            /**
             * @memberOf app
             * @function post
             * @description Adds listeners to elements with the (ng-data-field) attribute. If the data changes, trigger an update to each visualization instance listener.
             * @param {Object} scope Angular scope.
             * @param {Object} elem Angular DOM element.
             * @param {Object} attrs Angular attributes from DOM.
             * @param {Object} ctrl Angular controller.
             */
            post: function(scope, elem, attrs, ctrl) {
                if (verbose) console.log("Visual post link for: " + attrs.ngIdentifier);
                if (attrs.ngDataField) {
                    scope.$on(attrs.ngDataField + '.update', function(oldVal, newVal) {
                        if (verbose) console.log("Updating: " + attrs.ngIdentifier);
                        //TODO: Method to update args a little better 
                        if (newVal !== oldVal) {
                            //TODO: This may need to be updated if we want to periodically push new data WITHOUT redrawing the whole visualization
                            visualizations[attrs.ngIdentifier].SetAngularData(newVal);
                            visualizations[attrs.ngIdentifier].Update();
                        }
                    })
                }
            }
        }
    }
}])

app.directive('ngCnsVisRunner', ['$rootScope', '$timeout', 'Data', function($rootScope, $timeout, Data) {
    /**
     * @namespace  ngCnsVisRunner
     * @memberOf  app
     * @description Angular directive. Surrounds all {@link app.ngCnsVisual} to allow for synchronous operations. Gets data after all visualizations have been bound. 
     */
    return {
        restrict: "A",
        controller: ['$scope', '$http', function($scope, $http) {
            $scope.attrs = {};
            $scope.postHelper = function() {
                $timeout(function() {
                    Data.getAllData();
                }, 1);
            }
        }],
        link: {
            pre: function(scope, elem, attrs, ctrl) {
                if (verbose) console.log("Runner pre link");
            },
            post: function(scope, elem, attrs, ctrl) {
                if (verbose) console.log("Runner post link");
                scope.postHelper();
            }
        }
    }
}]);
angular.element(document).ready(function() {
    angular.bootstrap(document, ['app']);
})