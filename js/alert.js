export function alert(message) {
  // 如果已有弹窗，先移除
  const old = document.getElementById('customAlertBox');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.id = 'customAlertBox';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background: white;
    padding: 24px 32px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 0 20px rgba(0,0,0,0.2);
    max-width: 80%;
    font-size: 16px;
  `;

  const msg = document.createElement('p');
  msg.textContent = message;

  const btn = document.createElement('button');
  btn.textContent = '确定';
  btn.style.cssText = `
    margin-top: 16px;
    padding: 8px 16px;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  `;

  btn.onclick = () => overlay.remove();

  box.appendChild(msg);
  box.appendChild(btn);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}
const cdn = "https://cdn.jsdelivr.net/gh/tianzhuling/lwcg@main";

window.addEventListener('DOMContentLoaded', () => {
  // 替换 script 标签的 src
  document.querySelectorAll('script[src^="../"]').forEach(el => {
    const relative = el.getAttribute("src").replace(/^(\.\.\/)+/, "");
    el.src = cdn + "/" + relative;
  });

  // 替换 link 标签的 href（比如 CSS）
  document.querySelectorAll('link[href^="../"]').forEach(el => {
    const relative = el.getAttribute("href").replace(/^(\.\.\/)+/, "");
    el.href = cdn + "/" + relative;
  });

  // 替换 img 标签的 src（图片）
  document.querySelectorAll('img[src^="../"]').forEach(el => {
    const relative = el.getAttribute("src").replace(/^(\.\.\/)+/, "");
    el.src = cdn + "/" + relative;
  });
});
