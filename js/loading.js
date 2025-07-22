// 创建加载弹窗（只需调用一次）
export function createLoadingOverlay() {
  if (document.getElementById('loadingOverlay')) return; // 已存在则不重复创建

  const overlay = document.createElement('div');
  overlay.id = 'loadingOverlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background-color: rgba(0,0,0,0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;

  const popup = document.createElement('div');
  popup.style.cssText = `
    background-color: #fff;
    padding: 24px 32px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    text-align: center;
  `;

  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: 48px;
    height: 48px;
    border: 6px solid #f3f3f3;
    border-top: 6px solid #4f46e5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 12px auto;
  `;
  spinner.classList.add('spinner');

  const text = document.createElement('p');
  text.textContent = '加载中，请稍候...';
  text.style.cssText = `color: #4f46e5; font-weight: bold;`;

  popup.appendChild(spinner);
  popup.appendChild(text);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // 添加动画 keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

// 显示弹窗
export function showLoading() {
  createLoadingOverlay(); // 确保已创建
  document.getElementById('loadingOverlay').style.display = 'flex';
}

// 隐藏弹窗
export function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.style.display = 'none';
}
