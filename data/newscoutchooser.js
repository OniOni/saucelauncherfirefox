// Mathieu Sabourin

// Config
var root = 'http://www.saucelabs.com',
    url = '/images/scoutchooser/';

var ENTER_KEY = 13,
    ESCAPE_KEY = 27;
var debug = false;

if (typeof newscoutchooser == "undefined") { var newscoutchooser = {}; }

newscoutchooser.url_for = function(browser, version, os) {
    var container = $('<div>');
    return newscoutchooser._build(container, {type: 'url', event:'focus'}, newscoutchooser.def_on_choose, function (self) {
	// newscoutchooser.build_popup_activator(self.all, self.chooser, 'mouseenter', true);
	
	self.current_os = os;
	self.current_browser = {browser: browser, version: version};

	self.update_combo();

	self.all.css({
	    display: 'block'
	});

	self.chooser.css({
	    display: 'none'
	});
 
	container.keydown(function (event) {
	    if (!(event.which == ESCAPE_KEY)) {
		return;
	    }
	    $('.wrapper').css({
	     opacity: 1
	    });
	    container.remove();
	});

	$('body').append(container);
	$('.wrapper').css({
	     opacity: 0.5
	});

	container.css({
	    opacity: 1,
	    position: 'absolute',
	    margin: 'auto',
	    top: ($(window).scrollTop() + ($(window).height() / 2))+'px',
	    left: (($(window).width() / 2) - (self.url.width() / 2))+'px'
	});

	self.url.focus();

    });
};

newscoutchooser.build_chooser_only = function (div, on_choose) {
    return newscoutchooser._build(div, {type: 'chooser'}, 
	function (data) {
	    // Stuff
	    on_choose(data.os, data.browser, data.version);
	},
	function (self) {
	    console.log('hey'); 
            self.chooser.css({
	      width: '600px'
	    });
	    
	    self.chooser.find('#browser').css({
	      width: '48%'
	    });
            newscoutchooser.post_processing();
   });
};

newscoutchooser.build_from_url = function (div, on_choose) {
    return newscoutchooser._build(div, {type: 'url', event:'focus'}, on_choose, function (self) {

	var url = $(div);
	url.css('overflow', 'auto');
	
	newscoutchooser.build_popup_activator(self.all, self.chooser, 'mouseenter', true);
	
	self.all.css({
	    display: 'block'
	});

	self.chooser.css({
	    display: 'none'
	});
    });
};


newscoutchooser.build = function (div, popup, on_choose) {
    if (popup)
	popup = {type: 'popup', event: popup};
    else
	popup = false;

    return newscoutchooser._build(div, popup, on_choose);
};

newscoutchooser._build = function (div, popup, on_choose, cb) {
    var element;

    var with_chooser = true, with_search_bar = true;    

    if (popup && popup.type != 'chooser') {
	var link = $(div);
	var container = $('<div>');
	container.addClass('normalize');

	if (popup.type == 'popup')
	    newscoutchooser.build_popup_activator(link, container, popup.event);
	
	newscoutchooser.build_popup_container(container);

	element = $('<div>');
	
	container.append(element);
	if (popup.type == 'popup') {
	    $('body').append(container);
	    container.css({
		position: 'absolute'
	    });
	} else if (popup.type == 'url') {
	    link.append(container);
	}
    } else {
	element = $(div);
	element.addClass('normalize');
    }

    if(popup && popup.type == 'chooser') {
	with_search_bar = false;
    }
    
    var browsers = {};

    element.css({
	overflow: 'auto',
	padding: '0.6%'
    });

    ajax({
	url: root+'/rest/v1/info/scout',
	dataType: 'json',
	success: function (data, text) {
	    // Returns a dict of form {os: {browser: [versions ...]}
	    browsers = newscoutchooser.get_browsers(data);

	    var self = newscoutchooser.init(browsers);
	    self.popup = popup;

	    if (on_choose) {
		self.on_choose = on_choose;
	    } else {
		self.on_choose = newscoutchooser.def_on_choose;
	    }

	    if (with_search_bar) {
		// Set search bar
		var search_bar = $('<div>');
		self.build_search_bar(search_bar);
		element.append(search_bar);
	    }
	    
	    if (with_chooser) {
		// Set up chooser
		var chooser = $('<div>');
		self.build_chooser(chooser, browsers);
		element.append(chooser);
	    }

	    // Post processing
	    newscoutchooser.post_processing();
	
	    if (cb) {
		console.log('back');
		self.all = container;
		self.search_bar = search_bar;
		cb(self);
	    }
	},
	error: function () {
	    console.log('Error with json.');
	}
    });
  return container ? container : element;
};

