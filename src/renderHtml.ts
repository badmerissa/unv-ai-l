export function renderHtml(dataJson: string, adsenseId: string = 'ca-pub-7388329784955167') {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>unvAIl</title>

    <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}" crossorigin="anonymous"></script>

    <!-- Server-injected daily images -->
    <script>window.__INITIAL_DATA__ = ${dataJson};</script>

    <style>
        /* ── Transitions ─────────────────────────────── */
        .fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
        .fade-enter-from, .fade-leave-to { opacity: 0; }

        /* ── Micro-animations ────────────────────────── */
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25%, 75% { transform: translateX(-5px); }
            50%       { transform: translateX(5px); }
        }
        .shake { animation: shake 0.4s ease-in-out; }

        @keyframes pop {
            0%, 100% { transform: scale(1); }
            50%       { transform: scale(1.15); }
        }
        .pop { animation: pop 0.35s ease-in-out; }

        @keyframes slide-up {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .slide-up { animation: slide-up 0.35s ease-out forwards; }

        @keyframes badge-in {
            from { opacity: 0; transform: scale(0.7); }
            to   { opacity: 1; transform: scale(1); }
        }
        .badge-in { animation: badge-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

        /* ── Skeleton shimmer ────────────────────────── */
        @keyframes shimmer {
            0%   { background-position: -200% 0; }
            100% { background-position:  200% 0; }
        }
        .skeleton {
            background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
            background-size: 200% 100%;
            animation: shimmer 1.6s infinite;
        }

        /* ── Progress bar pulse on current ──────────── */
        @keyframes progress-pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.6; }
        }
        .progress-current { animation: progress-pulse 1.5s ease-in-out infinite; }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* ── Keyboard hint badge ─────────────────────── */
        .kbd {
            display: inline-flex; align-items: center; justify-content: center;
            min-width: 1.4rem; height: 1.4rem; padding: 0 0.3rem;
            background: rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.15);
            border-radius: 4px; font-size: 0.65rem; font-weight: 700;
            line-height: 1; font-family: monospace; color: #6b7280;
        }
    </style>
</head>
<body class="bg-gray-100 h-screen w-screen overflow-hidden text-gray-900">

