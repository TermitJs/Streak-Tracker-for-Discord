TikTok-style chat streaks for Discord! Write every day → get a fire streak in DMs & profile. Auto-reset after 24h. Inspired by TikTok. Lightweight, open-source. Follow: [GitHub](https://github.com/TermitJs) | [Discord](https://discord.gg/DcqV7MS6nS) | [Donate](https://boosty.to/termitjs)
# 🔥 Streak Tracker for Discord

**TikTok-style chat streaks for Discord!** Track your daily conversations with fire emojis and epic animations.

> 💬 Write every day → get a **fire streak**  
> ❌ Miss a day → streak resets  
> 🎯 Just like **Snapchat/TikTok**, but for Discord

[![GitHub](https://img.shields.io/badge/GitHub-TermitJs-blue?logo=github)](https://github.com/TermitJs)
[![Discord](https://img.shields.io/badge/Discord-Server-5865F2?logo=discord&logoColor=white)](https://discord.gg/DcqV7MS6nS)
[![Donate](https://img.shields.io/badge/Donate-Boosty-orange)](https://boosty.to/termitjs)
[![Version](https://img.shields.io/badge/version-1.0.5-ff4500)](https://github.com/TermitJs/Streak-Tracker-for-Discord/releases)

![Streak Preview](https://github.com/user-attachments/assets/56253d33-aaca-4627-b419-0937382c481b)

---

## ✨ Features

- 🔥 **Streak counter** next to usernames in DM list
- 🎨 **Dynamic colors** - Orange (10-49d) → Purple (50-99d) → Red (100+d)
- 🎉 **Epic milestone animations** at 10, 50, 100 days
- 💨 **Streak loss animation** - fire fades out with smoke
- 📊 **Statistics dashboard** - View top 5 streaks, total days, and more
- 👤 **Profile badges** showing streak in user popouts
- ⏰ **Daily reset at 00:00 MSK** (Moscow time, UTC+3)
- ⚡ **Lightweight** — no lag, minimal memory usage
- 🔓 **No permissions** required
- 📖 **Open-source** (MIT License)

---

## 📥 Installation

### Requirements
- [BetterDiscord](https://betterdiscord.app/) installed
- [ZeresPluginLibrary](https://betterdiscord.app/plugin/ZeresPluginLibrary) (auto-installs on first launch)

### Steps

**Option 1: Direct Download** (Recommended)
1. Download `StreakTracker.plugin.js` from [Latest Release](https://github.com/TermitJs/Streak-Tracker-for-Discord/releases/latest)
2. Place in: `%AppData%\BetterDiscord\plugins\`
3. Restart Discord
4. Enable in **Settings → Plugins → Streak Tracker**

**Option 2: Git Clone**
```bash
cd %AppData%\BetterDiscord\plugins
git clone https://github.com/TermitJs/Streak-Tracker-for-Discord.git
```

---

## 🚀 Usage

### Getting Started
**No setup needed!** Just start messaging:

1. 💬 Send a message to someone
2. 🔥 Streak counter appears: **🔥 1**
3. 📅 Message them tomorrow → **🔥 2**
4. ⏰ Skip a day → resets to **🔥 1**

### 🎊 Milestone Celebrations
Hit **10, 50, or 100 days** for an epic animation:
- Fire emoji **enlarges 1.5x**
- Spins **6 full rotations** (2160°)
- Returns with a **glowing effect**
- Toast notification: "🔥 X DAY STREAK!"

### 💔 Streak Loss
If you miss a day (24h+ no messages):
- Fire **fades out**
- Smoke **rises up** 💨
- Badge disappears from DM list

### 📊 View Statistics
Open **Settings → Plugins → Streak Tracker → Settings** to see:
- 📈 **Active Streaks** count
- 🏆 **Longest Streak** record
- 📅 **Total Days** across all streaks
- 👑 **Top 5 Leaderboard** with medals

---

## 🎨 Color System

Streak colors change based on achievement level:

| Days | Color | Emoji |
|------|-------|-------|
| 10-49 | 🟠 Orange (#ff4500) | 🔥 |
| 50-99 | 🟣 Purple (#8b00ff) | 🔥 |
| 100+ | 🔴 Red (#ff0000) | 🔥 |

---

## 🛠️ How It Works

- Tracks messages in **DMs and servers**
- Counts **consecutive days** (resets at midnight local time)
- Stores data **locally** using BetterDiscord's storage (no cloud sync)
- Checks for **expired streaks** every hour
- Uses **DOM Observer** to dynamically add/update badges
- **React components** for statistics modal

---

## 📱 Screenshots

### Streak in DM List
![DM List Preview]() *([Add screenshot](https://github.com/user-attachments/assets/56253d33-aaca-4627-b419-0937382c481b))*

### Statistics Dashboard
![Stats Modal]() *([Add screenshot](https://github.com/user-attachments/assets/6a9182a6-db54-4a4e-94b2-6f72f787f78f))*

---

## 🔧 Settings Panel

Access via **Settings → Plugins → Streak Tracker → ⚙️**

Features:
- 📊 **View Statistics** button
- 🗑️ **Clear All Streaks** (with confirmation)
- ℹ️ How it works guide
- 🎨 Color scheme reference
- 🔗 Quick links (GitHub, Discord, Donate)

---

## 💬 Support

Need help? Found a bug? Want to contribute?

- 💬 **Discord Server:** [Join here](https://discord.gg/DcqV7MS6nS)
- 🐛 **Report Issues:** [GitHub Issues](https://github.com/TermitJs/Streak-Tracker-for-Discord/issues)
- 💡 **Feature Requests:** [GitHub Discussions](https://github.com/TermitJs/Streak-Tracker-for-Discord/discussions)
- ❤️ **Donate:** [Boosty](https://boosty.to/termitjs)

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- 🐛 Report bugs
- 💡 Suggest features
- 🔧 Submit pull requests

- 📖 Improve documentation

---

## 📋 Changelog

### v1.0.5 (Current)
- ✨ Added statistics dashboard with top 5 leaderboard
- 🎨 Dynamic color system (orange/purple/red)
- 💨 Streak loss animation with smoke effect
- ⚙️ Settings panel with info and controls
- 🐛 Fixed badge overflow issues
- 🎯 Improved username detection in stats

### v1.0.0
- 🎉 Initial release
- 🔥 Basic streak tracking
- 🎊 Milestone animations

[View Full Changelog](https://github.com/TermitJs/Streak-Tracker-for-Discord/releases)

---

## ⚖️ Legal

This plugin is **inspired by** TikTok/Snapchat's streak feature.  
Not affiliated with, endorsed by, or connected to TikTok Inc., Snap Inc., or Discord Inc.  
All trademarks belong to their respective owners.

---

## 📜 License

MIT License — free to use, modify, and distribute.
```
MIT License

Copyright (c) 2025 TermitJs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

[Full License](./LICENSE)

---

<div align="center">

**Made with 🔥 by [TermitJs](https://github.com/TermitJs)**

*BetterDiscord Plugin • 2025*

[⭐ Star this repo](https://github.com/TermitJs/Streak-Tracker-for-Discord) • [🐛 Report Bug](https://github.com/TermitJs/Streak-Tracker-for-Discord/issues) • [💡 Request Feature](https://github.com/TermitJs/Streak-Tracker-for-Discord/issues)

</div>
