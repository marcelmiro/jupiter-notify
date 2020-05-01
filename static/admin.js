let app = new Vue({
    el: "main",
    data: {
        currentTab: 1,
        members: [],
        memberDetails: {},
        memberEdit: {},
        memberCount: 0,
        role: "all",
        search: "",
        showRoleDropdown: false,
        showMemberDetails: false,
        showMemberEdit: false,
        release: {},
        logs: "",
        settings: {},
    },

    methods: {
        refresh: function(content) {
            let button = undefined;
            if (content === "members") {
                SOCKET.emit("get-member-list");
                button = document.getElementById("refresh-members");
            } else if (content === "release") {
                SOCKET.emit("get-release");
                button = document.getElementById("refresh-releases");
            }

            if (button) {
                button.classList.remove("animation");
                setTimeout(() => {
                    button.classList.add("animation");
                }, 10);
            }
        },

        addMember: ROLE && ROLE["perms"] && ROLE["perms"]["modify_members"] ? function() {
            const USER_ID = prompt("Enter user's Discord id.");
            const ROLE = USER_ID ? prompt("Enter role name.") : undefined;
            if (ROLE) {
                SOCKET.emit("add-member", { user_id: USER_ID, role: ROLE });
                SOCKET.emit("get-member-list");
            }
        } : function(){},
        deleteMember: ROLE && ROLE["perms"] && ROLE["perms"]["modify_members"] ? function(id) {
            SOCKET.emit("delete-member", id);
        } : function(){},
        updateMember: ROLE && ROLE["perms"] && ROLE["perms"]["modify_members"] ? function(userId, name) {
            SOCKET.emit("update-member", { user_id: userId, name: name, value: this.memberEdit[name] });
        } : function(){},

        openMemberDetailsView: ROLE && ROLE["perms"] && ROLE["perms"]["view_members"] ? function(id) {
            SOCKET.emit("get-member-details", id);
            this.showMemberDetails = true;
        } : function(){},
        closeMemberDetailsView: ROLE && ROLE["perms"] && ROLE["perms"]["view_members"] ? function() {
            const CONTAINER = document.querySelector('.content__members .member-details-view .container');
            if (CONTAINER) CONTAINER.scrollTop = 0;
            setTimeout(() => { this.showMemberDetails = false }, 0);
        } : function(){},

        openMemberEditView: ROLE && ROLE["perms"] && ROLE["perms"]["modify_members"] ? function(id) {
            SOCKET.emit("get-member-edit", id);
            this.showMemberEdit = true;
        } : function(){},
        closeMemberEditView: ROLE && ROLE["perms"] && ROLE["perms"]["modify_members"] ? function() {
            const CONTAINER = document.querySelector('.content__members .member-edit-view .container');
            if (CONTAINER) CONTAINER.scrollTop = 0;
            setTimeout(() => { this.showMemberEdit = false }, 0);
        } : function(){},

        createRelease: ROLE && ROLE["perms"] && ROLE["perms"]["create_releases"] ? function() {
            const NUMBER = prompt("How many renewal licenses do you want to release?");
            if (NUMBER) { SOCKET.emit("create-release", NUMBER); }
        } : function(){},
        deleteRelease: ROLE && ROLE["perms"] && ROLE["perms"]["create_releases"] ? function() {
            SOCKET.emit("delete-release");
        } : function(){},

        updateSetting: ROLE && ROLE["perms"] && ROLE["perms"]["edit_config"] ? function(name) {
            SOCKET.emit("update-setting", { name: name, value: this.settings[name] });
        } : function(){},
    },

    filters: {
        capitalize: value => {
            return value.replace(/\b\w/g, letter => letter.toUpperCase());
        }
    },

    computed: {
        filteredMemberList: ROLE && ROLE["perms"] && ROLE["perms"]["view_members"] ? function() {
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
        } : function(){},
        filteredLogs: ROLE && ROLE["perms"] && ROLE["perms"]["view_console"] ? function() {
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
        } : function(){},
    },

    watch: {
        currentTab: {
            immediate: true,
            handler() {
                const TABS = document.querySelectorAll(".tabs-container .tab");
                const CONTENTS = document.querySelectorAll(".content > div");

                //  Check currentTab to receive content information from socket.
                switch (this.currentTab) {
                    case 1:
                        SOCKET.emit("get-member-list");
                        break;
                    case 2:
                        SOCKET.emit("get-release");
                        break;
                    case 3:
                        SOCKET.emit("get-logs");
                        break;
                    case 4:
                        SOCKET.emit("get-settings");
                        break;
                }


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
            }
        },
        role: function() { this.showRoleDropdown = false; },
        memberDetails: function() {
            if (this.memberDetails.username) {
                setTimeout(function() {
                    let username = document.querySelector(".content__members .member-details-view .container h2");

                    let firstLoop = true;
                    let usernameLoop = () => {
                        if (username.offsetWidth + 10 >= 500) {
                            if (firstLoop) {
                                firstLoop = false;
                                username.textContent += "...";
                            }
                            username.textContent = username.textContent.slice(0,-4) + username.textContent.slice(-3);
                            usernameLoop();
                        }
                    }
                    usernameLoop();
                }, 0);
            }
        },
        showMemberDetails: function() {
            !this.showMemberDetails ? this.memberDetails = {} : "";
        },
        memberEdit: function() {
            if (this.memberEdit.username) {
                setTimeout(function() {
                    let username = document.querySelector(".content__members .member-edit-view .container h2");

                    let firstLoop = true;
                    let usernameLoop = () => {
                        if (username.offsetWidth + 10 >= 500) {
                            if (firstLoop) {
                                firstLoop = false;
                                username.textContent += "...";
                            }
                            username.textContent = username.textContent.slice(0,-4) + username.textContent.slice(-3);
                            usernameLoop();
                        }
                    }
                    usernameLoop();
                }, 0);
            }
        },
        showMemberEdit: function() {
            !this.showMemberEdit ? this.memberEdit = {} : "";
        },
        release: function() {},
    },

    mounted: function() {
        SOCKET.on("send-message", msg => {
            alert(msg);
            msg.includes("has no role now.") ? this.memberDetails = {} : "";
        });
        SOCKET.on("send-error", msg => {
            console.error(msg);
            alert(msg);
        });

        if (ROLE && ROLE["perms"] && ROLE["perms"]["view_members"]) {
            SOCKET.on("get-member-list", () => {
                SOCKET.emit("get-member-list");
            });
            SOCKET.on("set-member-list", list => {
                this.members = list;
                lengthManager();
            });
            SOCKET.on("set-member-details", data => {
                this.memberDetails = data;
            });
        }
        if (ROLE && ROLE["perms"] && ROLE["perms"]["modify_members"]) {
            SOCKET.on("get-member-edit", () => {
                SOCKET.emit("get-member-edit");
            });
            SOCKET.on("set-member-edit", data => {
                this.memberEdit = data;
            });
        }

        if (ROLE && ROLE["perms"] && ROLE["perms"]["create_releases"]) {
            SOCKET.on("get-release", () => {
                SOCKET.emit("get-release");
            });
            SOCKET.on("set-release", data => {
                this.release = data;
            });
        }

        if (ROLE && ROLE["perms"] && ROLE["perms"]["view_console"]) {
            SOCKET.on("get-logs", () => {
                SOCKET.emit("get-logs");
            });
            SOCKET.on("send-logs", data => {
                this.logs = data;
            });
        }

        if (ROLE && ROLE["perms"] && ROLE["perms"]["edit_config"]) {
            SOCKET.on("get-settings", () => {
                SOCKET.emit("get-settings");
            });
            SOCKET.on("set-settings", data => {
                this.settings = data;
            });
        }
        setTimeout(() => { lengthManager(); }, 200);
    },
});


//  Function to check if length of text is almost greater than its container. If so, loop to
//  reduce last character and check length again until text fits inside container.
function lengthManager() {
    const USERNAMES = document.querySelectorAll(".content__members .member span");

    USERNAMES.forEach(username => {
        let firstLoop = true;
        function usernameLoop() {
            if (username.offsetWidth + 10 >= 400) {
                if (firstLoop) {
                    firstLoop = false;
                    username.textContent += "...";
                }
                username.textContent = username.textContent.slice(0,-4) + username.textContent.slice(-3);
                usernameLoop();
            }
        }
        usernameLoop();
    });
}