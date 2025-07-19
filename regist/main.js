
import { createClient} from 'https://cdn.skypack.dev/@supabase/supabase-js';
import {alert} from '../js/alert.js'
import {validateUsername} from '../js/user.js'
import {showLoading,hideLoading} from '../js/loading.js'
const supabaseURL = 'https://ukufabnmpevhmonxjmfb.supabase.co';
const supabaseKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWZhYm5tcGV2aG1vbnhqbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTgyNjAsImV4cCI6MjA2NjEzNDI2MH0.xtW2AjVHYKvnjPjFqgYHF0iDLVB_KWhDi0MFU0NFKnA';
const supabase = createClient(supabaseURL, supabaseKEY);

const btn = document.getElementById('submit');
const inputUname = document.getElementById('userName');
const inputPwd = document.getElementById('pwd');
const inputRepwd = document.getElementById('repwd');
const inputNickName = document.getElementById('nickname');



function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*\d)[a-z\d]{8,20}$/;
  return regex.test(password);
}

async function addUser(nickname, userName, password) {
  const { data, error } = await supabase
    .from('users')
    .insert([{ nickname, userName, password }]);

  if (error) {
    console.error('Error adding user:', error.message);
  } else {
    console.log('User added successfully:', data);
  }
}

async function checkUsernameExists(userName) {
  const { data, error } = await supabase
    .from('users')
    .select('userName')
    .eq('userName', userName);

  if (error) {
    console.error('查询错误:', error.message);
    return false;
  }

  return data.length > 0;  // 如果返回的结果中有数据，说明用户名已存在
}

btn.addEventListener('click', async () => {
  showLoading()
  let uname = inputUname.value;
  let pwd = inputPwd.value;
  let nickName = inputNickName.value;
  let repwd = inputRepwd.value;

  if (!validateUsername(uname)) {
    alert('用户名不可留空 3-30字 且不得含有非法字符');
    return;
  }

  const exists = await checkUsernameExists(uname);
  if (exists) {
    alert('用户名重复，请尝试使用其他用户名');
    return;
  } else {
    console.log('该用户名可以使用');
  }

  if (!validateUsername(nickName)) {
    alert('昵称不可留空 3-30字 且不得含有非法字符');
    return;
  }

  if (!validatePassword(pwd)) {
    alert('密码不可留空 8-20字 数字+字母');
    return;
  }

  if (pwd !== repwd) {
    alert('确认密码与原密码不同');
    return;
  }

  await addUser(nickName, uname, pwd);
  hideLoading()
  alert('账户创建成功');
  
  // 跳转到一个新的 URL，并替换当前页面
  window.location.replace('../login/index.html');
});
