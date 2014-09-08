/* Project specific Javascript goes here. */
$(function() {
	$('.toggle-nav').click(function() {
		console.log("click");
		toggleNav();
	});
});
			

function toggleNav() {
	if ($('#map-wrapper').hasClass('show-nav')) {
		$('#map-wrapper').removeClass('show-nav');
	} else {								
		$('#map-wrapper').addClass('show-nav');
	}
	//$('#map-wrapper').toggleClass('show-nav');
}
