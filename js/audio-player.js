// 音频播放器模块
class AudioPlayer {
  constructor() {
    this.audioCache = new Map();
    this.currentAudio = null;
    this.currentPlayingElement = null;
    this.loadedCount = 0;
    this.totalAudioFiles = 49;
    this.phoneticAudioMap = this.createPhoneticAudioMap();
  }

  // 创建音标到音频文件的映射
  createPhoneticAudioMap() {
    return {
      'i': './asset/audio/kk01.mp3',
      'ɪ': './asset/audio/kk02.mp3',
      'e': './asset/audio/kk03.mp3',
      'ɛ': './asset/audio/kk04.mp3',
      'æ': './asset/audio/kk05.mp3',
      'ɑ': './asset/audio/kk06.mp3',
      'o': './asset/audio/kk07.mp3',
      'ɔ': './asset/audio/kk08.mp3',
      'u': './asset/audio/kk09.mp3',
      'ʊ': './asset/audio/kk10.mp3',
      'ʌ': './asset/audio/kk11.mp3',
      'ə': './asset/audio/kk12.mp3',
      'ɚ': './asset/audio/kk13.mp3',
      'ɝ': './asset/audio/kk14.mp3',
      'aɪ': './asset/audio/kk15.mp3',
      'aʊ': './asset/audio/kk16.mp3',
      'ɔɪ': './asset/audio/kk17.mp3',
      'p': './asset/audio/kk18.mp3',
      'b': './asset/audio/kk19.mp3',
      't': './asset/audio/kk22.mp3',
      'd': './asset/audio/kk23.mp3',
      'k': './asset/audio/kk24.mp3',
      'g': './asset/audio/kk25.mp3',
      'f': './asset/audio/kk26.mp3',
      'v': './asset/audio/kk27.mp3',
      's': './asset/audio/kk28.mp3',
      'z': './asset/audio/kk29.mp3',
      'θ': './asset/audio/kk30.mp3',
      'ð': './asset/audio/kk31.mp3',
      'ʃ': './asset/audio/kk32.mp3',
      'ʒ': './asset/audio/kk33.mp3',
      'tʃ': './asset/audio/kk34.mp3',
      'dʒ': './asset/audio/kk35.mp3',
      'l': './asset/audio/kk38.mp3',
      'r': './asset/audio/kk40.mp3',
      'm': './asset/audio/kk42.mp3',
      'n': './asset/audio/kk44.mp3',
      'ŋ': './asset/audio/kk46.mp3',
      'j': './asset/audio/kk47.mp3',
      'w': './asset/audio/kk48.mp3',
      'h': './asset/audio/kk49.mp3'
    };
  }

