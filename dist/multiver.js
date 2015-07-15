(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.multiver = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = getModuleRequest;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _getRepository = require('./get-repository');

var _getRepository2 = _interopRequireDefault(_getRepository);

var _lookupModule = require('./lookup-module');

var _lookupModule2 = _interopRequireDefault(_lookupModule);

var _resolveModule = require('./resolve-module');

var _resolveModule2 = _interopRequireDefault(_resolveModule);

// https://regex101.com/r/wM7aS1/2
var moduleNameRegex = /^((?:@[\w\-]+\/)?[\w\-]+)(?:@([^\n]+))?$/;
var protocol = window.location.protocol;

function getModuleRequest(name, parentRequire, config) {
  var multiverConfig, repository, match, moduleName, moduleVersionRange, path, requirePath, p;
  return regeneratorRuntime.async(function getModuleRequest$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        multiverConfig = config.config.multiver;
        repository = undefined;

        if (!multiverConfig.repository) {
          context$1$0.next = 12;
          break;
        }

        context$1$0.prev = 3;
        context$1$0.next = 6;
        return regeneratorRuntime.awrap((0, _getRepository2['default'])(parentRequire, multiverConfig));

      case 6:
        repository = context$1$0.sent;
        context$1$0.next = 12;
        break;

      case 9:
        context$1$0.prev = 9;
        context$1$0.t0 = context$1$0['catch'](3);

        console.debug('Can\'t load repository -', context$1$0.t0);

      case 12:
        if (!(name === '#repository')) {
          context$1$0.next = 14;
          break;
        }

        return context$1$0.abrupt('return', onload(repository));

      case 14:
        match = name.match(moduleNameRegex);
        moduleName = match[1];
        moduleVersionRange = match[2];
        path = undefined;
        context$1$0.prev = 18;
        context$1$0.next = 21;
        return regeneratorRuntime.awrap((0, _lookupModule2['default'])(parentRequire, repository, moduleName, moduleVersionRange));

      case 21:
        path = context$1$0.sent;

        path = protocol + path;
        context$1$0.next = 28;
        break;

      case 25:
        context$1$0.prev = 25;
        context$1$0.t1 = context$1$0['catch'](18);

        console.debug('Can\'t find module ' + name + ' in repository -', context$1$0.t1);

      case 28:
        if (path) {
          context$1$0.next = 38;
          break;
        }

        context$1$0.prev = 29;
        context$1$0.next = 32;
        return regeneratorRuntime.awrap((0, _resolveModule2['default'])(multiverConfig.resolver, moduleName, moduleVersionRange));

      case 32:
        path = context$1$0.sent;
        context$1$0.next = 38;
        break;

      case 35:
        context$1$0.prev = 35;
        context$1$0.t2 = context$1$0['catch'](29);

        console.debug('Can\'t resolve module ' + name + ' with resolver -', context$1$0.t2);

      case 38:

        if (!path && multiverConfig.fallBackToParentRequire) {
          path = name;
        }

        if (!path) {
          context$1$0.next = 54;
          break;
        }

        if (!(path.slice(-3) === '.js')) {
          context$1$0.next = 51;
          break;
        }

        requirePath = path.slice(0, -3);
        context$1$0.t3 = regeneratorRuntime.keys(config.paths);

      case 43:
        if ((context$1$0.t4 = context$1$0.t3()).done) {
          context$1$0.next = 51;
          break;
        }

        p = context$1$0.t4.value;

        if (!config.paths.hasOwnProperty(p)) {
          context$1$0.next = 49;
          break;
        }

        if (!(requirePath === config.paths[p])) {
          context$1$0.next = 49;
          break;
        }

        path = p;
        return context$1$0.abrupt('break', 51);

      case 49:
        context$1$0.next = 43;
        break;

      case 51:
        return context$1$0.abrupt('return', path);

      case 54:
        throw new Error('Can\'t resolve require request for module [' + name + ']');

      case 55:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[3, 9], [18, 25], [29, 35]]);
}

module.exports = exports['default'];

// multiver!#repository -> repository obj

// try to find module in repository

// try to resolve module with resolver

// check if module for path just defined in requirejs

},{"./get-repository":2,"./lookup-module":4,"./resolve-module":5}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = getRepository;
var protocol = window.location.protocol;
var repositoryCache = new WeakMap();

function getRepository(parentRequire, multiverConfig) {
  return new Promise(function (resolve, reject) {
    var cachedRepo = repositoryCache.get(parentRequire);
    // return cached repository if present
    if (cachedRepo) {
      return resolve(cachedRepo);
    }
    var repo = multiverConfig.repository;
    // Repository specified as url
    var url = undefined;
    if (typeof repo === 'string') {
      if (repo.slice(0, 4) === 'http') {
        url = repo;
        if (protocol === 'https:' && repo.slice(0, 5) === 'http:') {
          return reject(new Error('Use https protocol in repository url [' + repo + ']'));
        }
      } else if (repo.slice(0, 2) === '//') {
        url = protocol + repo;
      } else {
        return reject(new Error('Unknown format of multiversion repository: ' + repo));
      }
      parentRequire([url], function (repository) {
        repositoryCache.set(parentRequire, repository);
        resolve(repository);
      });
    }
  });
}

module.exports = exports['default'];

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _getModuleRequest = require('./get-module-request');

var _getModuleRequest2 = _interopRequireDefault(_getModuleRequest);

exports['default'] = {
  load: function load(name, parentRequire, onload, config) {
    (0, _getModuleRequest2['default'])(name, parentRequire, config).then(function (request) {
      parentRequire([request], onload, onload.error);
    })['catch'](onload.error);
  }
};
module.exports = exports['default'];

},{"./get-module-request":1}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = lookupModule;

function lookupModule(parentRequire, repository, moduleName, moduleVersionRange) {
  return new Promise(function (resolve, reject) {
    if (!repository || !repository.modules) {
      return reject(new Error('Repository should have modules section'));
    }
    if (repository.modules[moduleName]) {
      var _ret = (function () {
        var versions = Object.keys(repository.modules[moduleName]);
        if (!versions.length) {
          return {
            v: reject(new Error('No versions specified for module [' + moduleName + ']'))
          };
        }
        parentRequire(['semver'], function (semver) {
          if (!semver.validRange(moduleVersionRange)) {
            return reject(new Error('Invalid version range [' + moduleVersionRange + ']'));
          }
          var version = semver.maxSatisfying(versions, moduleVersionRange);
          if (version) {
            var path = repository.modules[moduleName][version];
            resolve(path);
          }
        });
      })();

      if (typeof _ret === 'object') return _ret.v;
    } else {
      reject(new Error('Can\'t find applicable module for [' + moduleName + '] in repository'));
    }
  });
}

module.exports = exports['default'];

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = resolveModule;

function resolveModule(resolver, moduleName, moduleVersionRange) {
  return new Promise(function (resolve, reject) {
    if (resolver) {
      resolver.resolve(moduleName, moduleVersionRange, function (err, name) {
        if (err) {
          return reject(err);
        } else {
          resolve(name);
        }
      });
    } else {
      resolve();
    }
  });
}

module.exports = exports["default"];

},{}]},{},[3])(3)
});