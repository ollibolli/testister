Testister
==

Testister is a command line test tool for testing AMD javascript modules in headless and web browsers. 
Testisters goal is to create unit test for javascript that can be added to a continious delivery process
But also is straight forward and easy to use in the development phase. 

Testister is driven by Nodejs and uses PhantomJs as a headless browser. It uses RequireJS as module loader, Mocka 
as javascript test runner, Chai as it´s assert library and Sinon as it´s mock library. It also uses Express to expose
test resources to browser.

Basic consepts
---
The basic concept of the tool is to point out a the main directory containing the AMD modules, and a test directory
containing test or spec written in AMD styling. And then run testister from command line. 

When running testister.
---
1. It collects all testsuit files.
2. Generate a corresponding html to be able to run the test in a browser
3. Starts a http server on localhost and expose the test html files. (the files becomes urls)
4. Open in sequence each generated test url in a headless browser (PhantomJs). 
5. Log the process of the testsuits in console or/and log-files
7. Closes the http server
6. Returns exit code 0 if all test passed (above 0 if the fails)
7. Leave a test and a error log

Testister in http server mode
---
Testister can also be run in server mode. This start the http server and expose the
testsuits url. (http://localhost:<port>/test/). This make the test able to be run in 
a browser of your choce (FF,safari,ie...) and able to test browser specific funktionallity.


Installation
---
Testister is a npm package. To get the package just type 
    
    $ npm install testister
    
or 

    $ npm install -g testister 

for global access

or ad it as dependency in your package.json 


Runing testister
---
Testister is run from command prompt.

    $ node_modules/.bin/testister

or if you installed it global 

    $ testister 
    
the command have to be run from project root folder.

Configuration
---
Testister can be cofigurated by command line arguments 

    Usage: testister [options] [path(testfile or dirctory)] []....
    
    Options:
    
    -h, --help                       output usage information
    -V, --version                    output the version number
    -t, --test-dir <test directory>  Specify the path to the test directory (default src/test)
    -m, --main-dir <main directory>  Specify the path to the main directory (default src/main)
    -R, --reporter <name>            Specify the reporter to use (default spec) available tap,spec,json,list,dot
    -e, --extension <extension>      Files with this extention will be included  (default spec.js)
    -p, --port <port>                The port to start local http server (default 3330)
    -l, --log-dir <logg-dir>         Specify the log output files directory(default target) 
    -x, --template <template>        Specify the path to a template file (default node_modules/testister/template.html
    -s, --scaffold                   Creates a html test files for every test module and exits
    -S, --server                     Start a http server and expose tests. http://localhost:<port>/test/ (no test is performed
    -c, --config-file <configfile>   Url to a configfile in json format (default ./testister.conf.json)
    -C, --clean <directory>          Remove testmodules scaffolded html files in directory
    -T, --timeout                    Set tests default timeout in ms


You can also create a testister.config.json in your root folder of your project. It must be formated in json.
This is an example of a testister.conf.json

    {
      "extension" : "spec.js",
      "mainDir" : "main" ,
      "testDir" : "test" ,
      "reporter" : "tap" ,
      "logDir" : "target"
    }

_Notis that --main-dir,--test-dir is transformed to lowerCamelCase_  
