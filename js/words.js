// 单词数据管理模块
class WordManager {
  constructor() {
    this.words = [];
    this.filteredWords = [];
    this.currentScene = 'all';
    this.searchTerm = '';
    this.loadInitialWords(); // 异步加载数据
    this.setupEventListeners();
  }

  // 加载初始单词数据，从JSON文件加载
  async loadInitialWords() {
    try {
      const response = await fetch('./data/words.json');
      const data = await response.json();
      this.words = data.words;
      this.filteredWords = [...this.words];
      this.renderWords(); // 加载完成后重新渲染
    } catch (error) {
      console.error('加载单词数据失败:', error);
      // 如果加载失败，使用空数组
      this.words = [];
      this.filteredWords = [];
    }
  }

  // 设置事件监听器
  setupEventListeners() {
    // 分类切换事件
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
      item.addEventListener('click', () => {
        // 移除所有active类
        categoryItems.forEach(i => i.classList.remove('active'));
        // 添加到当前点击的项
        item.classList.add('active');
        
        this.currentScene = item.dataset.scene;
        this.applyFilter();
      });
    });

    // 搜索输入事件
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
    let filtered = [...this.words];

    // 应用场景筛选
    if (this.currentScene !== 'all') {
      filtered = filtered.filter(word => word.scene === this.currentScene);
    }

    // 应用搜索筛选
    if (this.searchTerm) {
      filtered = filtered.filter(word => 
        word.word.toLowerCase().includes(this.searchTerm) ||
        word.phonetic.toLowerCase().includes(this.searchTerm) ||
        word.meaning.toLowerCase().includes(this.searchTerm)
      );
    }

    this.filteredWords = filtered;
    this.renderWords();
  }

  // 渲染单词列表
  renderWords() {
    const wordsTableBody = document.getElementById('wordsTableBody');
    if (!wordsTableBody) return;

    wordsTableBody.innerHTML = '';

    this.filteredWords.forEach((wordData) => {
      const row = this.createWordRow(wordData);
      wordsTableBody.appendChild(row);
    });

    // 设置音标符号点击事件
    this.setupPhoneticSymbolEvents();
  }

  // 创建单词行
  createWordRow(wordData) {
    const row = document.createElement('tr');
    
    // 解析音标为可点击的符号
    const phoneticSymbols = this.createPhoneticSymbols(wordData.phonetic);
    
    // 获取场景中文名
    const sceneName = this.getSceneName(wordData.scene);

    // 创建谷歌翻译链接
    const googleTranslateUrl = `https://translate.google.com/?sl=en&tl=zh&text=${encodeURIComponent(wordData.word)}&op=translate`;

    row.innerHTML = `
      <td>
        <div class="word-text">${wordData.word}</div>
      </td>
      <td>
        <div class="phonetic-display">${wordData.phonetic}</div>
        <div class="phonetic-symbols">
          ${phoneticSymbols}
        </div>
      </td>
      <td>
        <div class="meaning-text">${wordData.meaning}</div>
        <a href="${googleTranslateUrl}" target="_blank" class="translate-link" title="查看更多翻译">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" fill="currentColor"/>
          </svg>
        </a>
      </td>
      <td>
        <span class="category-tag">${sceneName}</span>
      </td>
    `;

    return row;
  }

  // 获取场景中文名
  getSceneName(scene) {
    const sceneNames = {
      'basic': '基础词汇',
      'daily': '日常生活',
      'food': '食物饮料',
      'computer': '计算机',
      'clothing': '服装配饰',
      'sports': '运动健身',
      'travel': '旅行交通',
      'business': '商务办公',
      'education': '教育学习',
      'health': '健康医疗',
      'entertainment': '娱乐休闲',
      'nature': '自然环境',
      'family': '家庭关系',
      'shopping': '购物消费',
      'emotions': '情感表达',
      'weather': '天气气候',
      'animals': '动物世界',
      'colors': '颜色描述',
      'numbers': '数字时间',
      'transportation': '交通工具',
      'hobbies': '兴趣爱好',
      'science': '科学技术',
      'art': '艺术文化',
      'finance': '金融理财',
      'social': '社交活动',
      'career': '职业工作',
      'home': '居家生活',
      'communication': '沟通交流',
      'geography': '地理位置',
      'music': '音乐艺术'
    };
    return sceneNames[scene] || '其他';
  }

  // 创建可点击的音标符号
  createPhoneticSymbols(phonetic) {
    // 移除方括号和重音符号进行分析
    const cleanPhonetic = phonetic.replace(/[\[\]ˈˌ]/g, '');
    const sequence = audioPlayer.parsePhoneticSequence(cleanPhonetic);
    
    return sequence.map(symbol => {
      const type = this.getSymbolType(symbol);
      const audioSrc = audioPlayer.phoneticAudioMap[symbol];
      
      if (audioSrc) {
        return `<span class="phonetic-symbol ${type}" data-src="${audioSrc}">${symbol}</span>`;
      }
      return `<span class="phonetic-symbol unknown">${symbol}</span>`;
    }).join('');
  }

  // 判断音标符号类型（元音或辅音）
  getSymbolType(symbol) {
    // 元音（包括双元音）
    const vowels = ['i', 'ɪ', 'e', 'ɛ', 'æ', 'ə', 'ʌ', 'ɑ', 'ɔ', 'o', 'ʊ', 'u', 'ɚ', 'ɝ', 'aɪ', 'aʊ', 'ɔɪ', 'eɪ', 'oʊ'];
    // 辅音
    const consonants = ['p', 'b', 't', 'd', 'k', 'g', 'f', 'v', 's', 'z', 'θ', 'ð', 'ʃ', 'ʒ', 'tʃ', 'dʒ', 'l', 'r', 'm', 'n', 'ŋ', 'j', 'w', 'h'];
    
    if (vowels.includes(symbol)) {
      return 'vowel';
    } else if (consonants.includes(symbol)) {
      return 'consonant';
    }
    return 'unknown';
  }

  // 设置音标符号点击事件
  setupPhoneticSymbolEvents() {
    const phoneticSymbols = document.querySelectorAll('.phonetic-symbol');
    phoneticSymbols.forEach(symbol => {
      symbol.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const audioSrc = e.target.dataset.src;
        if (audioSrc) {
          audioPlayer.playPhoneticAudio(audioSrc, e.target);
        }
      });
    });
  }
}

// 全局单词管理器实例
let wordManager;

// 页面加载完成后初始化单词管理器
document.addEventListener('DOMContentLoaded', function() {
  // 只在单词页面初始化
  if (document.getElementById('wordsTableBody')) {
    wordManager = new WordManager();
  }
});
