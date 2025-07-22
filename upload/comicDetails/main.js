import {
  getComicInfoById,
  getCookieID,
  getUserInfoById,
  getChaptersByComicId,
  deleteComicById,
  updateViewsByComicId
} from '../../js/user.js';
import { showLoading, hideLoading } from '../../js/loading.js';
import { alert } from '../../js/alert.js';

// DOM 元素
const elements = {
  aComment:document.getElementById('aComment'),
  cover: document.getElementById('cover'),
  title: document.getElementById('title'),
  bio: document.getElementById('bio'),
  author: document.getElementById('author'),
  permission: document.getElementById('permission'),
  chaptersList: document.getElementById('chapters'),
  views: document.getElementById('views'),
  numOfChapters: document.getElementById('numOfChapters'),
  addChapter: document.getElementById('addChapter'),
  editComicBtn: document.getElementById('editComic'),
  removeComicBtn: document.getElementById('removeComic'),
  editComicDiv: document.getElementById('divEditComic'),
  removeComicDiv: document.getElementById('divRemoveComic')

};

const comicId = new URLSearchParams(window.location.search).get('id');
let authorId = null;
elements.aComment.href='../../comment/index.html?id='+comicId
async function init() {
  showLoading();
  try {
    const comic = await getComicInfoById(comicId);
    authorId = comic.author_id;

    renderComicInfo(comic);
    await updateViews(comic.views);

    const user = await getUserInfoById(authorId);
    renderAuthorInfo(user);

    handlePermission(comic.author_id);
    await renderChapters();

  } catch (err) {
    console.error("加载失败:", err);
    alert("加载漫画信息失败，请稍后再试！");
  } finally {
    hideLoading();
  }
}

function renderComicInfo(comic) {
  elements.cover.innerHTML = `<img src="${comic.cover_url}" alt="Comic Cover" />`;
  elements.title.innerHTML = `<h1>${comic.title}</h1>`;
  elements.bio.innerHTML = `<span>${comic.bio}</span>`;
}

async function updateViews(currentViews) {
  const newViews = currentViews + 1;
  await updateViewsByComicId(comicId, newViews);
  elements.views.innerHTML = `<p>
  👀${newViews}</p>`;
}

function renderAuthorInfo(user) {
  elements.author.innerHTML = `
    <div class="avatar"><img src="${user.avatar}" alt="作者头像"/></div>
    <div class="info">
      <span>作者: ${user.userName}</span>
      <span>昵称: ${user.nickname}</span>
    </div>
  `;
}

function handlePermission(authorId) {
  const myId = getCookieID(document.cookie);
  const hasWriteAccess = myId === authorId;

  elements.permission.innerHTML = `<span>权限: ${hasWriteAccess ? '读写' : '仅读'}</span>`;

  if (hasWriteAccess) {
    elements.addChapter.innerHTML = `<a href="../addChapter/index.html?id=${comicId}">创建新章节</a>`;
    elements.editComicDiv.style.display = 'block';
    elements.removeComicDiv.style.display = 'block';
  }
}

async function renderChapters() {
  const chapters = await getChaptersByComicId(comicId);
  if (chapters.length === 0) {
    elements.chaptersList.innerHTML = `<span>暂无章节</span>`;
  } else {
    const listHTML = chapters.map((chapter, idx) => 
      `<li data-chapter-id="${chapter.id}" style="cursor:pointer">${idx + 1}. ${chapter.title}</li>`
    ).join('');
    elements.chaptersList.innerHTML = listHTML;

    Array.from(elements.chaptersList.querySelectorAll('li')).forEach(li => {
      const chapterId = li.dataset.chapterId;
      li.addEventListener('click', () => {
        window.location.href = `../../read/index.html?chapterid=${chapterId}&comicid=${comicId}`;
      });
    });
  }

  elements.numOfChapters.innerText = `全章节 (${chapters.length})`;
}

// 跳转到编辑页面
elements.editComicBtn.addEventListener('click', () => {
  window.location.href = `../../edit/index.html?id=${comicId}`;
});

// 作者点击跳转
elements.author.addEventListener('click', () => {
  if (authorId) {
    window.location.replace(`../../author/index.html?id=${authorId}`);
  }
});

// 删除按钮事件
elements.removeComicBtn.addEventListener('click', async () => {
  const confirmDelete = prompt('确定删除漫画？(Y/n)');
  if (confirmDelete?.toLowerCase() === 'y') {
    const inputTitle = prompt('请输入完整漫画名确认删除：');
    const comic = await getComicInfoById(comicId);
    if (inputTitle === comic.title) {
      try {
        showLoading();
        await deleteComicById(comicId);
        alert('删除成功');
        localStorage.removeItem('myComicIds');
        window.location.replace('../index.html');
      } catch (err) {
        console.error(err);
        alert('删除失败，请稍后再试');
      } finally {
        hideLoading();
      }
    } else {
      alert('漫画名错误，删除操作已取消');
    }
  }
});

init();