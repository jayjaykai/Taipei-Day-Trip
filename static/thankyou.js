let token = localStorage.getItem('token');

function getQueryParams() {
    let searchParams = new URLSearchParams(window.location.search);
    let number = searchParams.get('number');
    if (number) {
        console.log(number);
        return number;
    } else {
        console.log("None");
        return null;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    // 檢查 token
    if (token) {
        getOderInfo();
    } else {
        window.location.href = `/`;
    }
});

async function getOderInfo(){
    let response = await fetch('http://127.0.0.1:8000/api/orders', {
        method: 'GET',
        headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    let getOrdersInfo = await response.json();
    if(!response.ok){
        console.error('HTTP error', response.status);
        alert(getOrdersInfo.message);
        return;
    }
    else{
        let orderNum = document.getElementById('order_num');
        orderNum.textContent = getQueryParams();
        console.log("orderNum: ", orderNum.textContent);
        console.log("Result: ", getOrdersInfo);
    }
}