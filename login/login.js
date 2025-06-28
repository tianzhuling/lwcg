import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ukufabnmpevhmonxjmfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWZhYm5tcGV2aG1vbnhqbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTgyNjAsImV4cCI6MjA2NjEzNDI2MH0.xtW2AjVHYKvnjPjFqgYHF0iDLVB_KWhDi0MFU0NFKnA'; // 请保持密钥私密
const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById('login-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // 使用 Supabase 进行登录验证
  const { user, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert(error.message);  // 显示错误消息
    return;
  }

  // 登录成功后跳转到首页
  window.location.href = '/lwcg/index.html';  // 请根据你的项目路径修改
});