newscoutchooser.build_popup_activator = function (div, container, event, no_repositioning) {
    // Display widget
    div.bind(event, function () {
	container.css({display: 'block'});

	if (!no_repositioning) {
	    var overflow = $(document).width() - (div.offset().left + container.outerWidth());
	    overflow = (overflow > 0) ? 0 : Math.ceil(overflow);
	    
	    container.offset ({
		top: div.offset().top + div.outerHeight(),
		left: div.offset().left + overflow
	    });

	    container.find('.url').focus();
	}

	newscoutchooser.post_processing();
    });

    var hide = function () {
	container.css({display: 'none'});
    };

    // Hide widget
    container.mouseleave(hide);
};

newscoutchooser.build_popup_container = function (div) {
    div.addClass('scout-container');
    div.addClass('shadow-box');
    div.css({
	width: '500px',
	display: 'none',
	padding: '6px'
    });
};

newscoutchooser.init = function (browsers) {
    var os = Object.keys(browsers)[0],
	browser = Object.keys(browsers[os])[0],
	version = browsers[os][browser][0];

    var obj = {};

    for(var k in newscoutchooser) {
	if (typeof newscoutchooser[k] == 'function') {
	    obj[k] = newscoutchooser[k];
	}
    }

    obj.current_os = os;
    obj.current_browser = {
	browser: browser,
	version: version
    };

    obj.url = "";

    return obj; 
};

var translate = {};
newscoutchooser.get_browser_short_string = function (b) {
    if (b == 'Google Chrome')
	return 'googlechrome';

    return translate[b];
};

var backend = {};
newscoutchooser.get_os_backend_name = function (os, b, v) {
    console.log(os);
    if (os == 'Mac') {
	os = 'OSX';
    }
    
    return backend[os][b][v];
};

newscoutchooser.get_browsers = function (data) {
    var browsers = {};

    if (!data) {
	return {
	    windows: {
		"iexplore": ["6", "7", "8", "9"],
		"firefox": ["3.6", "8", "9", "10"],
		"safari": ["3", "4", "5"],
		"opera": ["9", "10", "11"],
		"chrome": ["*"]
	    },
	    linux: {
		"firefox": ["3.6", "11", "12"],
		"opera": ["11"],
		"chrome": ["*"]
	    },
	    mac: {
		"firefox": ["3.6", "7"],
		"safari": ["5"],
		"chrome": ["*"]
	    }
	};
    }

    for (var i in data) {
	var 
	b = data[i], 
	n = data[i]['long_name'],
	os = data[i]['os_display'],
	v = data[i]['short_version'];

	if (!browsers[os])
	    browsers[os] = {};
	if (!browsers[os][n])
	    browsers[os][n] = [];
	
	if (browsers[os][n].indexOf(b.short_version) == -1)
	    browsers[os][n].push(b.short_version);

	if (!translate[n])
	    translate[n] = b.name;


	if (!backend[os])
	    backend[os] = {};
	if (!backend[os][n])
	    backend[os][n] = {};
	if (!backend[os][n][v])
	    backend[os][n][v] = data[i]['os'];
    }

    return browsers;
};

newscoutchooser.build_search_bar = function (div) {
    var url_bar = $('<div>');
    this.build_url_bar(url_bar);

    div.append(url_bar);
};

