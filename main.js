import { getCookieID, getUserInfoById,getRecommendedComics} from './js/user.js';
import {loadComic} from './js/loadComic.js'
import {showLoading,hideLoading} from './js/loading.js'
const listContainer = document.getElementById('recommend-list');
const sortHot = document.getElementById('sort-hot');
const sortNew = document.getElementById('sort-new');


const logReg = document.getElementById('logReg');
const input = document.getElementById('search');

// 游客
if (document.cookie === '') {
  document.cookie = `ID=guest; max-age=${3153600000}; path=/`;
}

// 显示/隐藏 登录接口
console.log(getCookieID(document.cookie));
console.log(document.cookie)
if (getCookieID(document.cookie) === 'guest') {
  logReg.style.display = 'block'; // ✅ 修正这里！
}

input.addEventListener('click', () => {
  window.location.replace('search/index.html');
});
function renderComics(comics) {
  listContainer.innerHTML = '';

  if (comics.length === 0) {
    listContainer.innerHTML = '<p style="text-align:center;">暂无推荐漫画</p>';
    return;
  }

  comics.forEach(comic => {
    const comicId = comic.id;
    const comicInfo = comic;
    
    const html = loadComic(comicInfo);
    listContainer.innerHTML += html;
  });
}

async function load(type) {
  const comics = await getRecommendedComics(type);
  renderComics(comics);
}

sortHot.addEventListener('click', () => {
  sortHot.classList.add('active');
  sortNew.classList.remove('active');
  load('hot');
});

sortNew.addEventListener('click', () => {
  sortNew.classList.add('active');
  sortHot.classList.remove('active');
  load('new');
});

// 默认加载最热
showLoading()
load('hot');
hideLoading()