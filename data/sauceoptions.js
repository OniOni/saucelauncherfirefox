var sauceURL = "https://saucelabs.com";

var sauceResetUsername = function() {
  localStorage.removeItem("sauceLaucherUsername");
}
var sauceResetAccessKey = function() {
  localStorage.removeItem("sauceLaucherAccessKey");
}

/** The username for connecting to sauce on demand - asks user if unknown. */
var sauceUsername = function (username) {
  if (username) {
    localStorage["sauceLaucherUsername"] = username;
  }
  if (localStorage["sauceLaucherUsername"]) {
    return localStorage["sauceLaucherUsername"];
  }
  return;
};

/** The access key for connecting to sauce on demand - asks user if unknown. */
var sauceAccessKey = function (apiKey) {
  if (apiKey) {
    localStorage["sauceLaucherAccessKey"] = apiKey;
  }
  if (localStorage["sauceLaucherAccessKey"]) {
    return localStorage["sauceLaucherAccessKey"];
  }
  return;
};

var createAccount = function() {
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
}

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


$(function () {

    $('#createAccount').click(createAccount);

    jQuery("#sauceCreateContainer").find("input").keypress(function(e) {
	if (e.keyCode == 13) {
	    saveValues();
	}
    });

    jQuery("#sauceSignupContainer").find("input").keypress(function(e) {
	if (e.keyCode == 13) {
	    createAccount();
	}
    });
})
