const SUPABASE_URL = 'https://ukufabnmpevhmonxjmfb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWZhYm5tcGV2aG1vbnhqbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTgyNjAsImV4cCI6MjA2NjEzNDI2MH0.xtW2AjVHYKvnjPjFqgYHF0iDLVB_KWhDi0MFU0NFKnA'; // 替换为你的 Supabase 匿名 Key
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('upload-form');
const statusEl = document.getElementById('status');
const preview = document.getElementById('preview');
const uploadProgress = document.getElementById('upload-progress');

function showStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? 'red' : 'green';
}

document.getElementById('image-file').addEventListener('change', (e) => {
  preview.innerHTML = '';
  for (const file of e.target.files) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
  }
});

document.getElementById('comic-title').addEventListener('blur', async () => {
  const title = document.getElementById('comic-title').value.trim();
  if (!title) return;
  const { data: comic } = await supabase
    .from('comics')
    .select('id')
    .eq('title', title)
    .maybeSingle();
  document.getElementById('new-comic-extra').style.display = comic ? 'none' : 'block';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  showStatus('开始上传...');
  uploadProgress.textContent = '';

  const title = document.getElementById('comic-title').value.trim();
  const chapter = document.getElementById('chapter-title').value.trim();
  const files = document.getElementById('image-file').files;

  const isNew = document.getElementById('new-comic-extra').style.display !== 'none';
  const description = isNew ? document.getElementById('comic-description').value.trim() : null;
  const coverFile = isNew ? document.getElementById('comic-cover').files[0] : null;

  try {
    let comicId;
    let coverUrl = null;

    const { data: existingComic } = await supabase
      .from('comics')
      .select('id')
      .eq('title', title)
      .maybeSingle();

    if (existingComic) {
      comicId = existingComic.id;
      showStatus('上传章节到已存在的漫画。');
    } else {
      if (coverFile) {
        const coverFilename = `cover-${crypto.randomUUID()}-${coverFile.name}`;
        const { data: coverUpload, error: coverError } = await supabase
          .storage
          .from('comics-image')
          .upload(coverFilename, coverFile);

        if (coverError) throw new Error('封面上传失败：' + coverError.message);

        const { data: coverUrlData } = supabase
          .storage
          .from('comics-image')
          .getPublicUrl(coverUpload.path);

        coverUrl = coverUrlData.publicUrl;
      }

      const { data: newComic } = await supabase
        .from('comics')
        .insert([{ title, description, cover_url: coverUrl }])
        .select()
        .single();

      comicId = newComic.id;
      showStatus('创建新漫画成功，开始上传章节...');
    }

    const { data: newChapter } = await supabase
      .from('chapters')
      .insert([{ title: chapter, comic_id: comicId }])
      .select()
      .single();

    for (let i = 0; i < files.length; i++) {
      uploadProgress.textContent = `上传进度：${i + 1} / ${files.length}`;
      const file = files[i];
      const filename = `${crypto.randomUUID()}-${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('comics-image')
        .upload(filename, file);

      if (uploadError) {
        throw new Error(`上传失败: ${file.name}，错误信息: ${uploadError.message}`);
      }

      const { data: urlData } = supabase
        .storage
        .from('comics-image')
        .getPublicUrl(uploadData.path);

      if (!urlData?.publicUrl) {
        throw new Error('无法获取上传后的图片URL');
      }

      await supabase.from('images').insert([{
        chapter_id: newChapter.id,
        image_url: urlData.publicUrl,
        order_num: i + 1
      }]);
    }

    uploadProgress.textContent = '';
    showStatus('上传成功！');
    form.reset();
    preview.innerHTML = '';
    document.getElementById('new-comic-extra').style.display = 'none';
  } catch (err) {
    console.error(err);
    showStatus('上传失败：' + err.message, true);
  }
});
