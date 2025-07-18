import { searchComics } from '../js/user.js'; // 请确保你实现了 searchComics 方法

const input = document.querySelector('.search input');
const endContainer = document.querySelector('.end');

// 输入框监听输入
input.addEventListener('input', async () => {
  const keyword = input.value.trim();

  // 如果输入为空，清空结果
  if (!keyword) {
    endContainer.innerHTML = '';
    return;
  }

  // 调用搜索函数
  const results = await searchComics(keyword);

  // 清空旧内容
  endContainer.innerHTML = '';

  if (results.length === 0) {
    endContainer.innerHTML = `<p style="text-align:center; color:gray; margin-top:20px;">没有找到匹配的漫画</p>`;
    return;
  }

  // 渲染搜索结果
  results.forEach(comic => {
    const comicHTML = `
      <div class="comic-item">
        <img src="${comic.cover_url}" alt="漫画封面" class="comic-cover">
        <div class="comic-info">
          <h2 class="comic-title">${comic.title}</h2>
          <p class="comic-description">${comic.bio}</p>
          <a href="../upload/comicDetails/index.html?id=${comic.id}" class="view-more">查看详情</a>
        </div>
      </div>
    `;
    endContainer.innerHTML += comicHTML;
  });
});