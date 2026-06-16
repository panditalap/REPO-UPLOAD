const DB_NAME = "share-target-db";
const STORE = "images";

self.addEventListener("install",event=>{
    self.skipWaiting();
});

self.addEventListener("activate",event=>{
    event.waitUntil(
        self.clients.claim()
    );
});

function openDB(){
    return new Promise((resolve,reject)=>{
        const req = indexedDB.open(DB_NAME,1);
        req.onupgradeneeded = e=>{
            const db = e.target.result;
            if(!db.objectStoreNames.contains(STORE)){
                db.createObjectStore(STORE,{
                    keyPath:"id",
                    autoIncrement:true
                });
            }
        };
        req.onsuccess = ()=>resolve(req.result);
        req.onerror = ()=>reject(req.error);
    });
}

async function saveFiles(files){
    const db = await openDB();
    const tx = db.transaction(STORE,"readwrite");
    const store = tx.objectStore(STORE);
    for(const file of files){
        store.add({
            file:file,
            created:Date.now()
        });
    }
    return tx.complete;
}

self.addEventListener("fetch",event=>{
    const url = new URL(event.request.url);
    if(
        event.request.method==="POST" &&
        url.pathname.endsWith("/share")
    ){
        event.respondWith(handleShare(event));
    }
});

async function handleShare(event){
    const formData = await event.request.formData();
    const files = formData.getAll("images");
    await clearStore();
    await saveFiles(files);
    return Response.redirect(
        "/REPO-UPLOAD/?shared=1",
        303
    );
}

async function clearStore(){
    const db = await openDB();
    return new Promise((resolve,reject)=>{
        const tx = db.transaction(STORE,"readwrite");
        const store = tx.objectStore(STORE);
        const req = store.clear();
        req.onsuccess = ()=>resolve();
        req.onerror = ()=>reject(req.error);
    });
}
