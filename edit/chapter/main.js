import {
  getCookieID,
  getChapterById,
  updateChapterById,
  uploadImage,
  uploadPage,
  validateUsername,
  isValidTitle
} from '../../js/user.js'

import { alert } from '../../js/alert.js'
import { showLoading, hideLoading } from '../../js/loading.js'

const chapterId = new URLSearchParams(window.location.search).get('id')
if (!chapterId) window.location.replace('../../404.html')

const inputTitle = document.getElementById('title')
const fileInput = document.getElementById('images')
const previewContainer = document.getElementById('preview')
const btnSubmit = document.getElementById('submit')
const quit = document.getElementById('quit')

let comicId = ''
let imageFiles = []

getChapterById(chapterId).then(chapter => {
  if (!chapter) {
    alert('章节不存在')
    window.location.replace('../../404.html')
  }

  inputTitle.value = chapter.title
  comicId = chapter.comic_id
  quit.innerHTML = `<a href="../comicDetails/index.html?id=${comicId}">＜</a>`
})

fileInput.addEventListener('change', handleFiles)
btnSubmit.addEventListener('click', handleSubmit)

function handleFiles(event) {
  const files = event.target.files
  Array.from(files).forEach(file => {
    if (file && file.type.startsWith('image/')) {
      imageFiles.push({ file, url: URL.createObjectURL(file) })
      renderPreview()
    }
  })
}

function renderPreview() {
  previewContainer.innerHTML = ''
  imageFiles.forEach((item, index) => {
    const div = document.createElement('div')
    div.classList.add('preview-image')
    div.setAttribute('draggable', 'true')
    div.dataset.index = index

    const img = document.createElement('img')
    img.src = item.url
    img.alt = item.file.name

    const deleteBtn = document.createElement('button')
    deleteBtn.classList.add('delete-btn')
    deleteBtn.innerText = 'X'
    deleteBtn.addEventListener('click', () => {
      imageFiles.splice(index, 1)
      renderPreview()
    })

    div.appendChild(img)
    div.appendChild(deleteBtn)
    previewContainer.appendChild(div)
  })

  bindDragEvents()
}

async function handleSubmit() {
  const title = inputTitle.value.trim()

  if (!isValidTitle(title)) {
    alert('标题不可留空 3-30字 且不得含有非法字符')
    return
  }

  if (imageFiles.length === 0) {
    alert('请上传至少一张图片')
    return
  }

  showLoading()

  try {
    await updateChapterById(chapterId, { title })

    const uploadTasks = imageFiles.map((item, index) =>
      uploadImage(item.file).then(url =>
        uploadPage(chapterId, index + 1, url)
      )
    )

    await Promise.all(uploadTasks)
    alert('章节修改成功')
    
  } catch (error) {
    console.error(error)
    alert('章节修改失败，请稍后重试')
  } finally {
    hideLoading()
  }
}

function bindDragEvents() {
  const previewImages = document.querySelectorAll('.preview-image')

  previewImages.forEach(imageDiv => {
    imageDiv.addEventListener('dragstart', e => {
      e.target.classList.add('dragging')
      e.dataTransfer.setData('text/plain', e.target.dataset.index)
    })

    imageDiv.addEventListener('dragend', e => {
      e.target.classList.remove('dragging')
    })

    imageDiv.addEventListener('dragover', e => {
      e.preventDefault()
    })

    imageDiv.addEventListener('drop', e => {
      e.preventDefault()
      const draggedIndex = e.dataTransfer.getData('text/plain')
      const targetIndex = e.target.closest('.preview-image').dataset.index

      if (draggedIndex !== targetIndex) {
        const temp = imageFiles[draggedIndex]
        imageFiles[draggedIndex] = imageFiles[targetIndex]
        imageFiles[targetIndex] = temp
        renderPreview()
      }
    })
  })
}