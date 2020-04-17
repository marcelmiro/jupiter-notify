const MEMBER_LIST = [
    {
        id: "001",
        username: "FocusFon#1473",
        role: { name: "owner", color: "#00FF00" },
        avatar_url: "https://cdn.discordapp.com/avatars/298920320356712449/144800865267805a765bed6c43f0daba.png?size=2048"
    },
    {
        id: "002",
        username: "MarcelMiro#2569",
        role: { name: "god", color: "#000000" },
        avatar_url: "https://cdn.discordapp.com/avatars/298920320356712449/144800865267805a765bed6c43f0daba.png?size=2048"
    },
    {
        id: "003",
        username: "Kosiris#1234",
        role: { name: "admin", color: "#FF0000" },
        avatar_url: "https://cdn.discordapp.com/avatars/298920320356712449/144800865267805a765bed6c43f0daba.png?size=2048"
    },
    {
        id: "004",
        username: "UNKNWN#6666",
        role: { name: "staff", color: "#fff52d" },
        avatar_url: "https://cdn.discordapp.com/avatars/298920320356712449/144800865267805a765bed6c43f0daba.png?size=2048"
    },
    {
        id: "005",
        username: "5stack#3545",
        role: { name: "renewal", color: "#1d9efc" },
        avatar_url: "https://cdn.discordapp.com/avatars/298920320356712449/144800865267805a765bed6c43f0daba.png?size=2048"
    },
    {
        id: "006",
        username: "marie#1564",
        role: { name: "lifetime", color: "#0072c6" },
        avatar_url: "https://cdn.discordapp.com/avatars/298920320356712449/144800865267805a765bed6c43f0daba.png?size=2048"
    },
    {
        id: "007",
        username: "Chatalot#9849",
        role: { name: "developer", color: "#bd71ff" },
        avatar_url: "https://cdn.discordapp.com/avatars/298920320356712449/144800865267805a765bed6c43f0daba.png?size=2048"
    }
];

let app = new Vue({
    el: "main",
    data: {
        currentTab: 1,
        members: MEMBER_LIST,
        memberCount: MEMBER_LIST.length,
        role: "all",
        search: "",
        showRoleDropdown: false,
        showMemberView: false,
    },
    methods: {
        refreshMembers: function() {
            CONTENT_MEMBER.refresh_button.classList.remove("animation");
            setTimeout(() => {
                CONTENT_MEMBER.refresh_button.classList.add("animation");
            }, 0);
        },
        addMember: function() {
            const USER_ID = prompt("Enter user's Discord id.");
            const ROLE_ID = USER_ID ? prompt("Enter role id.") : undefined;
        },
        viewMember: function(id) {
            this.showMemberView = true;
        }
    },
    filters: {
        capitalize: value => {
            return value.replace(/\b\w/g, letter => letter.toUpperCase());
        }
    },
    computed: {
        filteredList: function() {
            let members = this.members.filter(member => {
                return (
                    member.username.toLowerCase().includes(this.search.toLowerCase()) &&
                    (this.role.toLowerCase() !== "all" ? member.role.name.toLowerCase() === this.role.toLowerCase() : true)
                );
            });
            this.memberCount = members.length;
            return members;
        }
    },
    watch: {
        currentTab: function() {
            TABS.forEach(t => { t.classList.remove("active"); });
            CONTENTS.forEach(c => { c.classList.remove("active"); });

            TABS[this.currentTab-1].querySelector("input").checked = true;
            TABS[this.currentTab-1].classList.add("active");
            CONTENTS[this.currentTab-1].classList.add("active");
            if (CONTENTS[this.currentTab-1].classList.contains("content__console")) {
                CONTENTS[this.currentTab-1].scrollTop = CONTENTS[this.currentTab-1].scrollHeight;
            }
        },
        members: function() {},
        role: function() { this.showRoleDropdown = false; },
        showMemberView: function() {
            this.showMemberView ?
                CONTENT_MEMBER.member_view_button.classList.add("active") :
                CONTENT_MEMBER.member_view_button.classList.remove("active");
        },
    },
});


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