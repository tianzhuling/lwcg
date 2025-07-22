import { getCookieID, getUserInfoById,getComicIdsByUserId,getComicInfoById} from '../js/user.js';
import { hideLoading, showLoading } from '../js/loading.js';
const listContainer = document.getElementById('recommend-list');

const btnLookBio=document.getElementById('lookBio')
const btnChangeInfo=document.getElementById('changeInfo')
const infoUname = document.getElementById('userName');
const infoNickname = document.getElementById('nickname');
const infoBio = document.getElementById('bio');
const infoAvatar = document.getElementById('avatar');
const aLookBio=document.getElementById('aLookBio')
const params = new URLSearchParams(window.location.search);
const id=params.get('id')
//start


// 游客


// 显示/隐藏 登录接口
console.log(getCookieID(document.cookie));
console.log(document.cookie)



function renderComics(comics) {
  listContainer.innerHTML = '';

  if (comics.length === 0) {
    listContainer.innerHTML = '<p style="text-align:center;">暂无推荐漫画</p>';
    return;
  }
  console.log(comics)
  comics.forEach(comic => {
    comic= getComicInfoById(comic).then(comic=>{    
    const comicId = comic.id;
    const comicInfo = comic;

    const html = `
      <div class="comic-item">
        <img src="${comicInfo.cover_url}" alt="漫画封面" class="comic-cover">
        <div class="comic-info">
          <h2 class="comic-title">${comicInfo.title}</h2>
          <p class="comic-description">${comicInfo.bio}</p>
          <a href="upload/comicDetails/index.html?id=${comicId}" class="view-more">查看详情</a>
        </div>
      </div>
    `;
    
    listContainer.innerHTML += html;
     })
  });
}

async function load(type) {
  const comics = await getComicIdsByUserId(id);
  console.log(comics)
  renderComics(comics);
}



// 默认加载最热

//end
// 如果没有找到 ID 或 ID 为 'guest'，跳转到登录页面

// 动态加载 CSS 文件，避免重复加载

showLoading();
// 异步获取用户信息并更新页面
const loadUserInfo = async () => {
  
  try {
    // 显示加载中提示
    

    let userInfo = await getUserInfoById(id);

    if (userInfo) {
      // 更新用户信息到页面
      if (infoUname && infoNickname && infoBio && infoAvatar) {
        // 设置头像 (可以提供一个默认图片)
        infoAvatar.innerHTML = userInfo.avatar ?
          `<img id='pngAvatar' src='${userInfo.avatar}' alt='Avatar' />` :
          `<img id='pngAvatar' src='${userInfo.avatar}' alt='Default Avatar' />`;

        // 设置用户名和昵称
        infoUname.innerHTML = `<span id='textUname'>${userInfo.userName}</span>`

        infoNickname.innerHTML = `<span id='textNname'>昵称: ${userInfo.nickname}</span>`;
        

        // 设置用户简介
        infoBio.innerHTML = `<div id='divBio'><span id='textBio'>简介: ${userInfo.bio}</span></div>`;
        

        // 动态加载样式
        btnLookBio.style.display='block'
        aLookBio.href='../me/lookBio/index.html?id='+id
      } else {
        console.error('HTML 元素不存在!');
      }
    } else {
      console.log('未找到用户信息');
      // 设置默认内容
      infoAvatar.innerHTML = `<img id='pngAvatar' src='../image/avatar.png' alt='Default Avatar' />`;
      infoUname.innerHTML = `<span id='textUname'>用户信息加载失败</span>`;
      infoNickname.innerHTML = `<span id='textNname'>未知昵称</span>`;
      infoBio.innerHTML = `<div id='divBio'><span id='textBio'>暂无简介</span></div>`;
      
    }
  } catch (error) {
    console.error('加载用户信息时出错:', error.message);
    // 错误时也显示默认内容
    infoAvatar.innerHTML = `<img id='pngAvatar' src='../image/avatar.png' alt='Default Avatar' />`;
    infoUname.innerHTML = `<span id='textUname'>加载用户信息失败</span>`;
    infoNickname.innerHTML = `<span id='textNname'>未知昵称</span>`;
    infoBio.innerHTML = `<div id='divBio'><span id='textBio'>无法加载简介</span></div>`;
    
  } finally {
    // 隐藏加载中提示
    load()
    hideLoading();
    
  }
};

// 加载用户信息
loadUserInfo();
