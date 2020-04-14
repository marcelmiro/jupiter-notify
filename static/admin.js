const TABS = document.querySelectorAll(".tabs-container .tab");
const CONTENTS = document.querySelectorAll(".content > div");
const CONTENT_MEMBER = {
    role: {
        button: document.querySelector(".content__members .dropdown__button"),
        content: document.querySelector(".content__members .dropdown__content"),
    },
    add_member_button: document.getElementById("add-member"),
    refresh_button: document.getElementById("refresh-members"),
    view_buttons: document.querySelectorAll(".content__members .member .view-member"),
    member_view_button: document.querySelector(".content__members .member-view")
};

//  EVENT HANDLERS
window.addEventListener("load", () => {
});
window.addEventListener("resize", () => {
});

//  Click listener for panel tabs.
TABS.forEach((tab, index) => {
    tab.addEventListener("click", () => {
        TABS.forEach(t => { t.classList.remove("active"); });
        CONTENTS.forEach(c => { c.classList.remove("active"); });

        tab.querySelector("input").checked = true;
        tab.classList.add("active");
        CONTENTS[index].classList.add("active");
    });
});

//  Click listener for role dropdown menu in members' settings.
CONTENT_MEMBER.role.content.querySelectorAll("label").forEach(label => {
    label.addEventListener("click", () => {
        CONTENT_MEMBER.role.button.querySelector("span").textContent =
            "Role: " + label.textContent[0].toUpperCase() + label.textContent.substr(1);
    });
});

//  Click listener for refresh button animation in members' settings.
CONTENT_MEMBER.add_member_button.addEventListener("click", () => {
    const USER_ID = prompt("Enter user's Discord id:");
});
CONTENT_MEMBER.refresh_button.addEventListener("click", () => {
    CONTENT_MEMBER.refresh_button.classList.remove("animation");
    setTimeout(() => {
        CONTENT_MEMBER.refresh_button.classList.add("animation");
    }, 0);
});

//  Click listener for view button for each member.
CONTENT_MEMBER.view_buttons.forEach(button => {
    button.addEventListener("click", () => {
        CONTENT_MEMBER.member_view_button.classList.add("active");
    });
});
CONTENT_MEMBER.member_view_button.querySelector("button.back").addEventListener("click", () => {
    CONTENT_MEMBER.member_view_button.classList.remove("active");
});