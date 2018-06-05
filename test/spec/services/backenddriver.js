'use strict';

describe('Service: BackendDriver', function () {

  // load the service's module
  beforeEach(module('ngramApp'));

  // instantiate service
  var BackendDriver;
  beforeEach(inject(function (_BackendDriver_) {
    BackendDriver = _BackendDriver_;
  }));

  it('should exists', function () {
    expect(!!BackendDriver).toBe(true);
  });

  //var _backendDriver = BackendDriver.ngram();
  it('ngram driver', function () {
    expect(!!BackendDriver).toBe(true);
  });
});
