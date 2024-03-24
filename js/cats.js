let q = '';

function createAuthorElement(record) {
    let user = record.user || {'name': {'first': '', 'last': ''}};
    let authorElement = document.createElement('div');
    authorElement.classList.add('author-name');
    authorElement.innerHTML = user.name.first + ' ' + user.name.last;
    return authorElement;
}

function createUpvotesElement(record) {
    let upvotesElement = document.createElement('div');
    upvotesElement.classList.add('upvotes');
    upvotesElement.innerHTML = record.upvotes;
    return upvotesElement;
}

function createFooterElement(record) {
    let footerElement = document.createElement('div');
    footerElement.classList.add('item-footer');
    footerElement.append(createAuthorElement(record));
    footerElement.append(createUpvotesElement(record));
    return footerElement;
}

function createContentElement(record) {
    let contentElement = document.createElement('div');
    contentElement.classList.add('item-content');
    contentElement.innerHTML = record.text;
    return contentElement;
}

function createListItemElement(record) {
    let itemElement = document.createElement('div');
    itemElement.classList.add('facts-list-item');
    itemElement.append(createContentElement(record));
    itemElement.append(createFooterElement(record));
    return itemElement;
}

function renderRecords(records) {
    let factsList = document.querySelector('.facts-list');
    factsList.innerHTML = '';
    for (let i = 0; i < records.length; i++) {
        factsList.append(createListItemElement(records[i]));
    }
}

function setPaginationInfo(info) {
    document.querySelector('.total-count').innerHTML = info.total_count;
    let start = info.total_count && (info.current_page - 1) * info.per_page + 1;
    document.querySelector('.current-interval-start').innerHTML = start;
    let end = Math.min(info.total_count, start + info.per_page - 1);
    document.querySelector('.current-interval-end').innerHTML = end;
}

function createPageBtn(page, classes = []) {
    let btn = document.createElement('button');
    classes.push('btn');
    for (cls of classes) {
        btn.classList.add(cls);
    }
    btn.dataset.page = page;
    btn.innerHTML = page;
    return btn;
}

function renderPaginationElement(info) {
    let btn;
    let paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    btn = createPageBtn(1, ['first-page-btn']);
    btn.innerHTML = 'Первая страница';
    if (info.current_page === 1) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);

    let buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('pages-btns');
    paginationContainer.append(buttonsContainer);

    let start = Math.max(info.current_page - 2, 1);
    let end = Math.min(info.current_page + 2, info.total_pages);
    for (let i = start; i <= end; i++) {
        btn = createPageBtn(i, i === info.current_page ? ['active'] : []);
        buttonsContainer.append(btn);
    }

    btn = createPageBtn(info.total_pages, ['last-page-btn']);
    btn.innerHTML = 'Последняя страница';
    if (info.current_page === info.total_pages) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);
}

function downloadData(page = 1) {
    let factsList = document.querySelector('.facts-list');
    let url = new URL(factsList.dataset.url + '/facts');
    let perPage = document.querySelector('.per-page-btn').value;
    url.searchParams.append('page', page);
    url.searchParams.append('per-page', perPage);
    url.searchParams.append('q', q);
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = function () {
        renderRecords(this.response.records);
        setPaginationInfo(this.response['_pagination']);
        renderPaginationElement(this.response['_pagination']);
    };
    xhr.send();
}

function perPageBtnHandler() {
    downloadData(1);
}

function pageBtnHandler(event) {
    if (event.target.dataset.page) {
        downloadData(event.target.dataset.page);
        window.scrollTo(0, 0);
    }
}

function searchBtnHandler() {
    q = document.querySelector('.search-field').value;
    downloadData();
}

// После начала ввода запроса пользователем ему должны отображаться варианты возможных запросов,
// которые начинаются с введённых пользователем символов.
// Например, если пользователь введёт "m", ему могут быть предложены варианты "milk", "month", и т. д.
// Варианты автодополнения система генерирует автоматически на основе анализа истории запросов пользователей.
// Чтобы получить варианты автодополнения,
// необходимо выполнить запрос по указанному ниже адресу и передать в запросе параметр q -- текст поискового запроса,
// который на данный момент успел ввести пользователь.
// В ответ система пришлёт массив (в формате JSON) из 10 (или менее) наиболее популярных запросов,
// соответствующих указанному критерию.
// Для отображение возможных вариантов пользователю вам необходимо под полем ввода запроса
// добавить выпадающий список, как, например, это сделано в популярных поисковых системах (Google, Yandex, и др.).
// Оформление списка остаётся на ваше усмотрение.
// При клике пользователя по одному из предложенных вариантов его значение должно быть подставлено в поле ввода запроса,
// а выпадающий список должен быть скрыт.
function autocompleteHandler() {
    let searchField = document.querySelector('.search-field');
    let factsList = document.querySelector('.facts-list');
    let url = new URL(factsList.dataset.url + '/autocomplete');
    url.searchParams.append('q', searchField.value);
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = function () {
        let autocompleteList = document.querySelector('.autocomplete-list');
        autocompleteList.innerHTML = "";
        for (let i = 0; i < xhr.response.length; i++) {
            let item = document.createElement('div');
            item.classList.add('autocomplete-item');
            item.innerHTML = this.response[i];
            item.onclick = function () {
                searchField.value = this.innerHTML;
                searchBtnHandler();
                autocompleteList.innerHTML = '';
            };
            autocompleteList.append(item);
        }
    };
    xhr.send();

}

window.onload = function () {
    downloadData();
    document.querySelector('.pagination').onclick = pageBtnHandler;
    document.querySelector('.per-page-btn').onchange = perPageBtnHandler;
    document.querySelector('.search-btn').onclick = searchBtnHandler;
    document.querySelector('.search-field').onkeypress = autocompleteHandler;
};