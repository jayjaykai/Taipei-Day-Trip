TPDirect.setupSDK(151148, 'app_NRKxxIMkHz4HbAmtkuu3hZZHPh1S0njrXw1vZK9EYMbmLFIeRCYxGqgBGxdY', 'sandbox') // APP_ID: 151148 APP_KEY:app_NRKxxIMkHz4HbAmtkuu3hZZHPh1S0njrXw1vZK9EYMbmLFIeRCYxGqgBGxdY
// 以下提供必填 CCV 以及選填 CCV 的 Example
// 必填 CCV Example
var fields = {
    number: {
        // css selector
        element: '#card-number',
        placeholder: '**** **** **** ****'
    },
    expirationDate: {
        // DOM object
        element: document.getElementById('card-expiration-date'),
        placeholder: 'MM / YY'
    },
    ccv: {
        element: '#card-ccv',
        placeholder: '後三碼'
    }
}

TPDirect.card.setup({
    fields: fields,
    styles: {
        // Style all elements
        'input': {
            'color': 'gray'
        },
        // Styling ccv field
        'input.ccv': {
            // 'font-size': '16px'
        },
        // Styling expiration-date field
        'input.expiration-date': {
            // 'font-size': '16px'
        },
        // Styling card-number field
        'input.card-number': {
            // 'font-size': '16px'
        },
        // style focus state
        ':focus': {
            // 'color': 'black'
        },
        // style valid state
        '.valid': {
            'color': 'green'
        },
        // style invalid state
        '.invalid': {
            'color': 'red'
        },
        // Media queries
        // Note that these apply to the iframe, not the root window.
        '@media screen and (max-width: 400px)': {
            'input': {
                'color': 'orange'
            }
        }
    },
    // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
    isMaskCreditCardNumber: true,
    maskCreditCardNumberRange: {
        beginIndex: 6, 
        endIndex: 11
    }
})

document.addEventListener("DOMContentLoaded", function() {
    // listen for TapPay Field
    TPDirect.card.onUpdate(function (update) {
    /* Disable / enable submit button depend on update.canGetPrime  */
    /* ============================================================ */

    // update.canGetPrime === true
    //     --> you can call TPDirect.card.getPrime()
    // const submitButton = document.querySelector('button[type="submit"]')
        if (update.canGetPrime) {
            // submitButton.removeAttribute('disabled')
            $('button[type="submit"]').removeAttr('disabled')
        } else {
            // submitButton.setAttribute('disabled', true)
            $('button[type="submit"]').attr('disabled', true)
        }


        /* Change card type display when card type change */
        /* ============================================== */

        // cardTypes = ['visa', 'mastercard', ...]
        // var newType = update.cardType === 'unknown' ? '' : update.cardType
        // $('#cardtype').text(newType)



        /* Change form-group style when tappay field status change */
        /* ======================================================= */

        // number 欄位是錯誤的
        if (update.status.number === 2) {
            setNumberFormGroupToError('.card-number-group')
        } else if (update.status.number === 0) {
            setNumberFormGroupToSuccess('.card-number-group')
        } else {
            setNumberFormGroupToNormal('.card-number-group')
        }

        if (update.status.expiry === 2) {
            setNumberFormGroupToError('.expiration-date-group')
        } else if (update.status.expiry === 0) {
            setNumberFormGroupToSuccess('.expiration-date-group')
        } else {
            setNumberFormGroupToNormal('.expiration-date-group')
        }

        if (update.status.ccv === 2) {
            setNumberFormGroupToError('.ccv-group')
        } else if (update.status.ccv === 0) {
            setNumberFormGroupToSuccess('.ccv-group')
        } else {
            setNumberFormGroupToNormal('.ccv-group')
        }
    })
});