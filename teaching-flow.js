import { TestConnection, requiresOled } from './test-connection.js';
import { mountDeviceStatus } from './device-status.js';

mountDeviceStatus();

const oled = [['OLED VCC', '电源模块 3.3V'], ['OLED GND', '公共 GND'], ['OLED SDA', 'GPIO0'], ['OLED SCL / SCK', 'GPIO1']];
const infrared = [['左红外 VCC', '电源模块 3.3V'], ['左红外 GND', '公共 GND'], ['左红外 OUT', 'GPIO4'], ['右红外 VCC', '电源模块 3.3V'], ['右红外 GND', '公共 GND'], ['右红外 OUT', 'GPIO3']];
const servo = (name, pin) => [[name + ' 红线', '电源模块 5V'], [name + ' 棕/黑线', '公共 GND'], [name + ' 黄/橙信号线', pin]];
const touch = [['TTP223 VCC', '电源模块 3.3V'], ['TTP223 GND', '公共 GND'], ['TTP223 OUT', 'GPIO10']];
const common = [['ESP32 USB', '电脑数据 USB 线'], ['ESP32 GND', '电源模块 GND']];

const steps = [
  {
    id: 'display', nav: '屏幕', title: '屏幕测试', manifest: 'manifest-display.json',
    need: 'ESP32-C3 ＋ OLED', wires: [...common, ...oled],
    parts: [['board', 'ESP32-C3'], ['oled', 'OLED 0.96"']],
    test: '恢复 OLED 的 3.3V 电源，按一下 RST，等待屏幕开始循环。',
    actions: ['依次出现 HELLO、边框、棋盘格和反色画面。', '完整观察一轮，画面稳定，没有缺行或闪烁。'],
    pass: '四种画面都完整、稳定。',
    problems: ['黑屏：检查 OLED 的 VCC、GND，再按一次 RST。', '仍黑屏：核对 SDA→GPIO0、SCL→GPIO1。', '花屏：确认使用的是 128×64 SSD1306 OLED。']
  },
  {
    id: 'infrared', nav: '红外', title: '双红外测试', manifest: 'manifest-infrared.json',
    need: '接左右红外，OLED 屏幕可选', wires: [...common, ...oled, ...infrared],
    parts: [['board', 'ESP32-C3'], ['oled', 'OLED（可选）'], ['ir', '左红外 LM393'], ['ir', '右红外 LM393']],
    test: '恢复红外模块的 3.3V 电源，按一下 RST，再连接开发板。没接屏幕也能测试，直接看网页的左右实时状态。',
    actions: ['遮挡左侧时网页“左侧”显示已触发；遮挡右侧时“右侧”显示已触发。', '同时遮挡时两侧都已触发；全部移开时都未触发。有屏幕时同步显示 LEFT / RIGHT 的 ON / OFF。'],
    pass: '左、右、同时遮挡和全部移开都对应。',
    problems: ['一直 ON：移开近处物体，慢慢调节灵敏度旋钮。', '左右相反：核对左 OUT→GPIO4、右 OUT→GPIO3。', '一直 OFF：先检查 3.3V 和公共 GND。']
  },
  {
    id: 'servo_pan', nav: '水平舵机', title: '水平舵机测试', manifest: 'manifest-servo-pan.json',
    need: '只接水平舵机，OLED 屏幕可选', wires: [...common, ...oled, ...servo('水平舵机', 'GPIO5')],
    parts: [['board', 'ESP32-C3'], ['oled', 'OLED（可选）'], ['servo', 'SG90 水平舵机'], ['power', '多路电源模块']],
    test: '取下舵盘和负载，恢复舵机外部 5V，按一下 RST。没接屏幕也能开始，动作进度在网页显示。',
    actions: ['连接后点击“开始小幅转动”，舵机只做一轮小幅动作。', '动作顺序为 90°→85°→95°→90°，完成后停止；有屏幕时可同时查看状态。'],
    pass: '动作平稳，没有持续嗡鸣、卡住、复位或发热。',
    problems: ['不动：核对外部 5V、公共 GND 和 GPIO5；舵机红线不要接到 3.3V。', '开始按钮不可用：核对本步程序和版本，关闭安装窗口后重新连接；不需要先接屏幕。', '嗡鸣、卡住或发热：立即切断外部电源。']
  },
  {
    id: 'servo_tilt', nav: '俯仰舵机', title: '俯仰舵机测试', manifest: 'manifest-servo-tilt.json',
    need: '只接俯仰舵机，OLED 屏幕可选', wires: [...common, ...oled, ...servo('俯仰舵机', 'GPIO6')],
    parts: [['board', 'ESP32-C3'], ['oled', 'OLED（可选）'], ['servo', 'SG90 俯仰舵机'], ['power', '多路电源模块']],
    test: '取下舵盘和负载，恢复舵机外部 5V，按一下 RST。没接屏幕也能开始，动作进度在网页显示。',
    actions: ['连接后点击“开始小幅转动”，舵机只做一轮小幅动作。', '动作顺序为 90°→85°→95°→90°，完成后停止；有屏幕时可同时查看状态。'],
    pass: '动作平稳，没有持续嗡鸣、卡住、复位或发热。',
    problems: ['不动：本步信号接 GPIO6。', '提示程序不匹配：重新安装第 04 步程序。', '抖动、复位或发热：立即切断外部电源。']
  },
  {
    id: 'touch', nav: '触摸', title: '触摸模块测试', manifest: 'manifest-touch.json',
    need: '接 TTP223，OLED 屏幕可选', wires: [...common, ...oled, ...touch],
    parts: [['board', 'ESP32-C3'], ['oled', 'OLED（可选）'], ['touch', 'TTP223 触摸模块']],
    test: '恢复触摸模块的 3.3V 电源，按一下 RST，再连接开发板。没接屏幕也能测试，直接看下方触摸状态和次数。',
    actions: ['按住感应区时网页显示“触摸”，松开后显示“松开”；有 OLED 时同步显示 TOUCHED / OPEN。', '连续触摸并松开 5 次，触摸次数增加 5；按住不重复计数。'],
    pass: '五次触摸和松开都正常，计数每次加一。',
    problems: ['网页状态无变化：检查 TTP223 OUT→GPIO10、3.3V 和公共 GND。', '松手不恢复或按第二次才恢复：确认模块为点动模式，不是自锁模式。', '隔纸板不灵敏：先直接触摸裸模块测试。', '次数归零：按 RST、重新上电或安装程序会重置计数，重新连接网页不会清零。']
  },
  {
    id: 'robot', nav: '完整系统', title: '完整系统', manifest: 'manifest.json',
    need: '全部模块', wires: [...common, ...oled, ...infrared, ...servo('水平舵机', 'GPIO5'), ...servo('俯仰舵机', 'GPIO6'), ...touch],
    parts: [['board', 'ESP32-C3'], ['oled', 'OLED'], ['ir', '左右红外'], ['servo', '两个 SG90'], ['touch', 'TTP223'], ['power', '多路电源模块']],
    test: '确认舵机中位和机械活动空间，再恢复模块电源并按一下 RST。',
    actions: ['左右跟随合计测试 10 次，方向正确，动作自然。', '摸头 5 次并连续运行 2 分钟，没有撞限位、复位或发热。'],
    pass: '完整系统按上述项目观察通过。',
    problems: ['组装后异常：先断电检查接线、公共 GND 和机械干涉。', '方向或中位不对：停止动作，使用下方校准。', '重启、嗡鸣或发热：立即切断外部电源。']
  }
];

