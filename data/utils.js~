var sauceURL = "https://saucelabs.com";

var account = localStorage["sauceLaucherUsername"];
var api_key = localStorage["sauceLaucherAccessKey"];

var createSession = function(os, browser, version, destURL) {
  var baseURL = sauceURL+"/scout/launch/"+account;
  var pString = "?os="+os+"&browser="+browser+"&version="+version+"&url="+destURL+"&auth_username="+account+"&auth_access_key="+api_key;
  var params = encodeURI(pString)
  var url = baseURL+params;
    
  try {
    var req = new XMLHttpRequest();
    req.open('POST', url, true);
    
    req.onreadystatechange = function () {
      if (req.readyState == 4) {
        if(req.status == 200) {
          var rObj = JSON.parse(req.responseText);
          if (rObj.result == false) {
            chrome.tabs.create({url: "http://www.saucelabs.com/pricing", selected:true})
          }
          else {
            var mydest = sauceURL+"/scout/live/"+rObj.task+"?auth_username="+account+"&auth_access_key="+api_key;
            chrome.tabs.create({url: mydest, selected:false})
          }
        }
      }
    }
    req.send("All your base are belong to us.");
  }
  catch(err) {
    alert(err);
  }
  
}

var go = function(os, browser, version) {
  if (!localStorage["sauceLaucherUsername"] || !localStorage["sauceLaucherAccessKey"]) {
    chrome.tabs.create({url: chrome.extension.getURL("sauceprefs.html"), selected:true})
    return;
  }
  
  chrome.windows.getCurrent(function(currentWindow) {
    currentWindowId = currentWindow.id;
    chrome.tabs.getSelected(currentWindowId, function(tab) {
      if (localStorage["sauceLaucherLastURL"] && (tab.title == "Sauce Scout - Sauce Labs")) {
        createSession(os, browser, version, localStorage["sauceLaucherLastURL"]);
      }
      else {
        localStorage["sauceLaucherLastURL"] = tab.url;
        createSession(os, browser, version, tab.url);
      }
    });
  });
}

var tweet = function() {
  var tweetURL = "http://twitter.com/share?url=https://chrome.google.com/webstore/detail/mmcebionhdleomnkegjcoadpghnmcebl&via=saucelabs&text=You%20should%20check%20out%20Sauce%20Launcher,%20it's%20awesome!";
  chrome.tabs.create({url: tweetURL, selected:true})
};