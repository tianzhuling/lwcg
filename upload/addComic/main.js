import {
  getCookieID,
  validateUsername,
  validateBio,
  uploadImage,
  addComic,
  isComicTitleDuplicate,
  isValidTitle
} from '../../js/user.js'
import { alert } from '../../js/alert.js'
import { showLoading, hideLoading } from '../../js/loading.js'

console.log(document.cookie)
let id = getCookieID(document.cookie)
console.log(id)

if (id === 'guest') {
  window.location.href = '../../login/index.html'
}

const btn = document.getElementById('submit')
const inputTitle = document.getElementById('title')
const inputBio = document.getElementById('bio')
const inputCover = document.getElementById('cover')

btn.addEventListener('click', async () => {
  showLoading()
  
  let title = inputTitle.value
  let bio = inputBio.value
  let cover = inputCover.files[0]

  if (!isValidTitle(title)) {
    alert('标题不可留空 3-30字 且不得含有非法字符');
    hideLoading()
    return;
  }

  if (!validateBio(bio)) {
    alert('这是一个很长的简介，控制在150字之内')
    hideLoading()
    return
  }

  if (!cover) {
    alert('请上传封面')
    hideLoading()
    return
  }

  // ✅ 修复 async 错误（加上 async / await）
  //try {
    const boolOftitle = await isComicTitleDuplicate(title)
    if (boolOftitle) {
      alert('标题已存在')
      hideLoading()
      return
    }

    const publicURL = await uploadImage(cover, 'comics')
    console.log('上传成功，封面URL:', publicURL)
    await addComic(publicURL, bio, title, id)
    alert('上传成功')
    localStorage.removeItem('myComicIds');
    window.location.replace('../../upload/index.html')
  //} catch (error) {
    console.error('封面上传失败:', error.message)
    alert('封面上传失败，请联系开发者')
  //} finally {
    hideLoading()
  //}
})