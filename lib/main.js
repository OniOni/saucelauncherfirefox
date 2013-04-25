Object.prototype.sub = function () {
    var sub = {};

    for (var i= 0; i < arguments.length; i++) {
	sub[arguments[i]] = this[arguments[i]];
    }

    return sub;
};

var data = require("sdk/self").data,
    Request = require("sdk/request").Request,
    passwd = require("sdk/passwords"),
    tabs = require("sdk/tabs");

var sauceURL = "https://saucelabs.com";

var openPrefs = function() {
    tabs.open(data.url('sauceprefs.html'));
};

var createSession = function(user, session) {
    var baseURL = sauceURL+"/scout/launch/"+user.username;
    var pString = "?os="+session.os+"&browser="+session.browser+"&version="+session.version+"&url="+session.destURL+"&auth_username="+
	    user.username+"&auth_access_key="+user.accessKey;
    var params = encodeURI(pString);
    var url = baseURL+params;

    var req = Request ({
	url: url,
	content: "All your base are belong to us.",
	onComplete: function (response) {
	    if (!response.json)
		return;

	    if (response.json.result == false) {
		tabs.open("http://www.saucelabs.com/pricing");
	    } else {
		var mydest = sauceURL+"/scout/live/"+response.json.task+"?auth_username="+user.username+"&auth_access_key="+user.accessKey;
		tabs.open({url: mydest, inBackground:true});
	    }
	}
    }).post();
};

var panel = require("sdk/panel").Panel({
    width: 612,
    height: 540,
    contentURL: data.url('saucelauncher.html'),
    contentScriptFile: [data.url('jquery-2.0.0.min.js'),
			data.url('utils.js'),
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

panel.port.on('create_session', function (args) {
    if (!args.sub) args.sub = Object.prototype.sub;

    var conf = args.sub('browser', 'os', 'version');
    conf.destURL = tabs.activeTab.url;
    createSession(args.sub('username', 'accessKey'), conf);
});

panel.port.on('open_prefs', function () {
    openPrefs();
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
			data.url('sauceoptions.js'),
			data.url('bootleg.js')],
    onAttach: function(worker) {
	console.log('Attach !!');
	worker.port.on('check', function (args) {
	    console.log('Received request ' + args.username);

	    var req = Request({
		url: 'http://saucelabs.com/rest/v1/can_run_job',
		content: JSON.stringify(args),
		onComplete: function (response) {
		    console.log(response.text);

		    if (response.json.result) {
			worker.port.emit('can_run_job');
		    } else {
			worker.port.emit('can_not_run_job', response.json.msg);
		    }
		}
	    }).post();

	});

	worker.port.on('create_account', function (payObj) {
	    var url = sauceURL+"/rest/v1/users";
	    console.log('Creating account');

	    var req = Request({
		url: url,
		content: JSON.stringify(payObj),
		onComplete: function (response) {
		    console.log('response.text');

		    if (response.json) {
			var key = response.json.access_key;
			var name = response.json.id;

			worker.port.emit('account_created', {name: name, key: key});
		    } else {
			worker.port.emit('account_error');
		    }
		}
	    }).post();
	});
    }
});

console.log("Do all the stuff !");
