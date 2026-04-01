        let bestOf3State = {
            active: false,
            spins: 0,
            results: { 'YES': 0, 'NO': 0, 'MAYBE': 0 }
        };

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
