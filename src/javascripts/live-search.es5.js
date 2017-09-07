import {
    ARROW_LEFT,
    ARROW_UP,
    ARROW_RIGHT,
    ARROW_DOWN,
    ESC,
    ENTER,
    ERROR_CONNECTION,
    NOT_CHOICE,
    ERROR_NOT_FOUND
} from './live-search/constants'


var LiveSearch = (function () {
    "use strict";

    function liveSearch(options) {
        var elInput = document.querySelector(options.selector);

        elInput.addEventListener('keyup', doLiveSearch.bind(null, options.idOutputResult, options.postToURL, options.responseKey));
        elInput.addEventListener('keydown', upDownEvent.bind(null, options.idOutputResult));
        elInput.addEventListener('focus', focusInEvent);
        elInput.addEventListener('blur', validate.bind(null, options.idOutputResult));

        var state = {
            // element has value from user (enter or match from list) -> no show error if focus out
            selected: false,
            // state for prevent additional request
            request: false,
            loader: false,
            timer: null
        };

        // global var for drop-down list
        var updown = -1;

        function doLiveSearch(id, toURL, responseKey, event) {
            event.preventDefault();
            var target = event.target || event.srcElement;

            // handler for ESC
            if (event.keyCode === ESC) {
                try {
                    var firstSearchResult = document.getElementById(id).firstElementChild.textContent;
                } catch (e) {
                    firstSearchResult = null;
                }
                if (target.value === firstSearchResult) {
                    state.selected = true;
                }
                removeSearchResult(id);
                return false;
            }

            // handler for <- ->
            if (event.keyCode === ARROW_LEFT || event.keyCode === ARROW_RIGHT) {
                return false;
            }

            // handler for up & down arrow
            if (event.keyCode === ARROW_UP || event.keyCode === ARROW_DOWN) {
                return false;
            }

            if (target.value === '') {
                removeSearchResult(id);
                return false;
            }

            if (state.request === true) {
                return false;
            }

            newRequestHandler(target);

            sendXHR(id, target, toURL, responseKey);
        }

        function newRequestHandler(target) {
            state.selected = false;
            // throttle
            state.request = true;
            setTimeout(function () {
                state.request = false;
            }, 15);
            // show loader
            state.timer = setTimeout(function () {
                showLoader(target);
            }, 500);
        }

        function sendXHR(id, target, toURL, responseKey) {
            var xhr = getXmlHttp();

            xhr.open('POST', toURL, true);

            var csrfCookie = document.cookie.match(/_csrf=([\w-]+)/);
            if (csrfCookie) {
                xhr.setRequestHeader("X-CSRF-TOKEN", csrfCookie[1]);
            }

            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

            var fieldValue = JSON.stringify({
                name: target.value.trim()
            });

            xhr.send(fieldValue);

            xhr.onreadystatechange = function () {

                if (xhr.readyState !== 4) return;
                // response ready -> cancel loader task
                clearTimeout(state.timer);

                if (xhr.status !== 200) {
                    showSearchResult(target, id, ERROR_CONNECTION);
                } else {
                    // all good -> data exist and loaded
                    if (state.loader) {
                        hideLoader(target);
                    }
                    var result = JSON.parse(xhr.responseText);
                    if (result.length > 0) {
                        showSearchResult(target, id, result, responseKey);
                    } else {
                        showSearchResult(target, id, ERROR_NOT_FOUND);
                    }
                }
            };
        }

        function upDownEvent(id, event) {
            var elem = document.getElementById(id);

            if (elem && elem.firstElementChild.className !== 'blind') {
                var length = elem.childNodes.length - 1;

                if (updown !== -1 && typeof(elem.childNodes[updown]) !== 'undefined') {
                    elem.childNodes[updown].className = '';
                }

                // Up
                if (event.keyCode === ARROW_UP) {
                    updown = ( updown > 0 ) ? --updown : updown;
                } // Down
                else if (event.keyCode === ARROW_DOWN) {
                    updown = ( updown < length ) ? ++updown : updown;
                }

                if (updown >= 0 && updown <= length) {
                    elem.childNodes[updown].className = 'highlighted';

                    var text = elem.childNodes[updown].text;
                    if (typeof(text) === 'undefined') {
                        text = elem.childNodes[updown].innerText;
                    }
                    // handler for Enter
                    if (event.keyCode === ENTER) {
                        elInput.value = text;
                        state.selected = true;
                        focusNextElement();
                    }
                }
            }

            return false;
        }

        function showSearchResult(anchor, id, data, responseKey) {
            if (anchor.classList.contains('error') === true) return;

            var eList = document.createElement('ul');
            eList.id = id;
            var eListElem;
            var eSpanElem;
            var coords = getCoords(anchor);
            eList.style.left = coords.left + "px";
            eList.style.top = coords.bottom + "px";

            // if data from server exist -> show results
            if (responseKey) {
                var text = anchor.value;
                // escape special characters
                text = text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                var re = new RegExp("(" + text.split(' ').join('|') + ")", "gi");
                for (var i = 0; i < data.length; i++) {
                    eListElem = document.createElement('li');
                    // highlight first result
                    if (i === 0) {
                        eListElem.className = 'highlighted';
                        updown = 0;
                    }
                    eSpanElem = document.createElement('span');
                    eSpanElem.innerHTML = data[i][responseKey].replace(re, "<strong>$&</strong>");
                    eListElem.appendChild(eSpanElem);
                    eList.appendChild(eListElem);
                }
                // if no data, show why
            } else {
                eListElem = document.createElement('li');
                eListElem.className = 'blind';
                eListElem.appendChild(document.createTextNode(data));
                eList.appendChild(eListElem);
            }

            removeSearchResult(id);
            anchor.parentNode.appendChild(eList);
        }

        function showLoader(elem) {
            if (elem.classList.contains('error') === false) {
                elem.classList.add('loading');
                state.loader = true;
            }
        }

        function hideLoader(elem, ms) {
            var ms = ms || 1000;
            setTimeout(function () {
                elem.classList.remove('loading');
                state.loader = false;
            }, ms);
        }

        function removeSearchResult(selectorId) {
            var searchResult = document.getElementById(selectorId);
            if (searchResult !== null) {
                searchResult.parentNode.removeChild(searchResult);
                updown = -1;
            }
        }

        function focusNextElement() {
            //add all elements we want to include in our selection
            var focussableElements = 'a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
            if (document.activeElement && document.activeElement.form) {
                var focussable = Array.prototype.filter.call(document.activeElement.form.querySelectorAll(focussableElements),
                    function (element) {
                        //check for visibility while always include the current activeElement
                        return element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement
                    });
                var index = focussable.indexOf(document.activeElement);
                if (index > -1) {
                    var nextElement = focussable[index + 1] || focussable[0];
                    nextElement.focus();
                }
            }
        }

        function showError(anchor, errorMessage) {
            // for IE9
            if (anchor.value === '' || anchor.value === anchor.getAttribute('placeholder')) return;
            anchor.classList.add('error');
            hideLoader(anchor, 4);
            clearTimeout(state.timer);

            var msgElem = document.createElement('div');
            msgElem.className = "error-message";
            msgElem.innerHTML = errorMessage;

            var coords = getCoords(anchor);
            msgElem.style.left = coords.left + "px";
            msgElem.style.top = coords.bottom + "px";

            anchor.parentNode.appendChild(msgElem);
        }

        function focusInEvent(event) {
            var el = event.target || event.srcElement;
            resetError(el);
            moveScrollUp(el);
        }

        function moveScrollUp(el) {
            var coords = el.getBoundingClientRect();
            var currentBottom = document.documentElement.clientHeight - coords.bottom;
            // up page if necessary
            if (currentBottom < 300) {
                window.scrollBy(0, (300 - currentBottom));
            }
        }

        function resetError(el) {
            el.classList.remove('error');
            if (el.parentNode.lastElementChild.className === "error-message") {
                el.parentNode.removeChild(el.parentNode.lastElementChild);
            }
        }

        function validate(id, event) {
            if (state.selected) return;
            var target = event.target || event.srcElement;

            try {
                var firstSearchResult = document.getElementById(id).firstElementChild;
            } catch (e) {
                firstSearchResult = null;
            }
            // if the loader is shown OR not response
            if (state.loader || firstSearchResult === null) {
                showError(target, NOT_CHOICE);
            } else {
                // not found & server error
                if (firstSearchResult.className === 'blind') {
                    showError(target, NOT_CHOICE);
                    // insert same value to field
                } else if (target.value.toLowerCase() === firstSearchResult.textContent.toLowerCase()) {
                    target.value = firstSearchResult.textContent;
                    state.selected = true;
                }
            }
            removeSearchResult(id);
        }

        function getCoords(elem) {
            var box = elem.getBoundingClientRect();

            var body = document.body;
            var docEl = document.documentElement;

            var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
            var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

            var clientTop = docEl.clientTop || body.clientTop || 0;
            var clientLeft = docEl.clientLeft || body.clientLeft || 0;

            var top = box.top + scrollTop - clientTop;
            var bottom = box.bottom + scrollTop - clientTop;
            var left = box.left + scrollLeft - clientLeft;

            return {
                top: top,
                bottom: bottom,
                left: left
            };
        }

        function getXmlHttp() {
            var xmlhttp;
            try {
                xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (E) {
                    xmlhttp = false;
                }
            }
            if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
                xmlhttp = new XMLHttpRequest();
            }
            return xmlhttp;
        }

    }

    return liveSearch;
})();

/**
 * @selector: string - Required selector for text input field.
 * @idOutputResult: string - ID for div container with results.
 * @postToURL: string - URL for POST (AJAX).
 * @responseKey: string - Key from JSON (DATABASE response). For example: { "city_name": "Екатеринбург" }
 */
new LiveSearch({
    selector: '#city-live-search',
    idOutputResult: 'livesearch_results',
    postToURL: 'search',
    responseKey: 'city_name'
});
new LiveSearch({
    selector: '#street-live-search',
    idOutputResult: 'livesearch_results',
    postToURL: 'search',
    responseKey: 'city_name'
});

