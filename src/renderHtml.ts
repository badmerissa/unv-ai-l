export function renderHtml(dataJson: string, userEmail: string) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>unvAIl</title>
    
    <!-- Scripts: Now using the optimized production build of Vue -->
    <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Inject safe D1 Data and Cloudflare Access User Email -->
    <script>
        window.__INITIAL_DATA__ = ${dataJson};
        window.__USER_EMAIL__ = "${userEmail}";
    </script>

    <style>
        .fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
        .fade-enter-from, .fade-leave-to { opacity: 0; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25%, 75% { transform: translateX(-5px); } 50% { transform: translateX(5px); } }
        .shake { animation: shake 0.4s ease-in-out; }
        @keyframes pop { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        .pop { animation: pop 0.3s ease-in-out; }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="bg-gray-100 h-screen w-screen overflow-hidden text-gray-900">

    <div id="app" class="h-full w-full max-w-md mx-auto bg-gray-50 flex flex-col relative shadow-xl min-h-screen">
        
        <!-- Header -->
        <header class="flex justify-between items-center px-4 py-3 border-b border-gray-100 z-10 bg-white">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                    <i class="fa-solid fa-robot"></i>
                </div>
                <h1 class="font-bold text-xl tracking-tight text-gray-900">unv<span class="text-purple-600">AI</span>l</h1>
            </div>
            <div class="flex items-center gap-3 text-gray-600">
                <button @click="showStats = true" class="hover:text-black transition-colors" title="Statistics">
                    <i class="fa-solid fa-chart-simple text-xl"></i>
                </button>
                <button @click="showInfo = true" class="hover:text-black transition-colors" title="How to play">
                    <i class="fa-regular fa-circle-question text-xl"></i>
                </button>
                <!-- User Menu -->
                <div class="relative group ml-1">
                    <button class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
                        <i class="fa-solid fa-user text-sm text-gray-600"></i>
                    </button>
                    <!-- Dropdown -->
                    <div class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div class="p-3 border-b border-gray-100">
                            <p class="text-xs text-gray-500 mb-1">Logged in as:</p>
                            <p class="text-sm font-bold truncate" :title="userId">{{ isAnonymous ? 'Guest User' : userId }}</p>
                        </div>
                        <a v-if="!isAnonymous" href="/cdn-cgi/access/logout" class="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-xl transition-colors">
                            <i class="fa-solid fa-right-from-bracket mr-2"></i> Log Out
                        </a>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Game Area -->
        <main class="flex-1 relative overflow-hidden flex flex-col">
            
            <!-- Progress Bar -->
            <div class="w-full h-1 bg-gray-100 flex">
                <div v-for="(img, idx) in dailyImages" :key="idx" class="h-full flex-1 border-r border-white transition-all duration-500" :class="{'bg-gray-200': idx > currentIndex, 'bg-purple-500': idx === currentIndex, 'bg-green-500': idx < currentIndex && img.isCorrect, 'bg-red-500': idx < currentIndex && !img.isCorrect && img.guess !== null}"></div>
            </div>

            <!-- Game Content -->
            <div v-if="!gameFinished" class="flex-1 flex flex-col justify-center items-center p-6 gap-8 relative">
                
                <div class="relative w-full aspect-[4/5] max-h-[60vh] rounded-3xl overflow-hidden shadow-2xl bg-gray-900 group border border-white">
                    <div v-if="loadingImage" class="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                        <i class="fa-solid fa-circle-notch fa-spin text-3xl"></i>
                    </div>
                    <img :src="currentImage.url" class="w-full h-full object-cover transition-transform duration-700" :class="{'scale-105': imageRevealed}" @load="loadingImage = false">
                    
                    <div v-if="imageRevealed" class="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                        <div class="text-6xl mb-4" :class="currentImage.isCorrect ? 'text-green-400 pop' : 'text-red-400 shake'">
                            <i :class="currentImage.isCorrect ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'"></i>
                        </div>
                        <h2 class="text-white text-3xl font-bold mb-2">It was {{ currentImage.type }}!</h2>
                        <p class="text-white/80 text-center px-8 text-sm mb-8">{{ currentImage.explanation }}</p>
                        <button @click="nextImage" class="bg-white text-black px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform active:scale-95">
                            {{ isLastImage ? 'See Results' : 'Next Image' }} <i class="fa-solid fa-arrow-right ml-2"></i>
                        </button>
                    </div>
                </div>

                <div class="w-full flex gap-4 items-center justify-center px-2">
                    <button @click="makeGuess('Real')" :disabled="imageRevealed || checkingGuess" class="flex-1 h-16 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center gap-2 font-bold text-gray-700 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                        <i class="fa-solid fa-camera" v-if="!checkingGuess"></i>
                        <i class="fa-solid fa-circle-notch fa-spin" v-else></i>
                        Real
                    </button>
                    <div class="text-gray-300 font-bold text-sm">VS</div>
                    <button @click="makeGuess('AI')" :disabled="imageRevealed || checkingGuess" class="flex-1 h-16 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center gap-2 font-bold text-gray-700 hover:border-purple-500 hover:text-purple-500 hover:bg-purple-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                        <i class="fa-solid fa-robot" v-if="!checkingGuess"></i>
                        <i class="fa-solid fa-circle-notch fa-spin" v-else></i>
                        AI
                    </button>
                </div>
            </div>

            <!-- Results Screen -->
            <div v-else class="flex-1 flex flex-col items-center justify-start p-6 pt-10 text-center animate-fade-in overflow-y-auto no-scrollbar">
                
                <h2 class="text-3xl font-extrabold mb-6 tracking-tight">Statistics</h2>
                
                <!-- Wordle Style Top Stats -->
                <div class="flex justify-center gap-6 mb-8 w-full px-2">
                    <div class="flex flex-col items-center">
                        <div class="text-3xl font-bold">{{ userStats.played }}</div>
                        <div class="text-xs text-gray-500 mt-1">Played</div>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="text-3xl font-bold">{{ winPercentage }}</div>
                        <div class="text-xs text-gray-500 mt-1">Win %</div>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="text-3xl font-bold">{{ userStats.currentStreak }}</div>
                        <div class="text-xs text-gray-500 mt-1 whitespace-nowrap">Current<br>Streak</div>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="text-3xl font-bold">{{ userStats.maxStreak }}</div>
                        <div class="text-xs text-gray-500 mt-1 whitespace-nowrap">Max<br>Streak</div>
                    </div>
                </div>

                <!-- Score Distribution -->
                <div class="w-full max-w-xs text-left mb-8">
                    <h3 class="font-bold text-sm tracking-wider mb-3 text-gray-800">SCORE DISTRIBUTION</h3>
                    <div v-for="i in [0, 1, 2, 3, 4, 5]" :key="i" class="flex items-center text-sm mb-1.5">
                        <div class="w-3 font-bold text-gray-700">{{ i }}</div>
                        <div class="flex-1 bg-gray-100 h-6 ml-2 rounded-sm overflow-hidden flex">
                            <div class="h-full text-white text-xs font-bold flex justify-end items-center pr-2 transition-all duration-1000 ease-out min-w-[1.5rem]"
                                 :class="score === i && gameFinished ? 'bg-green-500' : 'bg-gray-500'"
                                 :style="{ width: getDistributionWidth(i) + '%' }">
                                {{ userStats.distribution[i] || 0 }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col gap-3 w-full max-w-xs mt-auto pb-4">
                    <div v-if="isAnonymous" class="text-xs text-orange-600 bg-orange-50 p-3 rounded-lg mb-2 text-left flex gap-2">
                        <i class="fa-solid fa-triangle-exclamation mt-0.5"></i>
                        You are playing locally as a Guest. Stats are saved, but won't sync across devices unless you deploy behind Cloudflare Access.
                    </div>

                    <button @click="shareResults" class="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 text-lg">
                        <span v-if="!copied">Share <i class="fa-solid fa-share-nodes ml-1"></i></span>
                        <span v-else><i class="fa-solid fa-check"></i> Copied!</span>
                    </button>
                    
                    <div class="text-sm text-gray-500 mt-3 font-semibold">
                        Next puzzle in <span class="text-gray-900 font-mono">{{ timeUntilNext }}</span>
                    </div>
                </div>
            </div>
        </main>
        
         <!-- Footer -->
        <footer class="py-4 text-center text-xs text-slate-500 bg-white border-t border-gray-100 shrink-0">
            <div class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5 text-slate-800" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <!-- Handle -->
                    <path d="M 70 35 C 100 35 100 75 70 75" fill="none" stroke="currentColor" stroke-width="14" stroke-linecap="round"/>
                    <!-- Mug Silhouette -->
                    <path d="M 10 15 L 80 15 L 80 55 C 80 85 65 95 45 95 C 25 95 10 85 10 55 Z" fill="currentColor"/>
                    <!-- White Hollow Space -->
                    <path d="M 22 15 L 68 15 L 68 55 C 68 75 58 80 45 80 C 32 80 22 75 22 55 Z" fill="#ffffff"/>
                    <!-- Inner Black Circle -->
                    <circle cx="45" cy="46" r="21" fill="currentColor"/>
                    <!-- Text -->
                    <text x="45" y="52" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="16" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">THD</text>
                </svg>
                <p>
                    Part of the <a href="https://thehelpfuldev.com/" target="_blank" rel="noopener noreferrer" class="font-semibold text-slate-700 hover:text-blue-500 transition-colors">The Helpful Dev</a> Network
                </p>
            </div>
        </footer>

        <!-- Stats Modal (Viewable during game) -->
        <div v-if="showStats && !gameFinished" class="fixed inset-0 bg-white z-50 flex flex-col items-center justify-start p-6 pt-12 animate-fade-in overflow-y-auto">
            <button @click="showStats = false" class="absolute top-4 right-4 text-gray-400 hover:text-black">
                <i class="fa-solid fa-xmark text-2xl"></i>
            </button>
            <h2 class="text-3xl font-extrabold mb-8 tracking-tight">Statistics</h2>
            
            <div class="flex justify-center gap-6 mb-10 w-full max-w-xs">
                <div class="flex flex-col items-center"><div class="text-3xl font-bold">{{ userStats.played }}</div><div class="text-xs text-gray-500 mt-1">Played</div></div>
                <div class="flex flex-col items-center"><div class="text-3xl font-bold">{{ winPercentage }}</div><div class="text-xs text-gray-500 mt-1">Win %</div></div>
                <div class="flex flex-col items-center"><div class="text-3xl font-bold">{{ userStats.currentStreak }}</div><div class="text-xs text-gray-500 mt-1 whitespace-nowrap">Current<br>Streak</div></div>
                <div class="flex flex-col items-center"><div class="text-3xl font-bold">{{ userStats.maxStreak }}</div><div class="text-xs text-gray-500 mt-1 whitespace-nowrap">Max<br>Streak</div></div>
            </div>

            <div class="w-full max-w-xs text-left mb-8">
                <h3 class="font-bold text-sm tracking-wider mb-3 text-gray-800">SCORE DISTRIBUTION</h3>
                <div v-for="i in [0, 1, 2, 3, 4, 5]" :key="i" class="flex items-center text-sm mb-1.5">
                    <div class="w-3 font-bold text-gray-700">{{ i }}</div>
                    <div class="flex-1 bg-gray-100 h-6 ml-2 rounded-sm overflow-hidden flex">
                        <div class="h-full text-white text-xs font-bold flex justify-end items-center pr-2 transition-all duration-1000 ease-out min-w-[1.5rem] bg-gray-500"
                             :style="{ width: getDistributionWidth(i) + '%' }">
                            {{ userStats.distribution[i] || 0 }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Info Modal -->
        < v-if="showInfo" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showInfo = false">
            <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                <h3 class="font-bold text-xl mb-4 text-gray-900">How to Play</h3>
                <ul class="space-y-3 text-gray-600 mb-6">
                    <li class="flex items-start gap-3">
                        <i class="fa-solid fa-image mt-1 text-purple-500"></i>
                        <span>You will see 5 images every day.</span>
                    </li>
                    <li class="flex items-start gap-3">
                        <i class="fa-solid fa-magnifying-glass mt-1 text-purple-500"></i>
                        <span>Look closely at hands, lighting, and textures.</span>
                    </li>
                    <li class="flex items-start gap-3">
                        <i class="fa-solid fa-chart-simple mt-1 text-purple-500"></i>
                        <span>Build your streak and check your score distribution.</span>
                    </li>
                </ul>
                <button @click="showInfo = false" class="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-800 transition-colors">
                    Got it
                </button>
            </div>
        </div>
        
    </div>

    <script>
        const { createApp, ref, computed, onMounted } = Vue;

        createApp({
            setup() {
                const initialData = (window.__INITIAL_DATA__ || []).map(img => ({
                    ...img,
                    type: null, 
                    explanation: null,
                    guess: null,
                    isCorrect: false
                }));

                const dailyImages = ref(initialData);
                const currentIndex = ref(0);
                const gameFinished = ref(false);
                const copied = ref(false);
                const showInfo = ref(false);
                const showStats = ref(false);
                const loadingImage = ref(true);
                const imageRevealed = ref(false);
                const checkingGuess = ref(false);

                const injectedEmail = window.__USER_EMAIL__;
                const isAnonymous = ref(!injectedEmail || injectedEmail === 'anonymous' || injectedEmail === '');

                const getUserId = () => {
                    if (!isAnonymous.value) return injectedEmail;
                    
                    let uid = localStorage.getItem('unvail_guest_id');
                    if (!uid) {
                        uid = 'guest_' + Math.random().toString(36).substr(2, 9);
                        localStorage.setItem('unvail_guest_id', uid);
                    }
                    return uid;
                };
                const userId = getUserId();

                const userStats = ref({
                    played: 0,
                    wins: 0,
                    currentStreak: 0,
                    maxStreak: 0,
                    distribution: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                    lastPlayedDate: null
                });

                const currentImage = computed(() => dailyImages.value[currentIndex.value]);
                const isLastImage = computed(() => currentIndex.value === dailyImages.value.length - 1);
                const score = computed(() => dailyImages.value.filter(img => img.isCorrect).length);

                const winPercentage = computed(() => {
                    if (userStats.value.played === 0) return 0;
                    return Math.round((userStats.value.wins / userStats.value.played) * 100);
                });

                const scoreEmoji = computed(() => {
                    if (score.value === 5) return '🏆';
                    if (score.value >= 3) return '😎';
                    return '🤔';
                });

                const currentDate = computed(() => {
                    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                });

                const timeUntilNext = ref('');
                const updateTimer = () => {
                    const now = new Date();
                    const tomorrow = new Date(now);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(0, 0, 0, 0);
                    
                    const diff = tomorrow - now;
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    
                    timeUntilNext.value = \`\${hours}h \${minutes}m \${seconds}s\`;
                };

                const getDistributionWidth = (targetScore) => {
                    const maxGuesses = Math.max(...Object.values(userStats.value.distribution), 1);
                    const amount = userStats.value.distribution[targetScore] || 0;
                    return (amount / maxGuesses) * 100;
                };

                const fetchStats = async () => {
                    try {
                        const res = await fetch('/api/stats?userId=' + encodeURIComponent(userId));
                        if (res.ok) {
                            const data = await res.json();
                            if (data && data.played !== undefined) {
                                userStats.value = {
                                    played: data.played || 0,
                                    wins: data.wins || 0,
                                    currentStreak: data.current_streak || 0,
                                    maxStreak: data.max_streak || 0,
                                    distribution: data.distribution ? (typeof data.distribution === 'string' ? JSON.parse(data.distribution) : data.distribution) : { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0 },
                                    lastPlayedDate: data.last_played_date
                                };
                            }
                        } else {
                            console.error("Failed to fetch stats from DB. Status:", res.status);
                        }
                    } catch (err) {
                        console.error("Network error fetching stats", err);
                    }
                };

                const saveStatsToCloud = async (finalScore) => {
                    const todayDateString = new Date().toISOString().split('T')[0];
                    let newStats = { ...userStats.value };
                    
                    if (newStats.lastPlayedDate !== todayDateString) {
                        newStats.played += 1;
                        if (finalScore === 5) newStats.wins += 1;
                        
                        newStats.distribution[finalScore] = (newStats.distribution[finalScore] || 0) + 1;
                        
                        if (!newStats.lastPlayedDate) {
                            newStats.currentStreak = 1;
                        } else {
                            const lastDate = new Date(newStats.lastPlayedDate);
                            const today = new Date(todayDateString);
                            const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
                            
                            if (diffDays === 1) {
                                newStats.currentStreak += 1;
                            } else if (diffDays > 1) {
                                newStats.currentStreak = 1;
                            }
                        }
                        
                        if (newStats.currentStreak > newStats.maxStreak) {
                            newStats.maxStreak = newStats.currentStreak;
                        }
                        
                        newStats.lastPlayedDate = todayDateString;
                        userStats.value = newStats;
                        
                        try {
                            const res = await fetch('/api/stats', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    userId: userId, 
                                    played: newStats.played,
                                    wins: newStats.wins,
                                    currentStreak: newStats.currentStreak,
                                    maxStreak: newStats.maxStreak,
                                    distribution: newStats.distribution,
                                    lastPlayedDate: newStats.lastPlayedDate
                                })
                            });
                            
                            if (!res.ok) {
                                console.error("Failed to save stats to D1:", await res.text());
                            }
                        } catch(err) {
                            console.error("Network error saving stats", err);
                        }
                    }
                };

                onMounted(() => {
                    setInterval(updateTimer, 1000);
                    updateTimer();
                    fetchStats();
                });

                const makeGuess = async (guessType) => {
                    if (imageRevealed.value || !currentImage.value || checkingGuess.value) return;
                    
                    checkingGuess.value = true;
                    
                    try {
                        const res = await fetch('/api/reveal?id=' + currentImage.value.id);
                        if (!res.ok) throw new Error('Network error');
                        const data = await res.json();
                        
                        currentImage.value.type = data.type;
                        currentImage.value.explanation = data.explanation;
                        currentImage.value.guess = guessType;
                        currentImage.value.isCorrect = (data.type === guessType);
                        
                        imageRevealed.value = true;
                    } catch (error) {
                        console.error('Failed to check answer:', error);
                        alert("Failed to check answer. Please check your connection and try again.");
                    } finally {
                        checkingGuess.value = false;
                    }
                };

                const nextImage = () => {
                    if (isLastImage.value) {
                        gameFinished.value = true;
                        saveStatsToCloud(score.value);
                    } else {
                        currentIndex.value++;
                        imageRevealed.value = false;
                        loadingImage.value = true;
                    }
                };

                const shareResults = () => {
                    let resultString = \`unvAIl \${currentDate.value}\\nScore: \${score.value}/5\\n\\n\`;
                    dailyImages.value.forEach(img => {
                        resultString += img.isCorrect ? '🟩' : '🟥';
                    });
                    resultString += '\\n\\nPlay now @ unvail.thehelpfuldev.com!';

                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(resultString).then(() => {
                            copied.value = true;
                            setTimeout(() => copied.value = false, 2000);
                        });
                    }
                };

                return { 
                    dailyImages, currentIndex, gameFinished, copied, showInfo, showStats, 
                    loadingImage, imageRevealed, checkingGuess, currentImage, isLastImage, 
                    score, scoreEmoji, currentDate, timeUntilNext, winPercentage, userStats,
                    userId, isAnonymous, makeGuess, nextImage, shareResults, getDistributionWidth 
                };
            }
        }).mount('#app');
    </script>
  
</body>
</html>`;
}