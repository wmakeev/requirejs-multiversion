export default function lookupModule(parentRequire, repository, moduleName, moduleVersionRange) {
  return new Promise((resolve, reject) => {
    if (!repository || !repository.modules) {
      return reject(new Error('Repository should have modules section'));
    }
    if (repository.modules[moduleName]) {
      let versions = Object.keys(repository.modules[moduleName]);
      if (!versions.length) {
        return reject(new Error('No versions specified for module [' + moduleName + ']'))
      }
      parentRequire(['semver'], semver => {
        if (!semver.validRange(moduleVersionRange)) {
          return reject(new Error(`Invalid version range [${moduleVersionRange}]`))
        }
        let version = semver.maxSatisfying(versions, moduleVersionRange);
        if (version) {
          let path = repository.modules[moduleName][version];
          resolve(path);
        }
      })
    }
    else {
      reject(new Error('Can\'t find applicable module for [' + moduleName + '] in repository'));
    }
  });
}