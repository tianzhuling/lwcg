import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';
import {alert} from '../js/alert.js'
import {showLoading,hideLoading} from '../js/loading.js'
const supabaseURL = 'https://ukufabnmpevhmonxjmfb.supabase.co';
const supabaseKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWZhYm5tcGV2aG1vbnhqbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTgyNjAsImV4cCI6MjA2NjEzNDI2MH0.xtW2AjVHYKvnjPjFqgYHF0iDLVB_KWhDi0MFU0NFKnA';
const supabase = createClient(supabaseURL, supabaseKEY);

const inputUname = document.getElementById('userName');
const inputPwd = document.getElementById('pwd');
const btn = document.getElementById('submit');

// 函数：检查 userName 和 password
async function checkCredentials(userName, password) {
  try {
    const { data, error } = await supabase
      .from('users')  // 选择 'users' 表
      .select('userName, password')  // 获取 'userName' 和 'password' 字段
      .eq('userName', userName)  // 根据 'userName' 进行匹配
      .single();  // 返回单条数据

    if (error || !data) {
      console.error('userName 不存在');
      return false;  // userName 不存在
    }

    // 直接比较密码
    console.log(data.password)
    if (data.password === password) {
      console.log('userName 和 password 正确');
      return true;
    } else {
      console.log('密码错误');
      return false;
    }
  } catch (err) {
    console.error('发生错误:', err.message);
    return false;
  }
}

// 函数：通过 userName 获取 id
async function getUserId(userName) {
  try {
    const { data, error } = await supabase
      .from('users')  // 从 users 表中查询
      .select('id')   // 只选择 id 字段
      .eq('userName', userName)  // 匹配指定的 userName
      .single();  // 返回单条记录

    if (error || !data) {
      console.error('userName 不存在');
      return null;
    }

    return data.id;  // 返回用户的 id
  } catch (err) {
    console.error('发生错误:', err.message);
    return null;
  }
}

btn.addEventListener('click', async () => {
  showLoading()
  const uname = inputUname.value;
  const pwd = inputPwd.value;

  // 检查用户名和密码是否正确
  const isValid = await checkCredentials(uname, pwd);
  if (isValid) {
    console.log('登录成功');
    localStorage.clear();
    
    alert('登录成功');
    
    // 获取用户 ID
    const id = await getUserId(uname);
    if (id) {
      console.log(`用户的 ID 是: ${id}`);

      // 设置一个有效期 100 年的 cookie
      document.cookie = `ID=${id};max-age=${31536000}; path=/`;  // 100年 = 3153600000秒
      console.log(document.cookie);  // 打印当前 cookie

      // 登录成功后跳转到另一个页面
      window.location.replace('../index.html');
    } else {
      console.log('未找到用户 ID');
    }
  } else {
    alert('登录失败');
  }
  hideLoading()

});
