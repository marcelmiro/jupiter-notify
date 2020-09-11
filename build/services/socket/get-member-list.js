'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../../database/repositories/user-roles'),
    listUsersAndRolesFromUserRoles = _require.listUsersAndRolesFromUserRoles;

module.exports = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(socket) {
    var _socket$request$role, userList, USERS;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if ((_socket$request$role = socket.request.role) === null || _socket$request$role === void 0 ? void 0 : _socket$request$role['admin_panel']) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return", socket.disconnect());

          case 3:
            userList = [];
            _context.next = 6;
            return listUsersAndRolesFromUserRoles();

          case 6:
            USERS = _context.sent;
            USERS.forEach(function (user) {
              userList.push({
                userId: user.user_id,
                username: user.username,
                avatarUrl: user.avatar_url ? user.avatar_url.includes('.png') ? user.avatar_url : user.avatar_url.slice(0, user.avatar_url.indexOf('?size=')) + '.png' + user.avatar_url.slice(user.avatar_url.indexOf('?size=')) : 'https://cdn.discordapp.com/embed/avatars/1.png?size=2048',
                role: {
                  name: user.name,
                  importance: user.importance || 10,
                  color: user.color
                }
              });
            });
            socket.emit('set-member-list', userList);
            _context.next = 14;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](0);
            console.error(_context.t0);

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 11]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();