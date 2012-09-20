# YUI Config Collector

The purpose of this script is to collect module settings of customized YUI module files.
By doing this, we don't have to maintain a centralized module dependencies config.

## Installation

````script
git clone git://github.com/josephj/ycc.git
cd ycc
git submodule init
git submodule update
cd node_modules
npm install .
````


## Usage 

````shell
./ycc <Custom YUI module folder> --ignore "jquery,flowplayer" --output "module.json"
````



