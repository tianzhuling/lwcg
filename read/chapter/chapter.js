import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 初始化 Supabase
const supabase = createClient(
  'https://ukufabnmpevhmonxjmfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWZhYm5tcGV2aG1vbnhqbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTgyNjAsImV4cCI6MjA2NjEzNDI2MH0.xtW2AjVHYKvnjPjFqgYHF0iDLVB_KWhDi0MFU0NFKnA'
)

// 获取章节ID
const params = new URLSearchParams(window.location.search)
const chapterId = params.get('id')

const container = document.getElementById('image-container')

if (!chapterId) {
  container.innerHTML = '未提供章节 ID。'
} else {
  // 查询图片列表
  const loadImages = async () => {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('order_num', { ascending: true })

    container.innerHTML = ''

    if (error) {
      container.textContent = '加载图片失败：' + error.message
    } else if (!data || data.length === 0) {
      container.textContent = '该章节暂无图片。'
    } else {
      data.forEach(img => {
        const imageEl = document.createElement('img')
        imageEl.src = img.image_url
        imageEl.alt = '漫画图片'
        container.appendChild(imageEl)
      })
    }
  }

  loadImages()
}
