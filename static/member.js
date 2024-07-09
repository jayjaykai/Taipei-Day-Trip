async function getUserInfo() {
    let token = localStorage.getItem('token');
    if(!token){
        window.location.href = `/`;
    }
    let response = await fetch('http://54.79.121.157:8000/api/user/auth', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    let result = await response.json();
    if (!response.ok) {
        result = await response.json();
        alert(result.message);
        window.location.href = `/`;
    }

    let enrolName = document.getElementById('enrolName');
    let enrolEmail = document.getElementById('enrolEmail');

    enrolName.textContent = result.data.name;
    enrolEmail.textContent = result.data.email;
}

function showUserInfo() {
    document.getElementById("userInfo").style.display = "block";
    document.getElementById("orderInfo").style.display = "none";
}

function showOrderInfo() {
    document.getElementById("userInfo").style.display = "none";
    document.getElementById("orderInfo").style.display = "block";
    getOderInfo();
}

async function getOderInfo(){
    let token = localStorage.getItem('token');
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
        if (getOrdersInfo.ok) {
            displayOrders(getOrdersInfo.orders);
        }
    }
}

function displayOrders(orders) {
    let historyLists = document.getElementById("history_lists");
    historyLists.innerHTML = "";
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

async function uploadImage(event) {
    let file = event.target.files[0];
    let token = localStorage.getItem('token');
    if (!file) {
        alert('No file selected.');
        return;
    }

    let fileType = file.type;
    console.log(fileType);
    if (fileType !== 'image/jpeg' && fileType !== 'image/jpg' && fileType !== 'image/png') {
        alert('只能上傳 JPG 或 PNG 檔案圖片!');
        return;
    }

    let formData = new FormData();
    formData.append('file', file);
    let response = await fetch('http://54.79.121.157:8000/api/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })

    let getUploadInfo = await response.json();
    if(!response.ok){
        console.error('HTTP error', response.status);
        alert(getUploadInfo.message);
        return;
    }
    else{
        alert(getUploadInfo.message);
        localStorage.setItem('proImg', getUploadInfo.data);
        window.location.href = `/member`;
    }
}

getUserInfo();