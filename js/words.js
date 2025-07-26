// 单词数据管理模块
class WordManager {
  constructor() {
    this.words = [];
    this.filteredWords = [];
    this.currentScene = 'all';
    this.searchTerm = '';
    this.hiddenColumns = {
      word: false,
      phonetic: false,
      meaning: false
    };
    this.loadInitialWords();
    this.setupEventListeners();
    this.setupTrainingControls();
    
    // 确保在页面加载后重新设置音标事件，以利用audioPlayer的缓存
    window.addEventListener('load', () => {
      if (typeof audioPlayer !== 'undefined') {
        // 延迟一点时间确保audioPlayer完全初始化
        setTimeout(() => {
          this.setupPhoneticSymbolEvents();
        }, 200);
      }
    });
  }

  // 加载初始单词数据，从JSON文件加载
  async loadInitialWords() {
    try {
      const response = await fetch('./data/words.json');
      const data = await response.json();
      this.words = data.words;
      this.filteredWords = [...this.words];
      this.renderWords();
    } catch (error) {
      console.error('加载单词数据失败:', error);
      this.words = [];
      this.filteredWords = [];
    }
  }

  // 设置事件监听器
  setupEventListeners() {
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
      item.addEventListener('click', () => {
        categoryItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        this.currentScene = item.dataset.scene;
        this.applyFilter();
      });
    });

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

    if (this.currentScene !== 'all') {
      filtered = filtered.filter(word => word.scene === this.currentScene);
    }

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

    // 渲染完成后设置音标符号事件，利用audioPlayer的缓存
    this.setupPhoneticSymbolEvents();
  }

  // 创建单词行
  createWordRow(wordData) {
    const row = document.createElement('tr');
    
    const phoneticSymbols = this.createPhoneticSymbols(wordData.phonetic);
    const sceneName = this.getSceneName(wordData.scene);
    const googleTranslateUrl = `https://translate.google.com/?sl=en&tl=zh&text=${encodeURIComponent(wordData.word)}&op=translate`;

    row.innerHTML = `
      <td class="word-column">
        <div class="word-text">${wordData.word}</div>
      </td>
      <td class="phonetic-column">
        <div class="phonetic-display">
          <span style="cursor: pointer; color: #667eea;" onclick="wordManager.playPhoneticSequence('${wordData.phonetic}', this)" title="点击播放完整音标">${wordData.phonetic}</span>
        </div>
        <div class="phonetic-symbols">
          ${phoneticSymbols}
        </div>
      </td>
      <td class="meaning-column">
        <div class="meaning-text">${wordData.meaning}</div>
        <div class="translation-controls">
          <button class="pronunciation-btn" data-word="${wordData.word}" title="播放发音" onclick="this.disabled=true; wordManager.playGoogleTTS('${wordData.word}', this)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/>
            </svg>
          </button>
          <a href="${googleTranslateUrl}" target="_blank" class="translate-link" title="查看更多翻译">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" fill="currentColor"/>
            </svg>
          </a>
        </div>
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

  // 创建可点击的音标符号 - 优化KK音标识别，充分利用缓存
  createPhoneticSymbols(phonetic) {
    const cleanPhonetic = phonetic.replace(/[\[\]ˈˌ]/g, '');
    const sequence = audioPlayer.parsePhoneticSequence(cleanPhonetic);
    
    return sequence.map(symbol => {
      const type = this.getSymbolType(symbol);
      const audioSrc = audioPlayer.phoneticAudioMap[symbol];
      
      if (audioSrc) {
        // 使用 kk 类名以便与 audioPlayer 的事件处理保持一致
        return `<span class="phonetic-symbol ${type} kk" data-src="${audioSrc}" data-symbol="${symbol}" title="点击听发音: [${symbol}]">${symbol}</span>`;
      } else {
        // 对于未找到的音标，记录调试信息
        console.warn(`未找到音标 "${symbol}" 的音频文件 (来源: ${phonetic})`);
        return `<span class="phonetic-symbol unknown" data-symbol="${symbol}" title="暂无音频: [${symbol}]" style="opacity: 0.6;">${symbol}</span>`;
      }
    }).join('');
  }

  // 判断KK音标符号类型
  getSymbolType(symbol) {
    // KK音标元音（包括双元音和r化音）
    const vowels = [
      'i', 'ɪ', 'e', 'ɛ', 'æ', 'ə', 'ʌ', 'ɑ', 'ɔ', 'o', 'ʊ', 'u', 
      'ɚ', 'ɝ',  // r化音
      'aɪ', 'aʊ', 'ɔɪ'  // 双元音
    ];
    
    // KK音标辅音
    const consonants = [
      'p', 'b', 't', 'd', 'k', 'g',  // 爆破音
      'f', 'v', 's', 'z', 'θ', 'ð', 'ʃ', 'ʒ', 'h',  // 摩擦音
      'tʃ', 'dʒ',  // 塞擦音
      'l', 'r',    // 流音
      'm', 'n', 'ŋ',  // 鼻音
      'j', 'w'     // 半元音
    ];
    
    if (vowels.includes(symbol)) {
      return 'vowel';
    } else if (consonants.includes(symbol)) {
      return 'consonant';
    }
    return 'unknown';
  }

  // 设置音标符号点击事件 - 优化，移除重复的事件监听，直接使用audioPlayer的缓存
  setupPhoneticSymbolEvents() {
    // 由于我们已经给音标符号添加了 'kk' 类名，
    // audioPlayer.setupPhoneticAudio() 会自动处理这些元素的点击事件
    // 这样可以充分利用audioPlayer的音频缓存和统一的播放逻辑
    
    // 确保audioPlayer已经设置了事件监听
    if (typeof audioPlayer !== 'undefined' && audioPlayer.setupPhoneticAudio) {
      audioPlayer.setupPhoneticAudio();
    }
  }

  // 播放完整单词的音标序列
  async playPhoneticSequence(phonetic, element) {
    if (typeof audioPlayer !== 'undefined' && audioPlayer.playPhoneticBreakdown) {
      try {
        element.style.color = '#28a745';
        element.innerHTML = `♪ ${phonetic}`;
        
        await audioPlayer.playPhoneticBreakdown(phonetic, element);
        
        element.style.color = '#667eea';
        element.innerHTML = phonetic;
      } catch (error) {
        console.error('播放音标序列失败:', error);
        element.style.color = '#667eea';
        element.innerHTML = phonetic;
      }
    }
  }

  // TTS相关方法保持不变...
  playGoogleTTS(word, button) {
    try {
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(word)}`;
      const audio = new Audio(ttsUrl);
      
      audio.onloadstart = () => {
        button.innerHTML = '<span style="font-size: 12px;">播放中...</span>';
      };
      
      audio.onended = () => {
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/>
          </svg>
        `;
        button.disabled = false;
      };
      
      audio.onerror = () => {
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/>
          </svg>
        `;
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
        button.innerHTML = '<span style="font-size: 12px;">播放中...</span>';
      };
      
      utterance.onend = () => {
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/>
          </svg>
        `;
        button.disabled = false;
      };
      
      utterance.onerror = () => {
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/>
          </svg>
        `;
        button.disabled = false;
      };
      
      speechSynthesis.speak(utterance);
    } else {
      button.disabled = false;
      console.error('浏览器不支持语音合成');
    }
  }

  // 设置训练控制面板
  setupTrainingControls() {
    const controlButtons = document.querySelectorAll('.control-button');
    
    controlButtons.forEach(button => {
      button.addEventListener('click', () => {
        const column = button.dataset.column;
        this.toggleColumn(column, button);
      });
    });
  }

  // 切换列的显示/隐藏
  toggleColumn(columnType, button) {
    this.hiddenColumns[columnType] = !this.hiddenColumns[columnType];
    const isHidden = this.hiddenColumns[columnType];
    
    // 更新按钮状态和文本
    if (isHidden) {
      button.classList.add('active');
      switch(columnType) {
        case 'word':
          button.textContent = '显示单词';
          break;
        case 'phonetic':
          button.textContent = '显示音标';
          break;
        case 'meaning':
          button.textContent = '显示中文';
          break;
      }
    } else {
      button.classList.remove('active');
      switch(columnType) {
        case 'word':
          button.textContent = '隐藏单词';
          break;
        case 'phonetic':
          button.textContent = '隐藏音标';
          break;
        case 'meaning':
          button.textContent = '隐藏中文';
          break;
      }
    }
    
    // 应用CSS类来隐藏/显示列
    const className = `${columnType}-column`;
    const elements = document.querySelectorAll(`.${className}`);
    
    elements.forEach(element => {
      if (isHidden) {
        element.classList.add('column-hidden');
      } else {
        element.classList.remove('column-hidden');
      }
    });
  }
}

let wordManager;

document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('wordsTableBody')) {
    wordManager = new WordManager();
  }
});