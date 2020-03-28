const stripe = Stripe(STRIPE_KEY);
const SESSION_MEMBERSHIP_ID = STRIPE_SESSIONS.membership.id;
const SESSION_EDIT_CARD_ID = STRIPE_SESSIONS.edit_card.id;

document.getElementById("pay-now").addEventListener("click", async function() {
    const {error} = await stripe.redirectToCheckout({
        sessionId: SESSION_MEMBERSHIP_ID
    });
    if (error.message) { console.log(error); }
});

document.getElementById("edit-card-details").addEventListener("click", async function() {
    const {error} = await stripe.redirectToCheckout({
        sessionId: SESSION_EDIT_CARD_ID
    });
    if (error.message) { console.log(error); }
});


document.getElementById("cancel-membership").addEventListener("click", _ => {
    document.getElementById("cancel-membership-popup").style.display = "block";
});

document.querySelectorAll(".confirm-popup .overlay," +
    ".confirm-popup a:nth-of-type(1)").forEach(item => {
        item.addEventListener("click", _ => {
            document.querySelectorAll(".confirm-popup").forEach(popup => {
                popup.style.display = "none";
            });
        });
});
