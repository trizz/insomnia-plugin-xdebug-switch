class Xdebug {
  /**
   * Construct the Xdebug class.
   */
  constructor() {
    /*
     * The friendly element is the (unique) class name of the element that is being used
     * to determine the position of the Xdebug switches.
     */
    this.friendlyElement = 'button.urlbar__send-btn';
    this.mutationObservers = ['div.sidebar__menu', 'ul.sidebar__list-root'];
    this.ideKey = 'INSOMNIA';
    this.states = { xdebug: false, profiler: false };
    this.style = require('./styles.js');

    // Only proceed when the Insomnia interface is loaded.
    const checkIfAppIsReady = setInterval(() => {
      if (document.querySelector(this.friendlyElement) !== null) {
        // When the friendly element is loaded remove timer and initialize the plugin.
        clearInterval(checkIfAppIsReady);
        this.initialize();
      }
    }, 100);
  }

  /**
   * Initialize the plugin.
   */
  initialize() {
    // Render the buttons.
    this.render();

    // Create the observers to re-render the buttons.
    const observerOptions = { attributes: true, subtree: true, childList: true, characterData: true };
    const observer = new MutationObserver(() => window.xdebug.render());

    // Add observers to the specified elements.
    for (let i = 0; i < this.mutationObservers.length; i++) {
      observer.observe(document.querySelector(this.mutationObservers[i]), observerOptions);
    }
  }

  /**
   * Render the Xdebug switches left of the 'Send' button.
   */
  render() {
    // Remove all existing instances of the rendered switches.
    Xdebug.remove('xdebugSwitchContainer');

    // Create the HTML container containing the switches.
    let xdebugSwitchContainer = document.createElement('div');
    xdebugSwitchContainer.style.cssText = this.style.container();
    xdebugSwitchContainer.classList.add('xdebugSwitchContainer');

    // Create the switches and add them to the container.
    let xdebugSwitch = this.renderSwitch('xdebug', 'bug', 'bug');
    let profilerSwitch = this.renderSwitch('profiler', 'hourglass-end', 'hourglass-start');

    xdebugSwitchContainer.append(xdebugSwitch);
    xdebugSwitchContainer.append(profilerSwitch);

    // The button container must be placed in the parent of the 'send button' parent.
    let friendlyElementParent = document.querySelector(this.friendlyElement).parentNode;
    friendlyElementParent.parentNode.insertBefore(xdebugSwitchContainer, friendlyElementParent);
  }

  /**
   * Render a switch.
   *
   * @param {string} type The switch type.
   * @param {string} iconOn The font-awesome icon name when the switch is on (without 'fa').
   * @param {string} iconOff The font-awesome icon name when the switch is off (without 'fa').
   * @returns {HTMLElement} The created HTML element.
   */
  renderSwitch(type, iconOn, iconOff) {
    let newSwitch = document.createElement('span');
    newSwitch.style.cssText = this.style.switch();

    newSwitch.innerHTML = this.states[type] ?
      `<i class="fa fa-${iconOn}" style="color: var(--color-success)">` :
      `<i class="fa fa-${iconOff}">`;

    newSwitch.onclick = () => {
      this.states[type] = !this.states[type];
      this.render();
      this.setXdebugCookie();
    };

    return newSwitch;
  }

  /**
   * Append the cookies to the request.
   */
  setXdebugCookie() {
    // Add the created cookie to the Insomnia request.
    module.exports.requestHooks = [
      context => {
        const cookie = this.getCookies(context);
        context.request.setCookie(cookie.name, cookie.data);
      },
    ];
  }

  /**
   * Based on the active switches, create the correct cookies to send along
   * with the request.
   */
  getCookies(context) {
    // Get the IDE key if configured in the environment, or the default IDE key.
    const ideKey = context.request.getEnvironmentVariable('ide-key') || this.ideKey;

    // There must be a default value to enable 'toggling' Xdebug.
    let cookieName = 'INSOMNIA-XDEBUG', cookieData = 'NO VALUE';

    if (this.states.xdebug && this.states.profiler) {
      /*
       *  Because it isn't possible (or I haven't found out how) to
       *  send multiple cookies through the requestHooks, a bit of
       *  creativity is needed to send both Xdebug triggers.
       */
      cookieName = 'XDEBUG_PROFILE=1;XDEBUG_SESSION';
      cookieData = ideKey;
    } else if (this.states.xdebug && !this.states.profiler) {
      cookieName = 'XDEBUG_SESSION';
      cookieData = ideKey;
    } else if (!this.states.xdebug && this.states.profiler) {
      cookieName = 'XDEBUG_PROFILE';
      cookieData = 1;
    }

    return { name: cookieName, data: cookieData };
  }
  /**
   * Remove all element with the given class name.
   *
   * @param className The class names of the element(s) to remove.
   */
  static remove(className) {
    let elementsToRemove = document.getElementsByClassName(className);

    if (elementsToRemove.length > 0) {
      for (let i = 0; i < elementsToRemove.length; i++) {
        elementsToRemove[i].remove();
      }
    }
  }
}

// Load the plugin.
window.xdebug = new Xdebug();