const phases = [
  ['wiring', '接线'],
  ['install', '安装程序'],
  ['test', '通电测试'],
  ['result', '确认结果']
];

function screenHint(id) {
  if (id === 'touch') return '屏幕可选：在网页查看触摸／松开和触摸次数，没接 OLED 也能完成测试；接上后同步显示。';
  if (id === 'display') return '屏幕必需：连接正常只是第一步，还需亲眼观察四种画面。';
  if (id === 'robot') return '完整系统按接线图连接全部模块，并观察屏幕与实物动作。';
  return '屏幕可选：图中 OLED 的四根线可以不接，本步测试照常进行；接上后可额外查看状态。';
}

function diagnosticPanel(step) {
  return `<details class="troubleshooting diagnostic-panel" data-diagnostics>
    <summary>遇到问题？检查连接、程序和屏幕</summary>
    <dl class="diagnostic-status">
      <div><dt>开发板连接</dt><dd data-check-connection>尚未连接</dd></div>
      <div><dt>本步程序</dt><dd data-check-program>尚未识别</dd></div>
      <div><dt>OLED 屏幕</dt><dd data-check-screen>连接后检查</dd></div>
    </dl>
    <p class="diagnostic-advice" data-diagnostic-advice>${screenHint(step.id)}</p>
    <ol>
      <li><strong>连接失败：</strong>关闭安装弹窗及其他串口工具，确认使用数据 USB 线，再按 RST 后重新连接。</li>
      <li><strong>程序不匹配：</strong>断开连接，返回“安装程序”，安装本页的${step.title}程序；网页与开发板版本必须一致。</li>
      <li><strong>屏幕黑屏：</strong>改线前同时断开 USB 和外部电源；检查 OLED 端 3.3V、公共 GND、SDA→GPIO0、SCL→GPIO1。有电后程序会自动重新检测；必要时按 RST 后重连。</li>
      ${step.problems.map(problem => `<li>${problem}</li>`).join('')}
    </ol>
    <div class="diagnostic-actions"><button type="button" class="secondary-action" data-read-status disabled>重新读取状态</button><button type="button" class="secondary-action" data-check-wiring>断开连接，查看接线图</button></div>
    <p class="diagnostic-footnote">网页能读取通信状态，供电电压和实物动作仍需现场检查。重新读取不会启动舵机；出现发热、嗡鸣或卡住，先切断外部电源。</p>
  </details>`;
}

const pinColors = {
  GPIO0: '#0057ff',
  GPIO1: '#00b83f',
  GPIO3: '#0057ff',
  GPIO4: '#ffd000',
  GPIO5: '#00b83f',
  GPIO6: '#ffd000',
  GPIO10: '#0057ff'
};

function wireColor(from, to) {
  const text = from + ' ' + to;
  if (/GND|棕\/黑/.test(text)) return '#000000';
  if (/USB|VCC|3\.3V|5V|红线/.test(text)) return '#ff0000';
  const pin = Object.keys(pinColors).find(name => text.includes(name));
  return pinColors[pin] || '#0057ff';
}

function wiringSvg(wires, title) {
  const h = 35 + wires.length * 25;
  return `<svg viewBox="0 0 540 ${h}" role="img" aria-label="${title}接线图"><title>${title}接线图</title>
    <text x="14" y="18">模块引脚</text><text x="350" y="18">连接到</text>
    ${wires.map(([from, to], index) => {
      const y = 39 + index * 25;
      const color = wireColor(from, to);
      return `<text x="14" y="${y}" dominant-baseline="middle">${from}</text>
        <path d="M 220 ${y} H 334" stroke="${color}" stroke-width="4"/>
        <circle cx="220" cy="${y}" r="4" fill="${color}"/>
        <circle cx="334" cy="${y}" r="4" fill="${color}"/>
        <text x="350" y="${y}" dominant-baseline="middle">${to}</text>`;
    }).join('')}
  </svg>`;
}

function partCards(parts) {
  return `<div class="parts-row">${parts.map(([kind, label]) =>
    `<div class="part-card"><div class="part-shape ${kind}" aria-hidden="true"></div><strong>${label}</strong></div>`
  ).join('')}</div>`;
}

function boardMini(bootPressed, rstPressed) {
  return `<div class="board-mini" aria-hidden="true">
    <img src="./assets/board/esp32-c3-supermini.png" alt="">
    ${bootPressed ? '<span class="key-highlight boot"></span>' : ''}
    ${rstPressed ? '<span class="key-highlight rst"></span>' : ''}
    ${bootPressed ? '<span class="finger boot"></span>' : ''}
    ${rstPressed ? '<span class="finger rst"></span>' : ''}
  </div>`;
}

