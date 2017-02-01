//Head loads scripts in parellel, but executes them in order.

/** @global 
    @description Visualization instance configurations. Each instanced visualization function with a dataprep function [defined in /visuals/** /(ng-identifier).js] is stored here. This function is run before the visualization instance has been run. Allows data to be pre-formatted to fit a visualization's requirements. */
var dataprep = {};
/** @global 
    @description Visualization functions collection. Each visualization type [ng-vis-type] is stored once and used by each instance of the visualizaiton.*/
var visualizationFunctions = {};
/** @global 
    @description Instanced visualization collection. Each instanced visualization is stored by it's Angular identifier defined in the DOM [ng-Identifier]. */
var visualizations = {};
/** @global 
    @description Visualization instance events. Each instanced visualization with an events function [defined in /visuals/** /(ng-identifier)-config.js] is stored here. This function is called after the visualization instance has been run. Provides opportunities to add customization to the underlying visualization. */
var events = {};
/** @global 
    @description Visualization instance configurations. Each instanced visualization with an events function [defined in /visuals/** /(ng-identifier).js] is stored here. This function maps data properties to visualization attributes. */
var configs = {};
var meta = {};

/** @global 
    @description If set to true, 
    will provide details on visualization binding. */
var verbose = false;

(function() {
    'use strict';
    head.js(
        { 'font-awesome.min.css': 'https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css' },
        { 'jquery-1.11.2.min.js': 'lib/jquery-1.11.2.min.js' }, 
        { 'd3.v3.min.js': 'lib/d3.v3.min.js' }, 
        { 'Utilities.js': 'src/Utilities.js' }, 
        { 'Visualization.js': 'src/Visualization.js' }, 
        { 'DatasourceMap.js': 'src/DatasourceMap.js' }, 
        { 'style.css': 'css/style.css' }, 
        { 'TemporalBarChart-configs.js': 'visuals/TemporalBarChart-configs.js' }, 
        { 'style.css': 'css/style.css' }, 
        { 'immutable.js': 'lib/immutable.js' }, 
        { 'TemporalBarChart.js': 'visuals/TemporalBarChart/TemporalBarChart.js' }, 
        { 'angular.js':'lib/angular.js'},
        { 'angular-route.js': 'lib/angular-route.js' });

}).call(this);

head.ready('angular-route.js', 
    function() {
    angular.element(document).ready(function() {
        head.js('src/App.js');
    });
});