newscoutchooser.build_url_bar = function (div) {
    var container = $('<div>');
    container.addClass('url-container');

    var url = $('<input>');
    //url.attr('type', 'url');
    url.attr('placeholder', 'Enter URL'),
    url.addClass('url');
    url.blur(function () {
	newscoutchooser.url = $(this).attr('value');
    });
    var self = this;
    url.keydown(function (event) {
	if (!(event.which == ENTER_KEY)) {
	    return;
	}

	self.launch_scout();
    });
    this.url = url;

    var button = $('<button>');
    this.build_button(button);

    var combo = $('<div>');
    combo.attr('id', 'combo');
    combo.css({
	'float': 'right',
	marginRight: '5px'
    });
    combo.addClass('scout-center');
    this.combo = combo;

    container.append(url);

    // Append backwards -> float right
    container.append(button);
    container.append(combo);

    div.append(container);
};

newscoutchooser.build_button = function (button) { 
    button.css({
	margin: '1px',
	'float': 'right'
    });

    var self = this;
    button.click(function () {
	self.launch_scout();
    });
};

newscoutchooser.build_chooser = function (div, browsers) {
    div.addClass('scout-container');
    if (!this.popup)
	div.addClass('shadow-box');
    
    this.chooser = div;

    var pane = {},
	title = $('<p>'),
	os_pane = $('<div>'),
	browser_pane = $('<div>');

    title.html('Choose os and browser');
    title.addClass('chooser-title');
    div.append(title);

    // set ids
    os_pane.attr('id', 'os');
    browser_pane.attr('id', 'browser');

    // build pane squelettons
    newscoutchooser.build_pane(os_pane, "OS");
    newscoutchooser.build_pane(browser_pane, "Browser");

    var content = os_pane.children('#scout-content');
    var is_first = true;

    // Populate os pane with rows and setup action for rows
    for (var os in browsers) {
	if (!os || os == 'undefined') {
	    continue;
	}

	var inner_browser_pane = $('<div>');
	this.build_browser_pane(inner_browser_pane, browsers[os]);
	browser_pane.children('#scout-content').append(inner_browser_pane);
	browser_pane.css({
	    marginLeft: '2%'
	});

	var curr_browser = Object.keys(browsers[os])[0],
            b = {browser: curr_browser,
	         version: browsers[os][curr_browser][0]};

	var os_row = $('<div>');
	this.build_os_row(os_row, os, b, browser_pane, inner_browser_pane);
	content.append(os_row);

	// Set up default
	if (is_first) {
	    os_row.addClass('active');
	    inner_browser_pane.attr('id', 'active');
	    inner_browser_pane.css('display', 'block');
	    inner_browser_pane.children('.row').first().addClass('active');
	    
	    this.current_os = os;
	    this.current_browser = b;
	    this.update_combo();

	    is_first = false;
	}
    }

    div.append(os_pane);
    div.append(browser_pane);
};

newscoutchooser.build_pane = function (div, title) {
    div.css({
	'float': 'left',
	width: '49%'
    });

    var content = $('<div>');
    content.attr('id', 'scout-content');
    content.addClass('pane-content');

    div.append(content);
};

newscoutchooser.build_os_row = function (div, os, browser, pane_div, pane_info) {
    var icon = $('<img>'),
	arrow = $('<img>'),
	text = $('<p>');

    div.addClass('os row');

    newscoutchooser.highlight_on_hover(div);

    icon.attr('src', root+url+'/os/small/'+os.toLowerCase()+'.png');
    icon.addClass('icon');
    icon.addClass('scout-center');

    arrow.attr('src', root+url+'/arrow.png');
    arrow.css({
	paddingRight: '5px',
	'float': 'right'
    });
    arrow.addClass('scout-center');

    text.html(os);
    text.css({
	'float': 'left',
	marginLeft: '3%',
	top: (div.outerHeight() / 2)+'px'
    });
    newscoutchooser.cursor_on_hover(text);
    text.addClass('scout-center');

    div.append(icon);
    div.append(text);
    div.append(arrow);

    var self = this;
    div.click(function () {
	self.chooser.find('.active.os').removeClass('active');

	div.addClass('active');
	self.current_os = os;
	self.current_browser = browser;
	self.update_combo();
	self.switch_browser_pane(pane_info);
    });
};

