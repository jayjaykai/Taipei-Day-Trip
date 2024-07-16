function showUserInfo() {
    document.getElementById("userInfo").style.display = "block";
    document.getElementById("orderInfo").style.display = "none";
}

function showOrderInfo() {
    document.getElementById("userInfo").style.display = "none";
    document.getElementById("orderInfo").style.display = "block";
    getOderInfo();
}

function EditUserEmail() {
    const enrolEmailDiv = document.getElementById('enrolEmail');
    if (document.getElementById('emailInput')) {
        return;
    }
    const emailText = enrolEmailDiv.textContent;

    let input = document.createElement('input');
    input.className = 'input-value';
    input.type = 'email';
    input.id = 'emailInput';
    input.value = emailText;

    let buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    let saveButton = document.createElement('button');
    saveButton.textContent = '更新 Email';
    saveButton.onclick = () => saveEmail(input.value);

    let cancelButton = document.createElement('button');
    cancelButton.textContent = '取消';
    cancelButton.onclick = () => cancelEdit(emailText);

    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(cancelButton);

    enrolEmailDiv.innerHTML = '';
    enrolEmailDiv.appendChild(input);
    enrolEmailDiv.appendChild(buttonContainer);
}

async function saveEmail(newEmail) {
    if (validateEmail(newEmail)) {
        let token = localStorage.getItem('token');
        let response = await fetch('/api/user/edit', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email: newEmail })
        });

        let editUserInfo = await response.json();
        if(!response.ok){
            console.error('HTTP error', response.status);
            alert(editUserInfo.message);
            return;
        }
        else{
            const enrolEmailDiv = document.getElementById('enrolEmail');
            enrolEmailDiv.textContent = newEmail;
        }
        alert(editUserInfo.message);
        localStorage.setItem('token', editUserInfo.token);
    } else {
        alert('請輸入有效的電子郵件');
    }
}

function cancelEdit(originalEmail) {
    let enrolEmailDiv = document.getElementById('enrolEmail');
    enrolEmailDiv.textContent = originalEmail;
}

function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

async function EditUserName(){
    let enrolNameDiv = document.getElementById('enrolName');
    if (document.getElementById('nameInput')) {
        return;
    }
    let currentName = enrolNameDiv.textContent;

    let input = document.createElement('input');
    input.className = 'input-value';
    input.type = 'text';
    input.id = 'nameInput';
    input.value = currentName;

    let buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    let saveButton = document.createElement('button');
    saveButton.textContent = '更新註冊姓名';
    saveButton.onclick = () => saveUserName(input.value);

    let cancelButton = document.createElement('button');
    cancelButton.textContent = '取消';
    cancelButton.onclick = () => cancelNameEdit(currentName);

    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(cancelButton);


    enrolNameDiv.innerHTML = '';
    enrolNameDiv.appendChild(input);
    enrolNameDiv.appendChild(buttonContainer);
}

async function saveUserName(newName) {
    if (!newName.trim()) {
        alert('新姓名不能為空值!');
        return;
    }

    let token = localStorage.getItem('token');
    let response = await fetch('/api/user/edit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName })
    });

    let editUserInfo = await response.json();
    if (!response.ok) {
        console.error('HTTP error', response.status);
        alert(editUserInfo.message);
        return;
    } else {
        const enrolNameDiv = document.getElementById('enrolName');
        enrolNameDiv.textContent = newName;
        alert(editUserInfo.message);
        localStorage.setItem('token', editUserInfo.token);
    }
}

function cancelNameEdit(originalName) {
    const enrolNameDiv = document.getElementById('enrolName');
    enrolNameDiv.textContent = originalName;
}

async function getOderInfo(){
    let token = localStorage.getItem('token');
    let response = await fetch('/api/orders', {
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
    let response = await fetch('/api/upload', {
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