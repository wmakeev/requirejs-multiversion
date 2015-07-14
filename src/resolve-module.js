export function resolveModule(resolver, moduleName, moduleVersionRange) {
  return new Promise(function (resolve, reject) {
    if (resolver) {
      resolver.resolve(moduleName, moduleVersionRange, function (err, name) {
        if (err) {
          return reject(err);
        } else {
          resolve(name)
        }
      })
    } else {
      resolve();
    }
  })
}