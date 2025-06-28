// auth.js

function getCookie(name) {
  const cookieString = `; ${document.cookie}`;
  const parts = cookieString.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function setGuestCookie() {
  document.cookie = "guest=1; path=/; max-age=" + 7 * 24 * 60 * 60; // 7天
}

export function getUserStatus() {
  const session = localStorage.getItem('supabaseSession');
  const isGuest = getCookie('guest') === '1';

  if (session) {
    return 'logged';  // 已登录
  } else if (isGuest) {
    return 'guest';   // 游客
  } else {
    setGuestCookie(); // 第一次访问，设置游客 cookie
    return 'none';    // 没有身份（新访客，设置游客身份）
  }
}
