import {
    ERROR_CONNECTION,
    NOT_FOUND
} from './constants'
import Promise from 'promise-polyfill';
import {request} from 'fetch-to-request'


export default class Transport {

    constructor(getState, renderResult, hideLoader) {
        this.getState = getState;
        this.renderResult = renderResult;
        this.hideLoader = hideLoader;

        // To add to window
        if (!window.Promise) {
            window.Promise = Promise;
        }
    };

    sendFetch = (id, target, toURL, responseKey) => {
        const csrfCookie = document.cookie.match(/_csrf=([\w-]+)/);

        const options = {
            cache: 'default',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'X-CSRF-TOKEN': csrfCookie[1],
                'Content-Type': 'application/json; charset=utf-8'
            },
            mode: 'cors'
        };

        const data = {name: target.value.trim()};

        request.post(toURL, data, options)
        // response as JSON
            .then(response => {
                // response ready -> cancel loader task
                clearTimeout(this.getState('timer'));

                // all good -> data exist and loaded
                if (this.getState('loader')) {
                    this.hideLoader(target);
                }

                if (response.length > 0) {
                    this.renderResult(target, id, response, responseKey);
                } else {
                    this.renderResult(target, id, NOT_FOUND);
                }
            })
            // error object { status, message }
            .catch(error => {
                this.renderResult(target, id, ERROR_CONNECTION);
            })

    };

}
