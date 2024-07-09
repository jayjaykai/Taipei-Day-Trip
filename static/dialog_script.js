document.addEventListener('DOMContentLoaded', function() {
    checkToken();
});

document.addEventListener('DOMContentLoaded', (event) => {
    let profileImage = document.getElementById('profileImage');
    profileImage.addEventListener('mouseenter', () => {
        hoverText.style.display = 'block';
    });

    profileImage.addEventListener('mouseleave', () => {
        hoverText.style.display = 'none';
    });
    profileImage.addEventListener('click', () => {
        window.location.href = '/member';
    });
});
// document.getElementById('loginButton').addEventListener('click', function() {
//     // 檢查dialog是否存在，不存在使用fetch寫到body最後面
//     // 登入畫面
//     showLoginAndSignon();
// });

// function showLoginAndSignon(){
//     if (!document.getElementById('loginModal')) {
//         fetch('/static/login.html')
//             .then(response => response.text())
//             .then(html => {
//                 document.body.insertAdjacentHTML('beforeend', html);

//                 let modal = document.getElementById('loginModal');
//                 modal.showModal();
//                 document.getElementById('closeLoginModal').addEventListener('click', function() {
//                     modal.close();
//                 });
//                  // 註冊對話框邏輯
//                  let showSignon = document.getElementById("showSignon");
//                  showSignon.addEventListener("click", (event) => {
//                      event.preventDefault();
//                      document.getElementById('loginResult').textContent='';
//                      loginModal.close();
//                      if (!document.getElementById('signonModal')) {
//                          fetch('/static/signon.html')
//                              .then(response => response.text())
//                              .then(html => {
//                                  document.body.insertAdjacentHTML('beforeend', html);
 
//                                  let signonModal = document.getElementById('signonModal');
//                                  let signonContent = signonModal.querySelector('.modal-content');
//                                  signonContent.classList.add('signon');
//                                  signonModal.showModal();
 
//                                  document.getElementById('closeSignonModal').addEventListener('click', function() {
//                                      signonModal.close();
//                                  });
 
//                                  const showLogin = document.getElementById("showLogin");
//                                  showLogin.addEventListener("click", (event) => {
//                                     event.preventDefault();
//                                     document.getElementById('signonResult').textContent='';
//                                     signonModal.close();
//                                     loginModal.showModal();
//                                  });
//                              });
//                      } else {
//                         let signonModal = document.getElementById('signonModal');
//                         let signonContent = signonModal.querySelector('.modal-content');
//                         signonContent.classList.add('signon');
//                         signonModal.showModal();
//                      }
//                  });
//             });
//     } else {
//         document.getElementById('loginModal').showModal();
//     }
// }
document.getElementById('loginButton').addEventListener('click', function() {
    // 登入畫面
    showLoginAndSignon();
});

function showLoginAndSignon(){
    let modal = document.getElementById('loginModal');
    modal.showModal();
}

async function bookEvent() {
    let token = localStorage.getItem('token');
    if(!token){
        showLoginAndSignon();
        // alert('請先登入會員帳戶');
        return;
    }
    let response = await fetch('http://54.79.121.157:8000/api/user/auth', {
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
        let response = await fetch('http://54.79.121.157:8000/api/user/auth', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userIfo)
        });
        let result = await response.json();
        let loginResultDiv = document.getElementById('loginResult');
        if (!response.ok) {
            console.error('HTTP error', response.status);
            loginResultDiv.textContent = result.message;
            loginResultDiv.style.color = 'red';
            console.log(result.message);
            // alert(result.message);
            return;
        }
        localStorage.setItem('token', result.token);
        
        checkToken();
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
        loginResultDiv.textContent = '';
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
        let response = await fetch('http://54.79.121.157:8000/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userIfo)
        });
        let result = await response.json();
        let signonResultDiv = document.getElementById('signonResult');
        if (!response.ok) {
            console.error('HTTP error', response.status);
            signonResultDiv.textContent = result.message;
            signonResultDiv.style.color = 'red';
            console.log(result.message);
            return;
        }
        else{
            signonResultDiv.textContent = "註冊成功";
            signonResultDiv.style.color = 'green';
        }

        document.getElementById('enroll_name').value = '';
        document.getElementById('enroll_email').value = '';
        document.getElementById('enroll_password').value = '';
        // document.getElementById('signonModal').close();
    } 
    catch (error) {
        console.error('Error:', error);
        alert('伺服器內部錯誤，請聯絡系統管理員');
    }
}

async function checkToken() {
    let token = localStorage.getItem('token');
    let proImg = localStorage.getItem('proImg');
    let loginButton = document.getElementById('loginButton');
    // let logoutButton = document.getElementById('logoutButton');
    let profileImage = document.getElementById('profileImage');

    if (token){
        //有token的情況下，再次檢查登入者的token資訊
        response = await fetch('http://54.79.121.157:8000/api/user/auth', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        let result = await response.json();
        if (!response.ok) {
            loginButton.style.display = 'inline';
            // logoutButton.style.display = 'none';
            profileImage.style.display = 'none';
            alert(result.message);
            localStorage.removeItem('token');
            window.location.href = `/`;
        }
        
        loginButton.style.display = 'none';
        // logoutButton.style.display = 'inline';
        profileImage.style.display = 'inline';
        if(proImg === null){
            profileImage.src = result.data.proImage;
        }
        else{
            profileImage.src = proImg;
        }

        if (window.location.pathname === '/booking') {
            document.getElementById('contactName').value = result.data.name;
            document.getElementById('contactEmail').value = result.data.email;
            let username = document.getElementById('username');
            username.textContent = "您好，" + result.data.name + "，待預訂的行程如下：";
        }
    } 
    else{
        loginButton.style.display = 'inline';
        // logoutButton.style.display = 'none';
        profileImage.style.display = 'none';
    }
}

function logout(){
    if (confirm("確認要登出系統嗎？")){
        localStorage.removeItem('token');
        checkToken();
        window.location.href = `/`;
    }
    else
    {
        return;
    }
}

fetch('/static/login.html')
    .then(response => response.text())
    .then(html => {
        document.body.insertAdjacentHTML('beforeend', html);
        document.getElementById('closeLoginModal').addEventListener('click', function() {
            document.getElementById('loginModal').close();
        });
        // 註冊對話框邏輯
        let showSignon = document.getElementById("showSignon");
        showSignon.addEventListener("click", (event) => {
            event.preventDefault();
            document.getElementById('loginResult').textContent='';
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
                        showLogin.addEventListener("click", (event) => {
                           event.preventDefault();
                           document.getElementById('signonResult').textContent='';
                           signonModal.close();
                           loginModal.showModal();
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