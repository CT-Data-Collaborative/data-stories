$(function() {

$('.multiple-items').slick({
    adaptiveHeight: true,
    draggable: false,
    infinite: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: "#leftControl",
    nextArrow: "#rightControl"
});

$("#slider").hide();

$('.multiple-items').on('beforeChange', function(event, slick, currentSlide, nextSlide) {
        $("#slider").hide();
});

$('.multiple-items').on('afterChange', function(event, slick, currentSlide, nextSlide) {
    var page = $(".slick-active").attr('id');
    if (page === 'pagetwo') {
        $("#slider").show();
    } else {}
});
map();

// watch active tabs and control slider


});