function bootSequence() {
  const sequence = [
    ['① 按住 BOOT', true, false],
    ['② 按下 RST', true, true],
    ['③ 松开 RST', true, false],
    ['④ 松开 BOOT', false, false]
  ];
  return `<div class="boot-sequence">${sequence.map(([label, boot, rst]) =>
    `<div class="boot-step"><strong>${label}</strong>${boardMini(boot, rst)}</div>`
  ).join('')}</div>`;
}

function resultVisual(id) {
  if (id === 'display') {
    return `<div class="result-visual">
      <div class="result-item">${oledTestFrame(0)}文字</div>
      <div class="result-item">${oledTestFrame(1)}边框</div>
      <div class="result-item">${oledTestFrame(2)}棋盘格</div>
      <div class="result-item">${oledTestFrame(3)}反色</div>
    </div>`;
  }
  if (id === 'infrared') {
    return `<div class="result-visual">
      <div class="result-item"><strong>遮挡左侧</strong><br>LEFT：ON</div>
      <div class="result-item"><strong>遮挡右侧</strong><br>RIGHT：ON</div>
      <div class="result-item"><strong>同时遮挡</strong><br>两侧：ON</div>
      <div class="result-item"><strong>全部移开</strong><br>两侧：OFF</div>
    </div>`;
  }
  if (id.startsWith('servo_')) {
    return `<div class="result-visual"><div class="result-item"><strong>小幅转动一轮</strong><br>90° → 85° → 95° → 90°</div><div class="result-item"><strong>完成后停止</strong><br>无持续嗡鸣或发热</div></div>`;
  }
  if (id === 'touch') {
    return `<div class="result-visual"><div class="result-item"><strong>按住</strong><br>网页：触摸</div><div class="result-item"><strong>松开</strong><br>网页：松开</div><div class="result-item"><strong>触摸 5 次</strong><br>触摸次数：+5</div></div>`;
  }
  return `<div class="result-visual"><div class="result-item"><strong>左右跟随</strong><br>方向正确</div><div class="result-item"><strong>摸头 5 次</strong><br>表情正常</div><div class="result-item"><strong>运行 2 分钟</strong><br>无异常</div></div>`;
}

function oledTestFrame(frame) {
  const inverted = frame === 3;
  const foregroundClass = inverted ? 'oled-off' : 'oled-on';
  const title = `OLED TEST ${frame + 1}/4`;
  let content = '';

  if (frame === 0) {
    content = `<text class="oled-text oled-text-large ${foregroundClass}" x="12" y="39">HELLO</text>
      <text class="oled-text oled-text-small ${foregroundClass}" x="12" y="58">screen is alive</text>`;
  } else if (frame === 1) {
    content = `<rect class="oled-stroke ${foregroundClass}" x="8" y="18" width="112" height="38"></rect>
      <rect class="oled-stroke ${foregroundClass}" x="16" y="26" width="96" height="22"></rect>
      <text class="oled-text oled-text-small ${foregroundClass}" x="36" y="39">BORDER</text>`;
  } else if (frame === 2) {
    const squares = [];
    for (let y = 18; y < 58; y += 10) {
      for (let x = 8; x < 120; x += 10) {
        if ((Math.floor(x / 10) + Math.floor(y / 10)) % 2 === 0) {
          squares.push(`<rect class="${foregroundClass}" x="${x}" y="${y}" width="8" height="8"></rect>`);
        }
      }
    }
    content = squares.join('');
  } else {
    content = `<text class="oled-text oled-text-large ${foregroundClass}" x="22" y="41">INVERT</text>`;
  }

  return `<svg class="oled-preview${inverted ? ' is-inverted' : ''}" viewBox="0 0 128 64" role="img" aria-label="${title} actual display preview">
    <rect class="oled-background" width="128" height="64"></rect>
    <text class="oled-text oled-text-small ${foregroundClass}" x="0" y="7">${title}</text>
    <line class="oled-stroke ${foregroundClass}" x1="0" y1="10" x2="127" y2="10"></line>
    ${content}
  </svg>`;
}

function robotCalibration() {
  return `<div class="calibration-controls">
    <div class="info-label">装配前校准</div>
    <div class="calibration-flow"><span>1 进入校准</span><span>2 回到默认 90°</span><span>3 断电装舵盘</span><span>4 按需微调保存</span></div>
    <p class="calibration-state" data-calibration-state>连接完整系统后可校准。</p>
    <div class="calibration-group"><strong>开始</strong><div class="calibration-grid">
      <button type="button" class="secondary-action" data-robot-command="2" disabled>进入校准</button>
      <button type="button" class="secondary-action" data-robot-command="B" disabled>恢复默认中位</button>
      <button type="button" class="secondary-action" data-robot-command="C" disabled>回到自定义中位</button>
    </div></div>
    <p class="note">首次装配先断电取下舵盘和头部负载，再通电恢复默认 90°；停稳后断电，朝正装回舵盘。此按钮不覆盖自定义中位；按钮不可用时请安装本页完整固件。</p>
    <div class="calibration-group"><strong>每次微调 1°</strong><div class="calibration-grid">
      <button type="button" class="secondary-action" data-robot-command="A" disabled>水平向左</button>
      <button type="button" class="secondary-action" data-robot-command="D" disabled>水平向右</button>
      <button type="button" class="secondary-action" data-robot-command="W" disabled>俯仰向上</button>
      <button type="button" class="secondary-action" data-robot-command="S" disabled>俯仰向下</button>
    </div></div>
    <div class="calibration-group"><strong>完成</strong><div class="calibration-grid">
      <button type="button" class="secondary-action save-action" data-robot-command="V" disabled>保存自定义中位</button>
      <button type="button" class="secondary-action" data-robot-command="1" disabled>返回正常运行</button>
    </div></div>
    <div class="calibration-group"><strong>安全控制</strong><div class="calibration-grid">
      <button type="button" class="secondary-action emergency-action" data-robot-command="X" disabled>立即急停</button>
      <button type="button" class="secondary-action" data-robot-command="R" disabled>恢复舵机驱动</button>
    </div></div>
    <details class="troubleshooting"><summary>校准安全说明</summary><ul><li>回中和微调会让舵机动作，先确认机构活动空间。</li><li>嗡鸣、卡住或发热时立即切断外部 12V。</li><li>断开网页连接不会代替急停。</li></ul></details>
  </div>`;
}

