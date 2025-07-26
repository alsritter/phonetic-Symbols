// 音频播放器模块 - KK音标专用版
class AudioPlayer {
  constructor() {
    this.audioCache = new Map();
    this.currentAudio = null;
    this.currentPlayingElement = null;
    this.loadedCount = 0;
    this.totalAudioFiles = 40; // 更新为实际KK音标数量
    this.phoneticAudioMap = this.createKKPhoneticAudioMap();
  }

  // 创建KK音标到音频文件的映射
  createKKPhoneticAudioMap() {
    return {
      // KK元音 (14个)
      'i': './asset/audio/kk01.mp3',      // see, meet
      'ɪ': './asset/audio/kk02.mp3',      // sit, big
      'e': './asset/audio/kk03.mp3',      // day, make (实际为eɪ的简化)
      'ɛ': './asset/audio/kk04.mp3',      // bed, red
      'æ': './asset/audio/kk05.mp3',      // cat, bad
      'ɑ': './asset/audio/kk06.mp3',      // father, car
      'o': './asset/audio/kk07.mp3',      // go, home (实际为oʊ的简化)
      'ɔ': './asset/audio/kk08.mp3',      // dog, all
      'u': './asset/audio/kk09.mp3',      // too, food
      'ʊ': './asset/audio/kk10.mp3',      // book, good
      'ʌ': './asset/audio/kk11.mp3',      // cup, run
      'ə': './asset/audio/kk12.mp3',      // about, sofa
      'ɚ': './asset/audio/kk13.mp3',      // butter, water (r化央元音)
      'ɝ': './asset/audio/kk14.mp3',      // bird, work (r化中元音)
      
      // KK双元音 (3个)
      'aɪ': './asset/audio/kk15.mp3',     // my, time
      'aʊ': './asset/audio/kk16.mp3',     // now, house
      'ɔɪ': './asset/audio/kk17.mp3',     // boy, voice
      
      // KK辅音 (24个)
      // 爆破音
      'p': './asset/audio/kk18.mp3',      // pen, cup
      'b': './asset/audio/kk19.mp3',      // book, job
      't': './asset/audio/kk22.mp3',      // tea, cat
      'd': './asset/audio/kk23.mp3',      // dog, red
      'k': './asset/audio/kk24.mp3',      // cat, back
      'g': './asset/audio/kk25.mp3',      // go, big
      
      // 摩擦音
      'f': './asset/audio/kk26.mp3',      // fish, laugh
      'v': './asset/audio/kk27.mp3',      // very, love
      's': './asset/audio/kk28.mp3',      // sun, yes
      'z': './asset/audio/kk29.mp3',      // zoo, these
      'θ': './asset/audio/kk30.mp3',      // think, bath
      'ð': './asset/audio/kk31.mp3',      // this, weather
      'ʃ': './asset/audio/kk32.mp3',      // she, wish
      'ʒ': './asset/audio/kk33.mp3',      // measure, vision
      'h': './asset/audio/kk49.mp3',      // he, house
      
      // 塞擦音
      'tʃ': './asset/audio/kk34.mp3',     // chair, teach
      'dʒ': './asset/audio/kk35.mp3',     // judge, bridge
      
      // 流音
      'l': './asset/audio/kk38.mp3',      // like, love
      'r': './asset/audio/kk40.mp3',      // red, run
      
      // 鼻音
      'm': './asset/audio/kk42.mp3',      // man, make
      'n': './asset/audio/kk44.mp3',      // no, name
      'ŋ': './asset/audio/kk46.mp3',      // sing, long
      
      // 半元音
      'j': './asset/audio/kk47.mp3',      // yes, you
      'w': './asset/audio/kk48.mp3'       // we, water
    };
  }

