$(document).ready(function() {
    console.log('jQuery loaded, initializing Slick...');
    
    $('.fade').slick({
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: true,
      autoplay: true,
      autoplaySpeed: 3000,
      cssEase: 'ease-in-out'
    });
    
    console.log('Slick initialized!');
});