let active = 'materials';
let controller;
let serialState = {};
let version = '';
const root = document.querySelector('#steps');
const panels = new Map();
const nav = document.createElement('nav');
nav.className = 'step-nav';
nav.setAttribute('aria-label', '选择物料清单、操作注意事项、裁切模板、开发板介绍、测试模块或帮助');
root.before(nav);
const materialsChoice = document.createElement('button');
materialsChoice.type = 'button';
materialsChoice.dataset.step = 'materials';
materialsChoice.innerHTML = '<span>准备</span>物料清单';
materialsChoice.addEventListener('click', () => select('materials'));
nav.append(materialsChoice);
const materialsCard = document.createElement('article');
materialsCard.id = 'step-materials';
materialsCard.className = 'step-card materials-page';
materialsCard.innerHTML = '<iframe src="./materials.html" title="物料清单" class="materials-frame"></iframe><div class="materials-footer"><button type="button" class="primary-action" data-materials-next>下一页：操作注意事项 →</button></div>';
root.append(materialsCard);
materialsCard.querySelector('[data-materials-next]').addEventListener('click', () => select('notes'));
const materialsFrame = materialsCard.querySelector('iframe');
function fitMaterials() {
  const body = materialsFrame.contentDocument?.body;
  if (!body || materialsCard.hidden || !body.offsetWidth) return;
  const height = Math.ceil(body.getBoundingClientRect().height);
  if (height > 0 && Math.abs(materialsFrame.offsetHeight - height) > 1) materialsFrame.style.height = height + 'px';
}
materialsFrame.addEventListener('load', () => {
  const doc = materialsFrame.contentDocument;
  const style = doc.createElement('style');
  style.textContent = 'main{padding:20px 18px 26px;max-width:none}header img,.author-credit{display:none}header{margin-bottom:26px}@media(max-width:760px){main{padding:18px 10px 22px}}';
  doc.head.append(style);
  fitMaterials();
  new ResizeObserver(fitMaterials).observe(doc.body);
});
const notesChoice = document.createElement('button');
notesChoice.type = 'button';
notesChoice.dataset.step = 'notes';
notesChoice.innerHTML = '<span>必读</span>操作注意事项';
notesChoice.addEventListener('click', () => select('notes'));
nav.append(notesChoice);
const notesCard = document.createElement('article');
notesCard.className = 'step-card operation-notes';
notesCard.id = 'step-notes';
notesCard.innerHTML = "<header class=\"notes-heading\"><div><p class=\"notes-eyebrow\">完全 0 基础 · 动手前先看看这些</p><h2>操作注意事项</h2><p>照着做，就能一步步完成！</p></div><span class=\"notes-count\">8 条制作提醒</span></header>\n<ol class=\"notes-grid\"><li class=\"notes-card\"><span class=\"notes-number\">1</span><div class=\"notes-content\"><h3>逐个模块测试，不要一次完成连线</h3><p>按照液晶屏 → 红外模块 → 舵机 → 触摸模块的顺序，逐个模块分别连接进行测试，方便排查问题，最后再连接全部模块进行联调。</p><p class=\"notes-tip\">液晶屏 → 红外模块 → 舵机 → 触摸模块</p></div></li><li class=\"notes-card\"><span class=\"notes-number\">2</span><div class=\"notes-content\"><h3>所有接线、拔线先断电，再操作</h3><p>尤其是 ESP32、舵机、电源模块之间改线时，先拔 USB / 5V 电源，再操作。</p><p>操作时不要触碰模块的金属引脚、插头等部位。</p><p class=\"notes-tip\">先断电！再操作！</p></div></li><li class=\"notes-card\"><span class=\"notes-number\">3</span><div class=\"notes-content\"><h3>清楚正负极，看丝印字符，不要只看颜色</h3><p>杜邦线的颜色只是为了方便区分，颜色本身不代表功能。最好每次插线都看元件上的丝印文字。</p><div class=\"notes-terms\"><span>VCC / 5V = 电源正极</span><span>GND = 地 / 负极</span></div><p class=\"notes-tip\">看清丝印字符再连接！</p></div></li><li class=\"notes-card\"><span class=\"notes-number\">4</span><div class=\"notes-content\"><h3>所有模块必须共地</h3><p>ESP32、传感器、舵机如果使用同一套系统，信号要正常工作，需要让它们的 GND 连在一起。</p><p>可使用电源模块的 GND 端子作为公共地。</p><p class=\"notes-tip\">所有 GND 连在一起</p></div></li><li class=\"notes-card\"><span class=\"notes-number\">5</span><div class=\"notes-content\"><h3>第一次通电之前做一次“接线体检”</h3><p>不要接完以后马上开机，按照固定顺序检查：</p><p>5V → GND → 信号线 → 是否插错一排 → 有没有松动 → 有没有裸露金属碰在一起。</p><ul class=\"notes-checks\"><li>5V 接好</li><li>GND 接好</li><li>信号线正确</li><li>没有松动</li><li>没有短路</li></ul><p class=\"notes-tip\">通电前先检查</p></div></li><li class=\"notes-card\"><span class=\"notes-number\">6</span><div class=\"notes-content\"><h3>裸露电路不要互相碰</h3><p>ESP32、电源模块、模块背面的焊点、金属引脚如果紧贴在一起，可能短路。</p><p>装进纸壳身体之前，要求模块之间保留间距，必要时用胶片或支架隔开。</p><p class=\"notes-tip\">保持一定间距，避免短路</p></div></li><li class=\"notes-card\"><span class=\"notes-number\">7</span><div class=\"notes-content\"><h3>舵机先回中，再安装舵盘</h3><p>在模块测试工具中校准舵机，恢复默认中位，再安装舵盘，否则可能头部摆不正。</p><p class=\"notes-tip\">先回中（约 90°），再装舵盘</p></div></li><li class=\"notes-card\"><span class=\"notes-number\">8</span><div class=\"notes-content\"><h3>正确进入下载模式</h3><p>ESP32-C3 要按住 BOOT → 按一下 RESET → 松开 RESET → 松开 BOOT → 再上传固件。</p><p class=\"notes-tip\">按住 BOOT → 按一下 RESET → 松开 RESET → 松开 BOOT → 上传固件</p></div></li></ol>\n<footer class=\"notes-footer\"><p>一步一步来，你也可以做到！</p><button type=\"button\" class=\"primary-action\" data-notes-next>下一页：裁切模板 →</button></footer>";
root.append(notesCard);
notesCard.querySelector('[data-notes-next]').addEventListener('click', () => select('template'));

