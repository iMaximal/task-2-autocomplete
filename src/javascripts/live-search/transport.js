import {
    ERROR_CONNECTION,
    NOT_FOUND
} from './constants'

export default class Transport {

    constructor(getState, renderResult, hideLoader) {
        this.getState = getState;
        this.renderResult = renderResult;
        this.hideLoader = hideLoader;
    };

    sendXHR = (id, target, toURL, responseKey) => {

        const xhr = this.getXmlHttp();

        xhr.open('POST', toURL, true);

        const csrfCookie = document.cookie.match(/_csrf=([\w-]+)/);
        if (csrfCookie) {
            xhr.setRequestHeader("X-CSRF-TOKEN", csrfCookie[1]);
        }

        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

        const fieldValue = JSON.stringify({
            name: target.value.trim()
        });

        xhr.send(fieldValue);

        xhr.onreadystatechange = () => {

            if (xhr.readyState !== 4) return;
            // response ready -> cancel loader task
            clearTimeout(this.getState('timer'));

            if (xhr.status !== 200) {
                this.renderResult(target, id, ERROR_CONNECTION);
            } else {
                // all good -> data exist and loaded
                if (this.getState('loader')) {
                    this.hideLoader(target);
                }
                const result = JSON.parse(xhr.responseText);
                if (result.length > 0) {
                    this.renderResult(target, id, result, responseKey);
                } else {
                    this.renderResult(target, id, NOT_FOUND);
                }
            }
        };
    };

    getXmlHttp = () => {
        let xmlhttp;
        try {
            xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (E) {
                xmlhttp = false;
            }
        }
        if (!xmlhttp && typeof XMLHttpRequest !== 'undefined') {
            xmlhttp = new XMLHttpRequest();
        }
        return xmlhttp;
    };
}
