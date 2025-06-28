// login.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// 创建 Supabase 客户端
const supabase = createClient(
  'https://ukufabnmpevhmonxjmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWZhYm5tcGV2aG1vbnhqbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTgyNjAsImV4cCI6MjA2NjEzNDI2MH0.xtW2AjVHYKvnjPjFqgYHF0iDLVB_KWhDi0MFU0NFKnA'
);

// 获取表单 DOM
const form = document.getElementById('login-form');

// 清除游客 cookie 的函数
function clearGuestCookie() {
  document.cookie = "guest=1; path=/; max-age=0";
}

// 登录事件监听
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // 使用 Supabase 登录
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // 如果邮箱未验证
    if (error.message.includes('email not confirmed')) {
      alert('邮箱未验证，请先前往邮箱进行验证。');
    } else {
      alert(`登录失败：${error.message}`);
    }
    return;
  }

  // 登录成功：清除游客 cookie
  clearGuestCookie();

  // 存储登录信息到 localStorage（可选）
  localStorage.setItem('supabaseSession', JSON.stringify(data));

  // 跳转到首页
  window.location.href = '/lwcg/index.html';
});
