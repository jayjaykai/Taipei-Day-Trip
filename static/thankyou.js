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
    let response = await fetch('http://54.79.121.157:8000/api/orders', {
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
        orderNum.classList.add('order-number');
        orderNum.textContent = getQueryParams();
        console.log("orderNum: ", orderNum.textContent);
        console.log("Result: ", getOrdersInfo);

        if (getOrdersInfo.ok) {
            displayOrders(getOrdersInfo.orders);
        }
    }
}

function displayOrders(orders) {
    const historyLists = document.getElementById("history_lists");

    if (orders.length === 0) {
        historyLists.innerHTML = "<p>No orders found.</p>";
        return;
    }

    let table = document.createElement("table");
    table.innerHTML = `
        <thead>
            <tr>
                <th>訂單編號</th>
                <th>日期</th>
                <th>時間</th>
                <th>費用</th>
                <th>景點</th>
                <th>訂單生效時間</th>
                <th>訂單狀態</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    let tbody = table.querySelector("tbody");

    orders.forEach(order => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${order.order_number}</td>
            <td>${order.date}</td>
            <td>${order.time}</td>
            <td>${order.price}</td>
            <td>${order.name}</td>
            <td>${order.created_time}</td>
            <td>${order.status}</td>
        `;
        tbody.appendChild(tr);
    });

    historyLists.appendChild(table);
}