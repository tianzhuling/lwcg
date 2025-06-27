const SUPABASE_URL = 'https://ukufabnmpevhmonxjmfb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWZhYm5tcGV2aG1vbnhqbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTgyNjAsImV4cCI6MjA2NjEzNDI2MH0.xtW2AjVHYKvnjPjFqgYHF0iDLVB_KWhDi0MFU0NFKnA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let uploadedImages = [];

function showStatus(msg, isError = false) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = msg;
  statusEl.style.color = isError ? 'red' : 'var(--primary)';
  
  setTimeout(() => {
    statusEl.textContent = '';
  }, 3000); // 3秒后清除状态消息
}

function updateImageIndexes() {
  const wrappers = document.querySelectorAll('#preview .image-wrapper');
  wrappers.forEach((wrapper, index) => {
    const indexLabel = wrapper.querySelector('.image-index');
    indexLabel.textContent = `第 ${index + 1} 张`;
  });
}

new Sortable(document.getElementById('preview'), {
  animation: 150,
  onEnd: updateImageIndexes,
});

document.getElementById('preview').addEventListener('drop', async (e) => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  await handleFiles(files);
});

['dragenter', 'dragover'].forEach(eventName => {
  document.getElementById('preview').addEventListener(eventName, e => e.preventDefault());
});

document.getElementById('image-file').addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  await handleFiles(files);
});

async function handleFiles(files) {
  const preview = document.getElementById('preview');
  let totalFiles = files.length;
  let uploadedFiles = 0;

  for (const file of files) {
    const filename = `${crypto.randomUUID()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage.from('comics-image')
      .upload(filename, file);
    if (uploadError) {
      showStatus(`图片上传失败：${file.name}`, true);
      continue;
    }

    const { data: urlData, error: urlError } = await supabase
      .storage.from('comics-image')
      .getPublicUrl(uploadData.path);

    if (urlError) {
      showStatus(`获取图片 URL 失败：${file.name}`, true);
      continue;
    }

    uploadedFiles++;
    updateUploadProgress(uploadedFiles, totalFiles);

    uploadedImages.push({ url: urlData.publicUrl, path: uploadData.path });

    const wrapper = document.createElement('div');
    wrapper.className = 'image-wrapper';

    const indexLabel = document.createElement('div');
    indexLabel.className = 'image-index';

    const img = document.createElement('img');
    img.src = urlData.publicUrl;

    const delBtn = document.createElement('button');
    delBtn.textContent = '❌';
    delBtn.style.position = 'absolute';
    delBtn.style.top = '50%';
    delBtn.style.right = '50%';
    delBtn.style.transform = 'translate(50%, -50%)';  // 居中
    delBtn.style.background = '#e74c3c';
    delBtn.style.color = 'white';
    delBtn.style.border = 'none';
    delBtn.style.borderRadius = '50%';
    delBtn.style.fontSize = '14px';
    delBtn.style.width = '24px';
    delBtn.style.height = '24px';
    delBtn.style.cursor = 'pointer';
    delBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    delBtn.onclick = async () => {
      preview.removeChild(wrapper);
      await supabase.storage.from('comics-image').remove([uploadData.path]);
      uploadedImages = uploadedImages.filter(img => img.path !== uploadData.path);
      updateImageIndexes();
      showStatus('已删除图片');
    };

    wrapper.appendChild(indexLabel);
    wrapper.appendChild(img);
    wrapper.appendChild(delBtn);
    preview.appendChild(wrapper);
  }

  updateImageIndexes();
  showStatus(`上传完成，共 ${uploadedImages.length} 张`);
}

function updateUploadProgress(uploadedFiles, totalFiles) {
  const progressBar = document.getElementById('upload-progress');
  const progress = Math.floor((uploadedFiles / totalFiles) * 100);
  progressBar.textContent = `上传进度：${progress}%`;
  progressBar.style.width = `${progress}%`;
}
document.getElementById('comic-title').addEventListener('blur', async () => {
  const title = document.getElementById('comic-title').value.trim();
  const extra = document.getElementById('new-comic-extra');

  if (!title) {
    extra.style.display = 'none';
    return;
  }

  const { data: comic } = await supabase
    .from('comics')
    .select('id')
    .eq('title', title)
    .maybeSingle();

  extra.style.display = comic ? 'none' : 'block';
});

document.getElementById('upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  showStatus('开始上传章节...');
  document.getElementById('upload-progress').textContent = '';
  const progressBar = document.getElementById('upload-progress');
  progressBar.style.width = '0%';

  const title = document.getElementById('comic-title').value.trim();
  const chapter = document.getElementById('chapter-title').value.trim();
  const isNew = document.getElementById('new-comic-extra').style.display !== 'none';
  let description = isNew ? document.getElementById('comic-description').value.trim() : null;
  if (description === '') description = null;
  const coverFile = isNew ? document.getElementById('comic-cover').files[0] : null;

  // 输入验证
  if (!title || !chapter) {
    showStatus('漫画标题和章节标题不能为空！', true);
    return;
  }

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
    } else {
      if (coverFile) {
        const coverFilename = `cover-${crypto.randomUUID()}-${coverFile.name}`;
        const { data: coverUpload, error: coverError } = await supabase
          .storage.from('comics-image')
          .upload(coverFilename, coverFile);
        if (coverError) throw coverError;

        const { data: coverUrlData } = supabase
          .storage.from('comics-image')
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
    }

    const { data: newChapter, error: chapterError } = await supabase
      .from('chapters')
      .insert([{ title: chapter, comic_id: comicId }])
      .select()
      .single();
    if (chapterError) throw chapterError;

    const preview = document.getElementById('preview');
    const wrappers = Array.from(preview.children);
    for (let i = 0; i < wrappers.length; i++) {
      const img = wrappers[i].querySelector('img');
      const url = img.src;

      const { error: insertImageError } = await supabase.from('images').insert([{
        chapter_id: newChapter.id,
        image_url: url,
        order_num: i + 1,
      }]);
      if (insertImageError) throw insertImageError;
    }

    uploadedImages = [];
    document.getElementById('upload-form').reset();
    preview.innerHTML = '';
    document.getElementById('new-comic-extra').style.display = 'none';
    showStatus('上传成功 ✅');
  } catch (err) {
    console.error(err);
    showStatus('上传失败：' + err.message, true);
  }
});
