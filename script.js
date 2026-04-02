        let bestOf3State = {
            active: false,
            spins: 0,
            results: { 'YES': 0, 'NO': 0, 'MAYBE': 0 }
        };
        
        let audioCtx, isSoundEnabled = false;

        function initAudio() {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        }

        function updateVolume(gainNode, volume, time) {
            if (isSoundEnabled) {
                gainNode.gain.setValueAtTime(volume, time);
            }
        }

        function toggleSound() {
            isSoundEnabled = !isSoundEnabled;
            const btn = document.getElementById('soundToggleBtn');
            btn.textContent = isSoundEnabled ? '🔊' : '🔇';
            
                initAudio();
                startBGM();
            } else {
                stopBGM();
            }
        }

        // --- Sound Synthesizer Functions ---
        function playSound(type) {
            if (!isSoundEnabled) return;
            initAudio();
            
            const now = audioCtx.currentTime;
            
            if (type === 'pull') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
                gain.gain.setValueAtTime(0.5, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.4);
            } else if (type === 'tick') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.05);
            } else if (type === 'win') {
                function playTone(freq, time, dir, pType, vol) {
                    const o = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    o.type = pType;
                    o.frequency.setValueAtTime(freq, time);
                    g.gain.setValueAtTime(vol, time);
                    g.gain.exponentialRampToValueAtTime(0.01, time + dir);
                    o.connect(g);
                    g.connect(audioCtx.destination);
                    o.start(time);
                    o.stop(time + dir);
                }
                playTone(523.25, now, 0.4, 'sine', 0.2); // C5
                playTone(659.25, now + 0.1, 0.4, 'sine', 0.2); // E5
                playTone(783.99, now + 0.2, 0.4, 'sine', 0.2); // G5
                playTone(1046.50, now + 0.3, 0.6, 'sine', 0.3); // C6
            }
        }

        let bgmOsc, lfo;
        function startBGM() {
            if (bgmOsc) return;
            const now = audioCtx.currentTime;
            
            bgmOsc = audioCtx.createOscillator();
            bgmOsc.type = 'triangle';
            bgmOsc.frequency.setValueAtTime(110, now); // Low A Drone
            
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200, now);
            
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.03, now); // subtle background ambient
            
            bgmOsc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            
            bgmOsc.start(now);
        }

        function stopBGM() {
            if (bgmOsc) {
                bgmOsc.stop();
                bgmOsc.disconnect();
                bgmOsc = null;
            }
        }

        function resetBestOf3() {
            bestOf3State.spins = 0;
            bestOf3State.results = { 'YES': 0, 'NO': 0, 'MAYBE': 0 };
            updateSpinCounter();
            document.getElementById('result').textContent = 'PULL!';
            document.getElementById('result').className = '';
        }

        function updateSpinCounter() {
            const counterEl = document.getElementById('spinCounter');
            const modeInput = document.querySelector('input[name="mode"]:checked');
            
            if (!modeInput) return; // Guard clause just in case
            
            const mode = modeInput.value;
            
            if (mode === '3') {
                counterEl.classList.add('active');
                counterEl.textContent = `Spin ${bestOf3State.spins} / 3`;
            } else {
                counterEl.classList.remove('active');
            }
        }

        function addToHistory(text, cssClass, isWinner = false) {
            const list = document.getElementById('historyList');
            const li = document.createElement('li');
            
            if (isWinner) {
                li.className = `history-item final-winner ${cssClass}`;
                li.textContent = `WINNER: ${text}`;
            } else {
                li.className = 'history-item';
                
                const spanNum = document.createElement('span');
                spanNum.textContent = `#${list.children.length + 1}`;
                spanNum.style.color = '#888';
                spanNum.style.fontSize = '0.9rem';
                
                const spanResult = document.createElement('span');
                spanResult.textContent = text;
                spanResult.className = cssClass;
                
                li.appendChild(spanNum);
                li.appendChild(spanResult);
            }
            
            // Insert at top
            if (list.firstChild) {
                list.insertBefore(li, list.firstChild);
            } else {
                list.appendChild(li);
            }
        }

        function clearHistory() {
            document.getElementById('historyList').innerHTML = '';
            resetBestOf3();
        }

        function changeBgColor(color, element) {
            document.body.style.background = color;
            
            if (element) {
                // Remove active class from all color circles
                document.querySelectorAll('.color-circle').forEach(btn => {
                    btn.classList.remove('active');
                });
                // Add active class to the clicked circle
                element.classList.add('active');
            }
        }

        function spinToDecide() {
            const resultDiv = document.getElementById('result');
            const lever = document.getElementById('lever');
            
            // Check options & mode
            const numOptions = parseInt(document.querySelector('input[name="options"]:checked').value);
            const mode = parseInt(document.querySelector('input[name="mode"]:checked').value);
            
            const choices2 = [ { text: 'YES', class: 'yes' }, { text: 'NO', class: 'no' } ];
            const choices3 = [ { text: 'YES', class: 'yes' }, { text: 'NO', class: 'no' }, { text: 'MAYBE', class: 'maybe' } ];
            const activePool = numOptions === 3 ? choices3 : choices2;
            
            if (lever.classList.contains('disabled')) return;
            
            // Auto reset if starting a new best of 3 round after finishing one
            if (mode === 3 && bestOf3State.spins >= 3) {
                resetBestOf3();
            }
            
            playSound('pull');
            
            lever.classList.add('disabled');
            lever.classList.add('pulled');
            
            // Release mechanism after short pull visual
            setTimeout(() => {
                lever.classList.remove('pulled');
            }, 300);
            
            // Start spinning effect
            resultDiv.className = 'spinning';
            
            let count = 0;
            const minSpins = 20; // Slightly faster for multi-spins
            const maxSpins = 40; 
            const targetSpins = minSpins + Math.floor(Math.random() * (maxSpins - minSpins));
            
            // Rapid shuffling (fake spinning)
            const spinInterval = setInterval(() => {
                playSound('tick');
                // Randomly display one from the pool purely for visual effect while spinning
                const visualIndex = Math.floor(Math.random() * activePool.length);
                resultDiv.textContent = activePool[visualIndex].text;

                count++;

                // Slow down the spin as it gets closer to target
                if (count >= targetSpins) {
                    clearInterval(spinInterval);
                    
                    // Securely calculate final answer
                    const array = new Uint8Array(1);
                    window.crypto.getRandomValues(array);
                    
                    // Slice 0-255 into 2 or 3 buckets
                    let finalIndex;
                    if (numOptions === 2) {
                        finalIndex = array[0] < 128 ? 0 : 1;
                    } else {
                        // For 3 options (255 / 3 = 85)
                        if (array[0] < 85) finalIndex = 0;
                        else if (array[0] < 170) finalIndex = 1;
                        else finalIndex = 2;
                    }
                    
                    const finalResult = activePool[finalIndex];

                    // Set final result with some flash
                    playSound('win');
                    resultDiv.className = finalResult.class;
                    resultDiv.textContent = finalResult.text;

                    // Flash effect on win
                    setTimeout(() => {
                        resultDiv.style.transform = 'scale(1.2)';
                        setTimeout(() => resultDiv.style.transform = 'scale(1)', 150);
                    }, 50);

                    // History tracking
                    addToHistory(finalResult.text, finalResult.class);

                    if (mode === 3) {
                        bestOf3State.spins++;
                        bestOf3State.results[finalResult.text]++;
                        updateSpinCounter();
                        
                        if (bestOf3State.spins >= 3) {
                            // Determine overall winner
                            let winner = null;
                            let maxScore = -1;
                            
                            for (const [key, value] of Object.entries(bestOf3State.results)) {
                                if (value > maxScore) {
                                    maxScore = value;
                                    winner = key;
                                } else if (value === maxScore) {
                                    winner = 'TIE'; // Handle tie if out of 3 options
                                }
                            }
                            
                            const winnerObj = activePool.find(p => p.text === winner) || { text: 'TIE', class: '' };
                            setTimeout(() => {
                                playSound('win');
                                addToHistory(winnerObj.text, winnerObj.class, true);
                            }, 500);
                        }
                    }

                    lever.classList.remove('disabled');
                }
            }, 60); // Spin speed
        }
        
        // Initialize best of 3 counter display on load
        window.addEventListener('DOMContentLoaded', () => {
            updateSpinCounter();
            createCasinoLights();
        });
        
        function createCasinoLights() {
            // Populate the light-container edges with bulbs
            const lightContainers = [
                { selector: '.lights-container.top', count: 12 },
                { selector: '.lights-container.bottom', count: 12 },
                { selector: '.lights-container.left', count: 8 },
                { selector: '.lights-container.right', count: 8 }
            ];
            
            lightContainers.forEach(containerData => {
                const container = document.querySelector(containerData.selector);
                if (container) {
                    for (let i = 0; i < containerData.count; i++) {
                        const bulb = document.createElement('div');
                        bulb.className = 'casino-bulb';
                        // Add stagger effect to animation
                        bulb.style.animationDelay = `${(i * 0.1)}s`;
                        container.appendChild(bulb);
                    }
                }
            });
        }
