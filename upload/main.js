import { getComicIdsByUserId, getCookieID, getComicInfoById } from '../js/user.js';
import { showLoading, hideLoading } from '../js/loading.js';

const container = document.getElementById('comics');

async function loadComics() {
  showLoading();

  try {
    const userId = getCookieID(document.cookie);
    let comicIds;

    const cacheComicIds = localStorage.getItem('myComicIds');
    if (!cacheComicIds) {
      // 没缓存就从接口获取
      comicIds = await getComicIdsByUserId(userId);
      localStorage.setItem('myComicIds', JSON.stringify(comicIds));
    } else {
      // 有缓存就解析
      comicIds = JSON.parse(cacheComicIds);
    }

    // 检查是否为空
    if (!comicIds || comicIds.length === 0) {
      container.innerHTML = '<span>空空如也</span>';
      return;
    }

    // 加载每部漫画的信息
    for (const id of comicIds) {
      try {
        const info = await getComicInfoById(id);

        if (info) {
          container.innerHTML += `
            <div class="comic-item">
              <img src="${info.cover_url}" alt="漫画封面" class="comic-cover">
              <div class="comic-info">
                <h2 class="comic-title">${info.title}</h2>
                <p class="comic-description">${info.bio}</p>
                <a href="comicDetails/index.html?id=${id}" class="view-more">查看详情</a>
              </div>
            </div>`;
        } else {
          console.warn(`未找到漫画信息，ID: ${id}`);
        }
      } catch (err) {
        console.error(`获取漫画 ID ${id} 的信息失败:`, err);
      }
    }
  } catch (error) {
    console.error('加载漫画失败:', error);
    container.innerHTML = '<span>加载失败，请稍后重试。</span>';
  } finally {
    hideLoading();
  }
}

loadComics();