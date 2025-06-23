import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://ukufabnmpevhmonxjmfb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWZhYm5tcGV2aG1vbnhqbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTgyNjAsImV4cCI6MjA2NjEzNDI2MH0.xtW2AjVHYKvnjPjFqgYHF0iDLVB_KWhDi0MFU0NFKnA'; // 替换为你的 Supabase 匿名 Key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const params = new URLSearchParams(window.location.search);
const comicId = params.get('id');

const comicTitleElem = document.getElementById('comic-title');
const comicCoverElem = document.getElementById('cover-img');
const comicDescriptionElem = document.getElementById('comic-description');
const chapterList = document.getElementById('chapter-list');

if (!comicId) {
  comicTitleElem.textContent = '无效的漫画ID';
} else {
  // 获取漫画详情
  const { data: comic, error } = await supabase
    .from('comics')
    .select('title, cover_url, description')
    .eq('id', comicId)
    .single();

  if (error || !comic) {
    comicTitleElem.textContent = '未找到该漫画';
  } else {
    comicTitleElem.textContent = comic.title;
    comicCoverElem.src = comic.cover_url;
    comicDescriptionElem.textContent = comic.description;
  }

  // 获取章节列表
  const { data: chapters, error: chapterError } = await supabase
    .from('chapters')
    .select('id, title, order_num')
    .eq('comic_id', comicId)
    .order('order_num', { ascending: true });

  if (chapterError || !chapters) {
    chapterList.innerHTML = '<li>加载章节失败</li>';
  } else if (chapters.length === 0) {
    chapterList.innerHTML = '<li>暂无章节</li>';
  } else {
    chapterList.innerHTML = chapters.map(ch => `
      <li>
        <a href="tianzhuling.github.io/lwcg/read/chapter/index.html?id=${ch.id}" target="_self">
          ${ch.order_num !== null ? ch.order_num + '. ' : ''}${ch.title}
        </a>
      </li>
    `).join('');
  }
}
