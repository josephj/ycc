# YUI Config Collector

The purpose of this script is to collect module settings of customized YUI module files.
By doing this, we don't have to maintain a centralized module dependencies config.


## Installation

````shell
git clone git://github.com/josephj/ycc.git
cd ycc
git submodule init
git submodule update
cd node_modules
npm install .
````


## Usage 

````shell
./ycc ~/miiicasa/static --ignore 'lib/yui'
````

## Sample Output

```js
{
    "viewer": {
        "requires": [
            "event",
            "event-resize",
            "io-base",
            "json-parse",
            "node",
            "querystring-stringify",
            "viewer-app",
            "widget"
        ]
    },
    "viewer-app": {
        "requires": [
            "app",
            "app-transition",
            "comment-info-model",
            "comment-list-model",
            "env-model",
            "file-model-list",
            "panel-view",
            "space",
            "substitute",
            "user-model"
        ]
    },
    "vlc": {
        "requires": [
            "base",
            "node",
            "substitute"
        ]
    },
    "vlc-plugin": {
        "requires": [
            "base"
        ]
    }
}
```

## Thanks

Special thanks to @panweizeng and his team members.
The original idea is coming from their sharing.

