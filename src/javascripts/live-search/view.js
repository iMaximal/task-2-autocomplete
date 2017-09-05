import {
    CSS_BLIND,
    CSS_ERROR_INPUT,
    CSS_ERROR_MESSAGE,
    CSS_HIGHLIGHTED,
    CSS_LOADER
} from './constants'


export default class View {
    constructor(getState, changeState) {
        this.getState = getState;
        this.changeState = changeState;

        this.state = {
            error: false,
            firstResult: null,
            loader: false
        };
    };

    renderResult = (anchor, id, data, responseKey) => {

        if (anchor.classList.contains(CSS_ERROR_INPUT) === true) return;

        const eList = document.createElement('ul');
        eList.id = id;
        let eListElem;
        let eSpanElem;
        let coords = this.getCoords(anchor);
        eList.style.left = coords.left + "px";
        eList.style.top = coords.bottom + "px";

        // if data from server exist -> show results
        if (responseKey) {
            let text = anchor.value;
            // escape special characters
            text = text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            let re = new RegExp("(" + text.split(' ').join('|') + ")", "gi");

            data.forEach((item, i) => {
                eListElem = document.createElement('li');
                // highlight first result
                if (i === 0) {
                    eListElem.className = CSS_HIGHLIGHTED;
                    this.changeState({updown: 0});
                    this.state.firstResult = data[i][responseKey];
                }
                eSpanElem = document.createElement('span');
                eSpanElem.innerHTML = data[i][responseKey].replace(re, "<strong>$&</strong>");
                eListElem.appendChild(eSpanElem);
                eList.appendChild(eListElem);
            })

            // if no data, show why
        } else {
            this.state.firstResult = null;
            this.state.error = true;
            eListElem = document.createElement('li');
            eListElem.className = CSS_BLIND;
            eListElem.appendChild(document.createTextNode(data));
            eList.appendChild(eListElem);
        }
        // delete old, show new
        this.removeSearchResult(id);
        anchor.parentNode.appendChild(eList);
    };

    showLoader = (elem) => {
        if (elem.classList.contains(CSS_ERROR_INPUT) === false) {
            elem.classList.add(CSS_LOADER);
            this.state.loader = true;
        }
    };

    hideLoader = (elem, ms = 1000) => {
        setTimeout(() => {
            elem.classList.remove(CSS_LOADER);
            this.state.loader = false;
        }, ms);
    };

    removeSearchResult = (selectorId) => {
        let searchResult = document.getElementById(selectorId);
        if (searchResult !== null) {
            searchResult.parentNode.removeChild(searchResult);
            this.changeState({updown: -1});
        }
    };

    showError = (anchor, errorMessage) => {
        // for IE9
        if (anchor.value === '' || anchor.value === anchor.getAttribute('placeholder')) return;
        anchor.classList.add(CSS_ERROR_INPUT);
        this.hideLoader(anchor, 4);
        clearTimeout(this.getState('timer'));

        const msgElem = document.createElement('div');
        msgElem.className = CSS_ERROR_MESSAGE;
        msgElem.innerHTML = errorMessage;

        const coords = this.getCoords(anchor);
        msgElem.style.left = coords.left + "px";
        msgElem.style.top = coords.bottom + "px";

        anchor.parentNode.appendChild(msgElem);
    };

    resetError = (el) => {
        el.classList.remove(CSS_ERROR_INPUT);
        if (el.parentNode.lastElementChild.className === CSS_ERROR_MESSAGE) {
            el.parentNode.removeChild(el.parentNode.lastElementChild);
        }
        this.state.error = false;
    };

    moveScrollUp = (el) => {
        const coords = el.getBoundingClientRect();
        const currentBottom = document.documentElement.clientHeight - coords.bottom;
        // up page if necessary
        if (currentBottom < 300) {
            window.scrollBy(0, (300 - currentBottom));
        }
    };

    focusNextElement = () => {
        //add all elements we want to include in our selection
        const focussableElements = 'a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
        if (document.activeElement && document.activeElement.form) {
            const focussable = Array.prototype.filter.call(document.activeElement.form.querySelectorAll(focussableElements),
                (element) => {
                    //check for visibility while always include the current activeElement
                    return element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement
                });
            const index = focussable.indexOf(document.activeElement);
            if (index > -1) {
                const nextElement = focussable[index + 1] || focussable[0];
                nextElement.focus();
            }
        }
    };

    getCoords = (elem) => {
        const box = elem.getBoundingClientRect();

        const body = document.body;
        const docEl = document.documentElement;

        const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
        const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

        const clientTop = docEl.clientTop || body.clientTop || 0;
        const clientLeft = docEl.clientLeft || body.clientLeft || 0;

        const top = box.top + scrollTop - clientTop;
        const bottom = box.bottom + scrollTop - clientTop;
        const left = box.left + scrollLeft - clientLeft;

        return {
            top: top,
            bottom: bottom,
            left: left
        };
    };

}
