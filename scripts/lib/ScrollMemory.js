'use strict';

var react = require('react');
var reactRouterDom = require('react-router-dom');

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

/**
 * get the scroll of page
 * @return {number}
 */
var getScrollPage = function getScrollPage() {
  var docScrollTop = 0;

  if (document.documentElement && document.documentElement !== null) {
    docScrollTop = document.documentElement.scrollTop;
  }

  return window.pageYOffset || docScrollTop;
};
/**
 * get the scroll of a parent element
 * @return {number}
 */

var getScrollElement = function getScrollElement(elementId) {
  var elemScrollTop = 0;
  var element = document.getElementById(elementId);

  if (element !== null) {
    elemScrollTop = element.scrollTop;
  }

  return elemScrollTop;
};
/**
 * scroll to y number of a page
 * @param {number} scrollnumber
 * @return {void}
 */

var scrollTo = function scrollTo() {
  var scrollnumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  return window.requestAnimationFrame(function () {
    window.scrollTo(0, scrollnumber);
  });
};
/**
 * scroll to y number inside an element
 * @param {number} scrollnumber
 * @return {void}
 */

var scrollToElement = function scrollToElement() {
  var scrollnumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var elementId = arguments.length > 1 ? arguments[1] : undefined;
  var element = document.getElementById(elementId);

  if (element) {
    element.scrollTop = scrollnumber;
  }
};
/**
 * verif if window exist
 * @return boolean
 */

var isBrowser = function isBrowser() {
  return typeof window !== "undefined";
};

var ScrollMemory =
/*#__PURE__*/
function (_Component) {
  _inherits(ScrollMemory, _Component);

  function ScrollMemory(props) {
    var _this;

    _classCallCheck(this, ScrollMemory);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ScrollMemory).call(this, props)); // add event for click on previous or next browser button

    _this.detectPop = _this.detectPop.bind(_assertThisInitialized(_assertThisInitialized(_this))); // stock location key with scroll associate

    _this.url = new Map();
    return _this;
  }

  _createClass(ScrollMemory, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      window.addEventListener("popstate", this.detectPop);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      window.removeEventListener("popstate", this.detectPop);
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps) {
      if (!isBrowser()) return false;
      var location = this.props.location; // location before change url

      var actual = location; // location after change url

      var next = nextProps.location; // the first page has not key, set "enter" for key

      var key = actual.key || "enter"; // if hash => let the normal operation of the browser

      var locationChanged = (next.pathname !== actual.pathname || next.search !== actual.search) && next.hash === ""; // get scroll of the page or the element before change location

      var scroll = this.props.elementID ? getScrollElement(this.props.elementID) : getScrollPage();

      if (locationChanged) {
        // pass page or element scroll to top
          this.props.elementID ? scrollToElement(0, this.props.elementID) : scrollTo(0); // save scroll with key location

          if (window.$overflowHandler && window.$overflowHandler.enable) {
              this.url.set(key, window.$overflowHandler.scrollPos);
          } else {
              this.url.set(key, scroll);
          }
      } // never render

      return false;
    }
    /**
     * callback for event popstate
     *
     * @memberof ScrollMemory
     */

  }, {
    key: "detectPop",
    value: function detectPop(location) {
      if (!isBrowser()) return;
      var state = location.state; // key or enter page

      var key = state ? state.key : "enter"; // get the next for scroll position

      var nextFind = this.url.get(key); // if find in url map => scroll to position

      if (nextFind) {
        this.props.elementID ? scrollToElement(nextFind, this.props.elementID) : scrollTo(nextFind);
      }
    }
  }, {
    key: "render",
    value: function render() {
      return null;
    }
  }]);

  return ScrollMemory;
}(react.Component);

var ScrollMemory$1 = reactRouterDom.withRouter(ScrollMemory);

module.exports = ScrollMemory$1;
