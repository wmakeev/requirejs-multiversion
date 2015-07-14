requirejs-multiversion
======================

##example

1. Publish dependencies repository to any public url

	```js
	define({
    "modules": {
      "lodash": {
          "2.4.1": "//cdn.jsdelivr.net/lodash/2.4.1/lodash.min.js",
          "3.0.8": "//cdn.jsdelivr.net/lodash/3.8.0/lodash.min.js"
      },
      "moment": {
          "2.10.3": "//cdn.jsdelivr.net/momentjs/2.10.3/moment.min.js"
      }
    }
    });
	```

2. Init **requirejs-multiversion** plugin with repository url

	```js
	requirejs.config({
	  paths: {
	    semver: 'https://path/to/semver',
	    multiver: 'https://path.to/requirejs-multiversion'
	  },
	  config: {
	    multiver: {
	      repositoryUrl: 'https://path.to/repository.js'
	    }
	  }
	});
	```

3. Define module

  ```js
  define('my-module', ['multiver!lodash@^2.0.0', 'multiver!lodash@~3.0.7', 'multiver!moment@2.10.3'],
    function (lodash_1, lodash_2, moment) {
        return [lodash_1.VERSION, lodash_2.VERSION, moment.version]
  })
  ```

4. Require module

  ```js
  requirejs(['my-module'], function(myModule) {
    console.log(myModule); // → ["2.4.1", "3.0.8", "2.10.3"]
  }
  ```