const templateChoice = document.createElement('button');
templateChoice.type = 'button';
templateChoice.dataset.step = 'template';
templateChoice.innerHTML = '<span>A4</span>裁切模板';
templateChoice.addEventListener('click', () => select('template'));
nav.append(templateChoice);

const templateCard = document.createElement('article');
templateCard.className = 'step-card cut-template';
templateCard.id = 'step-template';
templateCard.innerHTML = `
  <div class="cut-layout">
    <div class="cut-copy">
      <p class="cut-eyebrow">制作准备 · A4 原尺寸模板</p>
      <h2>裁切模板</h2>
      <p class="cut-description">把模板打印到 A4 纸上，再按图制作小纸壳机器人的纸板外壳。</p>
      <div class="cut-actions">
        <button type="button" class="primary-action" data-print-template>打印模板</button>

      </div>
      <div class="cut-settings">
        <strong>打印前这样设置</strong>
        <ul><li>纸张：A4，纵向。</li><li>缩放：实际大小 / 100%，不要选“适合页面”。</li><li>边距：无；关闭页眉和页脚。</li></ul>
        <p>打印后先用尺子核对图上标注的尺寸（单位：毫米），确认后再裁切。虚线不要裁断。</p>
      </div>
      <p class="cut-status" role="status" data-print-status>点击打印后，在系统打印窗口选择本地打印机。</p>
      <button type="button" class="text-action" data-template-next>下一页：了解开发板 →</button>
    </div>
    <figure class="cut-preview"><a class="cut-download-icon" href="./assets/template/cut-template-a4.jpg" download="裁切模板A4打印.jpg" aria-label="下载裁切模板原图" title="下载原图"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></svg></a><button type="button" class="cut-zoom-trigger" aria-label="放大裁切模板"><img src="./assets/template/cut-template-a4.jpg" alt="小纸壳机器人纸板裁切模板 A4 原图"></button><figcaption>点击图片放大查看</figcaption></figure>
  </div>`;
root.append(templateCard);
const templateDialog = document.createElement('dialog');
templateDialog.className = 'cut-lightbox';
templateDialog.setAttribute('aria-label', '裁切模板放大预览');
templateDialog.innerHTML = "<header class=\"cut-lightbox-header\"><strong>裁切模板</strong><div><a class=\"cut-download-icon\" href=\"./assets/template/cut-template-a4.jpg\" download=\"裁切模板A4打印.jpg\" aria-label=\"下载裁切模板原图\" title=\"下载原图\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5\"/></svg></a><button type=\"button\" class=\"cut-lightbox-close\" aria-label=\"关闭放大图片\" title=\"关闭\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m6 6 12 12M18 6 6 18\"/></svg></button></div></header><div class=\"cut-lightbox-scroll\"><img src=\"./assets/template/cut-template-a4.jpg\" alt=\"裁切模板放大原图\"></div>";
document.body.append(templateDialog);
const zoomTrigger = templateCard.querySelector('.cut-zoom-trigger');
zoomTrigger.addEventListener('click', () => templateDialog.showModal());
templateDialog.querySelector('.cut-lightbox-close').addEventListener('click', () => templateDialog.close());
templateDialog.addEventListener('click', event => {
  const rect = templateDialog.getBoundingClientRect();
  if (event.target === templateDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) templateDialog.close();
});
templateDialog.addEventListener('close', () => zoomTrigger.focus());
const printSheet = document.createElement('div');
printSheet.className = 'cut-print-sheet';
printSheet.setAttribute('aria-hidden', 'true');
const printImage = document.createElement('img');
printImage.src = './assets/template/cut-template-a4.jpg';
printImage.alt = '';
printSheet.append(printImage);
document.body.append(printSheet);
templateCard.querySelector('[data-print-template]').addEventListener('click', async event => {
  const button = event.currentTarget;
  const status = templateCard.querySelector('[data-print-status]');
  button.disabled = true;
  try {
    await printImage.decode();
    status.textContent = '请在打印窗口选择本地打印机，并核对 A4、纵向、100% 实际大小。';
    window.print();
  } catch {
    status.textContent = '无法打开打印窗口，请下载原图后打印。';
  } finally { button.disabled = false; }
});
templateCard.querySelector('[data-template-next]').addEventListener('click', () => select('board'));

const boardChoice = document.createElement('button');
boardChoice.type = 'button';
boardChoice.dataset.step = 'board';
boardChoice.innerHTML = '<span>00</span>开发板';
boardChoice.addEventListener('click', () => select('board'));
nav.append(boardChoice);

const boardCard = document.createElement('article');
boardCard.className = 'step-card board-intro';
boardCard.id = 'step-board';
boardCard.innerHTML = `
  <h2>了解开发板的两种供电模式</h2>
  <p class="board-intro-note">本页不用具体操作</p>
  <a class="board-power-image photo-zoom-trigger" href="./assets/board/power-modes.jpg" target="_blank" rel="noopener noreferrer" aria-label="查看开发板供电原图">
    <img src="./assets/board/power-modes.jpg" alt="ESP32-C3 两种供电模式示意图">
  </a>`;
root.append(boardCard);

