'use strict';
/*jshint camelcase: false */
/*jshint unused:false*/
/*jshint undef:false*/
describe('Directive: searchbox', function () {

  // load the directive's module
  beforeEach(module('ngramApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('test', inject(function ($compile) {
    element = angular.element('<searchbox></searchbox>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('');
  }));
});
