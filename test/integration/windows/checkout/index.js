/* @flow */

import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';
import { CONTEXT } from '@krakenjs/zoid/src';

import { runOnClick } from '../../tests/common';

const { action, type, onRender, onInit } = window.xprops.test;

const actions = {
    close() {
        window.close();
    }
};

const hash = window.location.hash ? `&hash=${ window.location.hash.slice(1) }` : '';

if (action === 'checkout') {

    window.xprops.payment().then(orderID => {

        return ZalgoPromise.try(() => {

            if (window.xprops.init) {
                return window.xprops.init({
                    orderID,
                    cancelUrl: `#cancel?token=${ orderID }${ hash }`
                });
            }

        }).then(() => {

            if (window.xprops.onAuth) {
                return window.xprops.onAuth('xxxyyy');
            }

        }).then(() => {

            window.xprops.onAuthorize({
                orderID,
                intent:     'commit',
                payerID:    'YYYYYYYYYYYYY',
                cancelUrl:  `#cancel?token=${ orderID }${ hash }`,
                returnUrl:  `#return?token=${ orderID }&PayerID=YYYYYYYYYYYYY${ hash }`,
                currentUrl: window.location.href
            }).catch(window.xprops.onError);
        });
    });

} else if (action === 'shippingChange') {

    const onShippingChangeActions = {
        reject:  () => { /* pass */ },
        resolve: () => ZalgoPromise.resolve(),
        order:   { patch: () => ZalgoPromise.resolve() }
    };

    const onShippingAddressChangeActions = {
        reject:  () => { /* pass */ },
        resolve: () => ZalgoPromise.resolve(),
        updateTax: ({ taxAmount }) => ZalgoPromise.resolve(taxAmount),
        updateShippingOptions: ({ shippingOptions }) => ZalgoPromise.resolve(shippingOptions),
        patch : () => ZalgoPromise.resolve(),
        query : () => ZalgoPromise.resolve()
    };

    const onShippingOptionsChangeActions = {
        reject:  () => { /* pass */ },
        resolve: () => ZalgoPromise.resolve(),
        updateShippingOptions: ({ shippingOptions }) => ZalgoPromise.resolve(shippingOptions),
        patch : () => ZalgoPromise.resolve(),
        query : () => ZalgoPromise.resolve()
    };


    if (type === 'noReject') {
        // $FlowFixMe
        delete onShippingChangeActions.reject;
    }

    window.xprops.payment().then(orderID => {
        if (window.xprops.onShippingChange) {
            window.xprops.onShippingChange({
                orderID,
                shipping_address: {
                    city:         'XXXXX',
                    state:        'YY',
                    postal_code:  '11111',
                    country_code: 'YY'
                }
            }, onShippingChangeActions);
        }

        if (window.xprops.onShippingAddressChange) {
            window.xprops.onShippingAddressChange({
                amount: {
                    currency_code: "USD",
                    value: "200.00",
                    breakdown: {
                        item_total: {
                            currency_code: "USD",
                            value: "180.00"
                        },
                        shipping: {
                            currency_code: "USD",
                            value: "5.00"
                        },
                        handling: {
                            currency_code: "USD",
                            value: "1.00"
                        },
                        tax_total: {
                            currency_code: "USD",
                            value: "20.00"
                        }
                    }
                },
                shipping_address: {
                    city: "San Jose",
                    state: "CA",
                    country_code: "US",
                    postal_code: "11111"
                }
            }, onShippingAddressChangeActions);
        }

        if (window.xprops.onShippingOptionsChange) {
            window.xprops.onShippingOptionsChange({
                selected_shipping_option: {
                    label: "Shipping",
                    type: "SHIPPING",
                    amount: {
                      value: "20.00",
                      currency_code: "USD"
                    }
                  }
            }, onShippingOptionsChangeActions);
        }

    });

} else if (action === 'cancel') {

    window.xprops.payment().then(orderID => {

        window.xprops.onCancel({
            orderID,
            cancelUrl: `#cancel?token=${ orderID }${ hash }`
        });
    });

} else if (action === 'popout') {
    runOnClick(() => {
        return window.paypal.Checkout({
            payment:     window.xprops.payment,
            onAuthorize: window.xprops.onAuthorize,
            onCancel:    window.xprops.onCancel,
            onError:     window.xprops.onError
        }).renderTo(window.parent.parent, 'body', CONTEXT.POPUP);
    });

} else if (action === 'error') {

    window.xprops.payment().then(() => {
        window.xprops.onError(new Error('something went wrong'));
    });

} else if (action === 'init') {
    
    window.xprops.payment().then(() => {
        if (onInit) {
            return onInit(actions);
        }
    });
}

if (onRender) {
    onRender(actions);
}
