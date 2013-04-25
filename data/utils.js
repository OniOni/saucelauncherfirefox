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

var checkCredentials = function(name, key) {
    console.log('Check Credentials');
    self.port.emit('check', {username: name, 'access-key': key});
};

var createAccount = function (payObj) {
    payObj.username = payObj["usernameCreate"];
    payObj.token = "0E44EF6E-B170-4CA0-8264-78FD9E49E5CD";

    console.log('Send create_account with ' + payObj);
    self.port.emit('create_account', payObj);
};

jQuery(function($){
    var save = function(name, key) {
	    localStorage["sauceLaucherUsername"] = name;
	    localStorage["sauceLaucherAccessKey"] = key;
    };

    var createPayLoad = function(fieldArray) {
	var payload = {};
	for (var i=0;i<fieldArray.length;i++){
	    var field = fieldArray[i];
	    var fieldValue = document.getElementById(field).value;

	    //Dont allow empty fields
	    if (!fieldValue) {
		throw("All fields are required.");
	    }

	    //validate email
	    if (field == "email") {
		var emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
		if (fieldValue.search(emailRegEx) == -1) {
		    throw("Please provide a valid email address.");
		}
	    }
	    if (field == "password") {
		if (fieldValue.length < 6) {
		    throw("Password must be at least 6 characters.");
		}
	    }
	    payload[field] = fieldValue;
	}
	return payload;
    };

    $('#save').click(function () {
	console.log('click');
	var name = $('#usernameEnter').val();
	var key = $('#api_key').val();

	checkCredentials(name, key);

	self.port.on('can_run_job', function () {
	    var content = $('#sauceContent');

	    save(name, key);

	    content.addClass('goodnews');
	    content.html("<h2>Thanks, "+name+"!</h2> You are all set to start Scouting.");
	});

	self.port.on('can_not_run_job', function (msg) {
	    if (msg.indexOf("Invalid") != -1) {
		// message here
	    } else if (msg.indexOf("parallel") != -1){
		document.getElementById('sauceEnterError').innerHTML = "*Is your limit on parallel tests currently maxed out?";
	    }
	    else {
		document.getElementById('sauceEnterError').innerHTML = "*You're out of Sauce Minutes..<br><a href='http://www.saucelabs.com/pricing' style='cursor:pointer;color:blue;text-decoration:underline;'>See our available plans!</a>.";

	    }
	});

    });

    $('#createAccount').click(function () {
	console.log('click');

	var payLoad = createPayLoad(["name", "email", "password"]);

	console.log('Payload is ' + payLoad);
	createAccount(payLoad);

	self.port.on('account_created', function (ident) {
	    var content = $('#sauceContent');
	    content.html("<h2>Thanks, "+ident.name+"!</h2> You are all set to start Scouting.");
	});

	self.port.on('account_error', function () {
	    var error = $('#sauceCreateError');
	    error.html("There was an error creating your account.");
	});
    });
});
