/**
 * @class  VisualizationClass
 * @type {Object}
 * @description Provides tools to visualization plugins. 
 */
/**
 * @namespace  CreateBaseConfig
 * @type {Object}
 * @description Predefined options for visualization alignment and creation. Contains basic custom layouts and easy configurations.
 */

var VisualizationClass = function() {
    /**
     * @memberOf  VisualizationClass
     * @type Object
     * @description Reference of instanced visualization configuration from {@link configs}.
     */
    this.config = null;
    /**
     * @memberOf  VisualizationClass
     * @type Function
     * @description Reference of visualization function from {@link visualizationFunctions}.
     */
    this.VisFunc = null;
    this.Vis = null;
    /**
     * @memberOf  VisualizationClass
     * @type Object
     * @description Placeholder for SVG canvas and exposed visualization attributes.
     */
    this.SVG = null;
    /**
     * @memberOf  VisualizationClass
     * @type Array
     * @description Exposed D3 domain/range scales.
     */
    this.Scales = {};
    /**
     * @memberOf  VisualizationClass
     * @type Array
     * @description Reference to each visualization that stated this visualization as a parent. 
     */
    this.Children = [];
    /**
     * @memberOf VisualizationClass
     * @type Function
     * @description Reference to events function for this visualization instance from {@link events}. 
     */
    this.events = null;
    /**
     * @memberOf VisualizationClass
     * @type Boolean
     * @description Set to false after the visualization has been ran the first time. 
     */
    this.isFirstRun = true;
    /**
     * @memberOf VisualizationClass
     * @type String
     * @description States which data attribute is used. Prevents needing to define it in each visualization. Ex: nodes, records.
     */
    this.PrimaryDataAttr = "";
    /**
     * @memberOf VisualizationClass
     * @type Object
     * @description Data object accessed directly from the visualization. Runs after the visualization instance is bound and has run any applicable {@link dataprep} function.
     */
    this.filteredData = {
            nodes: {
                data: {}
            },
            edges: {
                data: {}
            },
            records: {
                data: {}
            }
        },
        /**
         * @memberOf VisualizationClass
         * @type Object
         * @description Arguments passed by the {@link ngCnsVisual} binding. 
         */
        this.AngularArgs = {
            element: "",
            data: {
                nodes: {
                    data: {}
                },
                edges: {
                    data: {}
                },
                records: {
                    data: {}
                }
            },
            opts: ""
        },
        /**
         * @memberOf VisualizationClass
         * @type Boolean
         * @description Takes the global {@link verbose} value. Each visualization instance has the choice to toggle this for more focused debugging.
         */
        this.Verbose = verbose || false,


        /**
         * @memberOf VisualizationClass
         * @type Function
         * @property this {@link CreateBaseConfig}
         */
        this.CreateBaseConfig = function() {
            var out = {};
            out.margins = {};
            out.dims = {};
            out.meta = configs[this.AngularArgs.opts.ngIdentifier];
            out.margins.top = parseInt(this.AngularArgs.opts.ngMarginTop) || 0;
            out.margins.right = parseInt(this.AngularArgs.opts.ngMarginRight) || 0;
            out.margins.bottom = parseInt(this.AngularArgs.opts.ngMarginBottom) || 0;
            out.margins.left = parseInt(this.AngularArgs.opts.ngMarginLeft) || 0;
            out.dims.width = (this.AngularArgs.opts.ngWidth || $(this.AngularArgs.element[0]).width());
            out.dims.height = (this.AngularArgs.opts.ngHeight || $(this.AngularArgs.element[0]).height());
            out.dims.fixedWidth = out.dims.width - out.margins.left - out.margins.right;
            out.dims.fixedHeight = out.dims.height - out.margins.top - out.margins.bottom;
            var that = this;

            /**
             * @memberOf CreateBaseConfig
             * @type Function
             * @property selector Element to append canvas to.
             * @return Object D3 canvas.
             * @description  Creates simple D3 canvas with base configuration.
             */
            out.easySVG = function(selector, args) {
                    args = args || { responsive: true };
                    that.SVGBase = d3.select(selector)
                        .append("svg")
                        .classed("canvas " + that.AngularArgs.opts.ngIdentifier, true)
                        .attr("background", "white")

                    if (args.responsive) {
                        that.SVGBase
                            .attr("preserveAspectRatio", "xMinYMin meet")
                            .attr("viewBox", "0 0 " + this.dims.fixedWidth + " " + this.dims.fixedHeight)

                        .classed("svg-container", true) //container class to make it responsive
                            .classed("svg-content-responsive", true)
                    } else {
                        that.SVGBase
                            .attr("width", args.width || out.dims.width)
                            .attr("height", args.height || out.dims.height)

                    }

                    if (args.noG) {
                        return that.SVGBase
                    }
                    return that.SVGBase.append("g")
                }
                /**
                 * @memberOf CreateBaseConfig
                 * @type Function
                 * @property network Visualization function of a member of {@link visualizations}.
                 * @return Object D3 canvas.
                 * @description  Creates a graph layout with options. 
                 */
            out.easyGraphLayout = function(network, opts) {
                    network.SVG.graphOpts = {};
                    var defaultMargin = 20;
                    network.SVG.graphOpts.margins = {
                        top: network.config.margins.top || defaultMargin,
                        left: network.config.margins.left || defaultMargin,
                        right: network.config.margins.right || defaultMargin,
                        bottom: network.config.margins.bottom || defaultMargin
                    }
                    network.SVG.graphOpts.wOffset = network.SVG.graphOpts.margins.left;
                    network.SVG.graphOpts.hOffset = network.SVG.graphOpts.margins.top;
                    network.SVG.graphOpts.width = network.config.dims.fixedWidth - network.SVG.graphOpts.margins.left - network.SVG.graphOpts.margins.right;
                    network.SVG.graphOpts.height = network.config.dims.fixedHeight - network.SVG.graphOpts.margins.top - network.SVG.graphOpts.margins.bottom;
                }
                /**
                 * @memberOf CreateBaseConfig
                 * @type Function
                 * @property network Visualization function of a member of {@link visualizations}.
                 * @property {Object} opts Options for graph creation. 
                 * @description  Creates a graph with options. Offsets graph area to allow for axis margins. Adds axis labels. 
                 */
            out.easyGraph = function(network, opts) {
                network.Scales.x.range([0, network.SVG.graphOpts.width - 20]);
                // network.Scales.y.range([network.SVG.graphOpts.height, 0]);
                network.Scales.x1.range([network.SVG.graphOpts.wOffset, network.SVG.graphOpts.width + network.SVG.graphOpts.wOffset])
                network.Scales.y1.range([network.SVG.graphOpts.height + network.SVG.graphOpts.hOffset, network.SVG.graphOpts.hOffset])
                network.Scales.xAxis = d3.svg.axis()
                    .scale(opts.x.scale1)
                    .orient(opts.x.orient || "bottom")
                    // .tickSize(5);
                network.Scales.yAxis = d3.svg.axis()
                    .scale(opts.y.scale1)
                    .tickSize(network.SVG.graphOpts.width)
                    .orient(opts.y.orient || "left");

                if (!network.SVG.graphG) {
                    network.SVG.graphG = network.SVG.append("g")
                        .attr("class", "graphG")
                        .attr("transform", function(d, i) {
                            return "translate(" + network.SVG.graphOpts.wOffset + "," + network.SVG.graphOpts.hOffset + ")"
                        });

                }

                // if (network.Scales.x.domain()[0] == network.Scales.x.domain()[1]) {
                //  if (network.Scales.x.domain()[1] >= 0) {
                //      network.Scales.x.domain([0, network.Scales.x.domain()[1]])
                //  }
                // }

                var xAxisTranslate = network.SVG.graphOpts.height;
                var yAxisTranslate = network.SVG.graphOpts.width;
                var xLabelTranslate = network.SVG.graphOpts.height + network.SVG.graphOpts.hOffset;
                var yLabelTranslate = -20;
                var tLabelTranslate = -40;

                if (opts.x.orient == "top") {
                    xAxisTranslate = 0;
                    xLabelTranslate = -20;
                }
                if (opts.y.orient == "right") {
                    yAxisTranslate = 0;
                    yLabelTranslate = network.SVG.graphOpts.width + network.SVG.graphOpts.wOffset;
                }
                if (opts.t.orient == "bottom") tLabelTranslate = network.SVG.graphOpts.height + 40;

                if (network.SVG.xAxisG) network.SVG.xAxisG.remove()
                if (network.SVG.yAxisG) network.SVG.yAxisG.remove()
                if (network.SVG.xAxisLabel) network.SVG.xAxisLabel.remove()
                if (network.SVG.yAxisLabel) network.SVG.yAxisLabel.remove()
                if (network.SVG.title) network.SVG.title.remove()

                if (!network.SVG.graphArea) {
                    network.SVG.graphArea = network.SVG.graphG.append("g")
                        .attr("class", "graphArea")
                        .attr("transform", "translate(0," + (yAxisTranslate * 2 + 1) + ")")
                        // network.SVG.graphArea.append("rect")
                        //  .attr("width", 20)
                        //  .attr("height", 20)
                }

                network.SVG.xAxisG = network.SVG.graphG.append("g")
                    .attr("class", "x wvf-axis")
                    .attr("transform", "translate(0," + xAxisTranslate + ")")
                    .call(network.Scales.xAxis);

                network.SVG.yAxisG = network.SVG.graphG.append("g")
                    .attr("class", "y wvf-axis")
                    .attr("transform", "translate(" + yAxisTranslate + ",0)")
                    .call(network.Scales.yAxis);

                network.SVG.graphG.xAxisLabel = network.SVG.graphG
                    .append("text")
                    .attr("class", "l2")
                    .attr("transform", "translate(" + (network.SVG.graphOpts.width / 2) + "," + xLabelTranslate + ")")
                    .attr("text-anchor", "middle")
                    .text(opts.x.label);

                network.SVG.graphG.yAxisLabel = network.SVG.graphG
                    .append("text")
                    .attr("class", "l2")
                    .attr("transform", "translate(" + yLabelTranslate + "," + (network.SVG.graphOpts.height / 2) + ")rotate(270)")
                    .attr("text-anchor", "middle")
                    .text(opts.y.label)

                network.SVG.graphG.title = network.SVG.graphG
                    .append("text")
                    // .attr("class", "l")
                    .attr("transform", "translate(" + (network.SVG.graphOpts.width / 2) + "," + tLabelTranslate + ")")
                    .attr("text-anchor", "middle")
                    .text(opts.t.label)
            }

            /**
             * @memberOf CreateBaseConfig
             * @type Function
             * @property container Element to append Leaflet map to.
             * @property options Leaflet options for map creation.
             * @property {String} tileURL URL for Leaflet map tiles. 
             * @description  Creates a Leaflet map.
             */
            out.easyLeafletMap = function(container, options, tileURL) {
                var obj = new Object();
                obj.map = L.map(container, options);
                var map = obj.map;
                // map._initPathRoot();
                var leaflet = obj;
                obj.TILE_URL = tileURL + "/{z}/{x}/{y}.png";
                obj.addTileLayer = function() {
                    L.tileLayer(obj.TILE_URL, {
                        tms: false
                    }).addTo(map);
                    return obj;
                };
                obj.addInteractionLayer = function() {
                    geojson = L.geoJson(statesData, {
                        onEachFeature: onEachFeature,
                        style: {
                            weight: 0,
                            opacity: 0,
                            fillOpacity: 0
                        }
                    }).addTo(map);

                    function zoomToFeature(e) {
                        var mapZoom = map.getZoom();
                        if (mapZoom <= 8 && mapZoom >= 5) {
                            map.fitBounds(e.target.getBounds());
                        } else {
                            map.zoomIn();
                        }
                    }

                    function onEachFeature(feature, layer) {
                        layer.on({
                            dblclick: zoomToFeature
                        });
                    }
                    return obj;
                };
                obj.disableInteractions = function() {
                    map.dragging.disable();
                    map.keyboard.disable();
                    obj.disableZoom();
                    return obj;
                };
                obj.disableZoom = function() {
                    map.touchZoom.disable();
                    map.doubleClickZoom.disable();
                    map.scrollWheelZoom.disable();
                    map.boxZoom.disable();
                    return obj;
                };
                obj.enableInteractions = function() {
                    map.dragging.enable();
                    map.keyboard.enable();
                    obj.enableZoom();
                    return obj;
                };
                obj.enableZoom = function() {
                    map.touchZoom.enable();
                    map.doubleClickZoom.enable();
                    map.scrollWheelZoom.enable();
                    map.boxZoom.enable();
                    return obj;
                };
                obj.initPopup = function() {
                    //TODO: Implement obj
                };
                obj.removePopup = function() {
                    map.closePopup();
                }
                obj.latLngDebug = function() {
                    map.on('click', function(e) {
                        locationClicked = [e.latlng.lat, e.latlng.lng];
                        console.log(locationClicked);
                    });
                    return obj;
                };
                obj.marker = L.Icon.extend({
                    options: {
                        iconUrl: 'images/up_arrow.svg',
                        iconSize: [0, 0],
                        shadowSize: [0, 0],
                        iconAnchor: [0, 0],
                        shadowAnchor: [0, 0],
                        popupAnchor: [0, 0]
                    }
                });
                return obj;
            }
            return out;
        },

        /**
         * @memberOf CreateBaseConfig
         * @type Function
         * @returns Instance of {@link VisualizationClass}
         * @description  Removes all elements from the base selector.
         */
        this.ClearVis = function(empty) {
            that = this;
            if (empty) $(this.AngularArgs.element).empty()

            try {
                //TODO: Need to remove Leaflet somehow. 
                that.SVG.selectAll("*").remove();
            } catch (exception) {
            	// console.log(exception)
            }
            return this;
        },

        /**
         * @memberOf CreateBaseConfig
         * @type Function
         * @returns Instance of {@link VisualizationClass}
         * @description  Runs {@link this.ClearVis} and {@link this.RunVis}. 
         */
        this.ResetVis = function(args) {
            var args = args || {};
            this.ClearVis(args.empty);
            this.prepareData();
            this.RunVis();
            return this;
        },
        /**
         * @memberOf CreateBaseConfig
         * @type Function
         * @returns Instance of {@link VisualizationClass}
         * @description Runs the {@link events} for an instanced visualization if it exists. 
         */
        this.RunEvents = function() {
            if (events[this.AngularArgs.opts.ngIdentifier])
                events[this.AngularArgs.opts.ngIdentifier](visualizations[this.AngularArgs.opts.ngIdentifier]);
            var indent = "     ";
            if (this.AngularArgs.opts.ngComponentFor != null) indent += indent;
            if (this.Verbose) console.log(new Date().toLocaleTimeString() + ":" + indent + "Events bound: " + this.AngularArgs.opts.ngIdentifier);
            return this;
        },
        /**
         * @memberOf CreateBaseConfig
         * @type Function
         * @returns Instance of {@link VisualizationClass}
         * @description Runs all component visualizations. 
         */
        this.RunChildVisualizations = function() {
            var that = this;
            this.Children.forEach(function(v) {
                visualizations[v].Update();
                visualizations[v].PrimaryDataAttr = that.PrimaryDataAttr;
            })
        },
        //Simple duplicate request removal. Kills the timeout and reruns it within 10ms. Will this work with huge datasets?
        this.RunVisQueue;
    this.DataRange = [];
    /**
     * @memberOf CreateBaseConfig
     * @type Function
     * @returns Instance of {@link VisualizationClass}
     * @description Runs the {@link dataprep} for an instanced visualization if it exists. Otherwise, copies the Angular provided data object to {@link filteredData}
     */
    this.prepareData = function() {
        if (this.AngularArgs.opts.ngComponentFor) {
            this.filteredData = JSON.parse(JSON.stringify(visualizations[this.AngularArgs.opts.ngComponentFor].filteredData));
        } else {
            this.filteredData = JSON.parse(JSON.stringify(this.AngularArgs.data));
        }
        if (dataprep[this.AngularArgs.opts.ngIdentifier]) {
            dataprep[this.AngularArgs.opts.ngIdentifier](visualizations[this.AngularArgs.opts.ngIdentifier]);
        }
    };
    /**
     * @memberOf CreateBaseConfig
     * @type Function
     * @property {Object} args 
     * @returns Instance of {@link VisualizationClass}
     * @description Runs the {@link visualizationFunctions} for an instanced visualization. Calls are queued and ran ever .01 seconds. Angular controllers run through at least two digest cycles per change, we only care about the last. Runs the {@link events} and fires the component visualizations if they exist.
     */
    this.RunVis = function(args) {
            var args = args || {};
            clearTimeout(this.RunVisQueue);
            var that = this;
            this.RunVisQueue = setTimeout(function() {
                that.ClearVis(args.empty);
                if (that.isFirstRun) {
                    that.prepareData();
                    that.Vis(that.AngularArgs.element, that.AngularArgs.data, that.AngularArgs.opts);
                }
                try {
                    if (!that.AngularArgs.opts.ngLazy || args.lazyRun) that.VisFunc();
                } catch (exception) {
                    if (that.Verbose) console.log("Visualization failed: " + that.AngularArgs.opts.ngIdentifier);
                    throw exception;
                }
                var indent = " ";
                if (that.AngularArgs.opts.ngComponentFor != null) indent += "     ";
                if (that.Verbose) console.log(new Date().toLocaleTimeString() + ":" + indent + "Created visualization: " + that.AngularArgs.opts.ngIdentifier);
                angular.element(document).ready(function() {
                    that.RunChildVisualizations();
                    that.RunEvents();
                });
                that.isFirstRun = false;
            }, 200);

            return that;
        },
        /**
         * @memberOf CreateBaseConfig
         * @type Function
         * @property {Object} element 
         * @property {Object} data
         * @property {Object} opts
         * @description Binds the arguments to this. Creates an immutable map of the data argument. If data is not found, create an empty data object. Sets either "nodes" or "records" for easier implementation into a visualization.
         */
        this.SetAngularArgs = function(element, data, opts) {
            this.AngularArgs.element = element;
            this.AngularArgs.data = Immutable.Map(data) || Immutable.Map({
                nodes: {
                    data: {}
                },
                edges: {
                    data: {}
                },
                records: {
                    data: {}
                }
            });
            // this.filteredData = data;
            if (data.topology == "graph") this.PrimaryDataAttr = "nodes";
            if (data.topology == "table") this.PrimaryDataAttr = "records";
            this.AngularArgs.opts = opts;
        },
        /**
         * @memberOf CreateBaseConfig
         * @type Function
         * @property {Object} element
         * @description Binds the Angular element to this. 
         */
        this.SetAngularElement = function(element) {
            this.AngularArgs.element = element;
        },
        /**
         * @memberOf CreateBaseConfig
         * @type Function
         * @property {Object} element
         * @description Creates an immutable map of the data argument. If data is not found, create an empty data object. Sets either "nodes" or "records" for easier implementation into a visualization.
         */
        this.SetAngularData = function(data) {
            this.AngularArgs.data = Immutable.Map(data) || Immutable.Map({
                nodes: {
                    data: {},
                    schema: {}
                },
                edges: {
                    data: {},
                    schema: {}
                },
                records: {
                    data: {},
                    schema: {}
                }
            });
            // this.filteredData = data;
            if (data.topology == "graph") this.PrimaryDataAttr = "nodes";
            if (data.topology == "table") this.PrimaryDataAttr = "records";
        },
        /**
         * @memberOf CreateBaseConfig
         * @type Function
         * @property {Object} opts Contains the properties bound to the DOM element (ex:"ng-identifier")
         * @description Binds the Angular opts to this. 
         */
        this.SetAngularOpts = function(opts) {
            this.AngularArgs.opts = opts;
        },
        /**
         * @memberOf CreateBaseConfig
         * @type Function
         * @description Default update behavior for a visualization. 
         */
        this.Update = function() {
            this.RunVis();
        }
};