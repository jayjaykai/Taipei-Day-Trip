// JavaScript 檢查區域是否為空
document.addEventListener("DOMContentLoaded", function() {
    // 檢查 token 並調用 getUserData
    let token = sessionStorage.getItem('token');
    if (token) {
        getUserData();
    } else {
        alert('請先登入會員帳戶');
        window.location.href = `/`;
    }

    var personInfo = document.querySelector(".personInfo").innerHTML.trim();
    var creditCardInfo = document.querySelector(".creditCardInfo").innerHTML.trim();
    var confirm = document.querySelector(".confirm").innerHTML.trim();

    if (!personInfo && !creditCardInfo && !confirm) {
        document.querySelector(".footer").classList.add("full-height-footer");
        document.querySelector(".hr1").style.display = 'none';
        document.querySelector(".hr2").style.display = 'none';
        document.querySelector(".hr3").style.display = 'none';
    }
});


// document.addEventListener('DOMContentLoaded', (event) => {
//     let token = sessionStorage.getItem('token');
//     if(token){
//         getUserData()
//     }
// });

async function getUserData() { 
    try {
        let token = sessionStorage.getItem('token');
        if(!token){
            alert('請先登入會員帳戶');
            return;
        }
        let response = await fetch('http://127.0.0.1:8000/api/user/auth', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 403) {
            alert('無效的憑證，請重新登入');
            window.location.href = `/`;
            return;
        }

        let result = await response.json();
        console.log(result);
        if (!response.ok) {
            console.error('HTTP error', response.status);
            alert(result.message);
            window.location.href = `/`;
        }

        console.log(result.data);
        let username = document.getElementById('username');
        username.textContent = result.data.name;
    } 
    catch (error) {
        console.error('Error:', error);
    }
}
