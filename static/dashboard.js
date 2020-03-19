const stripe = Stripe(stripeKey);

document.getElementById("pay-now").addEventListener("click", async function() {
    const {error} = await stripe.redirectToCheckout({
        sessionId: checkoutId
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
