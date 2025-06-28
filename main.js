function getCookie(name) {
  const cookieString = `; ${document.cookie}`;
  const parts = cookieString.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function setGuestCookie() {
  document.cookie = "guest=1; path=/; max-age=" + 7 * 24 * 60 * 60; // 7天
  console.log('🔵 第一次访问，设置为游客');
}

window.addEventListener('DOMContentLoaded', () => {
  const isGuest = getCookie('guest') === '1';
  const session = localStorage.getItem('supabaseSession');

  if (session) {
    console.log('✅ 已登录');
  } else if (isGuest) {
    console.log('🟡 游客访问');
  } else {
    setGuestCookie(); // ✅ 不属于已登录，也不是游客，就设置
  }
});
