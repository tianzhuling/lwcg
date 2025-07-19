
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';
import {getCookieID,validateBio} from '../../js/user.js'
import {alert} from '../../js/alert.js'
const supabaseURL = 'https://ukufabnmpevhmonxjmfb.supabase.co';
const supabaseKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWZhYm5tcGV2aG1vbnhqbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTgyNjAsImV4cCI6MjA2NjEzNDI2MH0.xtW2AjVHYKvnjPjFqgYHF0iDLVB_KWhDi0MFU0NFKnA';
const supabase = createClient(supabaseURL, supabaseKEY);
const inputNname=document.getElementById('nickname')
const inputBio=document.getElementById('bio')
const btn=document.getElementById('submit')
function validateUsername(username) {
  const regex = /^[a-zA-Z][a-zA-Z0-9_-]{2,29}$/;
  return regex.test(username);
}


async function updateUser(id, newNickname, newBio) {
  // 更新用户信息
  const { data, error } = await supabase
    .from('users') // 假设 'users' 是你的表名
    .update({ nickname: newNickname, bio: newBio })
    .eq('id', id); // 通过 id 匹配用户

  if (error) {
    console.error('更新失败:', error.message);
    return;
  }

  console.log('更新成功:', data);
}
btn.addEventListener('click',()=>{
  let nname=inputNname.value
  let bio=inputBio.value
  if (!validateUsername(nname)) {
    alert('昵称不可留空 3-30字 且不得含有非法字符');
    return;
  }
  if (!validateBio(bio)){
    alert('这是一个很长的简介，控制在150字之内')
    return
  }
  if (bio.length==0){
    bio='这个作者很高冷，什么也没留下。'
  }
  updateUser(getCookieID(document.cookie),nname,bio)
  alert('修改成功')
  localStorage.removeItem('uname')
  localStorage.removeItem('nname')
  localStorage.removeItem('bio')
  window.location.replace('../index.html')
})