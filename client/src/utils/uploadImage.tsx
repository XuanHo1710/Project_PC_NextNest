const PRESET_KEY = "rb6icg22";
const CLOUD_NAME = "dakuahprw";

/**
 * Determine the Cloudinary resource type from a File's MIME type.
 * - video/* → "video"
 * - everything else (image, etc.) → "auto" (let Cloudinary decide)
 */
function getResourceType(file: File): "image" | "video" | "auto" {
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("image/")) return "image";
    return "auto";
}

/**
 * Upload multiple files (images & videos) to Cloudinary.
 * Returns an array of secure_url strings.
 */
export const UploadImages = async function (fileList: Array<File>): Promise<Array<string>> {
    const uploadPromises = fileList.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", PRESET_KEY);

        const resourceType = getResourceType(file);
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
            { method: "POST", body: formData },
        );

        const data = await response.json();
        if (!data.secure_url) throw new Error(data.error?.message || "Upload failed");
        return data.secure_url as string;
    });

    return Promise.all(uploadPromises);
};

/**
 * Upload a single image to Cloudinary.
 */
export const UploadImage = async function (img: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", img);
    formData.append("upload_preset", PRESET_KEY);

    const resourceType = getResourceType(img);
    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
        { method: "POST", body: formData },
    );

    const data = await response.json();
    if (!data.secure_url) throw new Error(data.error?.message || "Upload failed");
    return data.secure_url as string;
};

