import './teaching-flow.js';

const base = './assets/wiring/';
const diagrams = {
  display: {
    src: base + 'display.jpg',
    alt: 'OLED 屏幕模块、ESP32-C3 与电源模块实物接线图',
    note: '连线直接接到图中标出的 OLED 和 ESP32-C3 引脚。'
  },
  infrared: {
    src: base + 'infrared.jpg',
    alt: '左右 LM393 红外模块、ESP32-C3 与电源模块实物接线图',
    note: '左红外 OUT 接 GPIO4，右红外 OUT 接 GPIO3；OLED 可选，未接时看网页实时状态。'
  },
  servo_pan: {
    src: base + 'servo-pan.jpg',
    alt: '水平 SG90 舵机、ESP32-C3 与电源模块实物接线图',
    note: '水平舵机信号接 GPIO5，本步只接水平舵机；OLED 可选，已接时保持原接线，图中省略屏幕连线。'
  },
  servo_tilt: {
    src: base + 'servo-tilt.jpg',
    alt: '俯仰 SG90 舵机、ESP32-C3 与电源模块实物接线图',
    note: '俯仰舵机信号接 GPIO6，本步只接俯仰舵机；OLED 可选，已接时保持原接线，图中省略屏幕连线。'
  },
  touch: {
    src: base + 'touch.jpg',
    alt: 'TTP223 触摸模块、铜箔、ESP32-C3 与电源模块实物接线图',
    note: 'TTP223 OUT 接 GPIO10；OLED 可选，触摸状态和次数直接在网页查看。铜箔接触摸感应区。'
  }
};

function photoFigure({ src, alt, note }) {
  return `<figure class="photo-diagram">
    <button type="button" class="photo-zoom-trigger" aria-label="打开接线图原图">
      <img src="${src}" alt="${alt}">
    </button>
    <figcaption><strong>${note}</strong><span>点击图片可查看原图</span></figcaption>
  </figure>`;
}

for (const [id, diagram] of Object.entries(diagrams)) {
  const card = document.querySelector('#step-' + id);
  if (!card) continue;
  card.querySelector('.parts-row')?.remove();
  const wiring = card.querySelector('.wiring-card');
  if (!wiring) continue;
  wiring.classList.add('photo-wiring-card');
  wiring.innerHTML = photoFigure(diagram);
}

const robotCard = document.querySelector('#step-robot');
if (robotCard) {
  robotCard.querySelector('.parts-row')?.remove();
  const wiring = robotCard.querySelector('.wiring-card');
  if (wiring) {
    wiring.classList.add('photo-wiring-card', 'photo-wiring-complete');
    wiring.innerHTML = `
      <p class="photo-intro">按顺序打开五张图，逐项核对全部接线。</p>
      <div class="photo-accordion">
        <details open><summary>① 屏幕模块</summary>${photoFigure(diagrams.display)}</details>
        <details><summary>② 左右红外</summary>${photoFigure(diagrams.infrared)}</details>
        <details><summary>③ 水平舵机</summary>${photoFigure({ ...diagrams.servo_pan, note: '完整系统连接两个舵机；水平舵机信号接 GPIO5，OLED 保持屏幕图中的接线。' })}</details>
        <details><summary>④ 俯仰舵机</summary>${photoFigure({ ...diagrams.servo_tilt, note: '完整系统连接两个舵机；俯仰舵机信号接 GPIO6，OLED 保持屏幕图中的接线。' })}</details>
        <details><summary>⑤ 触摸模块</summary>${photoFigure({ ...diagrams.touch, note: '完整系统连接全部模块；TTP223 OUT 接 GPIO10，OLED 显示摸头表情。' })}</details>
      </div>`;

    const sections = [...wiring.querySelectorAll('.photo-accordion details')];
    sections.forEach(section => section.addEventListener('toggle', () => {
      if (!section.open) return;
      sections.forEach(other => {
        if (other !== section) other.open = false;
      });
    }));
  }
}

const lightbox = document.createElement('div');
lightbox.className = 'photo-lightbox';
lightbox.hidden = true;
lightbox.innerHTML = `<div class="photo-lightbox-panel" role="dialog" aria-modal="true" aria-label="接线图原图预览">
  <button type="button" class="photo-lightbox-close" aria-label="关闭原图预览">×</button>
  <img src="" alt="">
  <p>点击背景或按 Esc 关闭</p>
</div>`;
document.body.append(lightbox);

const lightboxImage = lightbox.querySelector('img');
const lightboxClose = lightbox.querySelector('.photo-lightbox-close');
let previousFocus = null;

function closeLightbox() {
  if (lightbox.hidden) return;
  lightbox.hidden = true;
  lightboxImage.removeAttribute('src');
  lightboxImage.alt = '';
  document.body.classList.remove('photo-lightbox-open');
  previousFocus?.focus();
}

document.addEventListener('click', event => {
  const trigger = event.target.closest('.photo-zoom-trigger');
  if (!trigger) return;
  const sourceImage = trigger.querySelector('img');
  if (!sourceImage) return;
  event.preventDefault();
  previousFocus = trigger;
  lightboxImage.src = sourceImage.currentSrc || sourceImage.src;
  lightboxImage.alt = sourceImage.alt;
  lightbox.hidden = false;
  document.body.classList.add('photo-lightbox-open');
  lightboxClose.focus();
});

lightbox.addEventListener('click', event => {
  if (event.target === lightbox || event.target === lightboxClose) closeLightbox();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
});
