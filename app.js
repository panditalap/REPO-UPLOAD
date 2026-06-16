const DB_NAME = "share-target-db";
const STORE = "images";

async function openDB() {

    return new Promise((resolve, reject) => {

        const req = indexedDB.open(DB_NAME, 1);

        req.onupgradeneeded = e => {

            const db = e.target.result;

            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE, {
                    keyPath: "id",
                    autoIncrement: true
                });
            }
        };

        req.onsuccess = () => resolve(req.result);

        req.onerror = () => reject(req.error);
    });
}

async function getImages() {

    const db = await openDB();

    return new Promise((resolve, reject) => {

        const tx = db.transaction(STORE, "readonly");

        const store = tx.objectStore(STORE);

        const req = store.getAll();

        req.onsuccess = () => resolve(req.result);

        req.onerror = () => reject(req.error);
    });
}

async function renderImages() {

    const gallery = document.getElementById("gallery");

    const status = document.getElementById("status");

    const images = await getImages();

    if (images.length === 0) {

        status.textContent = "No shared images";

        return;
    }

    status.textContent =
        `${images.length} image(s) received`;

    gallery.innerHTML = "";

    images.forEach(item => {

        const img = document.createElement("img");

        img.className = "thumb";

        img.src = URL.createObjectURL(item.file);

        gallery.appendChild(img);
    });
}

async function registerSW() {

    if ("serviceWorker" in navigator) {

        await navigator.serviceWorker.register(
            "./sw.js",
            {
                scope: "./"
            }
        );
    }
}

async function uploadSharedImages() {

    const images =
        await getImages();

    const files =
        images.map(
            x => x.file
        );

    await UploadManager
        .uploadFiles(files);

}

document.getElementById("uploadBtn").addEventListener("click", uploadSharedImages);

(async () => {

    await registerSW();

    await renderImages();

})();