newscoutchooser.switch_browser_pane = function (pane) {
    // Remove old
    var active = this.chooser.find('#active');
    active.each(function () {
	$(this).css({display: 'none'});
	$(this).attr('id', '');
    });
    pane.find('.active').each(function () {
	$(this).removeClass('active');
    });

    // Set new
    pane.css({display: 'block'});
    pane.attr('id', 'active');
    
    pane.find('.row').first().addClass('active');

    // Set height
    this.chooser.find('#os').children('#scout-content').height(this.chooser.find('#browser').children('#scout-content').outerHeight(true));
    pane.find('.scout-center').each(function () {
	newscoutchooser._center($(this));
    });
};

newscoutchooser.build_browser_pane = function (pane, browsers) {
    pane.css({
	display: 'none'
    });

    for (var b in browsers) {
	for (var k in browsers[b]) {
	    if (typeof browsers[b][k] == 'function')
		continue;

	    var row = $('<div>');
	    this.build_browser_row(row, b, browsers[b][k]);
	    pane.append(row);
	}
    }
};


newscoutchooser.build_browser_row = function (div, browser, version) {
    var icon = $('<img>'),
	text = $('<p>'),
	b = newscoutchooser.get_browser_short_string(browser);

    div.addClass('browser row');

    div.css({
	overflow: 'auto'
    });

    newscoutchooser.highlight_on_hover(div);

    icon.attr('src', root+url+'/browser/small/'+b+'.png');
    icon.addClass('icon');
    icon.addClass('scout-center');

    text.html(browser+ ' ' + version);
    text.css({
	'float': 'left',
	marginLeft: '3%',
	marginBottom: '0px'
    });
    newscoutchooser.cursor_on_hover(text);
    text.addClass('scout-center');
    
    div.append(icon);
    div.append(text);

    var self = this;
    div.click(function () {
	self.chooser.find('.active.browser').removeClass('active');
	div.addClass('active');
	self.current_browser = {browser: browser, version: version};
	self.update_combo();

	self.launch_scout();
    });
};

newscoutchooser.highlight_on_hover = function(div) {
    div.hover(
	function() { // enter
	    $(this).css('backgroundColor', 'rgba(220, 220, 220, 0.5)');
	},
	function() { // quit
	    $(this).css('backgroundColor', '');
	});
};

// Stub
newscoutchooser.launch_scout = function () {

    try {
	_USERNAME = _USERNAME;
    } catch (x) {
	_USERNAME = true; // Not at sauce labs
    }

    if (!_USERNAME) {
	var introMsg = "<br>To use our <i>cool</i> manual testing tool, ";
	  introMsg += "you need to sign up for a <b>free</b> Sauce Labs account - it's easy.";
	  introMsg += "<br><br><b>Free Account Benefits:</b><br><ul style='padding:20px'>";
	  introMsg += "<li>30 Manual Minutes every month</li>";
	  introMsg += "<li>All of our platforms and browsers</li>";
	  introMsg += "<li>Use Sauce Launcher browser Add-ons";
	  introMsg += "<li>Access to Sauce Automated Testing Cloud</li>";
	  introMsg += "<center><img style='width:200px;' src="+root+"/images/all_browsers.png'></center>";
        quicksignup.init(true, window.location, "<b style='font-size:21px'>Sign up!</b>", introMsg, 530, 450);
	return;
    }

    // Verify logic
    if (this.url && this.url.val() == '') {
	this.url.focus();
	return;
    }

    var launch_data = {
	os: newscoutchooser.get_os_backend_name(this.current_os,
						this.current_browser.browser, 
						this.current_browser.version),
	browser: newscoutchooser.get_browser_short_string(this.current_browser.browser),
	version: this.current_browser.version,
	url: this.url ? this.url.val() : ''
    };


    if (this.url){
	// Launch logic
	var self = this;
	newscoutchooser.check_url(this, function () {
	   self.on_choose(launch_data);	
        });
    } else {
	this.on_choose(launch_data);
    }

    // Debug
    if (debug)
	console.log(launch_data);
};

