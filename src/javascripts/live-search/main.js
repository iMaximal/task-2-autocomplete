import {
    ARROW_LEFT,
    ARROW_UP,
    ARROW_RIGHT,
    ARROW_DOWN,
    CSS_BLIND,
    CSS_HIGHLIGHTED,
    ESC,
    ENTER,
    NOT_CHOICE,
} from './constants'
import View from './view';
import Transport from './transport';

export default class LiveSearch {
    constructor(options) {
        const {selector, idOutputResult, postToURL, responseKey} = options;
        this.state = {
            // element has value from user (enter or match from list) -> no show error if focus out
            selected: false,
            // state for prevent additional request
            request: false,
            timer: null,
            // global var for drop-down list
            updown: -1
        };

        this.view = new View(
            param => this.getState(param),
            obj => this.changeState(obj),
        );

        this.transport = new Transport(
            param => this.getState(param),
            (...args) => this.view.renderResult(...args),
            target => this.view.renderResult(target)
            );


        this.elInput = document.querySelector(selector);

        this.elInput.addEventListener('keyup', this.doLiveSearch.bind(null, idOutputResult, postToURL, responseKey));
        this.elInput.addEventListener('keydown', this.navigationInResults.bind(null, idOutputResult));
        this.elInput.addEventListener('focus', this.focusInEvent);
        this.elInput.addEventListener('blur', this.validate.bind(null, idOutputResult));
    }

    getState = param => {
      return this.state[param]
    };

    changeState = obj => {
        this.state = {...this.state, ...obj}
    };


    doLiveSearch = (id, toURL, responseKey, event) => {
        event.preventDefault();
        const target = event.target || event.srcElement;
        // handler for ESC
        if (event.keyCode === ESC) {

            if (target.value === this.view.state.firstResult) {
                this.state.selected = true;
            }
            this.view.removeSearchResult(id);
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
            this.view.removeSearchResult(id);
            return false;
        }

        if (this.state.request === true) {
            return false;
        }

        this.newRequestHandler(target);

        this.transport.sendXHR(id, target, toURL, responseKey);
    };

    newRequestHandler = (target) => {
        this.state.selected = false;
        this.view.state.firstResult = null;
        // throttle
        this.state.request = true;
        setTimeout(() => {
            this.state.request = false;
        }, 15);
        // show loader
        this.state.timer = setTimeout(() => {
            this.view.showLoader(target);
        }, 500);
    };


    navigationInResults = (id, event) => {
        const elem = document.getElementById(id);

        if (elem && elem.firstElementChild.className !== CSS_BLIND) {
            const length = elem.childNodes.length - 1;

            if (this.state.updown !== -1 && typeof(elem.childNodes[this.state.updown]) !== 'undefined') {
                elem.childNodes[this.state.updown].className = '';
            }

            // Up
            if (event.keyCode === ARROW_UP) {
                this.state.updown = ( this.state.updown > 0 ) ? --this.state.updown : this.state.updown;
            } // Down
            else if (event.keyCode === ARROW_DOWN) {
                this.state.updown = ( this.state.updown < length ) ? ++this.state.updown : this.state.updown;
            }

            if (this.state.updown >= 0 && this.state.updown <= length) {
                elem.childNodes[this.state.updown].className = CSS_HIGHLIGHTED;

                let text = elem.childNodes[this.state.updown].text;
                if (typeof(text) === 'undefined') {
                    text = elem.childNodes[this.state.updown].innerText;
                }
                // handler for Enter
                if (event.keyCode === ENTER) {
                    this.elInput.value = text;
                    this.state.selected = true;
                    this.view.focusNextElement();
                }
            }
        }

        return false;
    };


    focusInEvent = event => {
        const el = event.target || event.srcElement;
        this.view.resetError(el);
        this.view.moveScrollUp(el);
    };


    validate = (id, event) => {
        if (this.state.selected) return;
        const target = event.target || event.srcElement;

        if (this.view.state.loader || this.view.state.firstResult === null) {
            this.view.showError(target, NOT_CHOICE);
        } else {
            // not found & server error
            if (this.view.state.error === true) {
                this.view.showError(target, NOT_CHOICE);
                // insert same value to field
            } else if (target.value.toLowerCase() === this.view.state.firstResult.toLowerCase()) {
                target.value = this.view.state.firstResult;
                this.state.selected = true;
            }
        }
        this.view.removeSearchResult(id);
    };

}


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

