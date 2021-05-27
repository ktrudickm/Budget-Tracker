alert('hello')
const indexDB = 
    window.indexedDB || 
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimeIndexedDB;


const req = indexDB.open('budget', 1);
let db;

req.onupgradeneeded = ({target}) => {
     db = target.result;
     db.createObjectStore('pending');
};

req.onsuccess = ({target}) => {
    db = target.result;
    if(navigator.onLine){
        checkDatabase();
    };
}

function saveRecord(transaction) {
    const transact = db.transaction('pending', 'readwrite');
    const store = transact.objectStore('pending');
    store.add(transaction);
}

function checkDatabase(){
    const transact = db.transaction(["pending"]);
    const store = transact.objectStore('pending');
    const getAll =store.getAll();


    getAll.onsuccess = function(){
        if (getAll.result.length > 0){
         fetch("/api/transaction/bulk", {
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json"
            }
          })
          .then((resp) => resp.json())
          .then(() => {
              const transact = db.transaction("pending", "readwrite");
              const store = transact.objectStore("pending");
              store.clear();
          })
        }
    }
}

window.addEventListener("online", checkDatabase);