var semver = require('semver');

module.exports = function multidep () {
    return {
        load: function (name, parentRequire, onload, config) {
            var dependencies    = config.dependencies;
            var resolver        = config.resolver;
            var isFallBack      = !!config.fallBackToParentRequire;

            if (name.indexOf('@') === -1) {
                name = name + '@default';
            }

            // need to resolve the dependency
            var nameVer = name.split('@');

            // i.e. module@^1.0.0
            if (nameVer.length !== 2) {
                return onload.error(new Error('Module query must contain only one "@" symbol'));
            }

            var moduleName    = nameVer[0],
                versionRange  = nameVer[1];

            if (!semver.validRange(versionRange)) {
                onload.error(new Error('Invalid semver version range [' + versionRange + ']'))
            }

            if (dependencies[moduleName]) {
                var versions = Object.keys(dependencies[moduleName]);
                var version = semver.maxSatisfying(versions, versionRange);
                if (version) {
                    var libUrl = dependencies[moduleName][version];
                    parentRequire(libUrl, onload, onload.error);
                }
                else if (resolver) {
                    resolver.resolve(moduleName, version, function (err, url) {
                        if (err) return onload.error(err);
                        parentRequire(url, onload, onload.error);
                    })
                }
                else if (isFallBack) {
                    parentRequire(moduleName, onload, onload.error);
                }
                else {
                    onload.error(new Error('Can\'t resolve module [' + moduleName + ']'));
                }
            }
            else {
                // TODO find module
                onload.error(new Error('Can\'t find applicable module for [' + name + '] in repository'));
            }
        }
    }
};