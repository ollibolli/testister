Testister
==

Testister is a command line test tool for testing AMD javascript modules in headless and web browsers. 
Testisters goal is to create unit test for javascript that can be added to a continious delivery process
But also is straight forward and easy to use in the development phase. 

Testister is driven by Nodejs and uses PhantomJs as a headless browser. It uses RequireJS as module loader, Mocka 
as javascript test runner, Chai as it´s assert library and Sinon as it´s mock library. It also uses Express to expose
test resources to browser.

Basic consepts
==
The basic concept of the tool is to point out a the main directory containing the AMD modules, and a test directory
containing test or spec written in AMD styling. And then run testister from command line. 

When running testister.
==
1. It collects all testsuit files.
2. Generate a corresponding html to be able to run the test in a browser
3. Starts a http server on localhost and expose the test html files. (the files becomes urls)
4. Open in sequence each generated test url in a headless browser (PhantomJs). 
5. Log the process of the testsuits in console or/and log-files
7. Closes the http server
6. Returns exit code 0 if all test passed (above 0 if the fails)
7. Leave a test and a error log

Testister in http server mode
=====
Testister can also be run in server mode. This start the http server and expose the
testsuits url. (http://localhost:<port>/test/). This make the test able to be run in 
a browser of your choce (FF,safari,ie...) and able to test browser specific funktionallity.


Instalation
=========
