# bower-sinopia-resolver

A [custom Bower resolver](http://bower.io/docs/pluggable-resolvers/) supporting installation of [scoped npm packages](https://docs.npmjs.com/misc/scope)
from a [sinopia server](https://github.com/rlidwka/sinopia)

npm packages for installation via bower are expected to contain a bower.json file.

## Installation

    npm install -g bower-sinopia-resolver

## Client Configuration

### Global .bowerrc

Create or edit a `.bowerrc` file in your home director (~/.bowerrc).

Add bower-sinopia-resolver to a resolvers section

```Javascript
  "resolvers": [
    "bower-sinopia-resolver"
  ]
```

Add a bower-sinopia-resolver configuration

```Javascript
  "bower-sinopia-resolver": {
    "scopes": {
      
      // scope would be @myco
      "myco": { 
        //uri of your sinopia server 
        "server": "https://sinopia.myco.com",
        
        //optional - allows strict ssl support for self-signed or private certificates
        "cafile": "/path/to/certificate.pem"
      }
    }
  }
```

## Usage

Once configured, your bower.json files may reference packages using [npm scope syntax](https://docs.npmjs.com/misc/scope):

```JavaScript
  "dependencies": {
    "@myco/package-name": "1.0.0"
  }
```

Even though referenced with the scope, pacakages will install without the @myco scope prefixed name.

## Notes

Authentication is not currently supported - packages are downloaded anonymously.

## History

This packaged was based off of [bower-art-resolver](https://github.com/JFrogDev/bower-art-resolver)

## License

Copyright 2015 [Jack Henry & Associates Inc](https://www.jackhenry.com/).

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0).

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
