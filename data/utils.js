var go = function(os, browser, version) {
    var account = localStorage["sauceLaucherUsername"];
    var api_key = localStorage["sauceLaucherAccessKey"];

    if (account && api_key) {
	self.port.emit('create_session', {
	    os: os,
	    browser: browser,
	    version: version,
	    username: account,
	    accessKey: api_key
	});
    } else {
	self.port.emit('open_prefs');
    }
};

var tweet = function() {
    var tweetURL = "http://twitter.com/share?url=https://chrome.google.com/webstore/detail/mmcebionhdleomnkegjcoadpghnmcebl&via=saucelabs&text=You%20should%20check%20out%20Sauce%20Launcher,%20it's%20awesome!";
    //chrome.tabs.create({url: tweetURL, selected:true})

    console.log('tweet');
};

var ajax = function(args) {
    self.port.emit('ajax', args);

    self.port.on('success', args.success);
    self.port.on('error', args.error);
};

