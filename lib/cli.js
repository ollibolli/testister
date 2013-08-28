var program = require('commander'),
    chokidar = require('chokidar'),
    FileSystemService = require('../lib/FileSystemService'),
    TestRunner = require('../lib/TestRunner');
    cwd = process.cwd();
    exports = {};

function Cli(){
//Default values
    var options = {
        extension : 'spec.js',
        mainDir : 'src/main' ,
        testDir : 'src/test' ,
        logDir : 'target/testister',
        reporter : 'spec' ,
        httpPort: '3330' ,
        serverOnly : false,
        scaffold : false,
        template : 'node_modules/testister/template.html',
        timeout: 200,
        script: fs.realpathSync(__dirname + '/../lib/testister.js'),
        argv: null,
        clean: null
    }

    try {
        var program = Cli.parseArgsv(program);
        var config = FileSystemService.getJsonFromFile(program.configfile);
        //merge config to options override defaults
        for (var method in config){
            options[method] = config[method];
        }

        //merge program to options override config
        options.extension = program.extension || options.extension;
        options.mainDir = validateMainDir(program.mainDir || options.mainDir);
        options.testDir = validateTestDir(program.testDir || options.testDir);
        options.reporter = program.reporter || options.reporter;
        options.httpPort = validatePort(program.port || options.httpPort);
        options.serverOnly = program.server || options.serverOnly;
        options.logDir = validateLogDir(program.logdir || options.logDir);
        options.scaffold = program.scaffold || options.scaffold;
        options.timeout = program.timeout || options.timeout;
        options.template = validateTemplatefile(program.template || options.template);
        options.args = program.args;
        options.clean = program.clean;

        //remove trailing slashes if they exists
        options.mainDir = options.mainDir.replace(/\/$/, "");
        options.testDir = options.testDir.replace(/\/$/, "");

        // start doing the actions
        var fileService = new FileSystemService(options);

        if (options.clean){
            console.log('Clean scaffolded files');
            fileService.clean(options.clean);
            if (! options.scaffold && ! options.serverOnly){
                process.exit(0);
            }

        }

        if (options.scaffold){
            console.log('Search and scaffold test html files');
            fileService.scaffoldHtml(options,true);
            if (! options.serverOnly){
                process.exit(0);
            }
        }

        console.log('Starting local Http server on Port :'+ options.httpPort);
        var app = startHttpServer(options.httpPort, options.testDir ,options.mainDir);

        if (! options.serverOnly){
            console.log('Running tests');
            var testSuiteFiles
            if (options.args && options.args.length > 0 ){
                testSuiteFiles = fileService.scaffoldCustomHtml(options.args);
            } else {
                testSuiteFiles = fileService.scaffoldHtml();
            }
            var testSuiteUrls = fileService.filePathToUrl(testSuiteFiles, 'http://localhost:'+ options.httpPort, options);

            var testRunner = new TestRunner(testSuiteUrls,options);

            testRunner.run();
        }
    }catch(e){
        console.log('Error accourd exit testister');
        throw e;//console.log(e);
        process.exit(1);
    }
}

Cli.parseArgsv = function(){
    var version = FileSystemService.getJsonFromFile(__dirname + '/../package.json').version;
    program
        .version(version)
        .usage('[options] [path(testfile or dirctory)] []....')
        .option('-R, --reporter <name>', 'Specify the reporter to use (default spec [tap,spec,list]) ')
        .option('-s, --scaffold ','Creates a html test files for every test module and exits')
        .option('-t, --testDir <test directory>','Specify the path to the test directory (default src/test)')
        .option('-m, --mainDir <main directory>','Specify the path to the main directory (default src/main)')
        .option('-e, --extension <extension>', 'Specify the test file extention (default spec.js)')
        .option('-p, --port <port>', 'The port to start local http server (default 3456)')
        .option('-S, --server ', 'Start a http server (no test is performed')
        .option('-l, --logdir <logg-dir>', 'Specify the log output files (default targer)')
        .option('-x, --template <template>','Specify the path to a template file (default node_modules/testister/template.html')
        .option('-c, --configfile <configfile>','Url to a configfile in json format',validateConfigfile,'testister.conf.json')
        .option('-C, --clean <directory>','Remove testmodules scaffolded html files in directory')
        .option('-T, --timeout', 'Set tests default timeout');

    program.on('--help', function(){
        console.log('This package is a comandline and browser based test-framework for testing amd modules using the RequireJs library.');
        console.log('');
        console.log('The the testframework is based on RequireJs as Amd loader, Mocha as test library, Chai as assertion library and Sinon as mock library ');
        console.log('Testister is');
        console.log('');
    });

    program.parse(process.argv);
    return program;
}

module.exports = Cli;

function startHttpServer(port, testDir, mainDir){
    var express = require('express');
    var app = express();
    app
        .use('/test',express.static(path.normalize(process.cwd() + '/'+ testDir)))
        .use(express.static(path.normalize(process.cwd() + '/'+ mainDir)))
        .use(express.static(path.normalize(__dirname + "/../testlib")))
        .use(express.directory(path.normalize(process.cwd() + '/' + mainDir)))
        .use('/test',express.directory(path.normalize(process.cwd() + '/' + testDir)))
        .use(express.directory(path.normalize(__dirname + "/../testlib")))

    app.listen(port);
    return app;
}

function validatePort(val){
    if (isNaN(parseInt(val))) {
        console.log('-p, --port have to be a number. --help for options help');
        process.exit(2);
    };
    return parseInt(val);
};

function validateConfigfile(val){
    return validateFile(val,'-c, --configfile :Could not find file.'+ val);
};
function validateTemplatefile(val){
    return validateFile(val,'-x, --template :Could not find file. '+val);
};
function validateMainDir(val){
    return validateFile(val,'-m, --maindir :Could not find directory. '+val);
};

function validateTestDir(val){
    return validateFile(val,'-t, --testdir :Could not find directory. '+val);
};

function validateLogDir(val){
    return val ;//parseFile(val,'-l, --logdir :Could not find directory. '+val);
};

function validateFile(url, msg){
    if (! FileSystemService.exsists(url)){
        console.log(msg);
        process.exit(2);
    }
    return url;
};

function consoleLogWrapper(){
    var orgConsoleLog = console.log;
    console.log = function(){
        var msg = '[';
        for(var i in arguments){
            if (i != 0) msg += ',';
            msg += arg.toString();
        }
        msg += ']';
        orgConsoleLog(msg);
    }
};
