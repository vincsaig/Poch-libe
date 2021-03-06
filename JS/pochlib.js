function displayPochList(){
    if (sessionStorage.getItem("pochlist") != null) {
        let library = sessionStorage.getItem("pochlist");
    
        let src = document.getElementById("pochlist");
        //let div = document.createElement("div");
        let books = library.split(",");
    
        books.forEach((e) => {
        console.log(e);
          if (e != "") {
            let bookThumbnail = sessionStorage.getItem(e);
            //console.log(bookThumbnail);
            let book = document.createElement("div");
            book.className="book";
            book.innerHTML = bookThumbnail;
            var spanElem = book.childNodes[0];
            spanElem.addEventListener('click',removeFromMyPochList);
            src.appendChild(book);
          }
        });
    }
};

window.onload = displayPochList;

function loadForm(){
    document.getElementById('formLoad').className = "submitButtonHide";
    document.getElementById('titleInputLabel').hidden = false;
    document.getElementById('title').hidden = false;
    document.getElementById('authorInputLabel').hidden = false;
    document.getElementById('author').hidden = false;
    document.getElementById('formSubmit').hidden = false;
    document.getElementById('formReset').hidden = false;
}

function get(){
    let title = document.getElementById('title').value;
    let author = document.getElementById('author').value;
    if(title == '' || author == ''){
        alert('Les champs Autheur/Titre ne doit pas être vide');
        return;
    }
    userAction();
}

function resetForm(){
    document.getElementById('formLoad').className = "submitButton";
    document.getElementById('titleInputLabel').hidden = true;
    document.getElementById('title').hidden = true;
    document.getElementById('authorInputLabel').hidden = true;
    document.getElementById('author').hidden = true;
    document.getElementById('formSubmit').hidden = true;
    document.getElementById('formReset').hidden = true;
    document.getElementById('firstLine').hidden=true;
    document.getElementById('searchResult').hidden=true;
    document.getElementById('books').innerHTML = "";
}

const userAction = async () => {
    document.getElementById('books').innerHTML = "";
    let title = document.getElementById('title').value;
    let author = document.getElementById('author').value;
    const response = await fetch('https://www.googleapis.com/books/v1/volumes?q='+ title + '+inauthor:' + author);
    const myJson = await response.json(); //extract JSON from the http response
    const bookArr = myJson.items;
    if(bookArr != null){
        for(let i = 0 ; i < bookArr.length; i++){
            bookProcessing(bookArr[i]);
        }
    }
    else{
        let notFound = document.createElement("div");
        notFound.className="bookNotFound";
        notFound.innerHTML="Aucun livre n'a été trouvé";
        document.getElementById('books').appendChild(notFound);
    }
    document.getElementById('firstLine').hidden=false;
    document.getElementById('searchResult').hidden=false;
}

function bookProcessing(bookInfo){
    let book = document.createElement("div");
    book.className = 'book';

    const author = 'authors' in bookInfo.volumeInfo ? bookInfo.volumeInfo.authors[0] : 'Non renseigné';
    const title = 'title' in bookInfo.volumeInfo ? bookInfo.volumeInfo.title : 'Non renseigné';
    const thumbnail = 
    'imageLinks' 
    in 
    bookInfo.volumeInfo 
    ?
    bookInfo.volumeInfo.imageLinks.thumbnail
    :
    "..\\images\\unavailable.png";
    let description = 'description' in bookInfo.volumeInfo ? bookInfo.volumeInfo.description : 'Non renseigné';

    if(description.length > 200){
        description = description.slice(0,201).concat('...');
    }

    let addBookFlag = document.createElement("span");
    addBookFlag.className = "flag";
    addBookFlag.id = "flagcard";
    addBookFlag.addEventListener('click', addToMyPochList);
    addBookFlag.innerHTML = "<i class='fa-solid fa-bookmark'></i>";
    book.appendChild(addBookFlag);

    bookElementProcessing(book,'title',title);
    bookElementProcessing(book,'id',bookInfo.id);
    bookElementProcessing(book,'author',author);
    bookElementProcessing(book,'description',description);
    bookImageProcessing(book,'thumbnail',thumbnail);

    document.getElementById('books').appendChild(book);
}

function bookElementProcessing(book,bookClassName,bookElement){
    let element = document.createElement("div");
    element.className = bookClassName;
    element.innerHTML = bookElement;
    book.appendChild(element);
}

function bookImageProcessing(book,imageClassName,image){
    let thumbnail = document.createElement("img");
    thumbnail.className = imageClassName;
    thumbnail.src = image;
    book.appendChild(thumbnail);
}

function addToMyPochList(event){
    let library = "";
    if(sessionStorage.getItem("pochlist")){
        library = sessionStorage.getItem("pochlist");
    }
;
    var bookElem = document.createElement("div");
    bookElem.className = "book";
    bookElem.innerHTML = event.target.parentElement.parentElement.innerHTML;
    var bookId = bookElem.childNodes[2].innerHTML.trim();

    if(library.includes(bookId)){
        alert("Vous ne pouvez pas ajouter deux fois le même livre");
        return;
    }

    var spanElem = bookElem.childNodes[0];

    spanElem.removeEventListener('click', addToMyPochList);
    spanElem.addEventListener('click',removeFromMyPochList);
    spanElem.innerHTML = "<i class='fa-solid fa-trash-can'></i>";

    library += bookId+",";

    sessionStorage.setItem("pochlist", library);
    sessionStorage.setItem(bookId, bookElem.innerHTML);

    document.getElementById('pochlist').appendChild(bookElem);
}

function removeFromMyPochList(event){
    let library = sessionStorage.getItem("pochlist");
    let bookID = event.target.parentElement.parentElement.childNodes[2].innerHTML.trim();
    library = library.replace(bookID+",","");
    sessionStorage.setItem("pochlist",library);
    sessionStorage.removeItem(bookID);
    event.target.parentElement.parentElement.remove();
}