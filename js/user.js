import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';
const supabaseURL = 'https://ukufabnmpevhmonxjmfb.supabase.co';
const supabaseKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWZhYm5tcGV2aG1vbnhqbWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTgyNjAsImV4cCI6MjA2NjEzNDI2MH0.xtW2AjVHYKvnjPjFqgYHF0iDLVB_KWhDi0MFU0NFKnA';
const supabase = createClient(supabaseURL, supabaseKEY);
// 从 Cookie 中获取 ID
export const getCookieID = () => {
  const cookieName = "ID=";
  const cookieString = document.cookie;
  const cookies = cookieString.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.startsWith(cookieName)) {
      return cookie.substring(cookieName.length);
    }
  }
  return null;
};

// 获取用户信息
export const getUserInfoById = async (userId, fields = "bio,nickname,userName,avatar") => {
  /*try {*/
    const fieldList = fields.split(',').map(f => f.trim());
    const result = {};
    const missingFields = [];

    const keyMap = {
      userName: 'uname',
      nickname: 'nname',
      bio: 'bio'
    };

    for (const field of fieldList) {
      const localKey = keyMap[field];
      const cached = localStorage.getItem(localKey);
      if (cached !== null) {
        result[field] = cached;
      } else {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      const { data, error } = await supabase
        .from('users')
        .select(missingFields.join(','))
        .eq('id', userId)
        .single();

      if (error) throw error;

      for (const field of missingFields) {
        result[field] = data[field] || '';
        const localKey = keyMap[field];
        localStorage.setItem(localKey, data[field] || '');
      }
    }

    return result;
  /*} catch (error) {
    console.error('Error fetching user info:', error.message);
    return null;
  }
  */
};

export function validateUsername(username) {
  const regex = /^[a-zA-Z][a-zA-Z0-9_-]{2,29}$/;
  return regex.test(username);
}

export function validateBio(bio) {
  return bio.length <= 150;
}
export async function uploadImage(file, bucketName = 'comics', directory = 'images') {
  const fileExt = file.name.split('.').pop();
  const uniqueName = `${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0]}`;
  const filePath = `${directory}/${uniqueName}.${fileExt}`;

  try {
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: publicData, error: urlError } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (urlError) {
      throw urlError;
    }

    const publicURL = publicData && publicData.publicUrl;

    console.log('文件上传成功，URL:', publicURL);
    return publicURL;
  } catch (error) {
    console.error('上传文件时出错:', error.message);
    throw new Error(`上传失败: ${error.message}`);
  }
}

export async function uploadImages(files, bucketName = 'comics') {
  if (files.length > 0) {
    const urls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const fileUrl = await uploadImage(file, bucketName);
        urls.push(fileUrl);
      } catch (error) {
        console.error(error);
        urls.push(`上传失败: ${error.message}`);
      }
    }

    console.log('上传成功的文件 URLs:', urls);
    return urls;
  } else {
    console.log('没有选择文件');
    return [];
  }
}

