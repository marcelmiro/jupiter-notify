'use strict'
const hasMembership = window.hasMembership

const LENGTH_DISCORD_USERNAME = {
    container: document.querySelector('.dashboard__welcome .h1-container'),
    element: document.getElementById('discord-username'),
    text: document.getElementById('discord-username').textContent
}
const LENGTH_CC_NAME = hasMembership
    ? {
        container: document.getElementById('cardholder-container'),
        element: document.getElementById('cardholder-name'),
        text: document.getElementById('cardholder-name').textContent
    }
    : undefined

//  EVENT HANDLERS
window.addEventListener('load', () => {
    layoutHeight()
    lengthManager()
})
window.addEventListener('resize', () => {
    layoutHeight()
    lengthManager()
})

//  CONFIRM POPUP EVENT HANDLERS
document.querySelectorAll('.confirm-popup .overlay, .confirm-popup .close-popup').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.confirm-popup')
            .forEach(popup => { popup.style.display = 'none' })
    })
})
if (document.getElementById('cancel-membership')) {
    document.getElementById('cancel-membership').addEventListener('click', () => {
        document.getElementById('cancel-membership-popup').style.display = 'block'
    })
}
if (document.getElementById('transfer-membership')) {
    document.getElementById('transfer-membership').addEventListener('click', () => {
        document.getElementById('transfer-membership-popup').style.display = 'block'
    })
    document.querySelector('#transfer-membership-popup .button').addEventListener('click', () => {
        const VALUE = document.querySelector('#transfer-membership-popup input[type=text]').value.trim()
        if (VALUE) window.location.href = '/stripe/transfer-membership/' + VALUE
    })
}

//  Function to check if length of text is almost greater than its container. If so, loop to
//  reduce last character and check length again until text fits inside container.
function lengthManager () {
    LENGTH_DISCORD_USERNAME.element.textContent = LENGTH_DISCORD_USERNAME.text
    let firstLoop = true
    const usernameLoop = () => {
        if (LENGTH_DISCORD_USERNAME.element.offsetWidth + 10 >= LENGTH_DISCORD_USERNAME.container.offsetWidth) {
            if (firstLoop) {
                firstLoop = false
                LENGTH_DISCORD_USERNAME.element.textContent = LENGTH_DISCORD_USERNAME.text + '...'
            }
            const text = LENGTH_DISCORD_USERNAME.element.textContent
            LENGTH_DISCORD_USERNAME.element.textContent = text.slice(0, -4) + text.slice(-3)
            usernameLoop()
        }
    }
    usernameLoop()

    if (LENGTH_CC_NAME) {
        LENGTH_CC_NAME.element.textContent = LENGTH_CC_NAME.text
        firstLoop = true
        const cardNameLoop = () => {
            if (LENGTH_CC_NAME.element.getBoundingClientRect().width + 10 >= LENGTH_CC_NAME.container.getBoundingClientRect().width) {
                if (firstLoop) {
                    firstLoop = false
                    LENGTH_CC_NAME.element.textContent = LENGTH_CC_NAME.text + '...'
                }
                const text = LENGTH_CC_NAME.element.textContent
                LENGTH_CC_NAME.element.textContent = text.slice(0, -4) + text.slice(-3)
                cardNameLoop()
            }
        }
        cardNameLoop()
    }
}

//  Function to spread layout through 100% of viewport height, if body height < window height.
function layoutHeight () {
    if (document.body.offsetHeight <= window.innerHeight) {
        document.body.style.height = window.innerHeight + 'px'
        if (!document.querySelector('.dashboard').getAttribute('style')) {
            document.querySelector('.dashboard').style.cssText =
                'margin: 0 auto; top: calc(50% + 20px); transform: translateY(-50%);'
        }
    }
    if (document.querySelector('.dashboard').offsetHeight + 100 > window.innerHeight) {
        document.body.removeAttribute('style')
        document.querySelector('.dashboard').removeAttribute('style')
    }
}
