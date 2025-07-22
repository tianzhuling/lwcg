import {
  getChapterById,
  getComicInfoById,
  getChapterIdByNumber,
  getChaptersByComicId,
  getPagesByChapterId,
  getCookieID,
  deleteChapterById
} from '../js/user.js';

import { showLoading, hideLoading } from '../js/loading.js';

const chapterTitle = document.getElementById('title');
const comicTitle = document.getElementById('comic');
const chapterContent = document.getElementById('chapter-content');
const backComic = document.getElementById('comic-nav');

const params = new URLSearchParams(window.location.search);
const chapterId = params.get('chapterid');
const comicId = params.get('comicid');
const btnEditChapter =document.getElementById('editChapter')
const btnRemoveChapter=document.getElementById('removeChapter')
const divForAuthor=document.getElementById('forAuthor')
if (!comicId || !chapterId) {
  window.location.href = '../404.html';
}

const chooseBtn = document.getElementById('choose');
const modal = document.getElementById('chapter-selector');
const closeBtn = document.getElementById('close-selector');
const chapterListContainer = document.getElementById('chapter-list')
btnEditChapter.href=`../edit/chapter/index.html?id=${chapterId}`
getChapterById(chapterId).then(chapterInfo=>{
  console.log(getCookieID(document.cookie))
  getComicInfoById(chapterInfo.comic_id).then(comicInfo=>{
    let authorId=comicInfo.author_id
  if (getCookieID(document.cookie)==authorId){
    divForAuthor.style.display='block'
     }
  })
  
})
btnRemoveChapter.addEventListener('click',()=>{
  showLoading()
  deleteChapterById(chapterId).then(data=>{
    console.log(data)
    hideLoading()
    alert('删除成功')
    
  })
  
})
chooseBtn.addEventListener('click', async () => {
  showLoading();
  modal.style.display = 'flex';
  chapterListContainer.innerHTML = '';

  const chapters = await getChaptersByComicId(comicId);
  chapters.sort((a, b) => a.chapter_number - b.chapter_number);

  chapters.forEach(chapter => {
    const btn = document.createElement('button');
    btn.textContent = `${chapter.chapter_number}. ${chapter.title}`;
    btn.addEventListener('click', async () => {
      modal.style.display = 'none';
      const idInfo = await getChapterIdByNumber(chapter.chapter_number, comicId);
      if (idInfo.id) {
        window.location.href = `?chapterid=${idInfo.id}&comicid=${comicId}`;
      }
    });
    chapterListContainer.appendChild(btn);
  });

  hideLoading();
});

closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

async function loadChapterData() {
  showLoading();
  try {
    const chapterData = await getChapterById(chapterId);
    const comicData = await getComicInfoById(comicId);

    backComic.href = `../upload/comicDetails/index.html?id=${comicId}`;
    comicTitle.innerHTML = `<span>漫画: ${comicData.title}</span>`;
    chapterTitle.innerHTML = `<h2>${chapterData.chapter_number} . ${chapterData.title}</h2>`;
    getPagesByChapterId(chapterData.id).then(pages=>{
    let contentHTML=''
      let i=0
      pages.forEach(page=>{
        i=i+1
        contentHTML+=`
      <img src='${page.image_url} ' alt='加载失败 (T _ T)'>
      `
      
      })
      
      chapterContent.innerHTML=contentHTML
      
    })
  } catch (err) {
    chapterContent.innerHTML = `<p>加载失败，请稍后重试。</p>`;
    console.error(err);
  } finally {
    hideLoading();
  }
}

async function setNavigationButtons() {
  const prevChapterBtn = document.getElementById('last');
  const nextChapterBtn = document.getElementById('next');

  const chapterData = await getChapterById(chapterId);
  const chapters = await getChaptersByComicId(comicId);
  const totalChapters = chapters.length;

  const current = chapterData.chapter_number;
  const prevNum = current === 1 ? totalChapters : current - 1;
  const nextNum = current === totalChapters ? 1 : current + 1;

  const prev = await getChapterIdByNumber(prevNum, comicId);
  const next = await getChapterIdByNumber(nextNum, comicId);

  if (prev.id) {
    prevChapterBtn.href = `?chapterid=${prev.id}&comicid=${comicId}`;
  } else {
    prevChapterBtn.style.display = 'none';
  }

  if (next.id) {
    nextChapterBtn.href = `?chapterid=${next.id}&comicid=${comicId}`;
  } else {
    nextChapterBtn.style.display = 'none';
  }
}

loadChapterData();
setNavigationButtons();
