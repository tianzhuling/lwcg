import { showLoading, hideLoading } from '../js/loading.js'
import { uploadComment, getCookieID, getCommentsByComicId, getComicInfoById, getUserInfoById } from '../js/user.js'
import { alert } from '../js/alert.js'

const aComic = document.getElementById('nav-comic')
const comicId = new URLSearchParams(window.location.search).get('id')
const submit = document.getElementById('submit')
const inputComment = document.getElementById('inputComment')
const textTitle = document.getElementById('textTitle')
const listComments = document.getElementById('comments')

async function getUserInfo(id) {
  const data = await getUserInfoById(id)
  return data
}

// 设置漫画标题

// 加载评论及用户信息并渲染
getCommentsByComicId(comicId).then(async comments => {
  showLoading()

  // 并发获取所有评论用户信息
  const userInfoPromises = comments.comments.map(comment => getUserInfo(comment.user_id))
  const usersInfo = await Promise.all(userInfoPromises)

  let html = ''
  for (let i = 0; i < comments.comments.length; i++) {
    const comment = comments.comments[i]
    const userInfo = usersInfo[i] || {}
    const avatar = userInfo.avatar || ''
    const uname = userInfo.userName || ''
    html += `
      <div id='Comment${comment.id}'>
        <div class='userInfo'>
          <img id='avatar${comment.id}' src='${avatar}' alt='头像'>
          <span>${uname}</span>
        </div>
        <li id='textComment${comment.id}'>${comment.content}</li>
      </div>
    `
  }

  listComments.innerHTML = html
  getComicInfoById(comicId).then(info => {
  let title = info.title
  textTitle.innerHTML = `${title}(${comments.comments.length})`
})

  hideLoading()
})

// 设置跳转链接
aComic.href = '../upload/comicDetails/index.html?id=' + comicId

// 提交评论事件
submit.addEventListener('click', () => {
  let content = inputComment.value.trim()
  if (!content) {
    alert('评论内容不能为空')
    return
  }
  showLoading()
  uploadComment(content, comicId, getCookieID(document.cookie))
    .then(() => {
      alert('发布成功')
      inputComment.value = ''
      // 这里可以考虑刷新评论列表，或新增刚发的评论
    })
    .catch(err => {
      alert('发布失败：' + err.message)
    })
    .finally(() => {
      hideLoading()
    })
})