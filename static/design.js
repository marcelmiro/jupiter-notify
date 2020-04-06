const DISCORD_USERNAME_CONTAINER = document.querySelector(".dashboard__welcome .h1-container");
const DISCORD_USERNAME = document.getElementById("discord-username");
const CC_NAME_CONTAINER = document.getElementById("cardholder-container");
const CC_NAME = document.getElementById("cardholder-name");


window.addEventListener("load", () => {
    lengthManager();
});
window.addEventListener("resize", () => {
    //lengthManager();
});


document.getElementById("cancel-membership").addEventListener("click",() => {
    document.getElementById("cancel-membership-popup").style.display = "block";
});

document.querySelectorAll(".confirm-popup .overlay," +
    ".confirm-popup a:nth-of-type(1)").forEach(item => {
    item.addEventListener("click",() => {
        document.querySelectorAll(".confirm-popup").forEach(popup => {
            popup.style.display = "none";
        });
    });
});

//  Function to check if length of text is almost greater than its container. If so, loop to
//  reduce last character and check length again until text fits inside container.
function lengthManager() {
    if (DISCORD_USERNAME.offsetWidth + 10 >= DISCORD_USERNAME_CONTAINER.offsetWidth) {
        DISCORD_USERNAME.textContent = DISCORD_USERNAME.textContent + "...";
        function usernameLoop() {
            if (DISCORD_USERNAME.offsetWidth + 10 >= DISCORD_USERNAME_CONTAINER.offsetWidth) {
                let text = DISCORD_USERNAME.textContent;
                DISCORD_USERNAME.textContent = text.slice(0,-4) + text.slice(-3);
                usernameLoop();
            }
        }
        usernameLoop();
    }

    if (CC_NAME.getBoundingClientRect().width + 10 >= CC_NAME_CONTAINER.getBoundingClientRect().width) {
        CC_NAME.textContent = CC_NAME.textContent + "...";
        function cardNameLoop() {
            if (CC_NAME.getBoundingClientRect().width + 10 >= CC_NAME_CONTAINER.getBoundingClientRect().width) {
                let text = CC_NAME.textContent;
                CC_NAME.textContent = text.slice(0,-4) + text.slice(-3);
                cardNameLoop();
            }
        }
        cardNameLoop();
    }
}