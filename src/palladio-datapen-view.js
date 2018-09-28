angular.module('palladioDataPenComponent', ['palladio', 'palladio.services'])
	.run(['componentService', function(componentService) {
		var compileStringFunction = function (newScope, options) {

			newScope.showSettings = newScope.showSettings === undefined ? false : newScope.showSettings;
			newScope.tableHeight = newScope.height === undefined ? undefined : newScope.height;
			newScope.functions = {};

			var compileString = '<div class="with-settings" data-palladio-datapen-view-with-settings ';
			compileString += 'show-settings="showSettings" ';
			compileString += 'functions=functions ';

			if(newScope.dimensions) {
				compileString += 'config-dimensions="dimensions" ';
			}

			if(newScope.row) {
				compileString += 'config-row="row" ';
			}

			compileString += '></div>';

			return compileString;
		};

		componentService.register('datapen', compileStringFunction);
	}])
	// Palladio Data Pen View
	.directive('palladioDataPenView', ['palladioService', function (palladioService) {

		return {

			scope : {
				dimensions : '=',
				dimension : '=',
				maxDisplay : '=',
				xfilter: '=',
				exportFunc: '='
			},

			link: function (scope, element, attrs) {

				function refresh() {

					element.height(scope.calcHeight);
					$(element[0].nextElementSibling).height(scope.calcHeight);
				}

				$(document).ready(refresh);
				$(window).resize(refresh);

				var uniqueDimension;
				var sortFunc = function() { };

				var sorting, desc = true;

				var search = '';

				var dims = [];

				function update() {
					if (!scope.dimension || !uniqueDimension || dims.length === 0) return;

					if (!sorting) sorting = dims[0].key;

				}
			}
		};
	}])

	// Palladio Data Pen View with Settings
	.directive('palladioDataPenViewWithSettings', ['palladioService', 'dataService', function (palladioService, dataService) {

		return {
			scope: {
				showSettings: '=',
				functions: '='
			},
			template : require('./template.html'),
			link: {

				pre: function (scope, element, attrs) {

					// In the pre-linking function we can use scope.data, scope.metadata, and
					// scope.xfilter to populate any additional scope values required by the
					// template.

					var deregister = [];

					scope.metadata = dataService.getDataSync().metadata;
					scope.xfilter = dataService.getDataSync().xfilter;

					scope.uniqueToggleId = "datapenView" + Math.floor(Math.random() * 10000);
					scope.uniqueModalId = scope.uniqueToggleId + "modal";

					// State save/load.

					scope.setInternalState = function (state) {
						// Placeholder
						return state;
					};

					// Add internal state to the state.
					scope.readInternalState = function (state) {
						// Placeholder
						return state;
					};

					scope.exportCsv = function () {};

					if(scope.functions) {
						scope.functions['getSettings'] = function() {
							return element.find('.datapen-settings')[0];
						}
						scope.functions['importState'] = function(state) {
							importState(state)
							return true
						}
						scope.functions['exportState'] = function() {
							return exportState()
						}
					}

					function importState(state) {
						scope.$apply(function (s) {
							scope.setInternalState(state);
						});
					}

					function exportState() {
						return scope.readInternalState({});
					}

					deregister.push(palladioService.registerStateFunctions(scope.uniqueToggleId, 'datapenView', exportState, importState));

					scope.$on('$destroy', function () {
						deregister.forEach(function (f) { f(); });
					});

				},

				post: function(scope, element, attrs) {

					element.find('.settings-toggle').click(function() {
						element.find('.settings').toggleClass('closed');
					});


				}
			}
		};
	}]);
