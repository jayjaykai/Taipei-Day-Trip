let currentPage = 0;
let isLoading = false;
let currentIndex = 0;
let currentKeyword = '';

async function getData() {
    let url;
    // console.log(currentPage);
    if(currentPage!= null){
        isLoading = true;
        if (currentKeyword) {
            url = `http://54.79.121.157:8000/api/attractions?page=${currentPage}&keyword=${encodeURIComponent(currentKeyword)}`;
        } else {
            url = `http://54.79.121.157:8000/api/attractions?page=${currentPage}`;
        }
    
        let response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            console.error('HTTP error', response.status);
            isLoading = false;
            return;
        }
        let result = await response.json();
        let spots = result.data;
        currentPage = result.nextPage;
        // console.log("currentPage: " + currentPage);
        addContent(spots);
        isLoading = false;
    }
}

function goToAttractionPage(element) {
    const id = element.getAttribute('data-id');
    window.location.href = `/attraction/${id}`;
}

function addContent(results) {
    // console.log(results);
    let container = document.getElementById('spot_images');
    for (let i = 0; i < results.length; i++) {
        let itemContainer = document.createElement('div');
        itemContainer.className = 'List_spot';

        // 添加 onclick 事件到每一個景點圖片中，使用id來帶入資料
        itemContainer.setAttribute('data-id', results[i].id);
        itemContainer.setAttribute('onclick', 'goToAttractionPage(this)');

        let imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';

        let img = document.createElement('img');
        img.className = 'content_image';
        img.src = results[i].images[0];
        img.alt = results[i].name;

        let textDiv = document.createElement('div');
        textDiv.className = 'image-text';
        textDiv.textContent = results[i].name;

        imageContainer.appendChild(img);
        imageContainer.appendChild(textDiv);

        let infotextDiv = document.createElement('div');
        infotextDiv.className = 'image-info';

        let mrt = document.createElement('div');
        mrt.className = 'mrt-name';
        mrt.textContent = results[i].mrt;

        let cat = document.createElement('div');
        cat.className = 'category';
        cat.textContent = results[i].category;

        infotextDiv.appendChild(mrt);
        infotextDiv.appendChild(cat);

        itemContainer.appendChild(imageContainer);
        itemContainer.appendChild(infotextDiv);

        container.appendChild(itemContainer);
    }
}

async function addMrtsList() {
    let response = await fetch("http://54.79.121.157:8000/api/mrts", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    let mrts = await response.json();
    let mrtList = new Set();
    for (let i = 0; i < mrts.length; i++) {
        if (mrts[i]) {
            mrtList.add(mrts[i]);
        }
    }

    let listMrtsDiv = document.getElementById('list-mrts');
    listMrtsDiv.innerHTML = '';

    let mrtArray = Array.from(mrtList);
    for (let i = 0; i < mrtArray.length; i++) {
        let mrt = mrtArray[i];
        let mrtLink = document.createElement('a');
        mrtLink.textContent = mrt;
        mrtLink.className = 'mrt-info';
        mrtLink.addEventListener('click', function (event) {
            event.preventDefault();
            document.getElementById('mrtInput').value = mrt;
            fetchAttractionsByKeyword(mrt);
        });
        listMrtsDiv.appendChild(mrtLink);
    }
}

async function fetchAttractionsByKeyword(keyword) {
    currentPage = 0;
    currentKeyword = keyword;
    let response = await fetch(`http://54.79.121.157:8000/api/attractions?page=0&keyword=${encodeURIComponent(keyword)}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    let result = await response.json();
    let spots = result.data;
    currentPage = result.nextPage;
    let container = document.getElementById('spot_images');
    container.innerHTML = "";
    addContent(spots);
}

function searchByMRT() {
    let mrtInput = document.getElementById('mrtInput').value.trim();
    if (mrtInput) {
        fetchAttractionsByKeyword(mrtInput);
    } else {
        alert('請輸入捷運站名稱');
    }
}

function getCssVariable(element, variable) {
    return getComputedStyle(element).getPropertyValue(variable);
}

// Left button
function shiftLeft() {
    // const items = document.getElementById('list-mrts');
    // const itemWidth = items.children[0].offsetWidth;
    // if (currentIndex > 0) {
    //     currentIndex--;
    //     items.scrollBy({
    //         left: -itemWidth,
    //         behavior: 'smooth'
    //     });
    // }
    let items = document.getElementById('list-mrts');
    let scrollWidth = parseInt(getCssVariable(document.documentElement, '--scroll-width'), 10);
    if (currentIndex > 0) {
        currentIndex--;
        items.scrollBy({
            left: -scrollWidth,
            behavior: 'smooth'
        });
    }
}

// Right button
function shiftRight() {
    // const items = document.getElementById('list-mrts');
    // const itemCount = items.children.length;
    // const itemWidth = items.children[0].offsetWidth;
    // const visibleWidth = items.parentElement.offsetWidth;
    // const visibleItemsCount = Math.floor(visibleWidth / itemWidth);

    // console.log('currentIndex:', currentIndex);
    // console.log('itemCount:', itemCount);
    // console.log('visibleItemsCount:', visibleItemsCount);
    // if (currentIndex < itemCount - visibleItemsCount) {
    //     currentIndex++;
    //     items.scrollBy({
    //         left: itemWidth,
    //         behavior: 'smooth'
    //     });
    // }
    let items = document.getElementById('list-mrts');
    let scrollWidth = parseInt(getCssVariable(document.documentElement, '--scroll-width'), 10);
    currentIndex++;
    items.scrollBy({
        left: scrollWidth,
        behavior: 'smooth'
    });
}

    getData();
    addMrtsList();

    window.addEventListener('scroll', () => {
        // console.log('scrolling...');
        // console.log('window.innerHeight:', window.innerHeight);
        // console.log('window.scrollY:', Math.ceil(window.scrollY));
        // console.log('document.body.offsetHeight:', document.body.offsetHeight);

        // 判斷網頁到底部的寫法
        // if ((window.innerHeight + Math.ceil(window.scrollY)) >= document.body.offsetHeight && !isLoading) {
        //     console.log('bottom reached');
        //     currentPage++;
        //     getData(currentPage);
        // }

        // 檢查特定元素是否進入視窗底部
        let element = document.getElementById('spot_images');
        if (element) {
            let rect = element.getBoundingClientRect();
            // console.log('rect.bottom: ' + rect.bottom);
            // console.log('window.innerHeight: ' + window.innerHeight);
            if (rect.bottom <= window.innerHeight && !isLoading) {
                getData();
            }
        }
    });