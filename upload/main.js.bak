const SUPABASE_URL = 'https://ukufabnmpevhmonxjmfb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWZhYm5tcGV2aG1vbnhqbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTgyNjAsImV4cCI6MjA2NjEzNDI2MH0.xtW2AjVHYKvnjPjFqgYHF0iDLVB_KWhDi0MFU0NFKnA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('upload-form');
  const statusEl = document.getElementById('status');
  const preview = document.getElementById('preview');
  const uploadProgress = document.getElementById('upload-progress');
  const titleEl = document.getElementById('comic-title');
  const extra = document.getElementById('new-comic-extra');

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

  titleEl.addEventListener('blur', async () => {
    const title = titleEl.value.trim();
    console.log('[DEBUG] blur →', title);
    if (!title) {
      extra.style.display = 'none';
      return;
    }

    showStatus('正在校验漫画是否已存在...');
    const { data: comic, error } = await supabase
      .from('comics')
      .select('id')
      .eq('title', title)
      .maybeSingle();

    console.log('[DEBUG] comic:', comic, 'error:', error);
    showStatus('');

    extra.style.display = comic ? 'none' : 'block';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showStatus('开始上传...');
    uploadProgress.textContent = '';

    const title = titleEl.value.trim();
    const chapter = document.getElementById('chapter-title').value.trim();
    const files = document.getElementById('image-file').files;

    const isNew = extra.style.display !== 'none';
    let description = isNew ? document.getElementById('comic-description').value.trim() : null;
    if (description === '') description = null;
    const coverFile = isNew ? document.getElementById('comic-cover').files[0] : null;

    try {
      let comicId;
      let coverUrl = null;

      const { data: existingComic, error: existError } = await supabase
        .from('comics')
        .select('id')
        .eq('title', title)
        .maybeSingle();

      if (existError) throw existError;

      if (existingComic) {
        comicId = existingComic.id;
        showStatus('上传章节到已存在的漫画...');
      } else {
        if (coverFile) {
          const coverFilename = `cover-${crypto.randomUUID()}-${coverFile.name}`;
          const { data: coverUpload, error: coverError } = await supabase
            .storage
            .from('comics-image')
            .upload(coverFilename, coverFile);
          if (coverError) throw coverError;

          const { data: coverUrlData } = supabase
            .storage
            .from('comics-image')
            .getPublicUrl(coverUpload.path);

          coverUrl = coverUrlData.publicUrl;
        }

        const { data: newComic, error: insertError } = await supabase
          .from('comics')
          .insert([{ title, description, cover_url: coverUrl }])
          .select()
          .single();
        if (insertError) throw insertError;

        comicId = newComic.id;
        showStatus('创建新漫画成功，开始上传章节...');
      }

      const { data: newChapter, error: chapterError } = await supabase
        .from('chapters')
        .insert([{ title: chapter, comic_id: comicId }])
        .select()
        .single();
      if (chapterError) throw chapterError;

      for (let i = 0; i < files.length; i++) {
        uploadProgress.textContent = `上传进度：${i + 1} / ${files.length}`;
        const file = files[i];
        const filename = `${crypto.randomUUID()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('comics-image')
          .upload(filename, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase
          .storage
          .from('comics-image')
          .getPublicUrl(uploadData.path);
        if (!urlData?.publicUrl) throw new Error('无法获取上传后的图片URL');

        const { error: imgInsertError } = await supabase.from('images').insert([{
          chapter_id: newChapter.id,
          image_url: urlData.publicUrl,
          order_num: i + 1
        }]);
        if (imgInsertError) throw imgInsertError;
      }

      uploadProgress.textContent = '';
      showStatus('上传成功！');
      form.reset();
      preview.innerHTML = '';
      extra.style.display = 'none';
    } catch (err) {
      console.error(err);
      showStatus('上传失败：' + err.message, true);
    }
  });
});
