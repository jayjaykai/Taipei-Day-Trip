// JavaScript 檢查區域是否為空
document.addEventListener("DOMContentLoaded", function() {
    // 檢查 token
    let token = localStorage.getItem('token');
    if (token) {
        // getUserData();
        // getUserBookingData();
        execute();
    } else {
        alert('請先登入會員帳戶');
        window.location.href = `/`;
    }
});

async function execute(){
    try{
        // getUserData()
        let token = localStorage.getItem('token');
        let response = await fetch('http://54.79.121.157:8000/api/user/auth', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        let result = await response.json();
        if (!response.ok){
            console.error('HTTP error', response.status);
            alert(result.message);
            return;
        }

        // console.log(result.data);
        let username = document.getElementById('username');
        username.textContent = "您好，" + result.data.name + "，待預訂的行程如下：";


        //getUserBookingData
        token = localStorage.getItem('token');
        response = await fetch('http://54.79.121.157:8000/api/booking', {
            method: 'GET',
            headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        result = await response.json();
        if(!response.ok){
            console.error('HTTP error', response.status);
            alert(result.message);
            return;
        }
        // console.log(result.data);
        if(result.data.length===0){
            document.querySelector(".footer").classList.add("full-height-footer");
            document.querySelector(".travel-dedails").style.display = 'none';
            document.querySelector(".personInfo").style.display = 'none';
            document.querySelector(".creditCardInfo").style.display = 'none';
            document.querySelector(".confirm").style.display = 'none';
            document.querySelector(".delete-btn").style.display = 'none';
            document.querySelector(".hr1").style.display = 'none';
            document.querySelector(".hr2").style.display = 'none';
            document.querySelector(".hr3").style.display = 'none';
            document.querySelector(".noReservation").style.display = 'block';
        }
        else{
            let img = document.getElementById('image');
            img.src = result.data.attraction.image;
            let spotName = document.getElementById('spotName');
            spotName.textContent = result.data.attraction.name;
            let spotDay = document.getElementById('spotDay');
            spotDay.textContent = result.data.date;
            let spotTime = document.getElementById('spotTime');
            spotTime.textContent = result.data.time;
            let spotPrice = document.getElementById('spotPrice');
            spotPrice.textContent = "新台幣 " + result.data.price + " 元";
            let spotPlace = document.getElementById('spotPlace');
            spotPlace.textContent = result.data.attraction.address;
            document.querySelector(".travel-dedails").style.display = 'grid';
            document.querySelector(".personInfo").style.display = 'flex';
            document.querySelector(".creditCardInfo").style.display = 'flex';
            document.querySelector(".confirm").style.display = 'flex';
            document.querySelector(".delete-btn").style.display = 'block';
            document.querySelector(".hr1").style.display = 'block';
            document.querySelector(".hr2").style.display = 'block';
            document.querySelector(".hr3").style.display = 'block';
        }
    } 
    catch(error){
        console.error('Error:', error);
        return;
    }
}

async function deleteEvent(){
    if (confirm("是否確認要刪除這個預訂？")){
        token = localStorage.getItem('token');
        response = await fetch('http://54.79.121.157:8000/api/booking', {
            method: 'DELETE',
            headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        result = await response.json();
        if(!response.ok){
            console.error('HTTP error', response.status);
            alert(result.message);
            return;
        }
        else{
            // alert("刪除成功");
            window.location.href = `/booking`;
        }
    }
    else{
        return;
    }
}

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

TPDirect.card.onUpdate(function (update) {
    // update.canGetPrime === true
    // --> you can call TPDirect.card.getPrime()
    if (update.canGetPrime) {
        // Enable submit Button to get prime.
        // submitButton.removeAttribute('disabled')
    } else {
        // Disable submit Button to get prime.
        // submitButton.setAttribute('disabled', true)
    }
                                            
    // cardTypes = ['mastercard', 'visa', 'jcb', 'amex', 'unknown']
    if (update.cardType === 'visa') {
        // Handle card type visa.
    }

    // number 欄位是錯誤的
    if (update.status.number === 2) {
        // setNumberFormGroupToError()
    } else if (update.status.number === 0) {
        // setNumberFormGroupToSuccess()
    } else {
        // setNumberFormGroupToNormal()
    }
    
    if (update.status.expiry === 2) {
        // setNumberFormGroupToError()
    } else if (update.status.expiry === 0) {
        // setNumberFormGroupToSuccess()
    } else {
        // setNumberFormGroupToNormal()
    }
    
    if (update.status.ccv === 2) {
        // setNumberFormGroupToError()
    } else if (update.status.ccv === 0) {
        // setNumberFormGroupToSuccess()
    } else {
        // setNumberFormGroupToNormal()
    }
})

// call TPDirect.card.getPrime when user submit form to get tappay prime
// $('form').on('submit', onSubmit)

function onSubmit(event) {
    event.preventDefault()

    // 取得 TapPay Fields 的 status
    const tappayStatus = TPDirect.card.getTappayFieldsStatus()

    // 確認是否可以 getPrime
    if (tappayStatus.canGetPrime === false) {
        alert('can not get prime')
        return
    }

    // Get prime
    TPDirect.card.getPrime((result) => {
        if (result.status !== 0) {
            alert('get prime error ' + result.msg)
            return
        }
        alert('get prime 成功，prime: ' + result.card.prime)

        // send prime to your server, to pay with Pay by Prime API .
        // Pay By Prime Docs: https://docs.tappaysdk.com/tutorial/zh/back.html#pay-by-prime-api
    })
}

// async function getUserData() { 
//     try {
//         let token = localStorage.getItem('token');
//         let response = await fetch('http://127.0.0.1:8000/api/user/auth', {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             }
//         });
        
//         // if (response.status === 403) {
//         //     alert('無效的憑證，請重新登入');
//         //     window.location.href = `/`;
//         //     return;
//         // }

//         let result = await response.json();
//         if (!response.ok) {
//             console.error('HTTP error', response.status);
//             alert(result.message);
//             window.location.href = `/`;
//         }

//         // console.log(result.data);
//         let username = document.getElementById('username');
//         username.textContent = result.data.name;
//     } 
//     catch (error) {
//         console.error('Error:', error);
//     }
// }

// async function getUserBookingData() { 
//     let token = localStorage.getItem('token');
//     let response = await fetch('http://127.0.0.1:8000/api/booking', {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//         }
//     });

//     let result = await response.json();
//     if (!response.ok) {
//         console.error('HTTP error', response.status);
//         alert(result.message);
//         return;
//     }
//     console.log(result.data);
//     let img = document.getElementById('image');
//     img.src = result.data.attraction.image;
//     let spotName = document.getElementById('spotName');
//     spotName.textContent = result.data.attraction.name;
//     let spotDay = document.getElementById('spotDay');
//     spotDay.textContent = result.data.date;
//     let spotTime = document.getElementById('spotTime');
//     spotTime.textContent = result.data.time;
//     let spotPrice = document.getElementById('spotPrice');
//     spotPrice.textContent = result.data.price;
//     let spotPlace = document.getElementById('spotPlace');
//     spotPlace.textContent = result.data.attraction.address;
// }
