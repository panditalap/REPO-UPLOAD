const UploadManager = (() => {

  const API_URL =
    "https://script.google.com/macros/s/AKfycbzSSiKmvrXWlX8phPYf1AkkfEB_LUSsyidA1NUCxzpInSEsVJKlMOqEdxg6XxC7I5wZDg/exec";

  async function uploadFiles(files) {

    const totalBytes =
      files.reduce(
        (sum, file) => sum + file.size,
        0
      );

    let uploadedBytes = 0;

    const progressEl =
      document.getElementById(
        "uploadProgress"
      );

    const statusEl =
      document.getElementById(
        "uploadStatus"
      );

    statusEl.textContent =
      `Uploading ${files.length} file(s)...`;

    for (let i = 0; i < files.length; i++) {

      const file = files[i];

      statusEl.textContent =
        `Uploading ${i + 1} of ${files.length}`;

      await uploadSingleFile(
        file,
        (loaded, total) => {

          const currentTotal =
            uploadedBytes + loaded;

          const percent =
            Math.round(
              currentTotal /
              totalBytes *
              100
            );

          progressEl.value =
            percent;
        }
      );

      uploadedBytes += file.size;
    }

    progressEl.value = 100;

    statusEl.textContent =
      "Upload Complete";
  }

  async function uploadSingleFile(
    file,
    onProgress
  ) {

    const base64 =
      await fileToBase64(file);

    return new Promise(
      (resolve, reject) => {

        const xhr =
          new XMLHttpRequest();

        xhr.upload.onprogress =
          e => {

            if (
              e.lengthComputable
            ) {

              onProgress(
                e.loaded,
                e.total
              );
            }
          };

        xhr.onload = () => {

          resolve(
            JSON.parse(
              xhr.responseText
            )
          );

        };

        xhr.onerror =
          reject;

        xhr.open(
          "POST",
          API_URL
        );

        xhr.setRequestHeader(
          "Content-Type",
          "application/json"
        );

        xhr.send(
          JSON.stringify({

            fileName: file.name,

            mimeType: file.type,

            content: base64

          })
        );

      });
  }

  function fileToBase64(file) {

    return new Promise(
      (resolve, reject) => {

        const reader =
          new FileReader();

        reader.onload =
          () => {

            resolve(
              reader.result
                .split(",")[1]
            );

          };

        reader.onerror =
          reject;

        reader.readAsDataURL(
          file
        );

      });
  }

  return {

    uploadFiles

  };

})();