import { getComicInfoById, getCookieID, getUserInfoById, getChaptersByComicId,deleteComicById} from '../../js/user.js';
import { showLoading, hideLoading } from '../../js/loading.js';
import { alert } from '../../js/alert.js';
const textNumOfChapters =document.getElementById('numOfChapters')
const imageCover = document.getElementById('cover');
const textTitle = document.getElementById('title');
const textBio = document.getElementById('bio');
const textAuthor = document.getElementById('author');
const textPermission = document.getElementById('permission');
const olChapters = document.getElementById('chapters');
const params = new URLSearchParams(window.location.search);
const btnRemoveComic=document.getElementById('removeComic')
const btnEditComic=document.getElementById('editComic')
const divRemoveComic=document.getElementById('divRemoveComic')
const divEditComic=document.getElementById('divEditComic')
const id = params.get('id');
const addChapter = document.getElementById('addChapter');



function loadCSS(url) {
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}


async function loadComicData() {
  try {
    showLoading();

    // 获取漫画信息
    const comicInfo = await getComicInfoById(id);

    // 更新封面图片
    imageCover.innerHTML = `<img src='${comicInfo.cover_url}' alt='Comic Cover'/>`;

    // 更新标题和简介
    textTitle.innerHTML = `<h1>${comicInfo.title}</h1>`;
    textBio.innerHTML = `<span>${comicInfo.bio}</span>`;

    // 获取作者信息
    const userInfo = await getUserInfoById(comicInfo.author_id);
    // 更新作者信息
    textAuthor.innerHTML = `
    <div class='avatar'>
      <img src='${userInfo.avatar}' alt='作者头像'/>
      </div>
      <div class='info'>
      <span>作者: ${userInfo.userName}</span>
      <span>昵称: ${userInfo.nickname}</span>
      </div>
    `;
    
    let myId = getCookieID(document.cookie);
    let permission;

    // 检查权限
    if (myId == comicInfo.author_id) {
      permission = '读写';
      addChapter.innerHTML = `
        <a href="../addChapter/index.html?id=${id}">创建新章节</a>
      `;
      divEditComic.style.display='block'
      divRemoveComic.style.display='block'
    } else {
      permission = '仅读';
    }

    textPermission.innerHTML = `<span>权限: ${permission}</span>`;

    // 获取章节信息
    const chapters = await getChaptersByComicId(id);
    let chaptersHtml = '';

    // 遍历章节
    for (let i = 0; i < chapters.length; i++) {
      const item = chapters[i];
      const title = item.title;
      chaptersHtml += `<li id='chapter${i + 1}' data-chapter-id='${item.id}'>${i + 1} . ${title}</li>`;
    }

    // 更新章节列表
    olChapters.innerHTML = chaptersHtml;

    // 为每个章节添加点击事件
    const chapterItems = olChapters.getElementsByTagName('li');
    for (let i = 0; i < chapterItems.length; i++) {
      chapterItems[i].addEventListener('click', function() {
        const chapterId = this.getAttribute('data-chapter-id');
        // 跳转到章节详情页面
        
        window.location.href = `../../read/index.html?chapterid=${chapterId}&comicid=${id}`;
      });
    }
    textNumOfChapters.innerHTML='全章节('+chapterItems.length+')'
    hideLoading();
  } catch (error) {
    // 错误处理
    console.error("加载漫画数据失败:", error);
    alert("加载漫画数据失败，请稍后再试！");
  }
}

btnEditComic.addEventListener('click',async () => {
  window.location.href=`../../edit/index.html?id=${id}`
})
textAuthor.addEventListener('click',()=>{
  if (true){
    getComicInfoById(id).then(comic=>{
  let authorId=comic.author_id
  window.location.replace('../../author/index.html?id='+authorId)
   })
   }
   
})
btnRemoveComic.addEventListener('click', async () => {
  if (prompt('确定?(Y/n)') == 'Y') {
    const inputName = prompt('请输入完整漫画名');
    const comicInfo = getComicInfoById(id)
    const comicName = comicInfo.title;

    if (inputName == comicName) {
      showLoading();
      deleteComicById(id).then(data => {
        console.log(data);
        hideLoading();
        alert('删除成功');
        localStorage.removeItem('myComicIds');
        window.location.replace('../index.html')
      });
    } else {
      alert('漫画名错误');
    }
  }
});
// 调用函数
loadComicData()
