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


jQuery(function($){
    $('#save').click(function () {
	console.log('click');
	var name = $('#usernameEnter').val();
	var key = $('#api_key').val();

	checkCredentials(name, key);

	self.port.on('can_run_job', function () {
	    var content = $('#sauceContent');

	    localStorage["sauceLaucherUsername"] = name;
	    localStorage["sauceLaucherAccessKey"] = key;


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
    //$('#createAccount').click(createAccount);
});


var createAccount = function () {

  var sauceCreateError = document.getElementById('sauceCreateError');

  try {
    var payObj = createPayLoad(["name", "email", "usernameCreate","password"]);
    payObj.username = payObj["usernameCreate"];
    payObj.token = "0E44EF6E-B170-4CA0-8264-78FD9E49E5CD";

    var url = sauceURL+"/rest/v1/users";
    var req = new XMLHttpRequest();
    req.open('POST', url, true);

    req.onreadystatechange = function (aEvt) {
      if (req.readyState == 4) {
	if(req.status == 200) {
	  var rObj = JSON.parse(req.responseText);
	  //backwards compat
	  var key = rObj.access_key;
	  var name = rObj.id;
	  //save
	  sauceUsername(name);
	  sauceAccessKey(key);

	  var content = document.getElementById('sauceContent');
	  content.innerHTML = "<h2>Thanks, "+name+"!</h2> You are all set to start Scouting.";
	}
	else {
	  sauceCreateError.innerHTML = "There was an error creating your account.";
	}
      }
    };
    req.send(JSON.stringify(payObj));
  }
  catch(err) {
    sauceCreateError.innerHTML = err;
  }
};
