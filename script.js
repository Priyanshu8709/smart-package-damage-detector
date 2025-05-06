function previewFile() {
    const fileInput = document.getElementById("fileInput");
    const previewImage = document.getElementById("previewImage");

    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Please upload a valid image file.");
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            previewImage.src = e.target.result;
            previewImage.classList.remove("hidden"); // Show the preview image
        };

        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("No file selected. Please choose an image.");
    }
}
async function uploadImageAndFetchResult() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  const uploadButton = document.getElementById("uploadButton");

  if (!file) {
      alert("Please select a file first!");
      return;
  }

  if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
  }

  showSpinner();
  uploadButton.disabled = true;

  const reader = new FileReader();
  reader.onload = async function (event) {
      const base64Data = event.target.result.split(",")[1];
      const contentType = file.type;

      const url = "https://script.google.com/macros/s/AKfycbybMZASmNuPsHmDMQEUHm3U4f7oDVnugqWX3tCACwqFUo7OOT51STkrJg5rqBRM_oyQ/exec";

      try {
          const response = await fetch(url, {
              method: "POST",
              headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                  filedata: base64Data,
                  mimetype: contentType
              }),
          });

          const resultText = await response.text();
          console.log("Upload Response:", resultText);

          if (resultText.toLowerCase().includes("uploaded")) {
              console.log("Waiting for prediction...");
              setTimeout(() => fetchResult(0), 8000);  // Allowing Colab more time
          } else {
              alert("Upload failed: " + resultText);
              hideSpinner();
              uploadButton.disabled = false;
          }
      } catch (error) {
          console.error("Upload Error:", error);
          alert("Error uploading image.");
          hideSpinner();
          uploadButton.disabled = false;
      }
  };

  reader.readAsDataURL(file);
}

async function fetchResult(retryCount) {
  const MAX_RETRIES = 3;
  const url = "https://script.google.com/macros/s/AKfycbybMZASmNuPsHmDMQEUHm3U4f7oDVnugqWX3tCACwqFUo7OOT51STkrJg5rqBRM_oyQ/exec";

  try {
      const response = await fetch(url);
      const text = await response.text();
      console.log("Fetched result:", text);

      if (text.toLowerCase().includes("good") || text.toLowerCase().includes("damaged")) {
          const emoji = text.toLowerCase().includes("good") ? "✅" : "❌";
          document.getElementById("resultDisplay").innerHTML = `
              <p class="text-2xl font-bold">Result:</p>
              <p class="mt-2 text-3xl">${emoji} ${text.trim()}</p>
          `;
          hideSpinner();
          document.getElementById("uploadButton").disabled = false;
      } else {
          if (retryCount < MAX_RETRIES) {
              console.log("Result not ready yet, retrying...");
              setTimeout(() => fetchResult(retryCount + 1), 4000);
          } else {
              document.getElementById("resultDisplay").innerText =
                  "Result not available. Please try again.";
              hideSpinner();
              document.getElementById("uploadButton").disabled = false;
          }
      }
  } catch (error) {
      console.error("Fetch Result Error:", error);
      document.getElementById("resultDisplay").innerText = "Error fetching result.";
      hideSpinner();
      document.getElementById("uploadButton").disabled = false;
  }
}

function showSpinner() {
  document.getElementById("spinner").classList.remove("hidden");
}

function hideSpinner() {
  document.getElementById("spinner").classList.add("hidden");
}