import { alert } from '../js/alert.js'
import { showLoading, hideLoading } from '../js/loading.js'
import {
  getComicInfoById,
  validateUsername,
  isComicTitleDuplicate,
  uploadImage,
  validateBio,
  updateComicById,
  isValidTitle
} from '../js/user.js'

const btnCancel = document.getElementById('cancel')
const params = new URLSearchParams(window.location.search)
const comicId = params.get('id')
btnCancel.href = `../upload/comicDetails/index.html?id=${comicId}`

const inputTitle = document.getElementById('title')
const inputBio = document.getElementById('bio')
const inputCover = document.getElementById('cover')
const btnSubmit = document.getElementById('submit')

let originalTitle = '' // 用来记录原始标题

getComicInfoById(comicId).then(comicInfo => {
  originalTitle = comicInfo.title
  inputTitle.value = comicInfo.title
  inputBio.value = comicInfo.bio
})

btnSubmit.addEventListener('click', async () => {
  showLoading()

  let title = inputTitle.value
  let bio = inputBio.value
  let cover = inputCover.files[0]

  if (!isValidTitle(title)) {
    alert('标题不可留空 3-30字 且不得含有非法字符')
    hideLoading()
    return
  }

  if (!validateBio(bio)) {
    alert('简介请控制在150字以内')
    hideLoading()
    return
  }

  if (!cover) {
    alert('请上传封面')
    hideLoading()
    return
  }

  try {
    // 只有当标题被修改过，才检查是否重复
    if (title !== originalTitle) {
      const isDuplicate = await isComicTitleDuplicate(title)
      if (isDuplicate) {
        alert('标题已存在')
        hideLoading()
        return
      }
    }

    const publicURL = await uploadImage(cover, 'comics')
    console.log('上传成功，封面URL:', publicURL)

    await updateComicById(comicId, {
      title: title,
      bio: bio,
      cover_url: publicURL
    })

    alert('修改成功')
    localStorage.removeItem('myComicIds');
    window.location.replace('../upload/comicDetails/index.html?id='+comicId)
  } catch (error) {
    console.error('上传失败:', error.message)
    alert('更新失败，请联系开发者')
  } finally {
    hideLoading()
  }
})