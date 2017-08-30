import Promise from 'promise-polyfill';
import {request} from 'fetch-to-request'


export default class Transport {

    constructor(responseHandler) {
        this.responseHandler = responseHandler;

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
                this.responseHandler(target, id, response, responseKey);
            })
            // error object { status, message }
            .catch(error => {
                this.responseHandler(target, id, 503);
            })

    };

}
