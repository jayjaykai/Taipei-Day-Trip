let currentIndex = 0;
let imageLen = 0;
let attraction;
let imgWrapper = document.getElementById('img-wrapper');
let dotsWrapper = document.getElementById('dots-wrapper');
let selectedTime = 'morning'; 

function getQueryParams() {
    const path = window.location.pathname;
    const parts = path.split('attraction/');
    // console.log(parts[1]);
    const attractionIndex = path.indexOf('attraction');
    if (attractionIndex !== -1 && parts.length == 2) {
        return parts[1];
    }
    return null;
}

async function fetchAttractionDetails(id) {
    try{
        let response = await fetch(`http://54.79.121.157:8000/api/attraction/${id}`);
        let result = await response.json();
        if (!response.ok) {
            console.error('HTTP error', response.status);
            alert(result.message);
            return;
        }
        // console.log(attraction);
        // let spotPicDiv = document.getElementById('spot-image');
        // spotPicDiv.src = attraction.data.images[currentIndex];
        attraction = result;
        imageLen = attraction.data.images.length;
        for (let i = 0; i < imageLen; i++) {
            const img = document.createElement('img');
            img.classList.add('spot-picture');
            img.src = attraction.data.images[i];
            imgWrapper.appendChild(img);
        }

        // create dot
        createDots(imageLen);
        updateDots();

        // Profile
        let attractionName = document.getElementById('profile-name');
        let attractionDescription = document.getElementById('profile-category');
        attractionName.textContent = attraction.data.name;
        attractionDescription.textContent = attraction.data.category + " at " + attraction.data.mrt ;

        // Info 
        let infoDiv = document.getElementById('info');
        let infoDescripDiv = document.createElement('div');
        infoDescripDiv.className = 'info-description';
        infoDescripDiv.textContent = attraction.data.description;

        let infoAddDiv = document.createElement('div');
        let infoAddtTtileDiv = document.createElement('div');
        infoAddtTtileDiv.className = 'info-address-title';
        infoAddtTtileDiv.innerHTML = "景點地址：";
        infoAddDiv.appendChild(infoAddtTtileDiv);
        let infoAddContentDiv = document.createElement('div');
        infoAddContentDiv.className = 'info-address';
        infoAddContentDiv.innerHTML = attraction.data.address;

        infoAddDiv.className = 'info-address-block';
        infoAddDiv.appendChild(infoAddContentDiv);

        let infoTrans = document.createElement('div');
        let infoTransTtileDiv = document.createElement('div');
        infoTransTtileDiv.className = 'info-transport-title';
        infoTransTtileDiv.innerHTML = "交通方式：";
        infoTrans.appendChild(infoTransTtileDiv);
        let infoTransContentDiv = document.createElement('div');
        infoTransContentDiv.className = 'info-transport';
        infoTransContentDiv.innerHTML = attraction.data.transport;

        infoTrans.className = 'info-transport-block';
        infoTrans.appendChild(infoTransContentDiv);

        infoDiv.appendChild(infoDescripDiv);
        infoDiv.appendChild(infoAddDiv);
        infoDiv.appendChild(infoTrans);
    }
    catch(error){
        console.error('Fetch error:', error);
    }
}

function updatePosition() {
    let spotPicture = document.querySelector('.spot-picture');
    let style = window.getComputedStyle(spotPicture);
    let Width = parseInt(style.width);
    let offset = -currentIndex * Width;
    imgWrapper.style.transform = `translateX(${offset}px)`;
    updateDots();
}

function preImg() {
    if (currentIndex > 0) {
        currentIndex--;
        updatePosition();
    }
}

function nextImg() {
    if (currentIndex < imageLen - 1) {
        currentIndex++;
        updatePosition();
    }
}

function createDots(num) {
    // console.log(num);
    for (let i = 0; i < num; i++) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dotsWrapper.appendChild(dot);
    }
}

function updateDots() {
    const dots = dotsWrapper.getElementsByClassName('dot');
    for (let i = 0; i < dots.length; i++) {
        if (i === currentIndex) {
            dots[i].classList.add('active');
        } else {
            dots[i].classList.remove('active');
        }
    }
}

function bookEvent() {
    window.location.href = `/booking`;
}

function updatePrice(radio) {
    const priceSpan = document.getElementById('tour-price');
    if (radio.id === 'morning') {
        priceSpan.textContent = '2000';
        selectedTime = 'morning';
    } 
    else{
        priceSpan.textContent = '2500';
        selectedTime = 'afternoon';
    }
}

async function reserveTravel(){
    try{
        let token = localStorage.getItem('token');
        let date = document.getElementById('date').value;
        let travelTime = selectedTime;
        let tourPrice = document.getElementById('tour-price').innerText;

        let data = {
            attraction_id: attractionId,
            date: date,
            travel_time: travelTime,
            tour_price: tourPrice
        };

        let response = await fetch('http://127.0.0.1:8000/api/booking',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const result = await response.json();
            console.error('HTTP error', response.status);
            alert(result.message);
            return;
        }

        alert('預約成功！');
    }
    catch(error){
        console.error('Booking error:', error);
    }
}

// // use another method
// function updatePosition() {
//     let spotPicDiv = document.getElementById('spot-image');
//     spotPicDiv.src = attraction.data.images[currentIndex];
//     updateDots();
// }

// function preImage() {
//     if(currentIndex!=0){
//         let spotPicDiv = document.getElementById('spot-image');
//         spotPicDiv.classList.add('hidden');
//         setTimeout(() => {
//             currentIndex--;
//             updateContent();
//             spotPicDiv.classList.remove('hidden');
//         }, 300);
//     }
// }

// function nextImage() {
//     if(currentIndex>=0 && currentIndex < imageLen-1){
//         let spotPicDiv = document.getElementById('spot-image');
//         spotPicDiv.classList.add('hidden');
//         setTimeout(() => {
//             currentIndex++;
//             updateContent();
//             spotPicDiv.classList.remove('hidden');
//         }, 500);
//     }
// }


let attractionId = getQueryParams();
// console.log(attractionId);

if (attractionId) {
    fetchAttractionDetails(attractionId);
}

let morningRadio = document.getElementById('morning');
updatePrice(morningRadio);
