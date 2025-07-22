import {getCookieID,getUserInfoById,deleteUserById} from '../js/user.js'
import {showLoading,hideLoading} from '../js/loading.js'
const btnRemove=document.getElementById('removeUser')
const btnSignOut=document.getElementById('signOut')
const btnRemoveCache=document.getElementById('removeCache')
btnRemoveCache.addEventListener('click',()=>{
  localStorage.clear()
  alert('清除成功')
})
btnSignOut.addEventListener('click',()=>{
  if (prompt('确定?(Y/n)')=='Y'){
    document.cookie=`ID=guest;max-age=${31536000}; path=/`
    console.log(document.cookie)
    alert('登出成功')
    localStorage.clear();
    //window.location.replace('../index.html')
    
  }
  
})
btnRemove.addEventListener('click',()=>{
  if (prompt('确定?(Y/n)')=='Y'){
    inputName=prompt('输入你的账号的完整识别名即可删除:')
    let id=getCookieID(document.cookie)
    if (getUserInfoById(id).userName==inputName) {
      showLoading()
      deleteUserById(id).then(data=>{
        hideLoading()
        console.log(data)
        alert('已成功注销账户')
        localStorage.clear();
        window.location.href='../index.html'
      })
    }else{
      alert('输入错误')
      
    }
  }
  
})