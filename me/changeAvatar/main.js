import Cropper from 'https://cdn.jsdelivr.net/npm/cropperjs@1.5.13/dist/cropper.esm.js';
import {
  updateUserAvatar,
  getCroppedAvatarFile,
  uploadImage,
  getCookieID
} from '../../js/user.js';
import { showLoading, hideLoading } from '../../js/loading.js';
import { alert } from '../../js/alert.js';

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('avatarInput');
  const image = document.getElementById('imageToCrop');
  const canvasPreview = document.getElementById('croppedCanvas');
  const ctx = canvasPreview.getContext('2d');
  const submitBtn = document.getElementById('submit');
  let cropper;

  input.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      image.src = reader.result;
      image.style.display = 'block';

      if (cropper) cropper.destroy();

      cropper = new Cropper(image, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: 'move',
        background: false,
        autoCrop: true,
        responsive: true,
        crop() {
          const croppedCanvas = cropper.getCroppedCanvas({
            width: 100,
            height: 100,
          });
          if (croppedCanvas) {
            ctx.clearRect(0, 0, canvasPreview.width, canvasPreview.height);
            ctx.drawImage(croppedCanvas, 0, 0, 100, 100);
          }
        }
      });
    };
    reader.readAsDataURL(file);
  });

  submitBtn.addEventListener('click', async () => {
    if (!cropper) {
      alert('请先上传并裁剪头像');
      return;
    }

    try {
      showLoading();
      const file = await getCroppedAvatarFile(cropper);
      const url = await uploadImage(file);
      const userId = getCookieID(document.cookie);
      await updateUserAvatar(userId, url);
      alert('上传头像成功');

    } catch (err) {
      console.error('上传头像失败', err);
      alert('上传失败，请稍后重试');
    } finally {
      hideLoading();
    }
  });
});