// 词根词缀说明页面管理
class RootsGuide {
  constructor() {
    this.roots = [];
    this.loadRootsData();
  }

  // 加载词根词缀数据
  async loadRootsData() {
    try {
      const response = await fetch('./data/roots.json');
      const data = await response.json();
      this.roots = data.roots;
      this.renderRootsShowcase();
    } catch (error) {
      console.error('加载词根词缀数据失败:', error);
      this.roots = [];
    }
  }

  // 渲染词根词缀展示
  renderRootsShowcase() {
    const showcase = document.getElementById('rootsShowcase');
    if (!showcase) return;

    // 选择一些代表性的词根词缀进行展示
    const featuredRoots = this.roots.slice(0, 12); // 展示前12个

    showcase.innerHTML = '';

    featuredRoots.forEach(rootData => {
      const card = this.createShowcaseCard(rootData);
      showcase.appendChild(card);
    });
  }

  // 创建展示卡片
  createShowcaseCard(rootData) {
    const card = document.createElement('div');
    card.className = 'showcase-card';

    const examplesHtml = rootData.examples.slice(0, 3).map(example => 
      `<li class="showcase-example">
        <strong>${example.word}</strong> ${example.meaning}
      </li>`
    ).join('');

    card.innerHTML = `
      <div class="showcase-header">
        <div class="showcase-root">${rootData.root}</div>
        <span class="showcase-type ${rootData.type}">${this.getTypeDisplayName(rootData.type)}</span>
      </div>
      <div class="showcase-meaning">含义: ${rootData.meaning}</div>
      <div style="font-size: 0.9em; color: #666; margin-bottom: 15px;">
        词源: ${rootData.origin}
      </div>
      <ul class="showcase-examples">
        ${examplesHtml}
      </ul>
    `;

    return card;
  }

  // 获取类型显示名称
  getTypeDisplayName(type) {
    const typeNames = {
      'prefix': '前缀',
      'suffix': '后缀',
      'root': '词根'
    };
    return typeNames[type] || type;
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('rootsShowcase')) {
    new RootsGuide();
  }
});
