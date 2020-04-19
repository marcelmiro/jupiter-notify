let app = new Vue({
    el: "main",
    data: {
        currentTab: 1,
        members: [],
        memberView: {},
        memberCount: 0,
        role: "all",
        search: "",
        showRoleDropdown: false,
        showMemberView: false,
        logs: "",
        settings: {},
    },

    methods: {
        refreshMembers: function() {
            SOCKET.emit("get-member-list");
            REFRESH_BUTTON.classList.remove("animation");
            setTimeout(() => {
                REFRESH_BUTTON.classList.add("animation");
            }, 0);
        },
        addMember: function() {
            const USER_ID = prompt("Enter user's Discord id.");
            const ROLE = USER_ID ? prompt("Enter role name.") : undefined;
            if (ROLE) {
                SOCKET.emit("add-member", { user_id: USER_ID, role: ROLE });
                SOCKET.emit("get-member-list");
            }
        },
        viewMember: function(id) {
            SOCKET.emit("get-member-details", id);
            this.showMemberView = true;
        },
        memberViewScrollTop: function() {
            setTimeout(() => {
                document.querySelector('.content__members .member-view .container').scrollTop = 0;
            }, 0);
        },
        deleteMember: function(id) {
            SOCKET.emit("delete-member", id);
        },
        updateSetting: function(name) {
            SOCKET.emit("update-setting", { name: name, value: this.settings[name] });
        },
    },

    filters: {
        capitalize: value => {
            return value.replace(/\b\w/g, letter => letter.toUpperCase());
        }
    },

    computed: {
        filteredMemberList: function() {
            let members = this.members.filter(member => {
                return (
                    member.username.toLowerCase().includes(this.search.toLowerCase()) &&
                    (this.role.toLowerCase() !== "all" ? member.role.name.toLowerCase() === this.role.toLowerCase() : true)
                );
            });

            //  Sort on importance, then role name and then username.
            members.sort((a, b) => {
                if (a.role.importance < b.role.importance) {
                    return -1;
                } else if (a.role.importance === b.role.importance) {
                    if (a.role.name.toLowerCase() < b.role.name.toLowerCase()) {
                        return -1;
                    } else if (a.role.name.toLowerCase() === b.role.name.toLowerCase()) {
                        if (a.username.toLowerCase() < b.username.toLowerCase()) {
                            return -1;
                        } else if (a.username.toLowerCase() > b.username.toLowerCase()) {
                            return 1;
                        } else { return 0; }
                    } else { return 1; }
                } else { return 1; }
            });

            this.memberCount = members.length;
            return members;
        },
        filteredLogs: function() {
            console.log(JSON.stringify(this.logs));
            let tempLogs = [];
            let logs = this.logs.split(/\n(?=\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\s)/);

            logs.forEach(log => {
                log = log.replace(/\r\n/g, "<br>");
                log = log.replace(/\r/g, "");
                log = log.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                log = log.replace(/&lt;br&gt;/g, "<br>");
                log = log.replace(/\s{4}/g, "&emsp;&emsp;");

                let tempLog = { time: log.split(" ", 2).join(" ") };
                tempLog.text = log.substring(tempLog.time.length).split(" ").filter(Boolean);
                tempLog.color = tempLog.text[0] === "INFO" ? "#3FBF3F" : tempLog.text[0] === "ERROR" ? "#FF0000" : "#FFFFFF";
                tempLogs.push(tempLog);
            });

            //  Scroll to bottom
            let container = document.querySelector(".content__console");
            setTimeout(() => { container.scrollTop = container.scrollHeight; }, 0);

            return tempLogs;
        }
    },

    watch: {
        currentTab: function() {
            //  On change, remove active class to tabs and contents. Then add to current tab and content.
            //  If content is console, scroll to bottom of box.
            TABS.forEach(t => { t.classList.remove("active"); });
            CONTENTS.forEach(c => { c.classList.remove("active"); });

            TABS[this.currentTab-1].querySelector("input").checked = true;
            TABS[this.currentTab-1].classList.add("active");
            CONTENTS[this.currentTab-1].classList.add("active");
            if (CONTENTS[this.currentTab-1].classList.contains("content__console")) {
                CONTENTS[this.currentTab-1].scrollTop = CONTENTS[this.currentTab-1].scrollHeight;
            }
        },
        role: function() { this.showRoleDropdown = false; },
        memberView: function() { this.showMemberView = Boolean(JSON.stringify(this.memberView) !== "{}"); },
    },

    mounted: function() {
        SOCKET.on("send-message", msg => {
            alert(msg);
            msg.includes("has no role now.") ? this.memberView = {} : "";
        });
        SOCKET.on("send-error", msg => {
            console.error(msg);
            alert(msg);
        });
        SOCKET.on("get-member-list", () => {
            SOCKET.emit("get-member-list");
        });
        SOCKET.on("set-member-list", list => {
            this.members = list;
        });
        SOCKET.on("set-member-details", data => {
            this.memberView = data;
        });
        SOCKET.on("get-logs", () => {
            SOCKET.emit("get-logs");
        });
        SOCKET.on("send-logs", data => {
            this.logs = data;
        });
        SOCKET.on("get-settings", () => {
            SOCKET.emit("get-settings");
        });
        SOCKET.on("set-settings", data => {
            this.settings = data;
        });
    },
});


const TABS = document.querySelectorAll(".tabs-container .tab");
const CONTENTS = document.querySelectorAll(".content > div");
const REFRESH_BUTTON = document.getElementById("refresh-members");