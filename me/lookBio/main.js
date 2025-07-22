import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';
import { getCookieID,getUserInfoById } from '../../js/user.js';
const params = new URLSearchParams(window.location.search);
const supabaseURL = 'https://ukufabnmpevhmonxjmfb.supabase.co';
const supabaseKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWZhYm5tcGV2aG1vbnhqbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTgyNjAsImV4cCI6MjA2NjEzNDI2MH0.xtW2AjVHYKvnjPjFqgYHF0iDLVB_KWhDi0MFU0NFKnA';
const supabase = createClient(supabaseURL, supabaseKEY);
const content = document.getElementById('content');
const btnQuit=document.getElementById('qiut')
// 获取用户 ID，并更新 content
async function updateBioContent() {
  const userId =params.get('id')// 获取用户 ID

  // 如果没有获取到 ID，提前退出
  if (!userId || userId === 'guest') {
    content.innerHTML = "用户未登录或无效 ID";
    return;
  }
  if (getCookieID(document.cookie)==userId){
    btnQuit.href='../index.html'
  }else{
    btnQuit.href='../../author/index.html?id='+id
  }
  try {
    // 获取用户 bio（只取 bio 字段）
    const userInfo = await getUserInfoById(userId, 'bio');
    const bio = userInfo.bio;

    console.log('用户简介:', bio);

    if (bio && bio.trim() !== '') {
      content.innerHTML = bio;  // 显示 bio
    } else {
      content.innerHTML = "未找到用户的简介";
    }
  } catch (err) {
    console.error('获取用户简介失败:', err);
    content.innerHTML = "加载用户简介时出错";
  }
}

// 执行函数
updateBioContent();
