'use strict'

function smoothScroll () {
    $('a[href*="#"]:not([href="#"])').click(function () {
        $('html, body').clearQueue()

        if (location.pathname.replace(/^\//, '') ===
            this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
            let target = $(this.hash)
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']')

            if (target.length) {
                if ($(window).width() <= 700) {
                    $('html, body').animate({
                        scrollTop: target.offset().top
                    }, 1500)
                } else {
                    $('html, body').animate({
                        scrollTop: target.offset().top
                    }, 1500)
                }

                return false
            }
        }
    })
}

function fadeOutLoader () {
    const loaderStyle = document.getElementsByClassName('loader')[0].style

    loaderStyle.opacity = 1;
    (function fade () {
        (loaderStyle.opacity -= (0.08).toString()) < 0
            ? loaderStyle.display = 'none'
            : setTimeout(fade, 40)
    })()
}

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
    CURRENCY_DROPDOWN.addEventListener('mouseenter', () => {
        CURRENCY_DROPDOWN.classList.add('active')
    })
    CURRENCY_DROPDOWN.addEventListener('mouseleave', () => {
        CURRENCY_DROPDOWN.classList.remove('active')
    })
    CURRENCY_DROPDOWN.addEventListener('click', () => {
        CURRENCY_DROPDOWN.classList.toggle('active')
    })

    let currency = 'EUR'
    CURRENCY_DROPDOWN.querySelectorAll('.dropdown__content label').forEach(label => {
        label.addEventListener('click', () => {
            currency = label.textContent.slice(0, 3)
            CURRENCY_DROPDOWN.querySelector('.dropdown__button span span').textContent = label.textContent
            CURRENCY_DROPDOWN.classList.remove('active')
        })
    })

    document.querySelector('.currency-popup .container .button').addEventListener('click', () => {
        window.location.href = !currency || currency.length !== 3
            ? IS_USER ? '/stripe/pay' : '/login?pay'
            : (IS_USER ? '/stripe/pay?currency=' : '/login?pay&currency=') + currency
    })
}

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

const accordions = document.querySelectorAll('.section-faq .container .accordion')
function collapseList () {
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

window.addEventListener('load', function () {
    smoothScroll()
    collapseList()
    setTimeout(() => fadeOutLoader(), 200)
})
window.addEventListener('resize', function () {
    resizeCollapseList()
})
if (HAS_HAMBURGER) {
    const HAMBURGER = {
        icon: document.querySelector('.section-home .navbar .hamburger'),
        container: document.querySelector('.section-home .navbar .hamburger-container')
    }

    HAMBURGER.icon.addEventListener('click', () => {
        HAMBURGER.icon.classList.toggle('active')
        HAMBURGER.container.classList.toggle('active')
    })
}

const FORM = {
    name: document.querySelector('#faq .form input#username'),
    id: document.querySelector('#faq .form input#user_id'),
    text: document.querySelector('#faq .form textarea')
}
const sendSupport = () => {
    let emptyField = false
    Object.values(FORM).forEach(value => { if (!value.value) emptyField = true })
    if (emptyField) return alert('Please fill in every field before submitting.')

    fetch('/send-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `name=${FORM.name.value}&id=${FORM.id.value}&text=${FORM.text.value}`
    }).then(r => {
        r?.status === 200
            ? console.log('Form sent.')
            : console.error('An unexpected error occurred when sending the form.')
    }).catch(err => console.error('Error on posting form info:', err.message))

    Object.values(FORM).forEach(value => { value.value = '' })
}

const controller = new ScrollMagic.Controller()

const tweenBgStars = gsap.timeline()
tweenBgStars.to('.section-home > .bg', { y: '17vh' })

const sceneBgStars = new ScrollMagic.Scene({
    offset: 1,
    triggerHook: '.section-home > .bg',
    duration: '100%',
    reverse: true
})
    .setTween(tweenBgStars)
    .addTo(controller)
