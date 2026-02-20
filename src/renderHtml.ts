export function renderHtml(dataJson: string) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>unvAIl</title>
    
    <!-- Scripts -->
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Inject D1 Data Directly -->
    <script>
        window.__INITIAL_DATA__ = ${dataJson};
    </script>

    <style>
        .fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
        .fade-enter-from, .fade-leave-to { opacity: 0; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25%, 75% { transform: translateX(-5px); } 50% { transform: translateX(5px); } }
        .shake { animation: shake 0.4s ease-in-out; }
        @keyframes pop { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        .pop { animation: pop 0.3s ease-in-out; }
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
            <div class="flex items-center gap-4 text-gray-600">
                <div class="bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold">
                    {{ currentDate }}
                </div>
                <button @click="showInfo = true" class="hover:text-black transition-colors">
                    <i class="fa-regular fa-circle-question text-xl"></i>
                </button>
            </div>
        </header>

        <!-- Main Game Area -->
        <main class="flex-1 relative overflow-hidden flex flex-col">
            
            <!-- Progress Bar -->
            <div class="w-full h-1 bg-gray-100 flex">
                <div v-for="(img, idx) in dailyImages" :key="idx" class="h-full flex-1 border-r border-white transition-all duration-500" :class="{'bg-gray-200': idx > currentIndex, 'bg-purple-500': idx === currentIndex, 'bg-green-500': idx < currentIndex && img.isCorrect, 'bg-red-500': idx < currentIndex && !img.isCorrect}"></div>
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
                    <button @click="makeGuess('Real')" :disabled="imageRevealed" class="flex-1 h-16 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center gap-2 font-bold text-gray-700 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                        <i class="fa-solid fa-camera"></i> Real
                    </button>
                    <div class="text-gray-300 font-bold text-sm">VS</div>
                    <button @click="makeGuess('AI')" :disabled="imageRevealed" class="flex-1 h-16 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center gap-2 font-bold text-gray-700 hover:border-purple-500 hover:text-purple-500 hover:bg-purple-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                        <i class="fa-solid fa-robot"></i> AI
                    </button>
                </div>
            </div>

            <!-- Results Screen -->
            <div v-else class="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div class="w-24 h-24 rounded-full bg-gray-100 mb-6 flex items-center justify-center text-4xl shadow-inner relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-b from-transparent to-gray-200/50"></div>
                    <span>{{ scoreEmoji }}</span>
                </div>
                <h2 class="text-3xl font-bold mb-2 text-gray-800">Daily Results</h2>
                <p class="text-gray-500 mb-8">You got <span class="text-black font-bold">{{ score }}</span> out of <span class="text-black font-bold">5</span> correct!</p>

                <div class="flex gap-2 mb-10">
                    <div v-for="(img, i) in dailyImages" :key="i" class="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-sm border border-gray-100" :class="img.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'">
                        <i :class="img.isCorrect ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"></i>
                    </div>
                </div>

                <div class="flex flex-col gap-3 w-full max-w-xs">
                    <button @click="shareResults" class="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2">
                        <span v-if="!copied"><i class="fa-solid fa-share-nodes"></i> Share Result</span>
                        <span v-else><i class="fa-solid fa-check"></i> Copied!</span>
                    </button>
                    <div class="text-xs text-gray-400 mt-4">Next challenge in: <span class="font-mono">{{ timeUntilNext }}</span></div>
                </div>
            </div>
        </main>
    </div>

    <script>
        const { createApp, ref, computed, onMounted } = Vue;

        createApp({
            setup() {
                // Initialize Vue state with data from D1 database!
                // We add the guess and isCorrect fields dynamically for frontend tracking.
                const initialData = (window.__INITIAL_DATA__ || []).map(img => ({
                    ...img,
                    guess: null,
                    isCorrect: false
                }));

                const dailyImages = ref(initialData);
                const currentIndex = ref(0);
                const gameFinished = ref(false);
                const copied = ref(false);
                const showInfo = ref(false);
                const loadingImage = ref(true);
                const imageRevealed = ref(false);

                const currentImage = computed(() => dailyImages.value[currentIndex.value]);
                const isLastImage = computed(() => currentIndex.value === dailyImages.value.length - 1);
                const score = computed(() => dailyImages.value.filter(img => img.isCorrect).length);

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

                onMounted(() => {
                    setInterval(updateTimer, 1000);
                    updateTimer();
                });

                const makeGuess = (guessType) => {
                    if (imageRevealed.value || !currentImage.value) return;
                    currentImage.value.guess = guessType;
                    currentImage.value.isCorrect = currentImage.value.type === guessType;
                    imageRevealed.value = true;
                };

                const nextImage = () => {
                    if (isLastImage.value) {
                        gameFinished.value = true;
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
                    resultString += '\\n\\nPlay now!';

                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(resultString).then(() => {
                            copied.value = true;
                            setTimeout(() => copied.value = false, 2000);
                        });
                    }
                };

                return { dailyImages, currentIndex, gameFinished, copied, showInfo, loadingImage, imageRevealed, currentImage, isLastImage, score, scoreEmoji, currentDate, timeUntilNext, makeGuess, nextImage, shareResults };
            }
        }).mount('#app');
    </script>
</body>
</html>`;
}