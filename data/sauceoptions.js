var sauceURL = "https://saucelabs.com";

var sauceResetUsername = function() {
  localStorage.removeItem("sauceLaucherUsername");
}
var sauceResetAccessKey = function() {
  localStorage.removeItem("sauceLaucherAccessKey");
}


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

    var notify = function(msg, type, target_id) {
	type = type || 'good';
	target_id = target_id || 'notificationArea';

	var content = $('#'+target_id);
	content.addClass(type + 'news');
	content.append(msg);

	setTimeout(function () {
	    console.log('Fade away... (like a ninja).');
	    content.removeClass(type + 'news');
	    content.text('');
	}, 5000);
    };

    $('#save').click(function () {
	console.log('click');
	var name = $('#usernameEnter').val();
	var key = $('#api_key').val();

	checkCredentials(name, key);

	self.port.on('can_run_job', function () {
	    save(name, key);
	    var msg = $("<span>")
		    .append($("<h2>", {text:"Thanks, "+name+"!"}))
		    .append($("<p>", {text: "You are all set to start Scouting."}));
	    notify(msg);
	});

	self.port.on('can_not_run_job', function (msg) {
	    if (msg.indexOf("Invalid") != -1) {
		notify(msg, 'bad');
	    } else if (msg.indexOf("parallel") != -1){
		notify($("<p>", {text: "*Is your limit on parallel tests currently maxed out?"}), "bad");
	    }
	    else {
		var errorMsg = $("<span>")
			.apppend($("<p>", {text: "*You're out of Sauce Minutes.."})
				 .append("<a>", {
				     text: "See our available plans!",
				     href: "http://www.saucelabs.com/pricing",
				     css: "cursor:pointer;color:blue;text-decoration:underline;"
				 })
				);
		notify(errorMsg, 'bad');
	    }
	});
    });

    $('#createAccount').click(function () {
	console.log('click');

	var payLoad = createPayLoad(["name", "email", "password"]);

	console.log('Payload is ' + payLoad);
	createAccount(payLoad);

	self.port.on('account_created', function (ident) {
	    notify("<h2>Thanks, "+ident.name+"!</h2> You are all set to start Scouting.");
	});

	self.port.on('account_error', function () {
	    notify("There was an error creating your account.", 'bad');
	});
    });
});
