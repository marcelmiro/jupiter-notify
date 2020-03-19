
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


//  FEATURES SECTION
let cards = document.querySelectorAll(".section-features .container .cell .card");
let svgChannelText = document.querySelector(".section-features .container .mobile svg #Channel-text text tspan");
let channels = ["welcome", "releases", "dsm-monitor", "twitter-monitor", "raffle-links", "nyc-info", "chat"];

cards.forEach(function(card) {
    card.addEventListener("mouseenter", function () {
        let channelText = channels[Array.from(cards).indexOf(card)+1];
        fadeText(svgChannelText, channelText);
        phoneAnimation(channelText);
    });

    card.addEventListener("mouseleave", function () {
        fadeText(svgChannelText, channels[0]);
        phoneAnimation("default");
    });
});

function fadeText(element, text) {
    $(element).stop(true, true);
    $(element).fadeOut(200, function() {element.textContent = text;});
    $(element).fadeIn(200);
}

let tween = gsap.timeline();
function phoneAnimation(word) {
    tween.totalProgress(1).kill();
    let animContainer = document.querySelector(".section-features .container .mobile div");
    if (word === "default") {
        $(animContainer).empty();
    } else if (word === "dsm-monitor") {
        $(animContainer).fadeIn(200);
        for (let i=0; i<2; i++) {
            let message = document.createElement("img");
            message.setAttribute("src", "assets/message_monitor.png");
            message.setAttribute("alt", "Discord message example");
            message.setAttribute("style", "left:43%;");
            animContainer.appendChild(message);
        }

        let messages = animContainer.children;
        tween = gsap.timeline();

        tween.to(messages[0],{duration: 0.5, left: "50%", opacity:1, ease: Power1.easeOut, onComplete: function() {
            let height;
            try { height = messages[0].offsetHeight; }
            catch (e) { phoneAnimation("default"); return; }

            tween.to(messages[0], {duration: 1.4, y: -height - 20, ease: Power3.easeOut}, 1.2);
        }}, 0.2);
        tween.to(messages[1], {duration: 0.6, left: "50%", opacity: 1}, 1.7);
    }
}
//phoneAnimation("releases");

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
//window.addEventListener("scroll", function () {});
window.addEventListener("resize", function () {
    resizeCollapseList();
});


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
