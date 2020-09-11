'use strict';

var Vue = window.Vue;
var ROLE = window.role;
var SOCKET = window.socket;
new Vue({
  el: 'main',
  data: {
    currentTab: 1,
    members: [],
    memberView: {},
    memberEdit: {},
    memberCount: 0,
    search: '',
    dropdowns: {
      role: {
        name: 'all',
        show: false
      },
      subscription_currency: {
        name: 'EUR',
        show: false
      }
    },
    showMemberView: false,
    showMemberEdit: false,
    release: {},
    logs: [],
    settings: {}
  },
  methods: {
    refresh: function refresh(content) {
      var button;

      if (content === 'members') {
        SOCKET.emit('get-member-list');
        button = document.getElementById('refresh-members');
      } else if (content === 'release') {
        SOCKET.emit('get-release');
        button = document.getElementById('refresh-releases');
      }

      if (button) {
        button.classList.remove('animation');
        setTimeout(function () {
          return button.classList.add('animation');
        }, 10);
      }
    },
    clearInput: function clearInput(element) {
      if (element.target.id === 'search-member') this.search = '';else element.target.value = '';
    },
    addMember: function addMember() {
      if (!ROLE.modify_members) return;
      var userId = prompt("Enter user's Discord id.");
      var role = userId ? prompt('Enter role name.') : undefined;
      if (role) SOCKET.emit('add-member', {
        userId: userId,
        role: role
      });
    },
    deleteMember: function deleteMember() {
      var _this$memberEdit;

      if (!ROLE.modify_members) return;
      if (!((_this$memberEdit = this.memberEdit) === null || _this$memberEdit === void 0 ? void 0 : _this$memberEdit.userId)) return console.error('deleteMember(): User id in \'this.memberEdit\' doesn\'t exist.');
      SOCKET.emit('delete-member', this.memberEdit.userId);
    },
    updateMember: function updateMember(name) {
      var _this$memberEdit2;

      if (!ROLE.modify_members) return;
      if (!((_this$memberEdit2 = this.memberEdit) === null || _this$memberEdit2 === void 0 ? void 0 : _this$memberEdit2.userId)) return console.error('updateMember(): User id in \'this.memberEdit\' doesn\'t exist.');
      SOCKET.emit('update-member', {
        userId: this.memberEdit.userId,
        name: name,
        value: this.memberEdit[name]
      });
    },
    openMemberView: function openMemberView(id) {
      if (!ROLE.view_members) return;
      SOCKET.emit('get-member-view', id);
      this.showMemberView = true;
    },
    closeMemberView: function closeMemberView() {
      var _this = this;

      if (!ROLE.view_members) return;
      var CONTAINER = document.querySelector('.content__members .member-details-view .container');
      if (CONTAINER) CONTAINER.scrollTop = 0;
      setTimeout(function () {
        _this.showMemberView = false;
      }, 0);
    },
    openMemberEdit: function openMemberEdit(id) {
      if (!ROLE.modify_members) return;
      SOCKET.emit('get-member-edit', id);
      this.showMemberEdit = true;
    },
    closeMemberEdit: function closeMemberEdit() {
      var _this2 = this;

      if (!ROLE.modify_members) return;
      var CONTAINER = document.querySelector('.content__members .member-edit-view .container');
      if (CONTAINER) CONTAINER.scrollTop = 0;
      setTimeout(function () {
        _this2.showMemberEdit = false;
      }, 0);
    },
    createRelease: function createRelease() {
      if (!ROLE.create_releases) return;
      var NUMBER = prompt('How many renewal licenses do you want to release?');
      if (NUMBER) SOCKET.emit('create-release', NUMBER);
    },
    deleteRelease: function deleteRelease() {
      if (!ROLE.create_releases) return;
      SOCKET.emit('delete-release');
    },
    updateSetting: function updateSetting(name) {
      if (!ROLE.edit_config) return;
      SOCKET.emit('update-setting', {
        name: name,
        value: this.settings[name]
      });
    }
  },
  filters: {
    capitalize: function capitalize(value) {
      return value.replace(/\b\w/g, function (letter) {
        return letter.toUpperCase();
      });
    }
  },
  computed: {
    filteredMemberList: function filteredMemberList() {
      var _this3 = this;

      if (!this.members || this.members.length === 0) return;
      var members = this.members.filter(function (member) {
        return (member.username.toLowerCase().includes(_this3.search.toLowerCase()) || member.userId === _this3.search) && (_this3.dropdowns.role.name.toLowerCase() !== 'all' ? member.role.name.toLowerCase() === _this3.dropdowns.role.name.toLowerCase() : true);
      });
      members.sort(function (a, b) {
        if (a.role.importance < b.role.importance) return -1;else if (a.role.importance > b.role.importance) return 1;
        if (a.role.name.toLowerCase() < b.role.name.toLowerCase()) return -1;else if (a.role.name.toLowerCase() > b.role.name.toLowerCase()) return 1;
        return a.username.toLowerCase() < b.username.toLowerCase() ? -1 : a.username.toLowerCase() > b.username.toLowerCase() ? 1 : 0;
      });
      this.memberCount = members.length;
      return members;
    }
  },
  watch: {
    currentTab: function currentTab() {
      var TABS = document.querySelectorAll('.tabs-container .tab');
      var CONTENTS = document.querySelectorAll('.content > div');

      switch (this.currentTab) {
        case 1:
          SOCKET.emit('get-member-list');
          break;

        case 2:
          SOCKET.emit('get-release');
          break;

        case 3:
          SOCKET.emit('get-logs');
          break;

        case 4:
          SOCKET.emit('get-settings');
          break;

        default:
          console.error('currentTab(): Tab not found.');
      }

      TABS.forEach(function (tab) {
        tab.classList.remove('active');
      });
      CONTENTS.forEach(function (content) {
        content.classList.remove('active');
      });
      TABS[this.currentTab - 1].querySelector('input').checked = true;
      TABS[this.currentTab - 1].classList.add('active');
      CONTENTS[this.currentTab - 1].classList.add('active');

      if (CONTENTS[this.currentTab - 1].classList.contains('content__console')) {
        CONTENTS[this.currentTab - 1].scrollTop = CONTENTS[this.currentTab - 1].scrollHeight;
      }
    },
    'dropdowns.role.name': function dropdownsRoleName() {
      this.dropdowns.role.show = false;
    },
    memberView: function memberView() {
      if (!this.memberView.username) return;
      setTimeout(function () {
        var username = document.querySelector('.content__members .member-details-view .container h2');
        var firstLoop = true;

        var usernameLoop = function usernameLoop() {
          if (username.offsetWidth + 10 >= 500) {
            if (firstLoop) {
              firstLoop = false;
              username.textContent += '...';
            }

            username.textContent = username.textContent.slice(0, -4) + username.textContent.slice(-3);
            usernameLoop();
          }
        };

        usernameLoop();
      }, 0);
    },
    memberEdit: function memberEdit() {
      if (!this.memberEdit.username) return;
      setTimeout(function () {
        var username = document.querySelector('.content__members .member-edit-view .container h2');
        var firstLoop = true;

        var usernameLoop = function usernameLoop() {
          if (username.offsetWidth + 10 >= 500) {
            if (firstLoop) {
              firstLoop = false;
              username.textContent += '...';
            }

            username.textContent = username.textContent.slice(0, -4) + username.textContent.slice(-3);
            usernameLoop();
          }
        };

        usernameLoop();
      }, 0);
    },
    'memberEdit.subscriptionCurrency': function memberEditSubscriptionCurrency() {
      this.dropdowns.subscription_currency.show = false;
    },
    members: function members() {
      if (!this.members) {
        this.members = [];
      }
    },
    showMemberView: function showMemberView() {
      if (!this.showMemberView) {
        this.memberView = {};
      }
    },
    showMemberEdit: function showMemberEdit() {
      if (!this.showMemberEdit) {
        this.memberEdit = {};
      }
    },
    release: function release() {
      if (!this.release) {
        this.release = {};
      }
    },
    logs: function logs() {
      if (!this.logs) {
        this.logs = [];
      }
    }
  },
  mounted: function mounted() {
    var _this4 = this;

    SOCKET.on('logout', function () {
      window.location.href = '/';
    });
    SOCKET.on('send-message', function (msg) {
      return alert(msg);
    });
    SOCKET.on('send-error', function (msg) {
      console.error(msg);
      alert(msg);
    });
    SOCKET.on('get-member-list', function () {
      return SOCKET.emit('get-member-list');
    });
    SOCKET.on('set-member-list', function (list) {
      _this4.members = list || [];
      usernameLengthMemberList();
    });

    if (ROLE.view_members) {
      SOCKET.on('set-member-view', function (data) {
        _this4.memberView = data || {};
      });
      SOCKET.on('close-member-view', function () {
        return _this4.closeMemberView();
      });
      SOCKET.on('close-member-edit', function () {
        return _this4.closeMemberEdit();
      });
    }

    if (ROLE.modify_members) {
      SOCKET.on('get-member-edit', function () {
        return SOCKET.emit('get-member-edit');
      });
      SOCKET.on('set-member-edit', function (data) {
        _this4.memberEdit = data || {};
      });
    }

    if (ROLE.create_releases) {
      SOCKET.on('get-release', function () {
        return SOCKET.emit('get-release');
      });
      SOCKET.on('set-release', function (data) {
        _this4.release = data || {};
      });
    }

    if (ROLE.view_console) {
      var CONTENT = document.querySelector('.content > div.content__console');
      SOCKET.on('get-logs', function () {
        return SOCKET.emit('get-logs');
      });
      SOCKET.on('send-logs', function (data) {
        _this4.logs = data || [];
        CONTENT.scrollTop = CONTENT.scrollHeight;
      });
    }

    if (ROLE.edit_config) {
      SOCKET.on('get-settings', function () {
        return SOCKET.emit('get-settings');
      });
      SOCKET.on('set-settings', function (data) {
        _this4.settings = data || {};
      });
    }

    var EMITS = [SOCKET.emit('get-member-list')];
    if (ROLE === null || ROLE === void 0 ? void 0 : ROLE['create_releases']) EMITS.push(SOCKET.emit('get-release'));
    if (ROLE === null || ROLE === void 0 ? void 0 : ROLE['view_console']) EMITS.push(SOCKET.emit('get-logs'));
    if (ROLE === null || ROLE === void 0 ? void 0 : ROLE['edit_config']) EMITS.push(SOCKET.emit('get-settings'));
    Promise.all([EMITS]).then(function () {
      usernameLengthMemberList();
      fadeOutLoader();
    })["catch"](console.error);
  }
});

var fadeOutLoader = function fadeOutLoader() {
  var loaderStyle = document.getElementsByClassName('screen-loader')[0].style;
  loaderStyle.opacity = 1 .toString();

  (function fade() {
    (loaderStyle.opacity -= 0.08.toString()) < 0 ? loaderStyle.display = 'none' : setTimeout(fade, 40);
  })();
};

var usernameLengthMemberList = function usernameLengthMemberList() {
  var USERNAMES = document.querySelectorAll('.content__members .member span');
  USERNAMES.forEach(function (username) {
    var firstLoop = true;

    var usernameLoop = function usernameLoop() {
      if (username.offsetWidth + 10 >= 400) {
        if (firstLoop) {
          firstLoop = false;
          username.textContent += '...';
        }

        username.textContent = username.textContent.slice(0, -4) + username.textContent.slice(-3);
        usernameLoop();
      }
    };

    usernameLoop();
  });
};