document.getElementById('loginButton').addEventListener('click', function() {
    // 檢查dialog是否存在，不存在使用fetch寫到body最後面
    // 登入畫面
    if (!document.getElementById('loginModal')) {
        fetch('/static/login.html')
            .then(response => response.text())
            .then(html => {
                document.body.insertAdjacentHTML('beforeend', html);

                let modal = document.getElementById('loginModal');
                modal.showModal();
                document.getElementById('closeLoginModal').addEventListener('click', function() {
                    modal.close();
                });

                // 點擊視窗外部關閉視窗
                window.addEventListener('click', function(event) {
                    if (event.target == modal) {
                        modal.close();
                    }
                });

                 // 註冊對話框邏輯
                 const showSignon = document.getElementById("showSignon");
                 showSignon.addEventListener("click", (e) => {
                     e.preventDefault();
                     loginModal.close();
                     if (!document.getElementById('signonModal')) {
                         fetch('/static/signon.html')
                             .then(response => response.text())
                             .then(html => {
                                 document.body.insertAdjacentHTML('beforeend', html);
 
                                 let signonModal = document.getElementById('signonModal');
                                 let signonContent = signonModal.querySelector('.modal-content');
                                 signonContent.classList.add('signon');
                                 signonModal.showModal();
 
                                 document.getElementById('closeSignonModal').addEventListener('click', function() {
                                     signonModal.close();
                                 });
 
                                 const showLogin = document.getElementById("showLogin");
                                 showLogin.addEventListener("click", (e) => {
                                     e.preventDefault();
                                     signonModal.close();
                                     loginModal.showModal();
                                 });
 
                                 // 點擊視窗外部關閉視窗
                                 window.addEventListener('click', function(event) {
                                     if (event.target == signonModal) {
                                         signonModal.close();
                                     }
                                 });
                             });
                     } else {
                        let signonModal = document.getElementById('signonModal');
                        let signonContent = signonModal.querySelector('.modal-content');
                        signonContent.classList.add('signon');
                        signonModal.showModal();
                     }
                 });
            });
    } else {
        document.getElementById('loginModal').showModal();
    }
});

async function bookEvent() {
    let token = localStorage.getItem('token');
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

    if (!response.ok) {
        let result = await response.json();
        alert(result.message);
        // window.location.href = `/`;
        return;
    }
    window.location.href = `/booking`;
}

async function login() { 
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    if (!email || !password) {
        alert('請輸入電子信箱和密碼');
        return;
    }

    let userIfo = {
        email: email,
        password: password
    };

    try {
        let response = await fetch('http://127.0.0.1:8000/api/user/auth', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userIfo)
        });
        let result = await response.json();
        if (!response.ok) {
            console.error('HTTP error', response.status);
            alert(result.message);
            return;
        }
        localStorage.setItem('token', result.token);

        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
        document.getElementById('loginModal').close();
    } 
    catch (error) {
        console.error('Error:', error);
        alert('伺服器內部錯誤，請聯絡系統管理員');
    }
}

async function signon() { 
    let name = document.getElementById('enroll_name').value;
    let email = document.getElementById('enroll_email').value;
    let password = document.getElementById('enroll_password').value;

    if (!email || !password || !name) {
        alert('請輸入姓名、電子信箱和密碼');
        return;
    }

    let userIfo = {
        name: name,
        email: email,
        password: password
    };

    try {
        let response = await fetch('http://127.0.0.1:8000/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userIfo)
        });
        let result = await response.json();
        if (!response.ok) {
            console.error('HTTP error', response.status);
            alert(result.message);
            return;
        }
        console.log( result.ok);

        document.getElementById('enroll_name').value = '';
        document.getElementById('enroll_email').value = '';
        document.getElementById('enroll_password').value = '';
        document.getElementById('signonModal').close();
    } 
    catch (error) {
        console.error('Error:', error);
        alert('伺服器內部錯誤，請聯絡系統管理員');
    }
}
