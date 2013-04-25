var data = require("sdk/self").data,
    Request = require("sdk/request").Request,
    passwd = require("sdk/passwords"),
    tabs = require("sdk/tabs");

var panel = require("sdk/panel").Panel({
    width: 612,
    height: 540,
    contentURL: data.url('saucelauncher.html'),
    contentScriptFile: [data.url('utils.js'),
			data.url('jquery-2.0.0.min.js'),
			data.url('newscoutchooser.js'),
			data.url('run.js')]
});

panel.port.on('ajax', function (args) {
    console.log('Fetching ' + args.url);

    var req = Request({
	url: args.url,
	onComplete: function (response) {
	    if(response.json) {
		console.log('success');
		panel.port.emit('success', response.json);
	    } else {
		console.log('error');
		panel.port.emit('error');
	    }
	}
    });

    switch(args.type) {
    default:
    case 'GET':
	req.get();
	break;
    case 'PUT':
	req.put();
	break;
    case 'POST':
	req.post();
	break;
    }   
});

panel.port.on('signin', function () {
    console.log('Getting credentials');

    passwd.search({
	realm: 'saucelabs',
	onComplete: function (credentials) {
	    if (credentials.size != 1) {
		console.log('No credentials !');
		tabs.open(data.url('sauceprefs.html'));
	    } else {
		tabs.open(tabs.activeTab.url);
	    }
	}
    });
});

var widget = require("sdk/widget").Widget({
    id: "mozilla-link",
    label: "Mozilla website",
    contentURL: "http://www.mozilla.org/favicon.ico",
    panel: panel
});


require('sdk/page-mod').PageMod({
    include: 'resource://jid1-2puula5e1diwww-at-jetpack/saucelauncherfirefox/data/sauceprefs.html',
    contentScriptFile: [data.url('jquery-2.0.0.min.js'),
			data.url('utils.js')],
    onAttach: function(worker) {
	console.log('Attach !!');
	worker.port.on('check', function (args) {
	    console.log('Received request ' + args.username);

	    var req = Request({
		url: 'http://saucelabs.com/rest/v1/can_run_job',
		content: JSON.stringify(args),
		onComplete: function (response) {
		    console.log(response.text);
		}
	    }).post();

	});
    }
});

console.log("Do all the stuff !");