<div id="app" class="h-full w-full max-w-md mx-auto bg-gray-50 flex flex-col relative shadow-xl min-h-screen">

    <!-- ── Header ──────────────────────────────────────────────────────── -->
    <header class="flex justify-between items-center px-4 py-3 border-b border-gray-100 z-10 bg-white shrink-0">
        <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs" aria-hidden="true">
                <i class="fa-solid fa-robot"></i>
            </div>
            <h1 class="font-bold text-xl tracking-tight text-gray-900">unv<span class="text-purple-600">AI</span>l</h1>
        </div>
        <div class="flex items-center gap-3 text-gray-600">
            <button @click="showStats = true" class="w-10 h-10 flex items-center justify-center hover:text-black hover:bg-gray-100 rounded-full transition-colors" aria-label="View statistics">
                <i class="fa-solid fa-chart-simple text-xl" aria-hidden="true"></i>
            </button>
            <button @click="showInfo = true" class="w-10 h-10 flex items-center justify-center hover:text-black hover:bg-gray-100 rounded-full transition-colors" aria-label="How to play">
                <i class="fa-regular fa-circle-question text-xl" aria-hidden="true"></i>
            </button>
            <!-- User Menu -->
            <div class="relative group ml-1">
                <button class="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                        :class="isAnonymous ? 'bg-gray-200 hover:bg-gray-300' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'"
                        :aria-label="isAnonymous ? 'Guest user menu' : 'User menu for ' + userId">
                    <i class="fa-solid fa-user text-sm" :class="isAnonymous ? 'text-gray-600' : ''" aria-hidden="true"></i>
                </button>
                <div class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div class="p-3 border-b border-gray-100">
                        <p class="text-xs text-gray-500 mb-1">Logged in as:</p>
                        <p class="text-sm font-bold truncate" :title="userId">{{ isAnonymous ? 'Guest User' : userId }}</p>
                    </div>
                    <button v-if="!isAnonymous" @click="logout" class="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-xl transition-colors">
                        <i class="fa-solid fa-right-from-bracket mr-2" aria-hidden="true"></i> Log Out
                    </button>
                    <button v-else @click="showAuth = true; authMode = 'login'" class="block w-full text-left px-4 py-3 text-sm text-purple-600 hover:bg-purple-50 rounded-b-xl transition-colors font-semibold">
                        <i class="fa-solid fa-right-to-bracket mr-2" aria-hidden="true"></i> Sign In / Register
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- ── Main Game Area ────────────────────────────────────────────────── -->
    <main class="flex-1 relative overflow-hidden flex flex-col" role="main">

        <!-- Progress Bar -->
        <div class="w-full h-1.5 bg-gray-100 flex shrink-0" role="progressbar" :aria-valuenow="currentIndex + 1" aria-valuemin="1" aria-valuemax="5" :aria-label="'Image ' + (currentIndex + 1) + ' of 5'">
            <div v-for="(img, idx) in dailyImages" :key="idx"
                 class="h-full flex-1 border-r border-white transition-all duration-500"
                 :class="{
                     'bg-gray-200':   idx > currentIndex,
                     'bg-purple-500 progress-current': idx === currentIndex && !gameFinished,
                     'bg-green-500':  idx < currentIndex && img.isCorrect,
                     'bg-red-400':    idx < currentIndex && !img.isCorrect && img.guess !== null,
                     'bg-purple-500': gameFinished && idx <= currentIndex
                 }">
            </div>
        </div>

        <!-- ── Game (active) ─────────────────────────────────────────────── -->
        <div v-if="!gameFinished" class="flex-1 flex flex-col justify-center items-center p-6 gap-6 relative overflow-y-auto">

            <!-- Image Container -->
            <div class="relative w-full aspect-[4/5] max-h-[58vh] rounded-3xl overflow-hidden shadow-2xl bg-gray-900 border border-white/20 shrink-0"
                 role="img" :aria-label="'Image ' + (currentIndex + 1) + ': Is it real or AI?'">

                <!-- Skeleton shimmer while loading -->
                <div v-if="loadingImage" class="absolute inset-0 skeleton rounded-3xl"></div>

                <!-- The actual image -->
                <img :src="currentImage.url"
                     class="w-full h-full object-cover transition-transform duration-700"
                     :class="{'scale-105': revealStep > 0, 'opacity-0': loadingImage}"
                     @load="onImageLoad"
                     @error="onImageError"
                     alt="">

                <!-- Reveal overlay — staged animation -->
                <div v-if="revealStep > 0"
                     class="absolute inset-0 bg-black/45 backdrop-blur-sm flex flex-col items-center justify-center z-20 px-6">

                    <!-- Step 1: Badge + result icon -->
                    <div v-if="revealStep >= 1" class="badge-in flex flex-col items-center mb-3">
                        <div class="text-6xl mb-3" :class="currentImage.isCorrect ? 'text-green-400' : 'text-red-400'">
                            <i :class="currentImage.isCorrect ? 'fa-solid fa-circle-check pop' : 'fa-solid fa-circle-xmark shake'" aria-hidden="true"></i>
                        </div>
                        <h2 class="text-white text-3xl font-extrabold tracking-tight" :aria-live="revealStep === 1 ? 'assertive' : 'off'">
                            It was <span :class="currentImage.type === 'Real' ? 'text-blue-300' : 'text-purple-300'">{{ currentImage.type }}</span>!
                        </h2>
                    </div>

                    <!-- Step 2: Explanation -->
                    <p v-if="revealStep >= 2"
                       class="slide-up text-white/80 text-center text-sm leading-relaxed mb-6">
                        {{ currentImage.explanation }}
                    </p>

                    <!-- Step 3: Next button -->
                    <button v-if="revealStep >= 3"
                            @click="nextImage"
                            class="slide-up bg-white text-gray-900 px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform active:scale-95 flex items-center gap-2"
                            aria-label="{{ isLastImage ? 'See final results' : 'Next image' }}">
                        {{ isLastImage ? 'See Results' : 'Next Image' }}
                        <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                        <span class="kbd" aria-hidden="true">↵</span>
                    </button>
                </div>
            </div>

            <!-- Guess buttons -->
            <div class="w-full flex gap-4 items-center justify-center px-2 shrink-0">
                <button @click="makeGuess('Real')"
                        :disabled="revealStep > 0 || checkingGuess"
                        class="flex-1 min-h-[3.5rem] bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm text-base"
                        aria-label="Guess: Real photo (press R)">
                    <i class="fa-solid fa-camera text-lg" :class="{'hidden': checkingGuess}" aria-hidden="true"></i>
                    <i class="fa-solid fa-circle-notch fa-spin" :class="{'hidden': !checkingGuess}" aria-hidden="true"></i>
                    Real
                    <span class="kbd" aria-hidden="true">R</span>
                </button>
                <div class="text-gray-300 font-bold text-sm shrink-0" aria-hidden="true">VS</div>
                <button @click="makeGuess('AI')"
                        :disabled="revealStep > 0 || checkingGuess"
                        class="flex-1 min-h-[3.5rem] bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-gray-700 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm text-base"
                        aria-label="Guess: AI generated (press A)">
                    <i class="fa-solid fa-robot text-lg" :class="{'hidden': checkingGuess}" aria-hidden="true"></i>
                    <i class="fa-solid fa-circle-notch fa-spin" :class="{'hidden': !checkingGuess}" aria-hidden="true"></i>
                    AI
                    <span class="kbd" aria-hidden="true">A</span>
                </button>
            </div>
        </div>

        <!-- ── Results Screen ─────────────────────────────────────────────── -->
        <div v-else class="flex-1 flex flex-col items-center justify-start p-6 pt-8 text-center overflow-y-auto no-scrollbar">

            <h2 class="text-3xl font-extrabold mb-5 tracking-tight">Today's Results</h2>

            <!-- Image thumbnail strip with correct/incorrect badges -->
            <div class="flex gap-2 mb-6 w-full justify-center" aria-label="Your results for each image">
                <div v-for="(img, idx) in dailyImages" :key="idx"
                     class="flex-1 aspect-square rounded-xl overflow-hidden relative border-2 shadow-sm"
                     :class="img.isCorrect ? 'border-green-500' : 'border-red-400'"
                     :aria-label="'Image ' + (idx + 1) + ': ' + (img.isCorrect ? 'Correct' : 'Incorrect')">
                    <img :src="img.url" class="w-full h-full object-cover" alt="">
                    <div class="absolute inset-0 flex items-end justify-end p-1"
                         :class="img.isCorrect ? 'bg-green-900/20' : 'bg-red-900/20'">
                        <div class="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                             :class="img.isCorrect ? 'bg-green-500' : 'bg-red-500'">
                            <i :class="img.isCorrect ? 'fa-solid fa-check' : 'fa-solid fa-xmark'" aria-hidden="true"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Score headline -->
            <div class="text-5xl mb-1" aria-hidden="true">{{ scoreEmoji }}</div>
            <p class="text-lg font-bold text-gray-700 mb-6">{{ score }}/5 Correct</p>

            <!-- Stats grid -->
            <div class="flex justify-center gap-6 mb-6 w-full px-2">
                <div class="flex flex-col items-center">
                    <div class="text-3xl font-bold">{{ userStats.played }}</div>
                    <div class="text-xs text-gray-500 mt-1">Played</div>
                </div>
                <div class="flex flex-col items-center">
                    <div class="text-3xl font-bold">{{ winPercentage }}%</div>
                    <div class="text-xs text-gray-500 mt-1">Win Rate</div>
                </div>
                <div class="flex flex-col items-center">
                    <div class="text-3xl font-bold flex items-center gap-1">
                        {{ userStats.currentStreak }}
                        <span v-if="userStats.currentStreak > 1" aria-hidden="true">🔥</span>
                    </div>
                    <div class="text-xs text-gray-500 mt-1 whitespace-nowrap">Streak</div>
                </div>
                <div class="flex flex-col items-center">
                    <div class="text-3xl font-bold">{{ userStats.maxStreak }}</div>
                    <div class="text-xs text-gray-500 mt-1 whitespace-nowrap">Best</div>
                </div>
            </div>

            <!-- Score Distribution -->
            <div class="w-full max-w-xs text-left mb-6">
                <h3 class="font-bold text-xs tracking-widest mb-3 text-gray-500 uppercase">Score Distribution</h3>
                <div v-for="i in [0, 1, 2, 3, 4, 5]" :key="i" class="flex items-center text-sm mb-1.5">
                    <div class="w-3 font-bold text-gray-700">{{ i }}</div>
                    <div class="flex-1 bg-gray-100 h-6 ml-2 rounded overflow-hidden flex">
                        <div class="h-full text-white text-xs font-bold flex justify-end items-center pr-2 transition-all duration-1000 ease-out min-w-[1.5rem]"
                             :class="score === i && gameFinished ? 'bg-green-500' : 'bg-gray-400'"
                             :style="{ width: getDistributionWidth(i) + '%' }">
                            {{ userStats.distribution[i] || 0 }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col gap-3 w-full max-w-xs mt-auto pb-4">
                <div v-if="isAnonymous" class="text-xs text-orange-600 bg-orange-50 p-3 rounded-lg mb-2 text-left flex flex-col gap-2 border border-orange-100">
                    <div class="flex gap-2">
                        <i class="fa-solid fa-triangle-exclamation mt-0.5" aria-hidden="true"></i>
                        <span>Playing as Guest. Create an account to save your stats across devices.</span>
                    </div>
                    <button @click="showAuth = true; authMode = 'register'" class="bg-orange-600 text-white rounded px-3 py-1.5 font-bold self-start text-xs hover:bg-orange-700 transition-colors">
                        Create Free Account
                    </button>
                </div>

                <button @click="shareResults" class="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 text-lg">
                    <span v-if="!copied">Share <i class="fa-solid fa-share-nodes ml-1" aria-hidden="true"></i></span>
                    <span v-else><i class="fa-solid fa-check" aria-hidden="true"></i> Copied!</span>
                </button>

                <div class="text-sm text-gray-500 mt-3 font-semibold mb-4">
                    Next puzzle in <span class="text-gray-900 font-mono">{{ timeUntilNext }}</span>
                </div>
            </div>
        </div>
    </main>

    <!-- ── Ad Banner ──────────────────────────────────────────────────────── -->
    <div class="w-full bg-gray-50 border-t border-gray-100 flex justify-center items-center py-2 shrink-0 min-h-[66px]">
        <div class="w-[320px] h-[50px] bg-gray-100 border border-gray-200 border-dashed rounded flex items-center justify-center text-xs text-gray-400 font-semibold relative overflow-hidden">
            <span>Advertisement Space</span>
        </div>
    </div>

    <!-- ── Footer ────────────────────────────────────────────────────────── -->
    <footer class="py-4 text-center text-xs text-slate-500 bg-white border-t border-gray-100 shrink-0">
        <div class="flex items-center justify-center gap-2">
            <svg class="w-5 h-5 text-slate-800" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M 70 35 C 100 35 100 75 70 75" fill="none" stroke="currentColor" stroke-width="14" stroke-linecap="round"/>
                <path d="M 10 15 L 80 15 L 80 55 C 80 85 65 95 45 95 C 25 95 10 85 10 55 Z" fill="currentColor"/>
                <path d="M 22 15 L 68 15 L 68 55 C 68 75 58 80 45 80 C 32 80 22 75 22 55 Z" fill="#ffffff"/>
                <circle cx="45" cy="46" r="21" fill="currentColor"/>
                <text x="45" y="52" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="16" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">THD</text>
            </svg>
            <p>Part of the <a href="https://thehelpfuldev.com/" target="_blank" rel="noopener noreferrer" class="font-semibold text-slate-700 hover:text-blue-500 transition-colors">The Helpful Dev</a> Network</p>
        </div>
    </footer>

    <!-- ── Auth Modal ─────────────────────────────────────────────────────── -->
    <div v-if="showAuth" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showAuth = false" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div class="flex justify-between items-center mb-6">
                <h3 id="auth-title" class="font-bold text-2xl text-gray-900">{{ authMode === 'login' ? 'Welcome Back' : 'Create Account' }}</h3>
                <button @click="showAuth = false" class="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close">
                    <i class="fa-solid fa-xmark text-xl" aria-hidden="true"></i>
                </button>
            </div>
            <form @submit.prevent="submitAuth" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide" for="auth-email">Email Address</label>
                    <input id="auth-email" v-model="authEmail" type="email" required autocomplete="email" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide" for="auth-password">Password</label>
                    <input id="auth-password" v-model="authPassword" type="password" required :autocomplete="authMode === 'login' ? 'current-password' : 'new-password'" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all">
                </div>
                <div v-if="authError" class="text-red-500 text-sm font-semibold bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2" role="alert">
                    <i class="fa-solid fa-circle-exclamation mt-0.5" aria-hidden="true"></i> <span>{{ authError }}</span>
                </div>
                <button type="submit" :disabled="authLoading" class="w-full py-3.5 mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                    <i v-if="authLoading" class="fa-solid fa-circle-notch fa-spin mr-2" aria-hidden="true"></i>
                    {{ authMode === 'login' ? 'Sign In' : 'Create Free Account' }}
                </button>
            </form>
            <div class="mt-6 text-center text-sm text-gray-600 border-t border-gray-100 pt-4">
                <button v-if="authMode === 'login'" @click="authMode = 'register'; authError=''" class="hover:text-purple-600 font-semibold transition-colors">Need an account? Sign up</button>
                <button v-else @click="authMode = 'login'; authError=''" class="hover:text-purple-600 font-semibold transition-colors">Already have an account? Sign in</button>
            </div>
        </div>
    </div>

    <!-- ── Stats Modal (during game) ──────────────────────────────────────── -->
    <div v-if="showStats && !gameFinished" class="fixed inset-0 bg-white z-50 flex flex-col items-center justify-start p-6 pt-12 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="stats-title">
        <button @click="showStats = false" class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 rounded-full" aria-label="Close statistics">
            <i class="fa-solid fa-xmark text-2xl" aria-hidden="true"></i>
        </button>
        <h2 id="stats-title" class="text-3xl font-extrabold mb-8 tracking-tight">Statistics</h2>
        <div class="flex justify-center gap-6 mb-10 w-full max-w-xs">
            <div class="flex flex-col items-center"><div class="text-3xl font-bold">{{ userStats.played }}</div><div class="text-xs text-gray-500 mt-1">Played</div></div>
            <div class="flex flex-col items-center"><div class="text-3xl font-bold">{{ winPercentage }}%</div><div class="text-xs text-gray-500 mt-1">Win Rate</div></div>
            <div class="flex flex-col items-center">
                <div class="text-3xl font-bold flex items-center gap-1">
                    {{ userStats.currentStreak }}
                    <span v-if="userStats.currentStreak > 1" aria-hidden="true">🔥</span>
                </div>
                <div class="text-xs text-gray-500 mt-1 whitespace-nowrap">Streak</div>
            </div>
            <div class="flex flex-col items-center"><div class="text-3xl font-bold">{{ userStats.maxStreak }}</div><div class="text-xs text-gray-500 mt-1 whitespace-nowrap">Best</div></div>
        </div>
        <div class="w-full max-w-xs text-left mb-8">
            <h3 class="font-bold text-xs tracking-widest mb-3 text-gray-500 uppercase">Score Distribution</h3>
            <div v-for="i in [0, 1, 2, 3, 4, 5]" :key="i" class="flex items-center text-sm mb-1.5">
                <div class="w-3 font-bold text-gray-700">{{ i }}</div>
                <div class="flex-1 bg-gray-100 h-6 ml-2 rounded overflow-hidden flex">
                    <div class="h-full text-white text-xs font-bold flex justify-end items-center pr-2 transition-all duration-1000 ease-out min-w-[1.5rem] bg-gray-400"
                         :style="{ width: getDistributionWidth(i) + '%' }">
                        {{ userStats.distribution[i] || 0 }}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- ── Info Modal ─────────────────────────────────────────────────────── -->
    <div v-if="showInfo" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showInfo = false" role="dialog" aria-modal="true" aria-labelledby="info-title">
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 id="info-title" class="font-bold text-xl mb-4 text-gray-900">How to Play</h3>
            <ul class="space-y-3 text-gray-600 mb-6">
                <li class="flex items-start gap-3">
                    <i class="fa-solid fa-image mt-1 text-purple-500" aria-hidden="true"></i>
                    <span>You will see 5 images every day. Each day brings a fresh set.</span>
                </li>
                <li class="flex items-start gap-3">
                    <i class="fa-solid fa-magnifying-glass mt-1 text-purple-500" aria-hidden="true"></i>
                    <span>Look closely at hands, lighting, reflections, and textures.</span>
                </li>
                <li class="flex items-start gap-3">
                    <i class="fa-solid fa-keyboard mt-1 text-purple-500" aria-hidden="true"></i>
                    <span>Keyboard shortcuts: <span class="kbd">R</span> Real &nbsp; <span class="kbd">A</span> AI &nbsp; <span class="kbd">↵</span> Next</span>
                </li>
                <li class="flex items-start gap-3">
                    <i class="fa-solid fa-chart-simple mt-1 text-purple-500" aria-hidden="true"></i>
                    <span>Build your streak and track your score distribution.</span>
                </li>
            </ul>
            <button @click="showInfo = false" class="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-800 transition-colors">
                Got it
            </button>
        </div>
    </div>

</div>

<script>
    const { createApp, ref, computed, onMounted, onBeforeUnmount } = Vue;

    createApp({
        setup() {
            const initialData = (window.__INITIAL_DATA__ || []).map(img => ({
                ...img,
                type: null,
                explanation: null,
                guess: null,
                isCorrect: false
            }));

            const dailyImages    = ref(initialData);
            const currentIndex   = ref(0);
            const gameFinished   = ref(false);
            const copied         = ref(false);
            const showInfo       = ref(false);
            const showStats      = ref(false);
            const loadingImage   = ref(true);
            const revealStep     = ref(0);   // 0=hidden, 1=badge, 2=explanation, 3=next btn
            const checkingGuess  = ref(false);
            const imageError     = ref(false);

            // ── Auth ──────────────────────────────────────────────────────
            const showAuth    = ref(false);
            const authMode    = ref('register');
            const authEmail   = ref('');
            const authPassword = ref('');
            const authError   = ref('');
            const authLoading = ref(false);

            const loggedInEmail = ref(localStorage.getItem('unvail_email') || '');
            const isAnonymous   = computed(() => !loggedInEmail.value);

            const userId = computed(() => {
                if (!isAnonymous.value) return loggedInEmail.value;
                let uid = localStorage.getItem('unvail_guest_id');
                if (!uid) {
                    uid = 'guest_' + Math.random().toString(36).substr(2, 9);
                    localStorage.setItem('unvail_guest_id', uid);
                }
                return uid;
            });

            const userStats = ref({
                played: 0, wins: 0, currentStreak: 0, maxStreak: 0,
                distribution: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                lastPlayedDate: null
            });

            // ── Computed ──────────────────────────────────────────────────
            const currentImage  = computed(() => dailyImages.value[currentIndex.value]);
            const isLastImage   = computed(() => currentIndex.value === dailyImages.value.length - 1);
            const score         = computed(() => dailyImages.value.filter(img => img.isCorrect).length);
            const imageRevealed = computed(() => revealStep.value > 0);

            const winPercentage = computed(() => {
                if (userStats.value.played === 0) return 0;
                return Math.round((userStats.value.wins / userStats.value.played) * 100);
            });

            const scoreEmoji = computed(() => {
                if (score.value === 5) return '🏆';
                if (score.value >= 3) return '😎';
                return '🤔';
            });

            const currentDate = computed(() =>
                new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            );

            const timeUntilNext = ref('');
            const updateTimer = () => {
                const now      = new Date();
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                const diff    = tomorrow - now;
                const hours   = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                timeUntilNext.value = \`\${hours}h \${minutes}m \${seconds}s\`;
            };

            const getDistributionWidth = (targetScore) => {
                const maxGuesses = Math.max(...Object.values(userStats.value.distribution), 1);
                const amount = userStats.value.distribution[targetScore] || 0;
                return (amount / maxGuesses) * 100;
            };

            // ── Image load/error handlers ─────────────────────────────────
            const onImageLoad = () => {
                loadingImage.value = false;
                imageError.value   = false;
                preloadNextImage();
            };

            const onImageError = () => {
                loadingImage.value = false;
                imageError.value   = true;
                // Report the broken image to the server (fire and forget)
                if (currentImage.value?.id) {
                    fetch('/api/report-broken', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: currentImage.value.id })
                    }).catch(() => {});
                }
            };

            // ── Preload next image ────────────────────────────────────────
            const preloadNextImage = () => {
                const nextIdx = currentIndex.value + 1;
                if (nextIdx < dailyImages.value.length) {
                    const img = new Image();
                    img.src = dailyImages.value[nextIdx].url;
                }
            };

            // ── Auth methods ──────────────────────────────────────────────
            const submitAuth = async () => {
                authError.value   = '';
                authLoading.value = true;
                const endpoint = authMode.value === 'login' ? '/api/auth/login' : '/api/auth/register';

                try {
                    const res = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: authEmail.value,
                            password: authPassword.value,
                            guestId: authMode.value === 'register' ? localStorage.getItem('unvail_guest_id') : undefined
                        })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Authentication failed');

                    localStorage.setItem('unvail_token', data.token);
                    localStorage.setItem('unvail_email', data.email);
                    loggedInEmail.value = data.email;
                    showAuth.value = false;
                    await fetchStats();
                } catch (err) {
                    authError.value = err.message;
                } finally {
                    authLoading.value = false;
                }
            };

            const logout = () => {
                localStorage.removeItem('unvail_token');
                localStorage.removeItem('unvail_email');
                loggedInEmail.value = '';
                fetchStats();
            };

            // ── Stats ─────────────────────────────────────────────────────
            const fetchStats = async () => {
                try {
                    const res = await fetch('/api/stats?userId=' + encodeURIComponent(userId.value));
                    if (!res.ok) return;
                    const data = await res.json();
                    if (data && data.played !== undefined) {
                        userStats.value = {
                            played: data.played || 0,
                            wins: data.wins || 0,
                            currentStreak: data.current_streak || 0,
                            maxStreak: data.max_streak || 0,
                            distribution: data.distribution
                                ? (typeof data.distribution === 'string' ? JSON.parse(data.distribution) : data.distribution)
                                : { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                            lastPlayedDate: data.last_played_date
                        };
                    } else {
                        userStats.value = { played: 0, wins: 0, currentStreak: 0, maxStreak: 0, distribution: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, lastPlayedDate: null };
                    }
                } catch (err) {
                    console.error('fetchStats error', err);
                }
            };

            const saveStatsToCloud = async (finalScore) => {
                const todayStr = new Date().toISOString().split('T')[0];
                let s = { ...userStats.value };

                if (s.lastPlayedDate === todayStr) return; // already saved today

                s.played += 1;
                if (finalScore === 5) s.wins += 1;
                s.distribution[finalScore] = (s.distribution[finalScore] || 0) + 1;

                if (!s.lastPlayedDate) {
                    s.currentStreak = 1;
                } else {
                    const diffDays = Math.floor((new Date(todayStr) - new Date(s.lastPlayedDate)) / 86400000);
                    if (diffDays === 1) s.currentStreak += 1;
                    else if (diffDays > 1) s.currentStreak = 1;
                }
                if (s.currentStreak > s.maxStreak) s.maxStreak = s.currentStreak;
                s.lastPlayedDate = todayStr;
                userStats.value = s;

                try {
                    await fetch('/api/stats', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: userId.value,
                            played: s.played, wins: s.wins,
                            currentStreak: s.currentStreak, maxStreak: s.maxStreak,
                            distribution: s.distribution, lastPlayedDate: s.lastPlayedDate
                        })
                    });
                } catch (err) {
                    console.error('saveStats error', err);
                }
            };

            // ── Game actions ──────────────────────────────────────────────
            const makeGuess = async (guessType) => {
                if (imageRevealed.value || !currentImage.value || checkingGuess.value) return;
                checkingGuess.value = true;

                try {
                    const res = await fetch('/api/reveal?id=' + currentImage.value.id);
                    if (!res.ok) throw new Error('Network error');
                    const data = await res.json();

                    currentImage.value.type        = data.type;
                    currentImage.value.explanation = data.explanation;
                    currentImage.value.guess        = guessType;
                    currentImage.value.isCorrect    = (data.type === guessType);

                    // Staggered reveal: badge → explanation → next button
                    revealStep.value = 1;
                    setTimeout(() => { revealStep.value = 2; }, 350);
                    setTimeout(() => { revealStep.value = 3; }, 700);
                } catch (error) {
                    console.error('makeGuess error:', error);
                    alert('Failed to check answer. Please check your connection and try again.');
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
                    revealStep.value   = 0;
                    loadingImage.value = true;
                    imageError.value   = false;
                }
            };

            // ── Keyboard shortcuts ────────────────────────────────────────
            const handleKeydown = (e) => {
                // Ignore when typing in an input
                if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
                if (gameFinished.value) return;

                if (imageRevealed.value) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (revealStep.value >= 3) nextImage();
                    }
                } else if (!checkingGuess.value) {
                    if (e.key === 'r' || e.key === 'R') makeGuess('Real');
                    if (e.key === 'a' || e.key === 'A') makeGuess('AI');
                }
            };

            // ── Share ─────────────────────────────────────────────────────
            const shareResults = () => {
                let text = \`unvAIl \${currentDate.value}\\nScore: \${score.value}/5 \${scoreEmoji.value}\\n\\n\`;
                dailyImages.value.forEach(img => { text += img.isCorrect ? '🟩' : '🟥'; });
                text += '\\n\\nPlay @ unvail.thehelpfuldev.com!';

                if (navigator.clipboard?.writeText) {
                    navigator.clipboard.writeText(text).then(() => {
                        copied.value = true;
                        setTimeout(() => copied.value = false, 2000);
                    });
                }
            };

            // ── Lifecycle ─────────────────────────────────────────────────
            onMounted(() => {
                setInterval(updateTimer, 1000);
                updateTimer();
                fetchStats();
                window.addEventListener('keydown', handleKeydown);

                // Eagerly preload image 2 after a short delay
                setTimeout(() => preloadNextImage(), 500);
            });

            onBeforeUnmount(() => {
                window.removeEventListener('keydown', handleKeydown);
            });

            return {
                dailyImages, currentIndex, gameFinished, copied, showInfo, showStats,
                loadingImage, imageError, revealStep, imageRevealed, checkingGuess,
                currentImage, isLastImage, score, scoreEmoji, currentDate, timeUntilNext,
                winPercentage, userStats, userId, isAnonymous,
                showAuth, authMode, authEmail, authPassword, authError, authLoading,
                submitAuth, logout, makeGuess, nextImage, shareResults,
                getDistributionWidth, onImageLoad, onImageError
            };
        }
    }).mount('#app');
</script>

</body>
</html>`;
}