  // 预加载音频文件
  preloadAudio() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
      loadingIndicator.classList.add('show');
    }

    const audioSources = [
      './asset/audio/kk01.mp3', './asset/audio/kk02.mp3', './asset/audio/kk03.mp3',
      './asset/audio/kk04.mp3', './asset/audio/kk05.mp3', './asset/audio/kk06.mp3',
      './asset/audio/kk07.mp3', './asset/audio/kk08.mp3', './asset/audio/kk09.mp3',
      './asset/audio/kk10.mp3', './asset/audio/kk11.mp3', './asset/audio/kk12.mp3',
      './asset/audio/kk13.mp3', './asset/audio/kk14.mp3', './asset/audio/kk15.mp3',
      './asset/audio/kk16.mp3', './asset/audio/kk17.mp3', './asset/audio/kk18.mp3',
      './asset/audio/kk19.mp3', './asset/audio/kk20.mp3', './asset/audio/kk21.mp3',
      './asset/audio/kk22.mp3', './asset/audio/kk23.mp3', './asset/audio/kk24.mp3',
      './asset/audio/kk25.mp3', './asset/audio/kk26.mp3', './asset/audio/kk27.mp3',
      './asset/audio/kk28.mp3', './asset/audio/kk29.mp3', './asset/audio/kk30.mp3',
      './asset/audio/kk31.mp3', './asset/audio/kk32.mp3', './asset/audio/kk33.mp3',
      './asset/audio/kk34.mp3', './asset/audio/kk35.mp3', './asset/audio/kk36.mp3',
      './asset/audio/kk37.mp3', './asset/audio/kk38.mp3', './asset/audio/kk39.mp3',
      './asset/audio/kk40.mp3', './asset/audio/kk41.mp3', './asset/audio/kk42.mp3',
      './asset/audio/kk43.mp3', './asset/audio/kk44.mp3', './asset/audio/kk45.mp3',
      './asset/audio/kk46.mp3', './asset/audio/kk47.mp3', './asset/audio/kk48.mp3',
      './asset/audio/kk49.mp3'
    ];

    audioSources.forEach((src, index) => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = src;

      audio.addEventListener('canplaythrough', () => {
        this.loadedCount++;
        if (loadingIndicator) {
          loadingIndicator.textContent = `正在预加载音频... (${this.loadedCount}/${this.totalAudioFiles})`;
        }

        if (this.loadedCount === this.totalAudioFiles) {
          setTimeout(() => {
            if (loadingIndicator) {
              loadingIndicator.classList.remove('show');
            }
          }, 500);
        }
      });

      audio.addEventListener('error', () => {
        console.warn(`Failed to load audio: ${src}`);
        this.loadedCount++;
      });

      this.audioCache.set(src, audio);
    });
  }

  // 设置音标点击事件
  setupPhoneticAudio() {
    const phoneticElements = document.querySelectorAll(".kk");

    phoneticElements.forEach(element => {
      element.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const audioSrc = e.target.dataset.src;
        this.playPhoneticAudio(audioSrc, e.target);
      };
    });
  }

  // 播放音标音频
  playPhoneticAudio(audioSrc, element) {
    // 停止所有当前播放的音频
    this.stopAllAudio();

    // 从缓存中获取音频对象
    let audio = this.audioCache.get(audioSrc);

    if (!audio) {
      // 如果缓存中没有，创建新的音频对象
      audio = new Audio();
      audio.src = audioSrc;
      audio.preload = 'auto';
      this.audioCache.set(audioSrc, audio);
    }

    this.currentAudio = audio;
    this.currentPlayingElement = element;

    // 添加播放状态样式
    element.classList.add('playing');

    // 重置播放位置并播放
    audio.currentTime = 0;

    // 监听播放结束事件
    audio.addEventListener('ended', () => {
      if (this.currentPlayingElement) {
        this.currentPlayingElement.classList.remove('playing');
        this.currentPlayingElement = null;
      }
    }, { once: true });

    // 使用 Promise 处理播放，避免阻塞
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('Audio play failed:', error);
        if (this.currentPlayingElement) {
          this.currentPlayingElement.classList.remove('playing');
          this.currentPlayingElement = null;
        }
      });
    }
  }

  // 分解音标并播放
  async playPhoneticBreakdown(phonetic, playButton) {
    // 停止当前播放的所有音频
    this.stopAllAudio();
    
    // 清除之前的播放状态
    document.querySelectorAll('.playing').forEach(element => {
      element.classList.remove('playing');
    });
    
    // 移除音标符号 [] 和重音符号
    const cleanPhonetic = phonetic.replace(/[\[\]ˈˌ]/g, '');
    
    // 解析音标序列
    const phoneticSequence = this.parsePhoneticSequence(cleanPhonetic);
    
    if (playButton) {
      playButton.classList.add('playing');
      this.currentPlayingElement = playButton;
    }

    // 逐个播放音标
    for (let i = 0; i < phoneticSequence.length; i++) {
      const phoneticSymbol = phoneticSequence[i];
      const audioSrc = this.phoneticAudioMap[phoneticSymbol];
      
      if (audioSrc) {
        await this.playAudioWithDelay(audioSrc, 400); // 每个音标间隔400ms
      }
    }

    if (playButton) {
      playButton.classList.remove('playing');
      this.currentPlayingElement = null;
    }
  }

  // 停止所有正在播放的音频
  stopAllAudio() {
    // 停止当前音频
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
    
    // 停止缓存中的所有音频
    this.audioCache.forEach(audio => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    
    // 清除当前播放状态
    this.currentAudio = null;
    if (this.currentPlayingElement) {
      this.currentPlayingElement.classList.remove('playing');
      this.currentPlayingElement = null;
    }
  }

  // 解析音标序列，识别双元音和复合辅音
  parsePhoneticSequence(phonetic) {
    const sequence = [];
    let i = 0;
    
    while (i < phonetic.length) {
      // 检查双元音和复合辅音
      if (i < phonetic.length - 1) {
        const twoChar = phonetic.substr(i, 2);
        if (this.phoneticAudioMap[twoChar]) {
          sequence.push(twoChar);
          i += 2;
          continue;
        }
      }
      
      // 单个音标
      const oneChar = phonetic.charAt(i);
      if (this.phoneticAudioMap[oneChar]) {
        sequence.push(oneChar);
      }
      i++;
    }
    
    return sequence;
  }

  // 播放音频并等待指定延迟
  playAudioWithDelay(audioSrc, delay = 0) {
    return new Promise((resolve) => {
      let audio = this.audioCache.get(audioSrc);
      
      if (!audio) {
        audio = new Audio();
        audio.src = audioSrc;
        audio.preload = 'auto';
        this.audioCache.set(audioSrc, audio);
      }

      // 确保音频停止并重置
      audio.pause();
      audio.currentTime = 0;
      
      // 设置为当前音频
      this.currentAudio = audio;
      
      // 监听播放结束事件
      const onEnded = () => {
        setTimeout(resolve, delay);
      };
      
      audio.addEventListener('ended', onEnded, { once: true });

      // 播放音频
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Audio play failed:', error);
          audio.removeEventListener('ended', onEnded);
          setTimeout(resolve, delay);
        });
      }
    });
  }
}

// 全局音频播放器实例
const audioPlayer = new AudioPlayer();

// 页面加载完成后初始化
window.addEventListener('load', () => {
  // 注册 Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  }

  // 立即设置点击事件
  audioPlayer.setupPhoneticAudio();

  // 延迟预加载，避免阻塞页面渲染
  setTimeout(() => {
    audioPlayer.preloadAudio();
  }, 100);
});
