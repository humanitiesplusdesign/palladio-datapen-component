!function(t){var n={};function e(i){if(n[i])return n[i].exports;var o=n[i]={i:i,l:!1,exports:{}};return t[i].call(o.exports,o,o.exports,e),o.l=!0,o.exports}e.m=t,e.c=n,e.d=function(t,n,i){e.o(t,n)||Object.defineProperty(t,n,{enumerable:!0,get:i})},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},e.t=function(t,n){if(1&n&&(t=e(t)),8&n)return t;if(4&n&&"object"==typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(e.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&n&&"string"!=typeof t)for(var o in t)e.d(i,o,function(n){return t[n]}.bind(null,o));return i},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},e.p="",e(e.s=0)}([function(t,n,e){"use strict";e.r(n);e(1)},function(t,n,e){angular.module("palladioDataPenComponent",["palladio","palladio.services"]).run(["componentService",function(t){t.register("datapen",function(t,n){t.showSettings=void 0!==t.showSettings&&t.showSettings,t.tableHeight=void 0===t.height?void 0:t.height,t.functions={};var e='<div class="with-settings" data-palladio-datapen-view-with-settings ';return e+='show-settings="showSettings" ',e+="functions=functions ",t.dimensions&&(e+='config-dimensions="dimensions" '),t.row&&(e+='config-row="row" '),e+="></div>"})}]).directive("palladioDataPenView",["palladioService",function(t){return{scope:{dimensions:"=",dimension:"=",maxDisplay:"=",xfilter:"=",exportFunc:"="},link:function(t,n,e){function i(){n.height(t.calcHeight),$(n[0].nextElementSibling).height(t.calcHeight)}$(document).ready(i),$(window).resize(i)}}}]).directive("palladioDataPenViewWithSettings",["palladioService","dataService",function(t,n){return{scope:{showSettings:"=",functions:"="},template:e(2),link:{pre:function(e,i,o){var a=[];function l(t){e.$apply(function(n){e.setInternalState(t)})}function s(){return e.readInternalState({})}e.metadata=n.getDataSync().metadata,e.xfilter=n.getDataSync().xfilter,e.uniqueToggleId="datapenView"+Math.floor(1e4*Math.random()),e.uniqueModalId=e.uniqueToggleId+"modal",e.setInternalState=function(t){return t},e.readInternalState=function(t){return t},e.exportCsv=function(){},e.functions&&(e.functions.getSettings=function(){return i.find(".datapen-settings")[0]},e.functions.importState=function(t){return l(t),!0},e.functions.exportState=function(){return s()}),a.push(t.registerStateFunctions(e.uniqueToggleId,"datapenView",s,l)),e.$on("$destroy",function(){a.forEach(function(t){t()})})},post:function(t,n,e){n.find(".settings-toggle").click(function(){n.find(".settings").toggleClass("closed")})}}}}])},function(t,n){t.exports='<div class="">\n\n\t\t<div\n\t\t\tdata-palladio-datapen-view\n      max-display="maxDisplay"\n\t\t\txfilter="xfilter">\n\t\t</div>\n\n</div>\n\n\x3c!-- Settings --\x3e\n<div class="row datapen-settings" data-ng-show="showSettings || showSettings === undefined">\n\n    <div class="settings col-lg-4 col-lg-offset-8 col-md-6 col-md-offset-6">\n      <div class="panel panel-default">\n\n        <a class="settings-toggle" data-toggle="tooltip" data-original-title="Settings" data-placement="bottom">\n          <i class="fa fa-bars"></i>\n        </a>\n\n        <div class="panel-body">\n\n          <div class="row">\n            <div class="col-lg-12">\n              <label>Settings</label>\n            </div>\n          </div>\n\n          <div class="row margin-top">\n            <div class="col-lg-4 col-md-4 col-sm-4 col-xs-4 text-right">\n              <label class="inline">Row dimension</label>\n            </div>\n            <div class="col-lg-8 col-md-8 col-sm-8 col-xs-8 col-condensed">\n              <span class="btn btn-default" ng-click="showCountModal()">\n                  {{countDim.description || "Choose"}}\n                  <span class="caret"></span>\n              </span>\n\t\t\t\t\t\t\t<p class="help-block">At least one row per value in this dimension. Multiple values will be displayed as lists in each cell.</p>\n\n            </div>\n          </div>\n\n          <div class="row margin-top">\n            <div class="col-lg-4 col-md-4 col-sm-4 col-xs-4 text-right">\n              <label class="inline">Dimensions</label>\n            </div>\n            <div class="col-lg-8 col-md-8 col-sm-8 col-xs-8 col-condensed">\n\t\t\t\t\t\t\t<span class="btn btn-default" ng-click="showModal()">\n                  {{fieldDescriptions() || "Choose"}}\n                  <span class="caret"></span>\n              </span>\n            </div>\n          </div>\n\n\t\t\t\t\t<div class="row margin-top">\n            <div class="col-lg-4 col-md-4 col-sm-4 col-xs-4 text-right">\n            </div>\n            <div class="col-lg-8 col-md-8 col-sm-8 col-xs-8 col-condensed">\n\n              <a class="pull-right"\n\t\t\t\t\t\t\ttooltip="Download data (csv)"\n\t\t\t\t\t\t\ttooltip-animation="false"\n\t\t\t\t\t\t\ttooltip-append-to-body="true"\n\t\t\t\t\t\t\tng-click="exportCsv()">\n\t\t\t\t\t\t\t\t<i class="fa fa-download margin-right"></i>Download\n\t\t\t\t\t\t\t</a>\n\n            </div>\n          </div>\n\n\n        </div>\n      </div>\n    </div>\n\n</div>\n\n<div id="{{uniqueModalId}}">\n</div>\n'}]);