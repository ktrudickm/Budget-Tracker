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
    db=target.result;

    if(navigator.onLine){
        checkDatabase();
    };
    
}




function checkDatabase(){
    const transact = db.transaction(["pending"]);
    const store = transact.objectStore('pending');
    const getAll =store.getAll();


    getAll.onsuccess =function(){
        if (getAll.result.length > 0){
            console.log('FETCH HERE')
        }
    }


}

window.addEventListener("online", checkDatabase);