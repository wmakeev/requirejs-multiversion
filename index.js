var semver = require('./vendor/semver');

var protocol = window.location.protocol;
var repositoryCache;

var getRepository = function (config, requirejs, cb) {
  // return cached repository if present
  if (repositoryCache) return cb(null, repositoryCache);

  var repo = config.repository;
  // Repository specified as url
  if (typeof repo === 'string') {
    var url;
    if (repo.slice(0, 4) === 'http') {
      url = repo;
      if (protocol === 'https:' && repo.slice(0, 5) === 'http:') {
        return cb(new Error('Use https protocol in repository url [' + repo + ']'));
      }
    } else if (repo.slice(0, 2) === '//') {
      url = protocol + repo;
    } else {
      return cb(new Error('Unknown format of multiversion repository url'))
    }
    requirejs([url], function (repository) {
      repositoryCache = repository;
      cb(null, repository);
    })
  }
};

module.exports = {

  load: function (name, parentRequire, onload, config) {
    var multiverConfig = config.config.multiver;

    getRepository(multiverConfig, parentRequire, function (err, repository) {
      if (err) return onload.error(err);

      var resolver = multiverConfig.resolver;
      var isFallBack = !!multiverConfig.fallBackToParentRequire;

      if (name.indexOf('@') === -1) {
        name = name + '@default';
      }

      // need to resolve the dependency
      var nameVer = name.split('@');

      // i.e. module@^1.0.0
      if (nameVer.length !== 2) {
        return onload.error(new Error('Module query must contain only one "@" symbol'));
      }

      var moduleName = nameVer[0],
          versionRange = nameVer[1];

      if (repository[moduleName]) {
        var versions = Object.keys(repository[moduleName]);
        if (!versions.length) {
          return onload.error(new Error('No versions specified for module [' + moduleName + ']'))
        }

        var version;
        if (versionRange === 'default') {
          // TODO already loaded or max version
          version = versions.sort()[versions.length - 1]
        }
        else if (!semver.validRange(versionRange)) {
          return onload.error(new Error('Invalid semver version range [' + versionRange + ']'))
        }
        else {
          version = semver.maxSatisfying(versions, versionRange);
        }

        if (version) {
          var path = repository[moduleName][version];
          parentRequire([protocol + path], onload, onload.error);
        }
        else if (resolver) {
          resolver.resolve(moduleName, version, function (err, name) {
            if (err) return onload.error(err);
            parentRequire([name], onload, onload.error);
          })
        }
        else if (isFallBack) {
          parentRequire([moduleName], onload, onload.error);
        }
        else {
          onload.error(new Error('Can\'t resolve module [' + name + ']'));
        }
      }
      else {
        // TODO find module
        onload.error(new Error('Can\'t find applicable module for [' + moduleName + '] in repository'));
      }
    });

  }

};