function setPhase(id, phase) {
  const panel = panels.get(id);
  if (!panel) return;
  const locked = serialState.connected || serialState.busy;
  if (locked && (phase === 'wiring' || phase === 'install')) return;
  panel.phase = phase;
  const currentIndex = phases.findIndex(([key]) => key === phase);
  panel.phaseTabs.forEach((button, index) => {
    button.classList.toggle('current', index === currentIndex);
    button.classList.toggle('done', index < currentIndex);
    button.setAttribute('aria-current', index === currentIndex ? 'step' : 'false');
  });
  panel.phasePanels.forEach(section => { section.hidden = section.dataset.phasePanel !== phase; });
  panel.workflowState.textContent = '当前：' + phases[currentIndex][1];
}

function select(id) {
  if (serialState.connected || serialState.busy) return;
  active = id;
  materialsCard.hidden = id !== 'materials';
  if (id === 'materials') requestAnimationFrame(fitMaterials);
  notesCard.hidden = id !== 'notes';
  templateCard.hidden = id !== 'template';
  boardCard.hidden = id !== 'board';
  helpCard.hidden = id !== 'help';
  for (const [key, panel] of panels) panel.card.hidden = key !== id;
  nav.querySelectorAll('button').forEach(button => button.setAttribute('aria-current', button.dataset.step === id ? 'step' : 'false'));
  setPhase(id, panels.get(id)?.phase || 'wiring');
}

function updateControls(state = {}) {
  serialState = state;
  const locked = state.connected || state.busy;
  for (const [id, panel] of panels) {
    panel.install.disabled = !!locked || !version;
    panel.connect.disabled = !!locked || !version;
    panel.disconnect.disabled = !state.connected || state.step !== id;
    panel.start.disabled = !!state.busy || !state.ready || state.step !== id || state.running || state.starting;
    panel.stop.disabled = !state.connected || state.step !== id;
    panel.phaseTabs.forEach(button => {
      button.disabled = !!locked && ['wiring', 'install'].includes(button.dataset.phase);
    });
    if (state.step === id || (!locked && id === active)) {
      panel.status.textContent = state.message || '';
      panel.status.classList.toggle('error', !!state.error);
      panel.status.classList.toggle('warning', !!state.warning && !state.error);
      if (state.error && !panel.lastError) panel.diagnostics.open = true;
      panel.lastError = !!state.error;
    }
    if (state.connected && state.step === id) {
      panel.workflowState.textContent = state.closing ? '正在断开连接'
        : !state.matched ? (state.error ? '程序未匹配' : '正在识别程序')
        : !state.ready ? '程序已识别，屏幕未就绪'
        : id === 'robot' && !state.oled ? '已连接，屏幕待检查'
        : state.running ? '正在测试' : state.warning ? '已连接，屏幕可选' : '已连接，可以测试';
    } else if (panel.phase === 'test') {
      panel.workflowState.textContent = state.error && id === active ? '连接未就绪，请排查' : '等待连接开发板';
    }
    const current = state.connected && state.step === id;
    const identified = current && state.matched;
    panel.readStatus.disabled = !identified || !!state.busy;
    panel.checkWiring.disabled = !!state.busy;
    panel.checkConnection.textContent = current ? '已连接' : '未连接：点击“连接开发板”';
    panel.checkProgram.textContent = identified ? `${steps.find(step => step.id === id).title} · V${state.firmwareVersion}`
      : current ? (state.error ? '不匹配，请安装本步程序' : '正在识别') : '连接后核对本步程序和版本';
    panel.checkScreen.textContent = identified ? state.oled ? '有应答：仍需观察实物画面'
      : requiresOled(id) ? '未检测到：本步必须有屏幕' : id === 'robot' ? '未检测到：校准可用，整机验收需屏幕' : '未检测到：可选，测试可继续'
      : '连接后检查（' + (requiresOled(id) ? '本步必需' : id === 'robot' ? '整机需观察' : '本步可选') + '）';
    panel.diagnosticAdvice.textContent = identified && !state.oled
      ? requiresOled(id) ? '程序已正确识别。请先恢复屏幕供电和接线，等待自动重新检测，仍需亲眼观察四种屏幕画面。'
        : id === 'robot' ? '完整系统程序已识别。校准可用，但整机验收仍需检查 OLED 画面。'
        : '本步不依赖屏幕，可以继续测试。若需要屏幕显示，请断电核对屏幕接线，恢复供电后会自动重新检测。'
      : screenHint(id);
    if (panel.liveLeft) {
      for (const [element, value] of [[panel.liveLeft, state.left], [panel.liveRight, state.right]]) {
        element.textContent = identified && typeof value === 'boolean' ? value ? '已触发' : '未触发' : '等待读取';
        element.classList.toggle('active', identified && value === true);
      }
    }
    if (panel.liveServo) panel.liveServo.textContent = identified
      ? (state.running ? '动作进行中' : state.starting ? '正在请求动作' : '等待开始或已停止') + (Number.isFinite(state.angle) ? ` · 程序角度 ${state.angle}°（以实物动作为准）` : '')
      : '连接后查看动作状态';
    if (panel.liveTouch) {
      panel.liveTouch.textContent = identified && typeof state.touched === 'boolean' ? state.touched ? '触摸' : '松开' : '等待读取';
      panel.liveTouch.classList.toggle('active', identified && state.touched === true);
      panel.liveCount.textContent = identified && Number.isFinite(state.count) ? String(state.count) : '等待读取';
    }
    if (requiresOled(id)) {
      if (current) panel.screenAvailable = !!state.matched && !!state.oled;
      panel.observed.disabled = !panel.screenAvailable;
      if (!panel.screenAvailable) panel.observed.checked = false;
      panel.screenRequiredNote.hidden = !!panel.screenAvailable;
    }
    panel.nextOrFinish.disabled = !!locked || (requiresOled(id) && (!panel.screenAvailable || !panel.observed.checked));
    if (panel.calibrationState) {
      const robotReady = !!state.connected && state.step === id && !!state.ready;
      const modeNames = { NORMAL: '正常运行', CALIBRATION: '校准模式', SELF_TEST: '自检模式' };
      const angles = Number.isFinite(state.panCurrent) && Number.isFinite(state.tiltCurrent)
        ? `水平 ${state.panCurrent}°→${state.panTarget}°；俯仰 ${state.tiltCurrent}°→${state.tiltTarget}°`
        : '角度等待读取';
      const drive = state.stopped ? '急停已生效' : (state.servoEnabled ? '舵机已启用' : '舵机未启用');
      panel.calibrationState.textContent = robotReady
        ? `${modeNames[state.mode] || state.mode || '读取中'}；${angles}；${drive}。`
        : '连接完整系统后可校准。';
      for (const button of panel.robotButtons) {
        const command = button.dataset.robotCommand;
        if (command === 'X') button.disabled = !robotReady || state.stopped;
        else if (command === 'R') button.disabled = !robotReady || !state.stopped;
        else if (command === '2') button.disabled = !robotReady || state.mode === 'CALIBRATION';
        else if (command === '1') button.disabled = !robotReady || state.mode === 'NORMAL' || state.stopped;
        else if (command === 'B') button.disabled = !robotReady || !state.supportsDefaultCenter || state.mode !== 'CALIBRATION' || state.stopped;
        else button.disabled = !robotReady || state.mode !== 'CALIBRATION' || state.stopped;
      }
    }
  }
  nav.querySelectorAll('button').forEach(button => { button.disabled = !!locked; });
}

