# Taiper-Day-Trip
> Taipei-Day-Trip is an **e-commerce travel website** developed with a **front-end** and **back-end** separation architecture. It integrates with a Restful API and fetches approximately 50 spot data provided by the Taipei City Government.

- Utilize **RESTful API** communication to connect frontend to backend.
- Authenticate users using JWT (JSON Web Token) for secure identity validation.
- Build the website with **RWD (Responsive Web Design)** to ensure compatibility across multiple devices.
- Offer a member page where users can upload a profile picture, modify their username and email, and review their order history.
- Integrate **TapPay API** to provide online payment service.

## Link
https://tdt-tw.online/

Test account / password：test@test.com / test  
Test card：4242-4242-4242-4242 | 07/25 | CVV 123

## How to use
1. 點擊景點照片後可查看更多資訊，並可預定行程時段並透過 TapPay SDK 第三方支付付款。
2. 需登入後才能使用預約行程和預定行程付款功能。
3. 可於會員頁面上傳個人大頭貼，修改帳號密碼資訊。
4. 可於會員頁面查詢過往完成付款的行程資訊。

## Architecture

![][architecture]

[architecture]: ./readme/Architecture.png

## Database

![][database]

[database]: ./readme/database.png

## RESTful API

![][APIs]

[APIs]: ./readme/APIs.png

## Demo

* **首頁**
![][index]

[index]:./readme/index.png

* **特定景點頁面**
![][spot]

[attraction]:./readme/spot.png

* **預定行程&信用卡資訊頁面**
![][booking]

[booking]:./readme/booking.png

* **會員中心頁面**
![][membership]

[membership]:./readme/membership.png

* **查詢歷史訂單**
![][history-orderlist]

[history-orderlist]:./readme/history_order_list.png