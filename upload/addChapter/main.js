import { getCookieID, getComicInfoById, uploadChapter, validateUsername, getChaptersByComicId, uploadImage, uploadPage, getChapterIdByNumber,isValidTitle} from '../../js/user.js';
import { alert } from '../../js/alert.js';
import { showLoading, hideLoading } from '../../js/loading.js';

const params = new URLSearchParams(window.location.search);
const comicId = params.get('id');
let userId = getCookieID(document.cookie);
if (!comicId){
  window.location.replace('../../404.html');
}
// 验证用户是否为漫画的作者
getComicInfoById(comicId).then(comicInfo => {
  let authorId = comicInfo.author_id;
  if (authorId !== userId) {
    window.location.replace('../../404.html');
  }
});

// 获取文件输入框和预览容器
const inputTitle = document.getElementById('title');
const submit = document.getElementById('submit');
const fileInput = document.getElementById('images');
const previewContainer = document.getElementById('preview');
const quit = document.getElementById('quit');
quit.innerHTML = `<a href="../comicDetails/index.html?id=${comicId}">＜</a>`;

// 用于存储选中的图片文件
let imageFiles = [];

// 监听文件选择变化
fileInput.addEventListener('change', handleFiles);

// 提交按钮点击事件
submit.addEventListener('click', handleSubmit);

// 处理文件选择的函数
function handleFiles(event) {
  const files = event.target.files;

  // 遍历所有选中的文件，读取并显示图片
  Array.from(files).forEach(file => {
    if (file && file.type.startsWith('image/')) {
      const imageObject = { file, url: URL.createObjectURL(file) }; // 使用 createObjectURL 提高性能
      imageFiles.push(imageObject);
      renderPreview(); // 渲染预览
    }
  });
}

// 渲染图片预览
function renderPreview() {
  previewContainer.innerHTML = ''; // 清空现有的预览

  imageFiles.forEach((item, index) => {
    const div = createPreviewImageElement(item, index);
    previewContainer.appendChild(div);
  });

  bindDragEvents(); // 绑定拖拽事件
}

// 创建单个预览图的 DOM 元素
function createPreviewImageElement(item, index) {
  const div = document.createElement('div');
  div.classList.add('preview-image');
  div.setAttribute('draggable', 'true');
  div.dataset.index = index;

  const img = document.createElement('img');
  img.src = item.url;
  img.alt = item.file.name;

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.innerText = 'X';
  deleteBtn.addEventListener('click', () => deleteImage(index));

  div.appendChild(img);
  div.appendChild(deleteBtn);

  return div;
}

// 删除图片
function deleteImage(index) {
  imageFiles.splice(index, 1);
  renderPreview();
}

// 提交章节
function handleSubmit() {
  let title = inputTitle.value;

  // 校验标题合法性
  if (!isValidTitle(title)) {
    alert('标题不可留空 3-30字 且不得含有非法字符');
    return;
  }

  // 如果没有图片，弹出提示
  if (imageFiles.length === 0) {
    alert('目前未上传任何图片');
    return;
  }

  // 获取当前章节数
  getChaptersByComicId(comicId).then(chapters => {
    let chapterNumber = chapters.length + 1;

    showLoading(); // 显示加载中提示
    console.log(title, chapterNumber, comicId);

    // 上传章节
    uploadChapter(title, chapterNumber, comicId).then(chapterIdData => {
      getChapterIdByNumber(chapterNumber, comicId).then(data => {
        let chapterId = data.id;
        // 上传图片和页面
        let uploadPromises = imageFiles.map((item, i) => {
          return uploadImage(item.file).then(url => {
            return uploadPage(chapterId, i + 1, url);
          });
        });

        // 等待所有图片上传完毕
        Promise.all(uploadPromises).then(() => {
          hideLoading();
          alert('章节上传成功');
          window.location.replace('../comicDetails/index.html?id='+comicId)
        });
      });
    });
  });
}

// 绑定拖拽事件
function bindDragEvents() {
  const previewImages = document.querySelectorAll('.preview-image');

  previewImages.forEach((imageDiv) => {
    imageDiv.addEventListener('dragstart', handleDragStart);
    imageDiv.addEventListener('dragend', handleDragEnd);
    imageDiv.addEventListener('dragover', handleDragOver);
    imageDiv.addEventListener('drop', handleDrop);
  });
}

// 拖拽开始事件
function handleDragStart(event) {
  event.target.classList.add('dragging');
  event.dataTransfer.setData('text/plain', event.target.dataset.index);
}

// 拖拽结束事件
function handleDragEnd(event) {
  event.target.classList.remove('dragging');
}

// 允许拖拽覆盖
function handleDragOver(event) {
  event.preventDefault();
}

// 拖拽放置事件
function handleDrop(event) {
  event.preventDefault();

  const draggedIndex = event.dataTransfer.getData('text/plain'); // 获取拖拽源的索引
  const targetIndex = event.target.dataset.index; // 获取目标元素的索引

  if (draggedIndex !== targetIndex) {
    // 交换图片数组中的图片位置
    const draggedImage = imageFiles[draggedIndex];
    imageFiles[draggedIndex] = imageFiles[targetIndex];
    imageFiles[targetIndex] = draggedImage;

    renderPreview(); // 重新渲染预览
  }
}
