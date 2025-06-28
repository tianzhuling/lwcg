import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ukufabnmpevhmonxjmfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWZhYm5tcGV2aG1vbnhqbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTgyNjAsImV4cCI6MjA2NjEzNDI2MH0.xtW2AjVHYKvnjPjFqgYHF0iDLVB_KWhDi0MFU0NFKnA';

const supabase = createClient(supabaseUrl, supabaseKey);

const input = document.getElementById('search-input');
const results = document.getElementById('search-results');

input.addEventListener('input', async () => {
  const keyword = input.value.trim();
  if (!keyword) {
    results.innerHTML = '';
    return;
  }

  const { data: comics, error } = await supabase
    .from('comics')
    .select('id, title, description, cover_url')
    .ilike('title', `%${keyword}%`)
    .limit(10);

  if (error) {
    results.innerHTML = `<li style="color:red;">搜索出错：${error.message}</li>`;
    return;
  }

  if (!comics || comics.length === 0) {
    results.innerHTML = '<li>没有找到匹配的漫画</li>';
    return;
  }

  results.innerHTML = comics.map(comic => `
    <li>
      ${comic.cover_url ? `<img src="${comic.cover_url}" alt="${comic.title}封面" />` : ''}
      <div>
        <a href="../read/comic/index.html?id=${comic.id}" target="_self">${comic.title}</a>
        <p>${comic.description || '暂无简介'}</p>
      </div>
    </li>
  `).join('');
});
