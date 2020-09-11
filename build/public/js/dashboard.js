'use strict';

var hasMembership = window.hasMembership;
var LENGTH_DISCORD_USERNAME = {
  container: document.querySelector('.dashboard__welcome .h1-container'),
  element: document.getElementById('discord-username'),
  text: document.getElementById('discord-username').textContent
};
var LENGTH_CC_NAME = hasMembership ? {
  container: document.getElementById('cardholder-container'),
  element: document.getElementById('cardholder-name'),
  text: document.getElementById('cardholder-name').textContent
} : undefined;
window.addEventListener('load', function () {
  layoutHeight();
  lengthManager();
});
window.addEventListener('resize', function () {
  layoutHeight();
  lengthManager();
});

if (document.getElementById('cancel-membership')) {
  document.getElementById('cancel-membership').addEventListener('click', function () {
    document.getElementById('cancel-membership-popup').style.display = 'block';
  });
}

if (document.getElementById('transfer-membership')) {
  document.getElementById('transfer-membership').addEventListener('click', function () {
    document.getElementById('transfer-membership-popup').style.display = 'block';
  });
  document.querySelector('#transfer-membership-popup button').addEventListener('click', function () {
    var VALUE = document.querySelector('#transfer-membership-popup input[type=text]').value;
    if (isNaN(VALUE)) return alert('Input is not a Discord id.');
    window.location.href = '/stripe/transfer-membership/' + VALUE;
  });
}

document.querySelectorAll('.confirm-popup .overlay,' + '.confirm-popup a:nth-of-type(1)').forEach(function (item) {
  item.addEventListener('click', function () {
    document.querySelectorAll('.confirm-popup').forEach(function (popup) {
      popup.style.display = 'none';
    });
  });
});

function lengthManager() {
  LENGTH_DISCORD_USERNAME.element.textContent = LENGTH_DISCORD_USERNAME.text;
  var firstLoop = true;

  var usernameLoop = function usernameLoop() {
    if (LENGTH_DISCORD_USERNAME.element.offsetWidth + 10 >= LENGTH_DISCORD_USERNAME.container.offsetWidth) {
      if (firstLoop) {
        firstLoop = false;
        LENGTH_DISCORD_USERNAME.element.textContent = LENGTH_DISCORD_USERNAME.text + '...';
      }

      var text = LENGTH_DISCORD_USERNAME.element.textContent;
      LENGTH_DISCORD_USERNAME.element.textContent = text.slice(0, -4) + text.slice(-3);
      usernameLoop();
    }
  };

  usernameLoop();

  if (LENGTH_CC_NAME) {
    LENGTH_CC_NAME.element.textContent = LENGTH_CC_NAME.text;
    firstLoop = true;

    var cardNameLoop = function cardNameLoop() {
      if (LENGTH_CC_NAME.element.getBoundingClientRect().width + 10 >= LENGTH_CC_NAME.container.getBoundingClientRect().width) {
        if (firstLoop) {
          firstLoop = false;
          LENGTH_CC_NAME.element.textContent = LENGTH_CC_NAME.text + '...';
        }

        var text = LENGTH_CC_NAME.element.textContent;
        LENGTH_CC_NAME.element.textContent = text.slice(0, -4) + text.slice(-3);
        cardNameLoop();
      }
    };

    cardNameLoop();
  }
}

function layoutHeight() {
  if (document.body.offsetHeight <= window.innerHeight) {
    document.body.style.height = window.innerHeight + 'px';

    if (!document.querySelector('.dashboard').getAttribute('style')) {
      document.querySelector('.dashboard').style.cssText = 'margin: 0 auto; top: calc(50% + 20px); transform: translateY(-50%);';
    }
  }

  if (document.querySelector('.dashboard').offsetHeight + 100 > window.innerHeight) {
    document.body.removeAttribute('style');
    document.querySelector('.dashboard').removeAttribute('style');
  }
}