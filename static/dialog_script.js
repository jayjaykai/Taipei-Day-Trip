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