//  BROWSER COMPATIBILITY
/**
 * @return {number}
 */
function getIEVersion() {
    let sAgent = window.navigator.userAgent;
    let Idx = sAgent.indexOf("MSIE");

    // If IE, return version number.
    if (Idx > 0){
        return parseInt(sAgent.substring(Idx+ 5, sAgent.indexOf(".", Idx)));
    }
    // If IE 11 then look for Updated user agent string.
    else if (!!navigator.userAgent.match(/Trident\/7\./)){
        return 11;
    }
    else{
        return 0; //It is not IE
    }
}
if (getIEVersion() > 0) {
    let loader = document.getElementsByClassName("loader")[0];
    loader.style.visibility = "hidden";
    loader.style.display = "none";
}


//  SMOOTH SCROLL
function smoothScroll() {
    $('a[href*="#"]:not([href="#"])').click(function () {
        $("html, body").clearQueue();

        if (location.pathname.replace(/^\//, "") === this.pathname.replace(/^\//, "") && location.hostname === this.hostname) {
            let target = $(this.hash);
            target = target.length ? target : $("[name=" + this.hash.slice(1) + "]");

            if (target.length) {
                if ($(window).width() <= 700) {
                    $("html, body").animate({
                        scrollTop: target.offset().top
                    }, 1500);
                } else {
                    $("html, body").animate({
                        scrollTop: target.offset().top
                    }, 1500);
                }

                return false;
            }
        }
    });
}


//  LOADING SCREEN FADE OUT
function fadeOutLoader() {
    loader = document.getElementsByClassName("loader")[0].style;

    loader.opacity = 1;
    (function fade(){(loader.opacity-=.08)<0?loader.display="none":setTimeout(fade,40)})();
}


//  CURRENCY POPUP
if (document.querySelector(".currency-popup")) {
    document.querySelector(".dashboard-button-container .buy-membership").addEventListener("click", () => {
        document.querySelector(".currency-popup").classList.add("active");
    });

    [".currency-popup .overlay", ".currency-popup img.close"].forEach(item => {
        document.querySelector(item).addEventListener("click", () => {
            document.querySelector(".currency-popup").classList.remove("active");
        });
    });
    const CURRENCY_DROPDOWN = document.querySelector(".currency-popup .dropdown");
    CURRENCY_DROPDOWN.addEventListener("mouseenter", () => {
        CURRENCY_DROPDOWN.classList.add("active");
    });
    CURRENCY_DROPDOWN.addEventListener("mouseleave", () => {
        CURRENCY_DROPDOWN.classList.remove("active");
    });
    CURRENCY_DROPDOWN.addEventListener("click", () => {
        CURRENCY_DROPDOWN.classList.toggle("active");
    });

    let currency = "EUR";
    CURRENCY_DROPDOWN.querySelectorAll(".dropdown__content label").forEach(label => {
        label.addEventListener("click", () => {
            currency = label.textContent.slice(0, 3);
            CURRENCY_DROPDOWN.querySelector(".dropdown__button span span").textContent = label.textContent;
            CURRENCY_DROPDOWN.classList.remove("active");
        });
    });

    document.querySelector(".currency-popup .container .button").addEventListener("click", () => {
        if (!currency || currency.length !== 3) {
            return window.location.href = IS_USER ? "/stripe/pay" : "/auth/login?pay";
        }

        window.location.href = (IS_USER ? "/stripe/pay?currency=" : "/auth/login?pay&currency=") + currency;
    });
}


//  TOOLS SECTION
if (document.getElementById("slideshow")) {
    $("#slideshow > div:gt(0)").hide();

    setInterval(function() {
        if (document.getElementById("slideshow")) {
            $('#slideshow > div:first')
                .fadeOut(1000)
                .next()
                .fadeIn(1000)
                .end()
                .appendTo('#slideshow');
        }
    }, 4000);
}


//  FAQS SECTION
let accordions = document.querySelectorAll(".section-faq .container .accordion");
function collapseList() {
    accordions.forEach(accordion => {
        accordion.addEventListener("click", function () {
            this.classList.toggle("active");
            let panel = this.nextElementSibling;

            if (panel.style.maxHeight) { panel.style.maxHeight = null; }
            else { panel.style.maxHeight = panel.scrollHeight + "px"; }
        });
    });
}
function resizeCollapseList() {
    accordions.forEach(accordion => {
        let panel = accordion.nextElementSibling;

        if (panel.style.maxHeight !== "") {
            panel.style.maxHeight = panel.scrollHeight + "px";
        }
    });
}


//    EVENT LISTENERS
window.addEventListener("load", function () {
    smoothScroll();
    collapseList();

    setTimeout(function () {
        fadeOutLoader();
    }, 200);
});
window.addEventListener("resize", function () {
    resizeCollapseList();
});
if (HAS_HAMBURGER) {
    const HAMBURGER = {
        icon: document.querySelector(".section-home .navbar .hamburger"),
        container: document.querySelector(".section-home .navbar .hamburger-container")
    };

    HAMBURGER.icon.addEventListener("click", () => {
        HAMBURGER.icon.classList.toggle("active");
        HAMBURGER.container.classList.toggle("active");
    });
}


//  Send email from contact form.
const FORM = {
    "name": document.querySelector("#faq .form input[type='text']"),
    "email": document.querySelector("#faq .form input[type='email']"),
    "text": document.querySelector("#faq .form textarea")
};
function sendEmail() {
    //  Check if there is an empty field.
    let emptyField = false;
    Object.values(FORM).forEach(value => {
        if (!value.value) {
            emptyField = true;
        }
    });
    if (emptyField) {
        alert("Please fill in every field before submitting.");
        return false;
    }

    //  Validate email field.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(FORM.email.value)) {
        alert("Email validation failed.");
        return false;
    }

    //  Replace new lines from textarea to <br> to render html code in email.
    //FORM.text.value = FORM.text.value.replace(/\r\n|\r|\n/g,"<br>");

    //  Post data to '/send-email' to send email.
    fetch("/send-email", {
        method: "POST",
        headers: {'Content-Type':'application/x-www-form-urlencoded'},
        body: `type=support&name=${FORM.name.value}&email=${FORM.email.value}&text=${FORM.text.value}`,
    }).then(() => {
        console.log("Email sent.");
    }).catch(err => {
        console.error("Error on posting email info:", err.message);
        return false;
    });

    //  Remove content from fields.
    Object.values(FORM).forEach(value => {
        value.value = "";
    });
}


//  SCROLLMAGIC
let controller = new ScrollMagic.Controller();

let tweenBgStars = gsap.timeline();
tweenBgStars.to(".section-home > .bg", {y: "17vh"});

let sceneBgStars = new ScrollMagic.Scene({
    offset: 1,
    triggerHook: ".section-home > .bg",
    duration: "100%",
    reverse: true
})
    .setTween(tweenBgStars)
    //.addIndicators()
    .addTo(controller);