// 词根词缀练习管理模块
class RootsManager {
  constructor() {
    this.roots = [];
    this.filteredRoots = [];
    this.currentType = 'all';
    this.currentOrigin = 'all';
    this.searchTerm = '';
    this.expandedCards = new Set(); // 记录展开的卡片
    this.hiddenElements = {
      meaning: false,
      phonetic: false,
      structure: false,
      origin: false
    };
    this.loadRootsData();
    this.setupEventListeners();
    this.setupTrainingControls();
  }

  // 加载词根词缀数据
  async loadRootsData() {
    try {
      const response = await fetch('./data/roots.json');
      const data = await response.json();
      this.roots = data.roots;
      this.filteredRoots = [...this.roots];
      this.renderRoots();
    } catch (error) {
      console.error('加载词根词缀数据失败:', error);
      this.roots = [];
      this.filteredRoots = [];
    }
  }

  // 设置事件监听器
  setupEventListeners() {
    // 类型筛选
    const typeItems = document.querySelectorAll('[data-type]');
    typeItems.forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('[data-type]').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        this.currentType = item.dataset.type;
        this.applyFilter();
      });
    });

    // 词源筛选
    const originItems = document.querySelectorAll('[data-origin]');
    originItems.forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('[data-origin]').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        this.currentOrigin = item.dataset.origin;
        this.applyFilter();
      });
    });

    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.applyFilter();
      });
    }
  }

  // 应用筛选和搜索
  applyFilter() {
    let filtered = [...this.roots];

    // 类型筛选
    if (this.currentType !== 'all') {
      filtered = filtered.filter(root => root.type === this.currentType);
    }

    // 词源筛选
    if (this.currentOrigin !== 'all') {
      filtered = filtered.filter(root => root.origin === this.currentOrigin);
    }

    // 搜索功能
    if (this.searchTerm) {
      filtered = filtered.filter(root => 
        root.root.toLowerCase().includes(this.searchTerm) ||
        root.meaning.toLowerCase().includes(this.searchTerm) ||
        root.origin.toLowerCase().includes(this.searchTerm) ||
        root.examples.some(example => 
          example.word.toLowerCase().includes(this.searchTerm) ||
          example.meaning.toLowerCase().includes(this.searchTerm) ||
          example.structure.toLowerCase().includes(this.searchTerm)
        )
      );
    }

    this.filteredRoots = filtered;
    // 清空展开状态，重新开始
    this.expandedCards.clear();
    this.renderRoots();
  }

  // 渲染词根词缀列表
  renderRoots() {
    const rootsGrid = document.getElementById('rootsGrid');
    if (!rootsGrid) return;

    rootsGrid.innerHTML = '';

    this.filteredRoots.forEach((rootData, index) => {
      const card = this.createRootCard(rootData, index);
      rootsGrid.appendChild(card);
    });
  }

  // 创建词根词缀卡片
  createRootCard(rootData, index) {
    const card = document.createElement('div');
    const isExpanded = this.expandedCards.has(index);
    card.className = `root-card ${isExpanded ? 'expanded' : ''}`;
    card.dataset.index = index;
    
    // 获取示例单词的前几个用于紧凑显示
    const exampleWords = rootData.examples.slice(0, 3).map(ex => ex.word).join(', ');
    const moreCount = Math.max(0, rootData.examples.length - 3);
    const exampleText = moreCount > 0 ? `${exampleWords} (+${moreCount})` : exampleWords;

    card.innerHTML = `
      <div class="root-header">
        <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
          <h3 class="root-name">${rootData.root}</h3>
          <span class="root-type ${rootData.type}">${this.getTypeDisplayName(rootData.type)}</span>
        </div>
        <span class="expand-indicator">▼</span>
      </div>
      
      <div class="root-compact-info">
        <span class="compact-meaning ${this.hiddenElements.meaning ? 'hidden-element' : ''}">
          ${rootData.meaning}
        </span>
        <span class="compact-origin ${this.hiddenElements.origin ? 'hidden-element' : ''}">
          ${rootData.origin}
        </span>
        <span class="compact-examples">
          ${exampleText}
        </span>
      </div>
      
      <div class="root-details">
        <div class="root-info">
          <div class="root-meaning ${this.hiddenElements.meaning ? 'hidden-element' : ''}">含义: ${rootData.meaning}</div>
          <div class="root-origin ${this.hiddenElements.origin ? 'hidden-element' : ''}">词源: ${rootData.origin}</div>
        </div>
        <ul class="examples-list">
          ${this.createExamplesHtml(rootData.examples)}
        </ul>
      </div>
    `;

    // 添加点击事件来切换展开/折叠
    card.addEventListener('click', (e) => {
      // 如果点击的是发音按钮，不触发展开/折叠
      if (e.target.classList.contains('pronunciation-btn')) {
        return;
      }
      
      this.toggleCardExpansion(index, card);
    });

    return card;
  }

  // 创建示例HTML
  createExamplesHtml(examples) {
    return examples.map(example => `
      <li class="example-item">
        <div>
          <span class="example-word">${example.word}</span>
          <span class="example-phonetic ${this.hiddenElements.phonetic ? 'hidden-element' : ''}">${example.phonetic}</span>
          <button class="pronunciation-btn" data-word="${example.word}" title="播放发音" onclick="event.stopPropagation(); this.disabled=true; rootsManager.playGoogleTTS('${example.word}', this)">
            🔊
          </button>
        </div>
        <div class="example-meaning ${this.hiddenElements.meaning ? 'hidden-element' : ''}">${example.meaning}</div>
        <div class="example-structure ${this.hiddenElements.structure ? 'hidden-element' : ''}">构词: ${example.structure}</div>
      </li>
    `).join('');
  }

  // 切换卡片展开/折叠状态
  toggleCardExpansion(index, cardElement) {
    if (this.expandedCards.has(index)) {
      this.expandedCards.delete(index);
      cardElement.classList.remove('expanded');
    } else {
      this.expandedCards.add(index);
      cardElement.classList.add('expanded');
    }
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

  // 设置训练控制面板
  setupTrainingControls() {
    const controlButtons = document.querySelectorAll('.control-button');
    
    controlButtons.forEach(button => {
      button.addEventListener('click', () => {
        const target = button.dataset.target;
        this.toggleElement(target, button);
      });
    });
  }

  // 切换元素的显示/隐藏
  toggleElement(elementType, button) {
    this.hiddenElements[elementType] = !this.hiddenElements[elementType];
    const isHidden = this.hiddenElements[elementType];
    
    // 更新按钮状态和文本
    if (isHidden) {
      button.classList.add('active');
      switch(elementType) {
        case 'meaning':
          button.textContent = '显示含义';
          break;
        case 'phonetic':
          button.textContent = '显示音标';
          break;
        case 'structure':
          button.textContent = '显示构词';
          break;
        case 'origin':
          button.textContent = '显示词源';
          break;
      }
    } else {
      button.classList.remove('active');
      switch(elementType) {
        case 'meaning':
          button.textContent = '隐藏含义';
          break;
        case 'phonetic':
          button.textContent = '隐藏音标';
          break;
        case 'structure':
          button.textContent = '隐藏构词';
          break;
        case 'origin':
          button.textContent = '隐藏词源';
          break;
      }
    }
    
    // 重新渲染以应用隐藏/显示状态
    this.renderRoots();
  }

  // TTS播放功能
  playGoogleTTS(word, button) {
    try {
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(word)}`;
      const audio = new Audio(ttsUrl);
      
      audio.onloadstart = () => {
        button.innerHTML = '<span style="font-size: 10px;">播放中...</span>';
      };
      
      audio.onended = () => {
        button.innerHTML = '🔊';
        button.disabled = false;
      };
      
      audio.onerror = () => {
        button.innerHTML = '🔊';
        button.disabled = false;
        this.playBrowserTTS(word, button);
      };
      
      audio.play().catch(err => {
        console.error('播放失败:', err);
        this.playBrowserTTS(word, button);
      });
      
    } catch (error) {
      console.error('TTS播放出错:', error);
      button.disabled = false;
      this.playBrowserTTS(word, button);
    }
  }

  playBrowserTTS(word, button) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      utterance.onstart = () => {
        button.innerHTML = '<span style="font-size: 10px;">播放中...</span>';
      };
      
      utterance.onend = () => {
        button.innerHTML = '🔊';
        button.disabled = false;
      };
      
      utterance.onerror = () => {
        button.innerHTML = '🔊';
        button.disabled = false;
      };
      
      speechSynthesis.speak(utterance);
    } else {
      button.disabled = false;
      console.error('浏览器不支持语音合成');
    }
  }
}

let rootsManager;

document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('rootsGrid')) {
    rootsManager = new RootsManager();
  }
});