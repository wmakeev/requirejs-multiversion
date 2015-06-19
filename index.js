var discover = require('locator/discover');
var semver = require('semver');

module.exports = function multidep () {
    return {
        load: function (name, parentRequire, onload, config) {
            var dependencies = config.dependencies;
            if (name.indexOf('@') !== -1) {
                // need to resolve the dependency
                var nameVer = name.split('@');
                // i.e. module@^1.0.0
                if (nameVer.length === 2) {
                    var moduleName    = nameVer[0],
                        versionRange  = nameVer[1];

                    if (semver.validRange(versionRange)) {
                        if (dependencies[moduleName]) {
                            var versions = Object.keys(dependencies[moduleName]);
                            var version = semver.maxSatisfying(versions, versionRange);
                            if (version) {
                                var libUrl = dependencies[moduleName][version];
                                parentRequire([libUrl], onload, onload.error);
                            } else {
                                discover('module', function (ev) {
                                    return ev.name === moduleName ? semver.satisfies(ev.version, versionRange) : false;
                                }).then(function (ev) {
                                    onload(ev.module);
                                }).catch(onload.error);
                            }
                        } else {
                            // TODO find module
                            onload.error(new Error('Can\'t find applicable module for [' + name + '] in repository'));
                        }
                    }

                } else {
                    onload.error(new Error('Module query must contain only one "@" symbol'));
                }
            }
        }
    }
};