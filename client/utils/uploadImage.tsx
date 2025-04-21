export const UploadImages = function(fileList: Array<File>) : Array<string>{
    const preset_key = "rb6icg22";
    const cloud_name = "dakuahprw";
    const listFileImage : Array<string> = [];
    fileList.forEach(async fileImage => {
        const formData = new FormData();
        formData.append('file', fileImage);
        formData.append('upload_preset', preset_key );
        
        await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => listFileImage.push(data.secure_url))
            .catch(err => console.log(err))
    })
    return listFileImage;
}

export const UploadImage = async function(img: File) : Promise<string>{
    const preset_key = "rb6icg22";
    const cloud_name = "dakuahprw";
    let singleImage = "";
  
    const formData = new FormData();
    formData.append('file', img);
    formData.append('upload_preset', preset_key );
    
    await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
        method: "POST",
        body: formData
    })
        .then(res => res.json())
        .then(data => singleImage = data.secure_url)
        .catch(err => console.log(err))
    
    return singleImage;
}

