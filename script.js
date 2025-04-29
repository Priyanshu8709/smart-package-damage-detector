function previewFile() {
    const fileInput = document.getElementById("fileInput");
    const previewImage = document.getElementById("previewImage");

   
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();

     
      reader.onload = function (e) {
        previewImage.src = e.target.result;
        previewImage.classList.remove("hidden"); 
      };

      reader.readAsDataURL(fileInput.files[0]); 
    }
  }