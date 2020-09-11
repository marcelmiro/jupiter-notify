'use strict';

var $ = window.$;
var ScrollMagic = window.ScrollMagic;
var gsap = window.gsap;
var isUser = window.isUser;
var hasHamburger = window.hasHamburger;

var smoothScroll = function smoothScroll() {
  $('a[href*="#"]:not([href="#"])').click(function () {
    $('html, body').clearQueue();

    if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) $('html, body').animate({
        scrollTop: target.offset().top
      }, 1500);
    }
  });
};

var fadeOutLoader = function fadeOutLoader() {
  var loaderStyle = document.getElementsByClassName('loader')[0].style;
  loaderStyle.opacity = 1 .toString();

  (function fade() {
    (loaderStyle.opacity -= 0.08.toString()) < 0 ? loaderStyle.display = 'none' : setTimeout(fade, 40);
  })();
};

if (document.querySelector('.currency-popup')) {
  document.querySelector('.dashboard-button-container .buy-membership').addEventListener('click', function () {
    document.querySelector('.currency-popup').classList.add('active');
  });
  ['.currency-popup .overlay', '.currency-popup img.close'].forEach(function (item) {
    document.querySelector(item).addEventListener('click', function () {
      document.querySelector('.currency-popup').classList.remove('active');
    });
  });
  var CURRENCY_DROPDOWN = document.querySelector('.currency-popup .dropdown');
  CURRENCY_DROPDOWN.addEventListener('mouseenter', function () {
    return CURRENCY_DROPDOWN.classList.add('active');
  });
  CURRENCY_DROPDOWN.addEventListener('mouseleave', function () {
    return CURRENCY_DROPDOWN.classList.remove('active');
  });
  CURRENCY_DROPDOWN.addEventListener('click', function () {
    return CURRENCY_DROPDOWN.classList.toggle('active');
  });
  var currency = 'EUR';
  CURRENCY_DROPDOWN.querySelectorAll('.dropdown__content label').forEach(function (label) {
    label.addEventListener('click', function () {
      currency = label.textContent.slice(0, 3);
      CURRENCY_DROPDOWN.querySelector('.dropdown__button span span').textContent = label.textContent;
      CURRENCY_DROPDOWN.classList.remove('active');
    });
  });
  document.querySelector('.currency-popup .container .button').addEventListener('click', function () {
    var redirect = '/stripe/pay';
    if (!isUser) redirect = '/login?redirect=' + redirect;

    if (currency && (typeof currency === 'string' || currency instanceof String) && currency.length === 3) {
      redirect += '?currency=' + currency;
    }

    window.location.href = redirect;
  });
}

if (document.getElementById('slideshow')) {
  $('#slideshow > div:gt(0)').hide();
  setInterval(function () {
    if (document.getElementById('slideshow')) {
      $('#slideshow > div:first').fadeOut(1000).next().fadeIn(1000).end().appendTo('#slideshow');
    }
  }, 4000);
}

var accordions = document.querySelectorAll('.section-faq .container .accordion');

var collapseList = function collapseList() {
  accordions.forEach(function (accordion) {
    accordion.addEventListener('click', function () {
      this.classList.toggle('active');
      var panel = this.nextElementSibling;
      if (panel.style.maxHeight) panel.style.maxHeight = null;else panel.style.maxHeight = panel.scrollHeight + 'px';
    });
  });
};

function resizeCollapseList() {
  accordions.forEach(function (accordion) {
    var panel = accordion.nextElementSibling;
    if (panel.style.maxHeight !== '') panel.style.maxHeight = panel.scrollHeight + 'px';
  });
}

window.addEventListener('load', function () {
  smoothScroll();
  collapseList();
  fadeOutLoader();
});
window.addEventListener('resize', function () {
  return resizeCollapseList();
});

if (hasHamburger) {
  var HAMBURGER = {
    icon: document.querySelector('.section-home .navbar .hamburger'),
    container: document.querySelector('.section-home .navbar .hamburger-container')
  };
  HAMBURGER.icon.addEventListener('click', function () {
    HAMBURGER.icon.classList.toggle('active');
    HAMBURGER.container.classList.toggle('active');
  });
}

var FORM = {
  username: document.querySelector('#faq .form input[type=text]'),
  email: document.querySelector('#faq .form input[type=email]'),
  text: document.querySelector('#faq .form textarea')
};

var sendSupport = function sendSupport() {
  if (!FORM.username.value || !FORM.text.value) return alert('Please fill in every field before submitting.');
  fetch('/api/discord/ticket', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: FORM.username.value,
      email: FORM.email.value ? FORM.email.value : undefined,
      text: FORM.text.value
    })
  }).then(function (r) {
    r && r.status === 200 ? alert('Form sent.') : alert('An unexpected error occurred when sending the form.');
  })["catch"](function (err) {
    return alert('Error on posting form info: ' + err.message);
  });
  Object.values(FORM).forEach(function (value) {
    value.value = '';
  });
};

var controller = new ScrollMagic.Controller();
var tweenBgStars = gsap.timeline().to('.section-home > .bg', {
  y: '17vh'
});
new ScrollMagic.Scene({
  offset: 1,
  triggerHook: '.section-home > .bg',
  duration: '100%',
  reverse: true
}).setTween(tweenBgStars).addTo(controller);