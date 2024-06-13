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
    // getUserData()
    try{
        let token = localStorage.getItem('token');
        let response = await fetch('http://127.0.0.1:8000/api/user/auth', {
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
            window.location.href = `/`;
        }

        // console.log(result.data);
        let username = document.getElementById('username');
        username.textContent = result.data.name;


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
        response = await fetch('http://127.0.0.1:8000/api/booking', {
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
