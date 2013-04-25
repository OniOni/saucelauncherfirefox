jQuery(function ($) {
    console.log('Bootleg is in da house!!');

    var max = 0;
    $('.sauceContainer').each(function () {
	if ($(this).height() > max) {
	    max = $(this).height();
	}
    });

    $('.sauceContainer').css('height', max+'px');
    

    $('.pullDown').each(function () {
	var parent = $(this).parent(),
	    height = 0;

	parent.children().each(function () {
	    height += $(this).height();
	});

	var h = height + $(this).height() + ($(this).height() / 2);
	$(this).css({
	    marginTop: parent.height() - h
	});
    });
});
