'use strict'
const $ = window.$
const ScrollMagic = window.ScrollMagic
const gsap = window.gsap
const isUser = window.isUser
const hasHamburger = window.hasHamburger

// Scroll smoothly to different anchors of page.
const smoothScroll = () => {
    $('a[href*="#"]:not([href="#"])').click(function () {
        $('html, body').clearQueue()
        if (
            location.pathname.replace(/^\//, '') ===
            this.pathname.replace(/^\//, '') &&
            location.hostname === this.hostname
        ) {
            let target = $(this.hash)
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']')
            if (target.length) $('html, body').animate({ scrollTop: target.offset().top }, 1500)
        }
    })
}

// Fade out screen loader.
function fadeOutLoader () {
    const loaderStyle = document.getElementsByClassName('loader')[0].style

    loaderStyle.opacity = (1).toString();
    (function fade () {
        (loaderStyle.opacity -= (0.08).toString()) < 0
            ? loaderStyle.display = 'none'
            : setTimeout(fade, 40)
    })()
}

//  CONFIRM POPUP EVENT HANDLERS
if (document.querySelector('.currency-popup')) {
    document.querySelector('.dashboard-button-container .buy-membership').addEventListener('click', () => {
        document.querySelector('.currency-popup').classList.add('active')
    });

    ['.currency-popup .overlay', '.currency-popup img.close'].forEach(item => {
        document.querySelector(item).addEventListener('click', () => {
            document.querySelector('.currency-popup').classList.remove('active')
        })
    })

    const CURRENCY_DROPDOWN = document.querySelector('.currency-popup .dropdown')
    CURRENCY_DROPDOWN.addEventListener('mouseenter', () => CURRENCY_DROPDOWN.classList.add('active'))
    CURRENCY_DROPDOWN.addEventListener('mouseleave', () => CURRENCY_DROPDOWN.classList.remove('active'))
    CURRENCY_DROPDOWN.addEventListener('click', () => CURRENCY_DROPDOWN.classList.toggle('active'))

    let currency = 'USD'
    CURRENCY_DROPDOWN.querySelectorAll('.dropdown__content label').forEach(label => {
        label.addEventListener('click', () => {
            currency = label.textContent.slice(0, 3)
            console.log(currency)
            CURRENCY_DROPDOWN.querySelector('.dropdown__button span span').textContent = label.textContent
            CURRENCY_DROPDOWN.classList.remove('active')
        })
    })

    document.querySelector('.currency-popup .container .button').addEventListener('click', () => {
        let redirect = '/stripe/pay'
        if (currency && typeof currency === 'string' && currency.length === 3) {
            redirect += '?currency=' + currency
            let password
            const params = new URLSearchParams(window.location.search)
            if (params) password = params.get('password')
            if (password) redirect += '&password=' + password
        }
        if (!isUser) redirect = '/login?redirect=' + encodeURIComponent(redirect)
        window.location.href = redirect
    })
}

// Image slideshow rotation.
if (document.getElementById('slideshow')) {
    $('#slideshow > div:gt(0)').hide()

    setInterval(function () {
        if (document.getElementById('slideshow')) {
            $('#slideshow > div:first')
                .fadeOut(1000)
                .next()
                .fadeIn(1000)
                .end()
                .appendTo('#slideshow')
        }
    }, 4000)
}

// FAQ animation.
const accordions = document.querySelectorAll('.section-faq .container .accordion')
const collapseList = () => {
    accordions.forEach(accordion => {
        accordion.addEventListener('click', function () {
            this.classList.toggle('active')
            const panel = this.nextElementSibling

            if (panel.style.maxHeight) panel.style.maxHeight = null
            else panel.style.maxHeight = panel.scrollHeight + 'px'
        })
    })
}
function resizeCollapseList () {
    accordions.forEach(accordion => {
        const panel = accordion.nextElementSibling
        if (panel.style.maxHeight !== '') panel.style.maxHeight = panel.scrollHeight + 'px'
    })
}

function loginRedirect () {
    let url = '/login'
    const params = window.location.search.slice(1)
    if (params) { url += '?redirect=' + '/?' + encodeURIComponent(params) }
    window.location.href = url
}

// EVENT HANDLERS
window.addEventListener('load', function () {
    smoothScroll()
    collapseList()
    fadeOutLoader()
})
window.addEventListener('resize', () => resizeCollapseList())

// Admin hamburger animation.
if (hasHamburger) {
    const HAMBURGER = {
        icon: document.querySelector('.section-home .navbar .hamburger'),
        container: document.querySelector('.section-home .navbar .hamburger-container')
    }

    HAMBURGER.icon.addEventListener('click', () => {
        HAMBURGER.icon.classList.toggle('active')
        HAMBURGER.container.classList.toggle('active')
    })
}

// Contact form function.
const FORM = {
    username: document.querySelector('#faq .form input[type=text]'),
    email: document.querySelector('#faq .form input[type=email]'),
    text: document.querySelector('#faq .form textarea')
}
// eslint-disable-next-line no-unused-vars
const sendSupport = () => {
    if (!FORM.username.value || !FORM.email.value || !FORM.text.value) {
        return alert('Please fill in every field before submitting.')
    }

    fetch('/api/discord/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: FORM.username.value,
            email: FORM.email.value,
            text: FORM.text.value
        })
    }).then(r => {
        if (r && r.status === 200) {
            alert('Form sent.')
            Object.values(FORM).forEach(value => { value.value = '' })
        } else {
            alert('An unexpected error occurred when sending the form.')
        }
    }).catch(() => alert('An unexpected error occurred when sending the form.'))
}

// Scrollmagic.
const controller = new ScrollMagic.Controller()
const tweenBgStars = gsap.timeline().to('.section-home > .bg', { y: '17vh' })
new ScrollMagic.Scene({
    offset: 1,
    triggerHook: '.section-home > .bg',
    duration: '100%',
    reverse: true
})
    .setTween(tweenBgStars)
    .addTo(controller)
