import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuid } from "uuid";

import type { FirebaseStorage } from "firebase/storage";

const uploadImageAsync = async (storage: FirebaseStorage, uri: string, path: string) => {
  // Why are we using XMLHttpRequest? See:
  // https://github.com/expo/expo/issues/2402#issuecomment-443726662
  const blob: Blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  const imagePath = `${path}${uuid()}`;

  const fileRef = ref(storage, imagePath);
  await uploadBytes(fileRef, blob);

  const imageUrl = await getDownloadURL(fileRef);

  return [imagePath, imageUrl];
};

const getImageUrl = async (storage: FirebaseStorage, path: string) => {
  const fileRef = ref(storage, path);
  return await getDownloadURL(fileRef);
};

const DEFAULT_PROFILE_IMAGE_PATH = "profile-images/default-user.png";

export { uploadImageAsync, getImageUrl, DEFAULT_PROFILE_IMAGE_PATH };
