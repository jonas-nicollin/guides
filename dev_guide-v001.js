(function () {
  'use strict';

  if (window.__guideCopyReady) return;
  window.__guideCopyReady = true;

  var config = Object.assign({
    customClassPrefix: '',
    bodyClass: 'has-guide-copy',
    copyLabel: 'Copier',
    copiedLabel: 'Copié',
    failedLabel: 'Non copié'
  }, window.GUIDE_COPY_CONFIG || {});

  var classPrefix = String(config.customClassPrefix || '').trim();
  if (classPrefix && !classPrefix.endsWith('-')) classPrefix += '-';

  function fallbackCopy(value) {
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.inset = '-9999px auto auto -9999px';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        var copied = document.execCommand('copy');
        textarea.remove();
        if (copied) resolve();
        else reject(new Error('Copy command failed'));
      } catch (error) {
        textarea.remove();
        reject(error);
      }
    });
  }

  function copyValue(value) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(value).catch(function () {
        return fallbackCopy(value);
      });
    }
    return fallbackCopy(value);
  }

  function addConfiguredClasses(root) {
    var elements = [];
    if (root && root.nodeType === 1 && root.matches('[class*="guide-copy-"]')) elements.push(root);
    elements = elements.concat(Array.from((root || document).querySelectorAll('[class*="guide-copy-"]')));

    elements.forEach(function (element) {
      if (!classPrefix) return;
      Array.from(element.classList).forEach(function (className) {
        if (className.indexOf('guide-copy-') === 0) {
          element.classList.add(classPrefix + className);
        }
      });
    });

    if (!elements.length || !document.body) return;
    document.body.classList.add(config.bodyClass || 'has-guide-copy');
    if (classPrefix) document.body.classList.add(classPrefix + (config.bodyClass || 'has-guide-copy'));
  }

  function setButtonState(button, label, copied) {
    var action = button.querySelector('.guide-copy-action');
    if (!action) return;

    window.clearTimeout(button.__guideCopyTimer);
    action.textContent = label;
    button.classList.toggle('is-copied', copied);

    button.__guideCopyTimer = window.setTimeout(function () {
      action.textContent = config.copyLabel;
      button.classList.remove('is-copied');
    }, 1600);
  }

  function initialize(root) {
    addConfiguredClasses(root && root.nodeType ? root : document);
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest('.guide-copy-item[data-copy]');
    if (!button) return;

    copyValue(button.getAttribute('data-copy') || '').then(function () {
      setButtonState(button, config.copiedLabel, true);
    }).catch(function () {
      setButtonState(button, config.failedLabel, false);
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initialize(document); }, { once: true });
  } else {
    initialize(document);
  }

  document.addEventListener('mercury:load', function () { initialize(document); });
})();
