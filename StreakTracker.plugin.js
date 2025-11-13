/**
 * @name StreakTracker
 * @description TikTok-style chat streaks for Discord
 * @version 1.0.5
 * @author TermitJs
 * @authorLink https://github.com/TermitJs
 * @website https://github.com/TermitJs/Streak-Tracker-for-Discord
 * @source https://github.com/TermitJs/Streak-Tracker-for-Discord
 * @donate https://boosty.to/termitjs
 * @invite DcqV7MS6nS
 */

module.exports = (() => {
    const config = {
        info: {
            name: "StreakTracker",
            authors: [{
                name: "TermitJs",
                discord_id: "415074555153874947",
                github_username: "TermitJs"
            }],
            version: "1.0.5",
            description: "TikTok-style chat streaks"
        }
    };

    return !global.ZeresPluginLibrary ? class {
        constructor() { this._config = config; }
        getName() { return config.info.name; }
        getAuthor() { return config.info.authors.map(a => a.name).join(", "); }
        getDescription() { return config.info.description; }
        getVersion() { return config.info.version; }
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: async () => {
                    try {
                        const response = await BdApi.Net.fetch("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js");
                        if (!response.ok) throw new Error("Failed to download library");
                        const body = await response.text();
                        const fs = require("fs");
                        const path = require("path");
                        await fs.promises.writeFile(path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body);
                        BdApi.showToast("Library installed! Please restart Discord.", { type: "success" });
                    } catch (error) {
                        console.error("Failed to install library:", error);
                        require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                    }
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {
            const { Patcher } = Api;

            return class StreakTracker extends Plugin {
                constructor() {
                    super();
                    this.streaks = {};
                    this.interval = null;
                    this.lastUserIds = new Map();
                    this.celebratedMilestones = new Set(); // Отслеживаем показанные анимации
                }

                onStart() {
                    console.log("🔥 [StreakTracker] Started!");
                    BdApi.showToast("Streak Tracker started!", { type: "success" });
                    this.loadData();
                    this.patchMessages();
                    this.startObserver();
                    this.interval = setInterval(() => this.checkResets(), 3600000);
                }

                getSettingsPanel() {
                    const panel = document.createElement('div');
                    panel.style.cssText = 'padding: 20px; font-family: "gg sans", "Noto Sans", sans-serif;';
                    
                    // Заголовок
                    const title = document.createElement('h2');
                    title.textContent = '🔥 Streak Tracker Settings';
                    title.style.cssText = 'color: #ff4500; margin-bottom: 20px;';
                    panel.appendChild(title);
                    
                    // Кнопка статистики
                    const statsButton = document.createElement('button');
                    statsButton.textContent = '📊 View Statistics';
                    statsButton.style.cssText = `
                        background: linear-gradient(45deg, #ff4500, #ffd700);
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        margin-bottom: 15px;
                        transition: transform 0.2s;
                    `;
                    statsButton.onmouseover = () => statsButton.style.transform = 'scale(1.05)';
                    statsButton.onmouseout = () => statsButton.style.transform = 'scale(1)';
                    statsButton.onclick = () => this.showStatisticsModal();
                    panel.appendChild(statsButton);
                    
                    // Разделитель
                    const divider = document.createElement('hr');
                    divider.style.cssText = 'border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;';
                    panel.appendChild(divider);
                    
                    // Информация
                    const info = document.createElement('div');
                    info.style.cssText = 'background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; color: #dcddde; line-height: 1.6;';
                    info.innerHTML = `
                        <h3 style="color: #ffd700; margin-bottom: 10px;">ℹ️ How it works</h3>
                        <p>• Write to someone every day → streak increases 🔥</p>
                        <p>• Skip a day → streak resets at 00:00 MSK ❌</p>
                        <p>• Milestones at 10, 50, 100 days with animations! 🎉</p>
                        <p>• All times calculated in <strong>Moscow timezone (UTC+3)</strong> 🕐</p>
                        <br>
                        <h3 style="color: #ffd700; margin-bottom: 10px;">🎨 Color scheme</h3>
                        <p>• <span style="color: #ff4500;">🔥 Orange</span> - 10-49 days</p>
                        <p>• <span style="color: #8b00ff;">🔥 Purple</span> - 50-99 days</p>
                        <p>• <span style="color: #ff0000;">🔥 Red</span> - 100+ days</p>
                    `;
                    panel.appendChild(info);
                    
                    // Кнопка очистки данных
                    const clearButton = document.createElement('button');
                    clearButton.textContent = '🗑️ Clear All Streaks';
                    clearButton.style.cssText = `
                        background: #ed4245;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        font-size: 14px;
                        cursor: pointer;
                        margin-top: 20px;
                        transition: opacity 0.2s;
                    `;
                    clearButton.onmouseover = () => clearButton.style.opacity = '0.8';
                    clearButton.onmouseout = () => clearButton.style.opacity = '1';
                    clearButton.onclick = () => {
                        BdApi.showConfirmationModal(
                            "Clear All Streaks",
                            "Are you sure you want to delete all streak data? This cannot be undone!",
                            {
                                confirmText: "Delete",
                                cancelText: "Cancel",
                                danger: true,
                                onConfirm: () => {
                                    this.streaks = {};
                                    this.saveData();
                                    BdApi.showToast("All streaks cleared!", { type: "success" });
                                    // Обновляем DM список
                                    setTimeout(() => {
                                        document.querySelectorAll('.streak-tracker-inline-badge').forEach(el => el.remove());
                                    }, 100);
                                }
                            }
                        );
                    };
                    panel.appendChild(clearButton);
                    
                    // Ссылки
                    const links = document.createElement('div');
                    links.style.cssText = 'margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; gap: 15px; justify-content: center;';
                    links.innerHTML = `
                        <a href="https://github.com/TermitJs/Streak-Tracker-for-Discord" target="_blank" style="color: #5865F2; text-decoration: none;">GitHub</a>
                        <span style="color: #72767d;">•</span>
                        <a href="https://discord.gg/DcqV7MS6nS" target="_blank" style="color: #5865F2; text-decoration: none;">Discord</a>
                        <span style="color: #72767d;">•</span>
                        <a href="https://boosty.to/termitjs" target="_blank" style="color: #5865F2; text-decoration: none;">Donate</a>
                    `;
                    panel.appendChild(links);
                    
                    return panel;
                }

                onStop() {
                    console.log("🔥 [StreakTracker] Stopped");
                    Patcher.unpatchAll();
                    if (this.interval) clearInterval(this.interval);
                    if (this.observer) this.observer.disconnect();
                }

                loadData() {
                    const data = BdApi.Data.load("StreakTracker", "streaks");
                    if (data) this.streaks = data;
                }

                saveData() {
                    BdApi.Data.save("StreakTracker", "streaks", this.streaks);
                }

                updateStreak(channelId, userId, time) {
                    try {
                        // Конвертируем в МСК (UTC+3)
                        const mskTime = new Date(time);
                        mskTime.setHours(mskTime.getHours() + 3); // Переводим в МСК
                        const today = mskTime.toDateString();
                        
                        const key = `${channelId}_${userId}`;
                        
                        if (!this.streaks[key]) {
                            this.streaks[key] = { count: 0, last: null };
                        }

                        const lastDate = this.streaks[key].last ? (() => {
                            const d = new Date(this.streaks[key].last);
                            d.setHours(d.getHours() + 3);
                            return d.toDateString();
                        })() : null;
                        
                        if (lastDate === today) return;

                        const yesterday = new Date(mskTime);
                        yesterday.setDate(yesterday.getDate() - 1);
                        const yestStr = yesterday.toDateString();

                        const oldCount = this.streaks[key].count;

                        if (lastDate === yestStr) {
                            this.streaks[key].count++;
                        } else {
                            this.streaks[key].count = 1;
                        }
                        
                        const newCount = this.streaks[key].count;
                        
                        this.streaks[key].last = time;
                        this.saveData();
                        console.log(`🔥 Streak: ${userId} → ${newCount} days`);
                        
                        // Проверяем milestone (10, 50, 100 дней)
                        const milestones = [10, 50, 100];
                        const milestoneKey = `${key}_${newCount}`;
                        
                        if (milestones.includes(newCount) && !this.celebratedMilestones.has(milestoneKey)) {
                            this.celebratedMilestones.add(milestoneKey);
                            this.showMilestoneAnimation(channelId, newCount);
                        }
                    } catch (error) {
                        console.error("Error updating streak:", error);
                    }
                }

                getMaxStreak(userId) {
                    let max = 0;
                    for (const key in this.streaks) {
                        if (key.endsWith(`_${userId}`)) {
                            max = Math.max(max, this.streaks[key].count);
                        }
                    }
                    return max;
                }

                showMilestoneAnimation(channelId, streakCount) {
                    try {
                        // Находим элемент канала в списке DM
                        const channelLink = document.querySelector(`a[href="/channels/@me/${channelId}"]`);
                        if (!channelLink) {
                            console.log("❌ Channel not found:", channelId);
                            return;
                        }
                        
                        const channelElement = channelLink.closest('[class*="channel"]');
                        if (!channelElement) return;
                        
                        // Находим огонёк в этом канале
                        const existingBadge = channelElement.querySelector('.streak-tracker-inline-badge');
                        if (!existingBadge) {
                            console.log("❌ Streak badge not found");
                            return;
                        }
                        
                        // СКРЫВАЕМ оригинальный огонёк на время анимации
                        existingBadge.style.opacity = '0';
                        
                        // Получаем позицию огонька
                        const rect = existingBadge.getBoundingClientRect();
                        
                        // Определяем цвет в зависимости от milestone
                        let fireColor = '#ff4500'; // Оранжевый для 10-49
                        if (streakCount >= 100) {
                            fireColor = '#ff0000'; // Красный для 100+
                        } else if (streakCount >= 50) {
                            fireColor = '#8b00ff'; // Фиолетовый для 50-99
                        }
                        
                        // Создаём анимированный огонёк (копия оригинала)
                        const animatedFire = document.createElement('div');
                        animatedFire.style.cssText = `
                            position: fixed;
                            left: ${rect.left}px;
                            top: ${rect.top}px;
                            font-size: ${rect.height * 1.5}px;
                            z-index: 9999;
                            pointer-events: none;
                            filter: drop-shadow(0 0 10px ${fireColor});
                            width: ${rect.width * 2}px;
                            display: flex;
                            align-items: center;
                            justify-content: flex-start;
                            white-space: nowrap;
                        `;
                        animatedFire.textContent = `🔥 ${streakCount}`;
                        animatedFire.style.color = fireColor;
                        
                        document.body.appendChild(animatedFire);
                        
                        // Анимация: увеличение на 50%, 5-6 вращений
                        const keyframes = [
                            { 
                                transform: 'scale(1) rotate(0deg)',
                                opacity: 1
                            },
                            { 
                                transform: 'scale(1.5) rotate(1800deg)', // 5 оборотов
                                opacity: 1,
                                offset: 0.8
                            },
                            { 
                                transform: 'scale(1) rotate(2160deg)', // 6 оборотов
                                opacity: 1
                            }
                        ];
                        
                        const animation = animatedFire.animate(keyframes, {
                            duration: 2000,
                            easing: 'ease-in-out'
                        });
                        
                        // После анимации: возвращаем и подсвечиваем
                        animation.onfinish = () => {
                            animatedFire.remove();
                            
                            // Возвращаем видимость оригинального badge
                            existingBadge.style.opacity = '1';
                            
                            // Обновляем цвет если нужно
                            existingBadge.style.color = fireColor;
                            
                            // Подсветка оригинального badge
                            existingBadge.style.transition = 'all 0.5s ease';
                            existingBadge.style.textShadow = `0 0 20px ${fireColor}, 0 0 30px #ffd700`;
                            existingBadge.style.transform = 'scale(1.3)';
                            existingBadge.style.transformOrigin = 'left center';
                            existingBadge.style.minWidth = '70px';
                            existingBadge.style.overflow = 'visible !important';
                            
                            setTimeout(() => {
                                existingBadge.style.textShadow = '';
                                existingBadge.style.transform = '';
                                existingBadge.style.minWidth = '50px';
                            }, 800);
                        };
                        
                        // Toast уведомление
                        BdApi.showToast(`🔥 ${streakCount} DAY STREAK! 🔥`, { 
                            type: "success",
                            timeout: 5000
                        });
                        
                    } catch (error) {
                        console.error("Error showing milestone animation:", error);
                    }
                }

                patchMessages() {
                    const MessageActions = BdApi.Webpack.getModule(m => m.receiveMessage && m.sendMessage);
                    if (!MessageActions) {
                        console.log("MessageActions not found");
                        return;
                    }
                    
                    Patcher.after(MessageActions, "receiveMessage", (_, args) => {
                        const channelId = args[0];
                        const msg = args[1];
                        
                        if (msg && msg.author && msg.author.id) {
                            const time = msg.timestamp || msg.id;
                            this.lastUserIds.set(channelId, msg.author.id);
                            this.updateStreak(channelId, msg.author.id, time);
                        }
                    });
                }

                startObserver() {
                    this.observer = new MutationObserver((mutations) => {
                        for (const mutation of mutations) {
                            for (const node of mutation.addedNodes) {
                                if (!(node instanceof Element)) continue;
                                
                                const nodeClass = node.className?.toString() || '';
                                
                                // Ищем попап
                                if (nodeClass.includes('layer') || nodeClass.includes('popout') || nodeClass.includes('modal')) {
                                    setTimeout(() => this.addStreakToPopout(node), 100);
                                }
                                
                                // Обновляем DM список при изменениях
                                if (nodeClass.includes('channel') || nodeClass.includes('privateChannels')) {
                                    setTimeout(() => this.addStreaksToDMs(), 100);
                                }
                            }
                        }
                    });
                    
                    this.observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                    
                    // Добавляем значки при загрузке
                    setTimeout(() => this.addStreaksToDMs(), 2000);
                    
                    // Обновляем каждые 5 секунд (на случай если что-то пропустили)
                    setInterval(() => this.addStreaksToDMs(), 5000);
                }

                addStreakToPopout(popoutElement) {
                    try {
                        // Проверяем что это именно user popout, а не настройки/другие модалы
                        const isUserPopout = popoutElement.querySelector('[class*="userPopout"]') || 
                                            popoutElement.querySelector('[class*="UserProfile"]') ||
                                            popoutElement.innerHTML.includes('user') && popoutElement.innerHTML.includes('profile');
                        
                        if (!isUserPopout) return;
                        if (popoutElement.querySelector('.streak-tracker-badge')) return;
                        
                        let userId = null;
                        
                        // Метод 1: Ищем через React Fiber (самый надёжный)
                        const reactFiber = popoutElement[Object.keys(popoutElement).find(k => k.startsWith('__reactFiber'))];
                        if (reactFiber) {
                            let node = reactFiber;
                            let depth = 0;
                            while (node && depth < 50) {
                                const props = node.memoizedProps || node.pendingProps;
                                if (props?.user?.id) {
                                    userId = props.user.id;
                                    break;
                                }
                                if (props?.userId) {
                                    userId = props.userId;
                                    break;
                                }
                                node = node.return;
                                depth++;
                            }
                        }
                        
                        // Метод 2: Ищем через data атрибуты
                        if (!userId) {
                            const elements = popoutElement.querySelectorAll('*');
                            for (const el of elements) {
                                const fiber = el[Object.keys(el).find(k => k.startsWith('__reactFiber'))];
                                if (fiber?.memoizedProps?.user?.id) {
                                    userId = fiber.memoizedProps.user.id;
                                    break;
                                }
                            }
                        }
                        
                        if (!userId) return;
                        
                        const streak = this.getMaxStreak(userId);
                        if (streak <= 0) return;
                        
                        const streakDiv = document.createElement('div');
                        streakDiv.className = 'streak-tracker-badge';
                        streakDiv.style.cssText = `
                            background: linear-gradient(45deg, #ff4500, #ffd700);
                            color: white;
                            padding: 8px 12px;
                            border-radius: 12px;
                            font-size: 14px;
                            font-weight: bold;
                            margin: 8px 16px;
                            text-align: center;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                        `;
                        streakDiv.textContent = `🔥 ${streak} day streak`;
                        
                        popoutElement.appendChild(streakDiv);
                    } catch (e) {
                        console.error("Error adding streak to popout:", e);
                    }
                }

                addStreaksToDMs() {
                    try {
                        // Ищем все элементы личных каналов
                        const channels = document.querySelectorAll('[class*="channel"]');
                        
                        channels.forEach(channel => {
                            // Проверяем что это личный канал (DM)
                            const link = channel.querySelector('a[href*="/channels/@me/"]');
                            if (!link) return;
                            
                            // Проверяем, не добавили ли уже
                            if (channel.querySelector('.streak-tracker-inline-badge')) return;
                            
                            const channelId = link.href.split('/').pop();
                            
                            // Ищем максимальный стрик для этого канала
                            let maxStreak = 0;
                            for (const key in this.streaks) {
                                if (key.startsWith(channelId + '_')) {
                                    maxStreak = Math.max(maxStreak, this.streaks[key].count);
                                }
                            }
                            
                            if (maxStreak <= 0) return;
                            
                            // Ищем контейнер с именем пользователя
                            const nameContainer = channel.querySelector('[class*="name"]');
                            if (!nameContainer) return;
                            
                            // Проверяем что родитель имеет достаточно места
                            const parentContainer = nameContainer.parentElement;
                            if (parentContainer) {
                                parentContainer.style.display = 'flex';
                                parentContainer.style.alignItems = 'center';
                                parentContainer.style.gap = '8px';
                                parentContainer.style.overflow = 'visible';
                            }
                            
                            // Имя НЕ обрезается
                            nameContainer.style.whiteSpace = 'nowrap';
                            nameContainer.style.overflow = 'visible';
                            
                            // Определяем цвет в зависимости от стрика
                            let fireColor = '#ff4500'; // Оранжевый по умолчанию (до 49)
                            if (maxStreak >= 100) {
                                fireColor = '#ff0000'; // Красный для 100+
                            } else if (maxStreak >= 50) {
                                fireColor = '#8b00ff'; // Фиолетовый для 50-99
                            }
                            
                            // Создаём inline значок
                            const badge = document.createElement('span');
                            badge.className = 'streak-tracker-inline-badge';
                            badge.style.cssText = `
                                color: ${fireColor};
                                font-weight: bold;
                                font-size: 13px;
                                display: inline-block;
                                white-space: nowrap;
                                flex-shrink: 0;
                                overflow: visible !important;
                                min-width: 50px;
                                text-align: left;
                                margin-left: 8px;
                            `;
                            badge.textContent = `🔥 ${maxStreak}`;
                            
                            // Добавляем ПОСЛЕ имени
                            if (parentContainer) {
                                parentContainer.appendChild(badge);
                            } else {
                                nameContainer.insertAdjacentElement('afterend', badge);
                            }
                        });
                    } catch (e) {
                        console.error("Error adding streaks to DMs:", e);
                    }
                }

                checkResets() {
                    // Проверяем в МСК времени
                    const now = new Date();
                    now.setHours(now.getHours() + 3); // МСК = UTC+3
                    const today = now.toDateString();
                    
                    const yesterday = new Date(now);
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yestStr = yesterday.toDateString();
                    
                    for (const key in this.streaks) {
                        const lastDate = this.streaks[key].last ? (() => {
                            const d = new Date(this.streaks[key].last);
                            d.setHours(d.getHours() + 3);
                            return d.toDateString();
                        })() : null;
                        
                        if (lastDate !== today && lastDate !== yestStr) {
                            // Показываем анимацию потери стрика если он был больше 3 дней
                            if (this.streaks[key].count >= 3) {
                                const channelId = key.split('_')[0];
                                this.showStreakLostAnimation(channelId);
                            }
                            delete this.streaks[key];
                        }
                    }
                    this.saveData();
                    
                    // Обновляем список DM
                    setTimeout(() => this.addStreaksToDMs(), 500);
                }

                showStreakLostAnimation(channelId) {
                    try {
                        const channelLink = document.querySelector(`a[href="/channels/@me/${channelId}"]`);
                        if (!channelLink) return;
                        
                        const channelElement = channelLink.closest('[class*="channel"]');
                        if (!channelElement) return;
                        
                        const existingBadge = channelElement.querySelector('.streak-tracker-inline-badge');
                        if (!existingBadge) return;
                        
                        const rect = existingBadge.getBoundingClientRect();
                        
                        // Создаём контейнер для анимации
                        const container = document.createElement('div');
                        container.style.cssText = `
                            position: fixed;
                            left: ${rect.left}px;
                            top: ${rect.top}px;
                            z-index: 9999;
                            pointer-events: none;
                        `;
                        
                        // Огонёк гаснет
                        const fire = document.createElement('div');
                        fire.style.cssText = `
                            font-size: ${rect.height}px;
                            position: absolute;
                        `;
                        fire.textContent = '🔥';
                        
                        // Дым
                        const smoke = document.createElement('div');
                        smoke.style.cssText = `
                            font-size: ${rect.height * 1.2}px;
                            position: absolute;
                            opacity: 0;
                        `;
                        smoke.textContent = '💨';
                        
                        container.appendChild(fire);
                        container.appendChild(smoke);
                        document.body.appendChild(container);
                        
                        // Анимация огня (гаснет)
                        const fireAnimation = fire.animate([
                            { opacity: 1, transform: 'scale(1)' },
                            { opacity: 0.5, transform: 'scale(0.8)' },
                            { opacity: 0, transform: 'scale(0.3)' }
                        ], {
                            duration: 1000,
                            easing: 'ease-out'
                        });
                        
                        // Анимация дыма (появляется)
                        setTimeout(() => {
                            smoke.animate([
                                { opacity: 0, transform: 'translateY(0px) scale(0.5)' },
                                { opacity: 0.8, transform: 'translateY(-20px) scale(1)' },
                                { opacity: 0, transform: 'translateY(-40px) scale(1.2)' }
                            ], {
                                duration: 1500,
                                easing: 'ease-out'
                            });
                        }, 500);
                        
                        // Удаляем после анимации
                        setTimeout(() => {
                            container.remove();
                            if (existingBadge) existingBadge.remove();
                        }, 2000);
                        
                        // Уведомление
                        BdApi.showToast("💔 Streak lost...", { 
                            type: "error",
                            timeout: 3000
                        });
                        
                    } catch (error) {
                        console.error("Error showing lost animation:", error);
                    }
                }

                showStatisticsModal() {
                    try {
                        // Собираем статистику
                        const UserStore = BdApi.Webpack.getStore("UserStore");
                        const ChannelStore = BdApi.Webpack.getStore("ChannelStore");
                        const streakList = [];
                        
                        for (const key in this.streaks) {
                            const [channelId, userId] = key.split('_');
                            
                            // Пробуем получить имя пользователя разными способами
                            let username = 'Unknown User';
                            
                            // Способ 1: Через UserStore
                            const user = UserStore?.getUser(userId);
                            if (user?.username) {
                                username = user.username;
                            } else {
                                // Способ 2: Через ChannelStore (для DM)
                                const channel = ChannelStore?.getChannel(channelId);
                                if (channel?.recipients?.includes(userId)) {
                                    const recipient = UserStore?.getUser(userId);
                                    if (recipient?.username) {
                                        username = recipient.username;
                                    }
                                }
                            }
                            
                            // Способ 3: Берём из DOM
                            if (username === 'Unknown User') {
                                const channelLink = document.querySelector(`a[href="/channels/@me/${channelId}"]`);
                                if (channelLink) {
                                    const nameElement = channelLink.querySelector('[class*="name"]');
                                    if (nameElement) {
                                        // Убираем огонёк из текста
                                        const fullText = nameElement.textContent;
                                        username = fullText.replace(/🔥\s*\d+/g, '').trim();
                                    }
                                }
                            }
                            
                            streakList.push({
                                username,
                                userId,
                                channelId,
                                count: this.streaks[key].count,
                                lastDate: new Date(this.streaks[key].last).toLocaleDateString()
                            });
                        }
                        
                        // Сортируем по количеству дней
                        streakList.sort((a, b) => b.count - a.count);
                        
                        // Топ-5
                        const top5 = streakList.slice(0, 5);
                        
                        // Общая статистика
                        const totalStreaks = streakList.length;
                        const totalDays = streakList.reduce((sum, s) => sum + s.count, 0);
                        const longestStreak = streakList[0]?.count || 0;
                        
                        const medals = ['👑', '🥈', '🥉', '4️⃣', '5️⃣'];
                        
                        // Создаём React компонент
                        const StatsContent = BdApi.React.createElement('div', {
                            style: { padding: '20px', fontFamily: "'gg sans', 'Noto Sans', sans-serif" }
                        },
                            BdApi.React.createElement('h2', {
                                style: { color: '#ff4500', marginBottom: '20px', fontSize: '24px' }
                            }, '🔥 Streak Statistics'),
                            
                            // Общая статистика
                            BdApi.React.createElement('div', {
                                style: { background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }
                            },
                                BdApi.React.createElement('div', {
                                    style: { display: 'flex', justifyContent: 'space-around', textAlign: 'center' }
                                },
                                    BdApi.React.createElement('div', null,
                                        BdApi.React.createElement('div', {
                                            style: { fontSize: '28px', color: '#ffd700', fontWeight: 'bold' }
                                        }, totalStreaks),
                                        BdApi.React.createElement('div', {
                                            style: { color: '#b9bbbe', fontSize: '12px' }
                                        }, 'Active Streaks')
                                    ),
                                    BdApi.React.createElement('div', null,
                                        BdApi.React.createElement('div', {
                                            style: { fontSize: '28px', color: '#ff4500', fontWeight: 'bold' }
                                        }, longestStreak),
                                        BdApi.React.createElement('div', {
                                            style: { color: '#b9bbbe', fontSize: '12px' }
                                        }, 'Longest Streak')
                                    ),
                                    BdApi.React.createElement('div', null,
                                        BdApi.React.createElement('div', {
                                            style: { fontSize: '28px', color: '#8b00ff', fontWeight: 'bold' }
                                        }, totalDays),
                                        BdApi.React.createElement('div', {
                                            style: { color: '#b9bbbe', fontSize: '12px' }
                                        }, 'Total Days')
                                    )
                                )
                            ),
                            
                            // Топ-5
                            BdApi.React.createElement('h3', {
                                style: { color: '#dcddde', marginBottom: '15px', fontSize: '18px' }
                            }, '👑 Top 5 Streaks'),
                            
                            BdApi.React.createElement('div', {
                                style: { display: 'flex', flexDirection: 'column', gap: '10px' }
                            },
                                top5.length === 0 ? 
                                    BdApi.React.createElement('div', {
                                        style: { color: '#72767d', textAlign: 'center', padding: '20px' }
                                    }, 'No streaks yet. Start chatting! 💬')
                                :
                                top5.map((streak, index) => {
                                    let color = '#ff4500';
                                    if (streak.count >= 100) color = '#ff0000';
                                    else if (streak.count >= 50) color = '#8b00ff';
                                    
                                    return BdApi.React.createElement('div', {
                                        key: index,
                                        style: { 
                                            background: 'rgba(0,0,0,0.3)', 
                                            padding: '12px 15px', 
                                            borderRadius: '8px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between' 
                                        }
                                    },
                                        BdApi.React.createElement('div', {
                                            style: { display: 'flex', alignItems: 'center', gap: '10px' }
                                        },
                                            BdApi.React.createElement('span', {
                                                style: { fontSize: '24px' }
                                            }, medals[index]),
                                            BdApi.React.createElement('span', {
                                                style: { color: '#dcddde', fontWeight: '500' }
                                            }, streak.username)
                                        ),
                                        BdApi.React.createElement('div', {
                                            style: { display: 'flex', alignItems: 'center', gap: '8px' }
                                        },
                                            BdApi.React.createElement('span', {
                                                style: { color: color, fontWeight: 'bold', fontSize: '18px' }
                                            }, `🔥 ${streak.count}`),
                                            BdApi.React.createElement('span', {
                                                style: { color: '#72767d', fontSize: '12px' }
                                            }, streak.lastDate)
                                        )
                                    );
                                })
                            )
                        );
                        
                        // Показываем модалку с React компонентом
                        BdApi.showConfirmationModal("Streak Statistics", StatsContent, {
                            confirmText: "Close",
                            cancelText: null
                        });
                        
                    } catch (error) {
                        console.error("Error showing statistics:", error);
                        BdApi.showToast("Error loading statistics", { type: "error" });
                    }
                }
            };
        };
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();