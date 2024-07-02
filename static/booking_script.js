let img = document.getElementById('image');
let spotName = document.getElementById('spotName');
let spotDay = document.getElementById('spotDay');
let spotTime = document.getElementById('spotTime');
let spotPrice = document.getElementById('spotPrice');
let finalPrice = document.getElementById('finalPrice');
let price = "";
let spotPlace = document.getElementById('spotPlace');
let spotId = "";

// JavaScript 檢查區域是否為空
document.addEventListener("DOMContentLoaded", function() {
    // 檢查 token
    let token = localStorage.getItem('token');
    if (token) {
        // getUserData();
        // getUserBookingData();
        execute();
    } else {
        //alert('請先登入會員帳戶');
        window.location.href = `/`;
    }
});

async function execute(){
    try{
        // getUserData()
        //getUserBookingData
        token = localStorage.getItem('token');
        response = await fetch('http://127.0.0.1:8000/api/booking', {
            method: 'GET',
            headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        result = await response.json();
        if(!response.ok){
            console.error('HTTP error', response.status);
            // alert(result.message);
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
            img.src = result.data.attraction.image;
            spotName.textContent = result.data.attraction.name;
            spotDay.textContent = result.data.date;
            spotTime.textContent = result.data.time;
            spotPrice.textContent = "新台幣 " + result.data.price + " 元";
            finalPrice.textContent = "新台幣 " + result.data.price + " 元";
            price = result.data.price;
            spotPlace.textContent = result.data.attraction.address;
            spotId = result.data.attraction.id;

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

async function deleteFetch(){
    token = localStorage.getItem('token');
    let response = await fetch('http://127.0.0.1:8000/api/booking', {
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
        window.location.href = `/booking`;
    }
}

async function deleteEvent(){
    if (confirm("是否確認要刪除這個預訂？")){
        deleteFetch();
    }
    else{
        return;
    }
}

// function disableInteraction() {
//     document.getElementById('card-number').setAttribute('contenteditable', 'false');
//     document.getElementById('card-expiration-date').setAttribute('contenteditable', 'false');
//     document.getElementById('card-ccv').setAttribute('contenteditable', 'false');
//     document.querySelectorAll('button, input').forEach(element => {
//         element.disabled = true;
//     });
// }

// function enableInteraction() {
//     document.getElementById('card-number').setAttribute('contenteditable', 'true');
//     document.getElementById('card-expiration-date').setAttribute('contenteditable', 'true');
//     document.getElementById('card-ccv').setAttribute('contenteditable', 'true');
//     document.querySelectorAll('button, input').forEach(element => {
//         element.disabled = false;
//     });
// }

async function onSubmit(event) {
    event.preventDefault();
    // 禁止使用者在進行期間點選其他的按鈕
    //disableInteraction();
    if (confirm("是否確認要訂購並付款？")){
         // 取得 TapPay Fields 的 status
        const tappayStatus = TPDirect.card.getTappayFieldsStatus();

        // 確認是否可以 getPrime
        if (tappayStatus.canGetPrime === false) {
            // alert('can not get prime');
            alert('信用卡資訊有誤，請確認!');
            //enableInteraction();
            return;
        }
        // Get prime and fetch service
        TPDirect.card.getPrime(async(result) => {
            if (result.status !== 0) {
                //alert('get prime error ' + result.msg); 
                alert('信用卡資訊有誤，請確認!' + result.msg);
                //enableInteraction();
                return;
            }
            let prime = result.card.prime;
            // alert('get prime 成功，prime: ' + result.card.prime);

            // send prime to your server, to pay with Pay by Prime API .
            // Pay By Prime Docs: https://docs.tappaysdk.com/tutorial/zh/back.html#pay-by-prime-api
            //組織前端畫面的資料
            let contactName = document.getElementById('contactName').value;
            let contactEmail = document.getElementById('contactEmail').value;
            let contactNumber = document.getElementById('contactNumber').value;
            let data = {
                prime: prime,
                order:{
                    price: parseInt(price),
                    trip:{
                        attraction:{
                            id: parseInt(spotId),
                            name: spotName.textContent,
                            address: spotPlace.textContent,
                            image:img.src
                        },
                        date: spotDay.textContent,
                        time: spotTime.textContent
                    },
                    contact:{
                        name: contactName,
                        email: contactEmail,
                        phone: contactNumber
                    }
                }
            };
            // console.log("Request body:", data);
            token = localStorage.getItem('token');
            let response = await fetch('http://127.0.0.1:8000/api/orders', {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
        
            let getOrdersResult = await response.json();
            if(!response.ok){
                console.error('HTTP error', response.status);
                alert(getOrdersResult.message);
                //enableInteraction();
                return;
            }
            else{
                // console.log("Result: ", getOrdersResult);
                alert("付款成功！")
                // deleteFetch();
                //enableInteraction();
                window.location.href = `/thankyou?number=${getOrdersResult.data.number}`;
            }
        });
    }
    else{
        //enableInteraction();
        return;
    }
}

// async function confirmAndPay(){
//     if (confirm("是否確認要訂購並付款？")){
//         token = localStorage.getItem('token');
//         let response = await fetch('http://127.0.0.1:8000/api/orders', {
//             method: 'POST',
//             headers:{
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             }
//         });

//         result = await response.json();
//         if(!response.ok){
//             console.error('HTTP error', response.status);
//             alert(result.message);
//             return;
//         }
//         else{
//             window.location.href = `/booking`;
//         }
//     }
//     else{
//         return;
//     }
// }

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