export async function addComic(coverUrl, bio, title, authorId) {
  if (!coverUrl || !bio || !title || !authorId) {
    throw new Error('cover_url, bio, title, and author_id are required');
  }

  try {
    const { data, error } = await supabase
      .from('comics')
      .insert([
        {
          cover_url: coverUrl,
          bio: bio,
          title: title,
          author_id: authorId,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      throw error;
    }

    console.log('新增漫画记录成功:', data);
    return data;
  } catch (error) {
    console.error('新增漫画记录时出错:', error.message);
    throw new Error(`新增失败: ${error.message}`);
  }
}
export async function getComicIdsByUserId(userId) {
  if (!userId) {
    console.error('userId 参数不能为空');
    return [];
  }

  const { data, error } = await supabase
    .from('comics')
    .select('id')
    .eq('author_id', userId); // 通过外键字段匹配用户

  if (error) {
    console.error('查询漫画失败:', error);
    return [];
  }

  return data.map(comic => comic.id);
}
export async function getComicInfoById(comicId) {
  if (!comicId) {
    console.error('comicId 参数不能为空');
    return null;
  }

  const { data, error } = await supabase
    .from('comics')
    .select('bio, title, cover_url,author_id,views')
    .eq('id', comicId)
    .single(); // 只返回一条结果

  if (error) {
    console.error('获取漫画信息失败:', error);
    return null;
  }
  console.log(data)
  return data;
}
export async function isComicTitleDuplicate(title, excludeId = null) {
  if (!title) {
    console.error('标题不能为空');
    return false;
  }

  let query = supabase
    .from('comics')
    .select('id')
    .eq('title', title)
    .limit(1); // 只查1条就够判断了

  if (excludeId) {
    query = query.neq('id', excludeId); // 排除当前正在编辑的漫画
  }

  const { data, error } = await query;

  if (error) {
    console.error('检查标题时出错:', error);
    return false;
  }

  return data.length > 0; // 如果查到一条，说明已存在重复标题
}
// 获取 comic_id 对应的所有章节
export async function getChaptersByComicId(comicId) {
  // 1. 数据验证
  if (!comicId) {
    console.error("漫画 ID 不能为空！");
    return [];
  }

  // 2. 查询章节表获取所有匹配的章节
  try {
    const { data, error } = await supabase
      .from('chapters')  // 表名为 'chapters'
      .select('*')  // 获取所有字段
      .eq('comic_id', comicId);  // 根据 comic_id 进行过滤

    if (error) {
      throw error;  // 如果查询失败，抛出错误
    }

    // 成功返回数据
    if (data.length > 0) {
      console.log('找到的章节:', data);
      return data;  // 返回章节数据
    } else {
      console.log('没有找到对应的章节');
      return [];
    }
  } catch (error) {
    console.error('查询章节时出错:', error.message);
    return [];  // 出现错误时返回空数组
  }
}
export async function uploadChapter(title, chapterNumber, comicId) {
  // 调试日志：打印要插入的数据
  console.log('插入数据:', {
    title: title,
    chapter_number: chapterNumber,
    comic_id: comicId,
    created_at: new Date(),
  });

  const { data, error } = await supabase
    .from('chapters') // 替换成你实际的表名
    .insert([
      {
        title: title,
        chapter_number: chapterNumber,
        comic_id: comicId,
        created_at: new Date(),
      }
    ])
    .single(); // 确保返回单个对象

  // 调试日志：检查返回数据
  console.log('插入响应:', { data, error });

  if (error) {
    console.error('插入章节失败:', error);
    return null;
  }

  // 检查 data 是否有效
  if (!data) {
    console.error('没有返回数据，插入失败');
    return null;
  }

  // 确保获取到了插入的 ID
  console.log('插入的章节 ID:', data.id); 
  return data.id; // 返回插入数据的 ID
}

export async function uploadPage(chapterId, pageNumber, url ){
  // 1. 数据验证
  if (!chapterId || !pageNumber || !url) {
    console.error("章节id、页码或url不能为空！");
    return;
  }

  // 2. 插入章节数据
  try {
    const { data, error } = await supabase
      .from('pages')  // 假设你有一个名为 'chapters' 的表
      .insert([
        {
          chapter_id: chapterId,            // 章节标题
          page_number: pageNumber, // 章节号
          image_url: url     // 漫画ID
        }
      ]);

    if (error) {
      throw error;
    }

    // 成功时的反馈
    console.log('章节上传成功:', data);
    return data;  // 返回插入的数据
  } catch (error) {
    console.error('上传章节失败:', error.message);
  }
}
export async function getChapterIdByNumber(chapterNumber, comicId) {
  const { data, error } = await supabase
    .from('chapters')
    .select('id')
    .eq('chapter_number', chapterNumber)
    .eq('comic_id', comicId)
    .single()
  if (error) {
    console.error("Error fetching chapter ID:", error);
    return null;  // 发生错误时返回 null
  }

  return data;  // 返回符合条件的章节 ID 数据
}
// 获取章节详细信息
export async function getChapterById(chapterId) {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('id', chapterId)
    .single();
/*
  if (error) {
    throw new Error('获取章节数据失败',error);
  }
*/
  return data;
}

// 获取下一章信息
export async function getNextChapterById(chapterId) {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .gt('id', chapterId) // 获取比当前章节 ID 大的章节（即下一章）
    .order('id', { ascending: true })
    .limit(1)
    .single();

  if (error) {
    console.error('获取下一章失败:', error);
    return null;
  }

  return data;
}

// 获取上一章信息
export async function getPreviousChapterById(chapterId) {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .lt('id', chapterId) // 获取比当前章节 ID 小的章节（即上一章）
    .order('id', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('获取上一章失败:', error);
    return null;
  }

  return data;
}
export async function getPagesByChapterId(chapterId) {
  try {
    // 查询 pages 表中与指定 chapter_id 相关的记录
    const { data, error } = await supabase
      .from('pages')  // 表名
      .select('*')    // 选择所有字段
      .eq('chapter_id', chapterId);  // 筛选特定 chapter_id

    if (error) {
      throw new Error(error.message);
    }

    // 返回筛选结果
    return data;

  } catch (error) {
    console.error('获取页面失败:', error);
    return null;
  }
}
export async function deleteComicById(comicId) {
  const { data, error } = await supabase
    .from('comics')
    .delete()
    .eq('id', comicId)

  if (error) {
    console.error('删除失败:', error.message)
    return null
  }

  console.log('删除成功:', data)
  return data
}
export async function deleteUserById(userId) {
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)

  if (error) {
    console.error('删除失败:', error.message)
    return null
  }

  console.log('删除成功:', data)
  return data
}
export async function deleteChapterById(chapterId) {
  try {
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', chapterId)

    if (error) throw error
    return true
  } catch (err) {
    console.error('删除章节失败:', err.message)
    return false
  }
}

export async function searchComics(keyword) {
  if (!keyword || keyword.trim() === '') return [];

  try {
    const { data, error } = await supabase
      .from('comics')
      .select('*')
      .or(`title.ilike.%${keyword}%,bio.ilike.%${keyword}%`)  // 模糊匹配 title 或 bio 中含有关键词

    if (error) {
      console.error('搜索失败:', error.message);
      return [];
    }

    return data;
  } catch (err) {
    console.error('搜索异常:', err);
    return [];
  }
}
// type: 'hot' | 'new'
export async function getRecommendedComics(type = 'hot', limit = 10) {
  let query;

  if (type === 'hot') {
    // 查询漫画并按章节数降序排序
    const { data, error } = await supabase
  .from('comics')
  .select('*')
  .order('views', { ascending: false });
  

    if (error) {
      console.error('获取最热漫画失败:', error.message);
      return [];
     }
    return data;
  } else if (type === 'new') {
    const { data, error } = await supabase
      .from('comics')
      .select('*')
      .order('created_at', { ascending: false })
      //.limit(limit);

    if (error) {
      console.error('获取最新漫画失败:', error.message);
      return [];
    }

    return data;
  }
}
export function isValidTitle(title) {
  if (typeof title !== 'string') return false;

  const trimmed = title.trim();

  // 长度限制：3 ~ 30 个字符
  if (trimmed.length < 3 || trimmed.length > 30) return false;

  // 允许中文、英文、数字、空格、下划线
  const validPattern = /^[\u4e00-\u9fa5\w\s]+$/;
  return validPattern.test(trimmed);
}
export function getCroppedAvatarFile(cropper, fileName = 'avatar.png') {
  return new Promise((resolve, reject) => {
    if (!cropper) {
      reject(new Error('Cropper 未初始化'));
      return;
    }

    const canvas = cropper.getCroppedCanvas({
      width: 200,
      height: 200,
    });

    if (!canvas) {
      reject(new Error('无法获取裁剪画布'));
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('裁剪失败，未生成 Blob'));
        return;
      }

      const file = new File([blob], fileName, { type: 'image/png' });
      resolve(file);
    }, 'image/png');
  });
}
export async function updateUserAvatar(userId, avatarUrl) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ avatar: avatarUrl })
      .eq('id', userId);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    console.error('更新用户头像失败:', err);
    return { success: false, error: err };
  }
}
export async function updateViewsByComicId(comicId, views) {
  try {
    const { error } = await supabase
      .from('comics')
      .update({ views: views })
      .eq('id', comicId);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    console.error('更新漫画浏览记录失败:', err);
    return { success: false, error: err };
  }
}
export async function getCommentsByComicId(comicId) {
  if (!comicId) {
    return { comments: [], error: 'comicId 不能为空' };
  }

  const { data, error } = await supabase
    .from('comments')
    .select('id, content, user_id, created_at') // 也可以加用户表信息
    .eq('comic_id', comicId)
    .order('created_at', { ascending: false }); // 按时间倒序排列（新评论在前）

  if (error) {
    console.error('获取评论失败:', error.message);
    return { comments: [], error: error.message };
  }

  return { comments: data, error: null };
}
export async function uploadComment(content, comicId, userId) {
  if (!content || !comicId || !userId) {
    return { success: false, error: '参数不能为空' };
  }

  const { error } = await supabase
    .from('comments')
    .insert([
      {
        content,
        comic_id: comicId,
        user_id: userId,
      }
    ]);

  if (error) {
    console.error('上传评论失败:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}