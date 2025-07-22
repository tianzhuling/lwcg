export function loadComic(comic,id) {
  if (id){
    id=id
  }else{
    id=comic.id
  }
  return  `
      <div class="comic-item">
        <img src="${comic.cover_url}" alt="漫画封面" class="comic-cover">
        <div class="comic-info">
          <h2 class="comic-title">${comic.title}</h2>
          <p class="comic-description">${comic.bio}</p>
          <p class="comic-description">👀${comic.views}</p>
          <a href="../upload/comicDetails/index.html?id=${id}" class="view-more">查看详情</a>
        </div>
      </div>
    `
}