  // 预加载KK音标音频文件
  preloadAudio() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
      loadingIndicator.classList.add('show');
      loadingIndicator.textContent = '正在预加载KK音标音频...';
    }

    // 获取所有KK音标音频文件
    const audioSources = Object.values(this.phoneticAudioMap);
    this.totalAudioFiles = audioSources.length;

    audioSources.forEach((src, index) => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = src;

      audio.addEventListener('canplaythrough', () => {
        this.loadedCount++;
        if (loadingIndicator) {
          loadingIndicator.textContent = `正在预加载KK音标音频... (${this.loadedCount}/${this.totalAudioFiles})`;
        }

        if (this.loadedCount === this.totalAudioFiles) {
          setTimeout(() => {
            if (loadingIndicator) {
              loadingIndicator.classList.remove('show');
            }
            console.log('KK音标音频预加载完成');
          }, 500);
        }
      });

      audio.addEventListener('error', () => {
        console.warn(`Failed to load KK phonetic audio: ${src}`);
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
    this.stopAllAudio();

    let audio = this.audioCache.get(audioSrc);

    if (!audio) {
      audio = new Audio();
      audio.src = audioSrc;
      audio.preload = 'auto';
      this.audioCache.set(audioSrc, audio);
    }

    this.currentAudio = audio;
    this.currentPlayingElement = element;

    element.classList.add('playing');

    audio.currentTime = 0;

    audio.addEventListener('ended', () => {
      if (this.currentPlayingElement) {
        this.currentPlayingElement.classList.remove('playing');
        this.currentPlayingElement = null;
      }
    }, { once: true });

    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('KK phonetic audio play failed:', error);
        if (this.currentPlayingElement) {
          this.currentPlayingElement.classList.remove('playing');
          this.currentPlayingElement = null;
        }
      });
    }
  }

  // 优化的KK音标分解播放
  async playPhoneticBreakdown(phonetic, playButton) {
    this.stopAllAudio();
    
    document.querySelectorAll('.playing').forEach(element => {
      element.classList.remove('playing');
    });
    
    const cleanPhonetic = phonetic.replace(/[\[\]ˈˌ]/g, '');
    const phoneticSequence = this.parseKKPhoneticSequence(cleanPhonetic);
    
    if (phoneticSequence.length === 0) {
      console.warn('未识别到有效的KK音标:', phonetic);
      return;
    }

    if (playButton) {
      playButton.classList.add('playing');
      this.currentPlayingElement = playButton;
    }

    console.log('播放KK音标序列:', phoneticSequence);

    // 逐个播放音标
    for (let i = 0; i < phoneticSequence.length; i++) {
      const phoneticSymbol = phoneticSequence[i];
      const audioSrc = this.phoneticAudioMap[phoneticSymbol];
      
      if (audioSrc) {
        await this.playAudioWithDelay(audioSrc, 400);
      } else {
        console.warn('未找到音频文件:', phoneticSymbol);
      }
    }

    if (playButton) {
      playButton.classList.remove('playing');
      this.currentPlayingElement = null;
    }
  }

  // 停止所有音频
  stopAllAudio() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
    
    this.audioCache.forEach(audio => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    
    this.currentAudio = null;
    if (this.currentPlayingElement) {
      this.currentPlayingElement.classList.remove('playing');
      this.currentPlayingElement = null;
    }
  }

  // 优化的KK音标序列解析
  parseKKPhoneticSequence(phonetic) {
    const sequence = [];
    let i = 0;
    
    while (i < phonetic.length) {
      let found = false;
      
      // 检查三字符组合（tʃ, dʒ等）
      if (i < phonetic.length - 2) {
        const threeChar = phonetic.substr(i, 3);
        if (this.phoneticAudioMap[threeChar]) {
          sequence.push(threeChar);
          i += 3;
          found = true;
        }
      }
      
      // 检查双字符组合（双元音、r化音等）
      if (!found && i < phonetic.length - 1) {
        const twoChar = phonetic.substr(i, 2);
        if (this.phoneticAudioMap[twoChar]) {
          sequence.push(twoChar);
          i += 2;
          found = true;
        }
      }
      
      // 检查单字符
      if (!found) {
        const oneChar = phonetic.charAt(i);
        if (this.phoneticAudioMap[oneChar]) {
          sequence.push(oneChar);
        } else {
          console.warn('未识别的KK音标符号:', oneChar);
        }
        i++;
      }
    }
    
    return sequence;
  }

  // 通用音标序列解析（兼容性方法）
  parsePhoneticSequence(phonetic) {
    return this.parseKKPhoneticSequence(phonetic);
  }

  // 播放音频并等待
  playAudioWithDelay(audioSrc, delay = 0) {
    return new Promise((resolve) => {
      let audio = this.audioCache.get(audioSrc);
      
      if (!audio) {
        audio = new Audio();
        audio.src = audioSrc;
        audio.preload = 'auto';
        this.audioCache.set(audioSrc, audio);
      }

      audio.pause();
      audio.currentTime = 0;
      
      this.currentAudio = audio;
      
      const onEnded = () => {
        setTimeout(resolve, delay);
      };
      
      audio.addEventListener('ended', onEnded, { once: true });

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('KK Audio play failed:', error);
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
