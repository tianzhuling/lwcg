import { getCookieID, getUserInfoById } from '../js/user.js';
import { hideLoading, showLoading } from '../js/loading.js';
const btnLookBio=document.getElementById('lookBio')
const btnChangeInfo=document.getElementById('changeInfo')
const infoUname = document.getElementById('userName');
const infoNickname = document.getElementById('nickname');
const infoBio = document.getElementById('bio');
const infoAvatar = document.getElementById('avatar');
const aLookBio=document.getElementById('aLookBio')
// 获取 Cookie 中的 ID
const id=getCookieID(document.cookie);
// 如果没有找到 ID 或 ID 为 'guest'，跳转到登录页面
if (id == 'guest' || !id) {
  window.location.replace('../login/index.html');
}

// 动态加载 CSS 文件，避免重复加载
function loadCSS(url) {
  if (!document.querySelector(`link[href='${url}']`)) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
  }
}
showLoading();
// 异步获取用户信息并更新页面
const loadUserInfo = async () => {
  
  try {
    // 显示加载中提示
    
    console.log(id)
    let userInfo = await getUserInfoById(id);
    console.log(userInfo)
    if (userInfo) {
      // 更新用户信息到页面
      if (infoUname && infoNickname && infoBio && infoAvatar) {
        // 设置头像 (可以提供一个默认图片)
        infoAvatar.innerHTML = userInfo.avatar ?
          `<img id='pngAvatar' src='${userInfo.avatar}' alt='Avatar' />` :
          `<img id='pngAvatar' src='${userInfo.avatar}' alt='Default Avatar' />`;

        // 设置用户名和昵称
        infoUname.innerHTML = `<span id='textUname'>${userInfo.userName}</span>`;
        localStorage.setItem('uname', userInfo.userName);

        infoNickname.innerHTML = `<span id='textNname'>昵称: ${userInfo.nickname}</span>`;
        localStorage.setItem('nname', userInfo.nickname);

        // 设置用户简介
        infoBio.innerHTML = `<div id='divBio'><span id='textBio'>简介: ${userInfo.bio}</span></div>`;
        localStorage.setItem('bio', userInfo.bio);

        // 动态加载样式
        btnLookBio.style.display='block'
        btnChangeInfo.style.display='block'
        aLookBio.href='lookBio/index.html?id='+id
        loadCSS('style.css')
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
    
    hideLoading();
    
  }
  
};

// 加载用户信息
loadUserInfo();