for (const [index, step] of steps.entries()) {
  const no = String(index + 1).padStart(2, '0');
  const choice = document.createElement('button');
  choice.type = 'button';
  choice.dataset.step = step.id;
  choice.innerHTML = `<span>${no}</span>${step.nav}`;
  choice.addEventListener('click', () => select(step.id));
  nav.append(choice);

  const card = document.createElement('article');
  card.className = 'step-card';
  card.id = 'step-' + step.id;
  const isServo = step.id.startsWith('servo_');
  const isRobot = step.id === 'robot';
  const nextStep = steps[index + 1];
  card.innerHTML = `
    <div class="workflow-head">
      <div class="workflow-title"><span class="number">${no}</span><div><h2>${step.title}</h2><p>${step.need}</p></div></div>
      <span class="workflow-state">当前：接线</span>
    </div>
    <div class="phase-nav" role="navigation" aria-label="${step.title}操作步骤">
      ${phases.map(([key, label], phaseIndex) => `<button type="button" class="phase-tab" data-phase="${key}"><span class="phase-no">${phaseIndex + 1}</span><span>${label}</span></button>`).join('')}
    </div>

    <section class="phase-panel" data-phase-panel="wiring">
      <h3 class="phase-heading">接好本步元件</h3>
      <div class="safety-strip"><span class="safety-icon">⚠</span><span>改线前，断开电脑 USB 和全部外部电源。不同电子器件不可互相触碰，容易短路烧坏器件。</span></div>
      <p class="screen-requirement">${screenHint(step.id)}</p>
      ${partCards(step.parts)}
      <div class="wiring-card">${wiringSvg(step.wires, step.title)}</div>
      <div class="phase-actions"><span></span><button type="button" class="primary-action" data-go-phase="install">我已接好线，下一步 →</button></div>
    </section>

    <section class="phase-panel" data-phase-panel="install" hidden>
      <h3 class="phase-heading">让开发板进入下载模式</h3>
      <div class="safety-strip"><span class="safety-icon">⚠</span><span>关闭外部电源，只保留电脑 USB 连接。</span></div>
      ${bootSequence()}
      <div class="phase-actions">
        <button type="button" class="text-action" data-go-phase="wiring">‹ 返回接线</button>
        <div>
          <esp-web-install-button manifest="./${step.manifest}">
            <button slot="activate" class="install-action" type="button" disabled>安装${step.title}程序 →</button>
            <span slot="unsupported" class="slot-message">请使用最新版 Chrome 或 Edge。</span>
            <span slot="not-allowed" class="slot-message">请运行离线启动脚本打开本页。</span>
          </esp-web-install-button>
          <p class="install-helper">在弹窗中选择开发板</p>
          <button type="button" class="text-action" data-go-phase="test">安装完成，下一步 →</button>
        </div>
      </div>
      <details class="troubleshooting"><summary>找不到设备？</summary><ul><li>确认使用可以传数据的 USB 线。</li><li>重新按上面的 BOOT / RST 顺序操作。</li><li>等待开发板重新出现后再点击安装。</li></ul></details>
    </section>

    <section class="phase-panel" data-phase-panel="test" hidden>
      <h3 class="phase-heading">通电并测试</h3>
      <div class="test-intro"><p>${step.test}</p></div>
      <div class="test-controls">
        <div class="action-row"><button type="button" class="secondary-action" data-connect disabled>${isRobot ? '连接完整系统' : '连接开发板'}</button><button type="button" class="secondary-action" data-disconnect disabled>断开连接</button></div>
        <p class="status" role="status"></p>
        ${step.id === 'infrared' ? '<div class="module-live" aria-live="polite"><span>左侧 <strong data-live-left>等待读取</strong></span><span>右侧 <strong data-live-right>等待读取</strong></span></div>' : ''}
        ${step.id === 'touch' ? '<div class="module-live" aria-live="polite"><span>触摸状态 <strong data-live-touch>等待读取</strong></span><span>触摸次数 <strong data-live-count>等待读取</strong></span></div><p class="note">每次触摸加 1，按住不重复计数；重新连接网页保留次数，按 RST 或重新上电后归零。</p>' : ''}
        ${isServo ? '<p class="module-live" data-live-servo aria-live="polite">连接后查看动作状态</p>' : ''}
        <div class="action-row" ${isServo ? '' : 'hidden'}><button type="button" class="secondary-action" data-start disabled>开始小幅转动</button><button type="button" class="secondary-action stop-action" data-stop disabled>立即停止</button></div>
        ${isRobot ? robotCalibration() : ''}
      </div>
      ${diagnosticPanel(step)}
      <div class="phase-actions"><button type="button" class="text-action" data-go-phase="install">‹ 返回安装</button><button type="button" class="primary-action" data-go-phase="result">查看正常现象 →</button></div>
    </section>

    <section class="phase-panel" data-phase-panel="result" hidden>
      <h3 class="phase-heading">对照检查结果</h3>
      ${resultVisual(step.id)}
      <ol class="result-list">${step.actions.map(action => `<li>${action}</li>`).join('')}</ol>
      <label class="observed"><input type="checkbox"> <span>${step.pass}</span></label>
      <p class="screen-required-note" data-screen-required-note ${requiresOled(step.id) ? '' : 'hidden'}>请先连接开发板，确认 OLED 有应答，并观察完整画面后再确认通过。</p>
      <p class="diagnostic-footnote">确认实物现象后，先返回“通电测试”断开连接，再进入下一模块；改线前断开全部电源。</p>
      <details class="troubleshooting"><summary>没有出现这些现象？</summary><ul>${step.problems.map(problem => `<li>${problem}</li>`).join('')}</ul></details>
      <div class="phase-actions"><button type="button" class="text-action" data-go-phase="test">‹ 返回测试</button>
        ${nextStep ? `<button type="button" class="primary-action" data-next-step="${nextStep.id}">现象正常，进入下一模块 →</button>` : '<button type="button" class="primary-action" data-finish>完成本次测试</button>'}
      </div>
    </section>`;

  root.append(card);
  const panel = {
    card,
    phase: 'wiring',
    phaseTabs: [...card.querySelectorAll('[data-phase]')],
    phasePanels: [...card.querySelectorAll('[data-phase-panel]')],
    workflowState: card.querySelector('.workflow-state'),
    install: card.querySelector('.install-action'),
    connect: card.querySelector('[data-connect]'),
    disconnect: card.querySelector('[data-disconnect]'),
    start: card.querySelector('[data-start]'),
    stop: card.querySelector('[data-stop]'),
    status: card.querySelector('.status'),
    diagnostics: card.querySelector('[data-diagnostics]'),
    checkConnection: card.querySelector('[data-check-connection]'),
    checkProgram: card.querySelector('[data-check-program]'),
    checkScreen: card.querySelector('[data-check-screen]'),
    diagnosticAdvice: card.querySelector('[data-diagnostic-advice]'),
    readStatus: card.querySelector('[data-read-status]'),
    checkWiring: card.querySelector('[data-check-wiring]'),
    liveLeft: card.querySelector('[data-live-left]'),
    liveRight: card.querySelector('[data-live-right]'),
    liveServo: card.querySelector('[data-live-servo]'),
    liveTouch: card.querySelector('[data-live-touch]'),
    liveCount: card.querySelector('[data-live-count]'),
    observed: card.querySelector('.observed input'),
    screenRequiredNote: card.querySelector('[data-screen-required-note]'),
    nextOrFinish: card.querySelector('[data-next-step], [data-finish]'),
    calibrationState: card.querySelector('[data-calibration-state]'),
    robotButtons: [...card.querySelectorAll('[data-robot-command]')]
  };
  panels.set(step.id, panel);
  panel.phaseTabs.forEach(button => button.addEventListener('click', () => setPhase(step.id, button.dataset.phase)));
  card.querySelectorAll('[data-go-phase]').forEach(button => button.addEventListener('click', () => setPhase(step.id, button.dataset.goPhase)));
  card.querySelector('[data-next-step]')?.addEventListener('click', event => {
    select(event.currentTarget.dataset.nextStep);
    document.querySelector('.step-nav')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  card.querySelector('[data-finish]')?.addEventListener('click', () => {
    panel.workflowState.textContent = '本次测试已完成';
    document.querySelector('.step-nav')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  panel.connect.addEventListener('click', () => controller?.connect(step.id));
  panel.disconnect.addEventListener('click', () => controller?.disconnect());
  panel.start.addEventListener('click', () => controller?.start());
  panel.stop.addEventListener('click', () => controller?.stop());
  panel.readStatus.addEventListener('click', () => controller?.readStatus());
  panel.checkWiring.addEventListener('click', async () => {
    await controller?.disconnect('已断开测试连接，请先断开 USB 和外部电源，再按图检查接线。');
    setPhase(step.id, 'wiring');
  });
  panel.observed.addEventListener('change', () => updateControls(serialState));
  panel.robotButtons.forEach(button => button.addEventListener('click', () => controller?.robotCommand(button.dataset.robotCommand)));
  setPhase(step.id, 'wiring');
}

const helpChoice = document.createElement('button');
helpChoice.type = 'button';
helpChoice.dataset.step = 'help';
helpChoice.innerHTML = '<span>07</span>帮助';
helpChoice.addEventListener('click', () => select('help'));
nav.append(helpChoice);

const helpCard = document.createElement('article');
helpCard.className = 'step-card help-page';
helpCard.id = 'step-help';
helpCard.innerHTML = `
  <h2>制作过程中遇到问题怎么办？</h2>
  <ol class="help-list">
    <li>仔细看配套视频教程和提供的制作资料，认真排查是否做对了每一步。</li>
    <li>使用答疑小工具搜索问题，常见问题已有答案。<span class="help-note">答疑小工具在Made by Z小红书笔记“小纸壳机器人制作答疑小工具”下方（需用手机访问）</span></li>
    <li>在群里搜索聊天记录，你的问题可能已经有群友遇到过并已解决。</li>
    <li>在群里提问，写清楚做到了哪一步、什么问题或现象、自己做过了哪些排查，最好配照片或视频</li>
  </ol>`;
root.append(helpCard);

select(active);

try {
  const response = await fetch('./release.json');
  if (!response.ok) throw new Error('安装资源没有加载，请重新打开完整安装包。');
  const release = await response.json();
  version = release.version;
  const versionLabel = document.querySelector('.version');
  versionLabel.textContent = 'V' + (versionLabel.dataset.toolVersion || version);
  controller = new TestConnection(navigator.serial, version, updateControls);
  updateControls({ message: '' });
} catch (error) {
  updateControls({ message: error.message, error: true });
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden && controller?.session) void controller.disconnect('页面已离开，测试已停止。');
});
window.addEventListener('pagehide', () => { void controller?.disconnect(); });