// Shamelessy stolen from scoutchooser
newscoutchooser.check_url = function(scout_obj, cb) {
    var banArray = ["", "www.example.com"];
    if (window.location.host == "saucelabs.com") {
	$.ajax({
	    url:"/downloads/ban.json?"+Number(new Date()),
	    success:function(data){
		banArray = JSON.parse(data);
	    }, async:false
	});
    }
    if ($.inArray(scout_obj.url.val(), banArray) != -1) {
	scout_obj.url.val("");
	scout_obj.url.focus();
    }
    else {
	var needURL = window.location.protocol +"//";
	needURL += window.location.host;
	needURL += "/rest/"+_USERNAME+"/needs_tunnel/";
	needURL += $.url(scout_obj.url.val()).attr("host");
	$.ajax({
	    'url': needURL,
	    error: function() {
		cb();
	    },
	    success: function(data) {
		if (data.needs_tunnel) {
		    window.location.href = encodeURI("/scout/needstunnel?url="+$.url(scout_obj.url.val()).attr("host"));
		}
		else {
		    cb();
		}
	    }
	});
    }
};


// Shamelessy stolen from scoutchooser
newscoutchooser.def_on_choose = function(sc_data) {
  var form = $("<form>");
  form.css("display", "none");
  form.attr("action", "/scout/create");
  form.attr("method", "POST");
  var os = $("<input>");
  os.attr("name", "os");
  os.attr("id", "os");
  var browser = $("<input>");
  browser.attr("name", "browser");
  browser.attr("id", "browser");
  var version = $("<input>");
  version.attr("name", "version");
  version.attr("id", "version");
  var url = $("<input>");
  url.attr("name", "url");
  url.attr("id", "url");
  form.append(os);
  form.append(browser);
  form.append(version);
  form.append(url);
  $(document.body).append(form);
  os.val(sc_data.os);
  browser.val(sc_data.browser);
  version.val(sc_data.version);
  url.val(sc_data.url);

  try {
    // only happens in case of flash scout fallback
    if (bugtv) {
      bugtv.im_done_button();
    }
  } catch(err){}

  console.log(window.location.href);
  // only happens if user is on flash scout page
  if (window.location.href.indexOf("scout/live") != -1 && typeof bugtv != 'undefined') {
    window.stopped = true;
    bugtv.im_done_button(true);
    setTimeout(function() { form.submit() }, 1000);
  }
  else {
      if (!debug)
	  form.submit();
  }
};


newscoutchooser.update_combo = function () {
    if (!this.combo)
	return;
    
    // Fix this
    var combo = this.combo;

    // Clear previous combo
    combo.children().remove();

    // Set up new combo
    var os = $('<span>');
    this.build_combo_element(os, this.current_os);

    var plus = $('<span>');
    plus.html(' + ');

    var b = $('<span>');
    this.build_combo_element(b, newscoutchooser.get_browser_short_string(this.current_browser.browser));

    combo.append(os);
    combo.append(plus);
    combo.append(b);
};

newscoutchooser.build_combo_element = function (div, el) {
    var icon = $('<img>');

    icon.attr('src', root+url+el.toLowerCase()+'.png');
    icon.css({
	marginRight: '2px'
    });

    var name = $('<span>');
    name.css({
	fontSize: '0.6rem',
	color: 'grey'
    });
    name.html(el);

    div.append(icon);
    
    if (!this.popup)
	div.append(name);
};

newscoutchooser.cursor_on_hover = function (div) {
    div.hover(function () {
	div.css({
	    cursor: 'default'
	});
    });
};

newscoutchooser._center = function (el) {
    var p = el.parent();
    el.css({
	marginTop: (Math.floor((p.height() / 2) - (el.height() / 2)))+'px'
    });
};

newscoutchooser.register_for_postprocessing = function (f) {
    if (!newscoutchooser.post_funcs)
	newscoutchooser.post_funcs = [];

    newscoutchooser.post_funcs.push(f);
};

// Post processing
newscoutchooser.post_processing = function () {
    $('.scout-center').each(function () {
	newscoutchooser._center($(this));
    });

    if (newscoutchooser.post_funcs) {
	for (var i in newscoutchooser.post_funcs) {
	    newscoutchooser.post_funcs[i]();
	}
    }
};
