let garbageCounter = 1;
let scheduleCounters = {};

document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    setupEventListeners();
    updateNextGarbageDay();
});

function setupEventListeners() {
    document.getElementById('addGarbage').addEventListener('click', addGarbageItem);
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('enableNotification').addEventListener('click', requestNotificationPermission);
    document.getElementById('resetSettings').addEventListener('click', resetAllSettings);

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-schedule')) {
            const garbageId = e.target.dataset.garbageId;
            addScheduleItem(garbageId);
        }

        if (e.target.classList.contains('remove-schedule')) {
            e.target.closest('.schedule-item').remove();
        }

        if (e.target.classList.contains('remove-garbage')) {
            e.target.closest('.garbage-item').remove();
            updateRemoveButtons();
        }
    });

    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('frequency-type')) {
            const scheduleItem = e.target.closest('.schedule-item');
            const nthWeek = scheduleItem.querySelector('.nth-week');
            if (e.target.value === 'nth') {
                nthWeek.style.display = 'block';
            } else {
                nthWeek.style.display = 'none';
            }
        }
    });
}

function addGarbageItem() {
    const garbageSettings = document.getElementById('garbageSettings');
    const newGarbageItem = document.createElement('div');
    newGarbageItem.className = 'garbage-item';
    newGarbageItem.dataset.garbageId = garbageCounter;

    newGarbageItem.innerHTML = `
        <h3>ゴミ設定</h3>
        <input type="text" class="garbage-name" placeholder="ゴミ名（例：燃えるゴミ）" value="">

        <div class="schedule-settings" data-garbage-id="${garbageCounter}">
            <div class="schedule-item" data-schedule-id="0">
                <select class="frequency-type">
                    <option value="every">毎週</option>
                    <option value="nth">第n</option>
                </select>

                <select class="nth-week" style="display:none;">
                    <option value="1">第1</option>
                    <option value="2">第2</option>
                    <option value="3">第3</option>
                    <option value="4">第4</option>
                    <option value="5">第5</option>
                </select>

                <select class="day-of-week">
                    <option value="0">日曜日</option>
                    <option value="1">月曜日</option>
                    <option value="2">火曜日</option>
                    <option value="3">水曜日</option>
                    <option value="4">木曜日</option>
                    <option value="5">金曜日</option>
                    <option value="6">土曜日</option>
                </select>

                <button class="remove-schedule" style="display:none;">✕</button>
            </div>
        </div>

        <button class="add-schedule" data-garbage-id="${garbageCounter}">+ 曜日を追加</button>
        <button class="remove-garbage">ゴミ設定を削除</button>
    `;

    garbageSettings.appendChild(newGarbageItem);
    scheduleCounters[garbageCounter] = 1;
    garbageCounter++;
    updateRemoveButtons();
}

function addScheduleItem(garbageId) {
    const scheduleSettings = document.querySelector(`.schedule-settings[data-garbage-id="${garbageId}"]`);
    if (!scheduleCounters[garbageId]) {
        scheduleCounters[garbageId] = 1;
    }

    const newScheduleItem = document.createElement('div');
    newScheduleItem.className = 'schedule-item';
    newScheduleItem.dataset.scheduleId = scheduleCounters[garbageId];

    newScheduleItem.innerHTML = `
        <select class="frequency-type">
            <option value="every">毎週</option>
            <option value="nth">第n</option>
        </select>

        <select class="nth-week" style="display:none;">
            <option value="1">第1</option>
            <option value="2">第2</option>
            <option value="3">第3</option>
            <option value="4">第4</option>
            <option value="5">第5</option>
        </select>

        <select class="day-of-week">
            <option value="0">日曜日</option>
            <option value="1">月曜日</option>
            <option value="2">火曜日</option>
            <option value="3">水曜日</option>
            <option value="4">木曜日</option>
            <option value="5">金曜日</option>
            <option value="6">土曜日</option>
        </select>

        <button class="remove-schedule">✕</button>
    `;

    scheduleSettings.appendChild(newScheduleItem);
    scheduleCounters[garbageId]++;
    updateScheduleRemoveButtons(garbageId);
}

function updateScheduleRemoveButtons(garbageId) {
    const scheduleSettings = document.querySelector(`.schedule-settings[data-garbage-id="${garbageId}"]`);
    const scheduleItems = scheduleSettings.querySelectorAll('.schedule-item');

    scheduleItems.forEach(item => {
        const removeButton = item.querySelector('.remove-schedule');
        if (scheduleItems.length > 1) {
            removeButton.style.display = 'block';
        } else {
            removeButton.style.display = 'none';
        }
    });
}

function updateRemoveButtons() {
    const garbageItems = document.querySelectorAll('.garbage-item');

    garbageItems.forEach(item => {
        const removeButton = item.querySelector('.remove-garbage');
        if (garbageItems.length > 1) {
            removeButton.style.display = 'block';
        } else {
            removeButton.style.display = 'none';
        }
    });
}

function saveSettings() {
    const settings = {
        garbageItems: [],
        notificationTime: document.getElementById('notificationTime').value
    };

    const garbageItems = document.querySelectorAll('.garbage-item');

    garbageItems.forEach(item => {
        const garbageName = item.querySelector('.garbage-name').value;
        if (!garbageName) return;

        const schedules = [];
        const scheduleItems = item.querySelectorAll('.schedule-item');

        scheduleItems.forEach(scheduleItem => {
            const frequencyType = scheduleItem.querySelector('.frequency-type').value;
            const nthWeek = scheduleItem.querySelector('.nth-week').value;
            const dayOfWeek = scheduleItem.querySelector('.day-of-week').value;

            schedules.push({
                frequencyType,
                nthWeek: frequencyType === 'nth' ? nthWeek : null,
                dayOfWeek
            });
        });

        settings.garbageItems.push({
            name: garbageName,
            schedules: schedules
        });
    });

    localStorage.setItem('garbageSettings', JSON.stringify(settings));
    updateNextGarbageDay();
    scheduleNotifications();
    alert('設定を保存しました！');
}

function loadSettings() {
    const savedSettings = localStorage.getItem('garbageSettings');
    if (!savedSettings) return;

    const settings = JSON.parse(savedSettings);

    if (settings.notificationTime) {
        document.getElementById('notificationTime').value = settings.notificationTime;
    }

    const garbageSettings = document.getElementById('garbageSettings');
    garbageSettings.innerHTML = '';

    settings.garbageItems.forEach((garbageItem, garbageIndex) => {
        const garbageDiv = document.createElement('div');
        garbageDiv.className = 'garbage-item';
        garbageDiv.dataset.garbageId = garbageIndex;

        let schedulesHtml = '';
        garbageItem.schedules.forEach((schedule, scheduleIndex) => {
            const nthDisplay = schedule.frequencyType === 'nth' ? 'block' : 'none';
            schedulesHtml += `
                <div class="schedule-item" data-schedule-id="${scheduleIndex}">
                    <select class="frequency-type">
                        <option value="every" ${schedule.frequencyType === 'every' ? 'selected' : ''}>毎週</option>
                        <option value="nth" ${schedule.frequencyType === 'nth' ? 'selected' : ''}>第n</option>
                    </select>

                    <select class="nth-week" style="display:${nthDisplay};">
                        ${[1,2,3,4,5].map(n => `<option value="${n}" ${schedule.nthWeek == n ? 'selected' : ''}>第${n}</option>`).join('')}
                    </select>

                    <select class="day-of-week">
                        ${[0,1,2,3,4,5,6].map(d => {
                            const days = ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'];
                            return `<option value="${d}" ${schedule.dayOfWeek == d ? 'selected' : ''}>${days[d]}</option>`;
                        }).join('')}
                    </select>

                    <button class="remove-schedule" ${garbageItem.schedules.length > 1 ? '' : 'style="display:none;"'}>✕</button>
                </div>
            `;
        });

        garbageDiv.innerHTML = `
            <h3>ゴミ設定</h3>
            <input type="text" class="garbage-name" placeholder="ゴミ名（例：燃えるゴミ）" value="${garbageItem.name}">

            <div class="schedule-settings" data-garbage-id="${garbageIndex}">
                ${schedulesHtml}
            </div>

            <button class="add-schedule" data-garbage-id="${garbageIndex}">+ 曜日を追加</button>
            <button class="remove-garbage" ${settings.garbageItems.length > 1 ? '' : 'style="display:none;"'}>ゴミ設定を削除</button>
        `;

        garbageSettings.appendChild(garbageDiv);
        scheduleCounters[garbageIndex] = garbageItem.schedules.length;
    });

    garbageCounter = settings.garbageItems.length;
}

function updateNextGarbageDay() {
    const savedSettings = localStorage.getItem('garbageSettings');
    if (!savedSettings) {
        document.getElementById('nextGarbageDay').textContent = '';
        return;
    }

    const settings = JSON.parse(savedSettings);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextDates = [];

    settings.garbageItems.forEach(garbageItem => {
        garbageItem.schedules.forEach(schedule => {
            const nextDate = getNextGarbageDate(today, schedule);
            if (nextDate) {
                nextDates.push({
                    date: nextDate,
                    name: garbageItem.name
                });
            }
        });
    });

    if (nextDates.length === 0) {
        document.getElementById('nextGarbageDay').textContent = '';
        return;
    }

    nextDates.sort((a, b) => a.date - b.date);

    const nextDate = nextDates[0].date;
    const garbageNames = nextDates
        .filter(item => item.date.getTime() === nextDate.getTime())
        .map(item => item.name);

    const uniqueNames = [...new Set(garbageNames)];

    const month = nextDate.getMonth() + 1;
    const day = nextDate.getDate();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][nextDate.getDay()];

    document.getElementById('nextGarbageDay').textContent =
        `次のゴミの日: ${month}/${day} (${dayOfWeek}) - ${uniqueNames.join(', ')}`;
}

function getNextGarbageDate(today, schedule) {
    const targetDay = parseInt(schedule.dayOfWeek);
    let nextDate = new Date(today);

    if (schedule.frequencyType === 'every') {
        const daysUntilTarget = (targetDay - today.getDay() + 7) % 7;
        if (daysUntilTarget === 0) {
            nextDate.setDate(nextDate.getDate() + 7);
        } else {
            nextDate.setDate(nextDate.getDate() + daysUntilTarget);
        }
    } else if (schedule.frequencyType === 'nth') {
        const nthWeek = parseInt(schedule.nthWeek);

        for (let monthOffset = 0; monthOffset < 2; monthOffset++) {
            const checkDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
            const nthDate = getNthWeekdayOfMonth(checkDate.getFullYear(), checkDate.getMonth(), targetDay, nthWeek);

            if (nthDate && nthDate > today) {
                nextDate = nthDate;
                break;
            }
        }
    }

    return nextDate;
}

function getNthWeekdayOfMonth(year, month, dayOfWeek, n) {
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();

    let daysToAdd = (dayOfWeek - firstDayOfWeek + 7) % 7;
    daysToAdd += (n - 1) * 7;

    const resultDate = new Date(year, month, 1 + daysToAdd);

    if (resultDate.getMonth() !== month) {
        return null;
    }

    return resultDate;
}

function requestNotificationPermission() {
    if (!('Notification' in window)) {
        alert('このブラウザは通知をサポートしていません');
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            alert('通知が有効になりました！');
            registerServiceWorker();
        } else {
            alert('通知の許可が必要です');
        }
    });
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker登録成功:', registration);
                scheduleNotifications();
            })
            .catch(error => {
                console.log('Service Worker登録失敗:', error);
            });
    }
}

function scheduleNotifications() {
    if (!('serviceWorker' in navigator) || Notification.permission !== 'granted') {
        return;
    }

    const savedSettings = localStorage.getItem('garbageSettings');
    if (!savedSettings) return;

    const settings = JSON.parse(savedSettings);
    const notificationTime = settings.notificationTime || '07:30';
    const [hours, minutes] = notificationTime.split(':').map(n => parseInt(n));

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const garbageForTomorrow = [];

    settings.garbageItems.forEach(garbageItem => {
        garbageItem.schedules.forEach(schedule => {
            if (isGarbageDayTomorrow(tomorrow, schedule)) {
                garbageForTomorrow.push(garbageItem.name);
            }
        });
    });

    if (garbageForTomorrow.length > 0) {
        const uniqueNames = [...new Set(garbageForTomorrow)];
        const notificationDate = new Date(tomorrow);
        notificationDate.setHours(hours, minutes, 0, 0);

        const now = new Date();
        const delay = notificationDate.getTime() - now.getTime();

        if (delay > 0) {
            setTimeout(() => {
                showNotification(uniqueNames);
            }, delay);
        }
    }
}

function isGarbageDayTomorrow(tomorrow, schedule) {
    const targetDay = parseInt(schedule.dayOfWeek);

    if (tomorrow.getDay() !== targetDay) {
        return false;
    }

    if (schedule.frequencyType === 'every') {
        return true;
    } else if (schedule.frequencyType === 'nth') {
        const nthWeek = parseInt(schedule.nthWeek);
        const nthDate = getNthWeekdayOfMonth(tomorrow.getFullYear(), tomorrow.getMonth(), targetDay, nthWeek);

        return nthDate && nthDate.getDate() === tomorrow.getDate();
    }

    return false;
}

function showNotification(garbageNames) {
    if (Notification.permission === 'granted') {
        const notification = new Notification('ゴミの日お知らせくん', {
            body: `${garbageNames.join(', ')} を出してください！`,
            icon: 'icon-192.png',
            badge: 'icon-192.png',
            vibrate: [200, 100, 200]
        });
    }
}

function resetAllSettings() {
    if (confirm('すべての設定をリセットしますか？\nこの操作は取り消せません。')) {
        localStorage.removeItem('garbageSettings');

        const garbageSettings = document.getElementById('garbageSettings');
        garbageSettings.innerHTML = `
            <div class="garbage-item" data-garbage-id="0">
                <h3>ゴミ設定</h3>
                <input type="text" class="garbage-name" placeholder="ゴミ名（例：燃えるゴミ）" value="">

                <div class="schedule-settings" data-garbage-id="0">
                    <div class="schedule-item" data-schedule-id="0">
                        <select class="frequency-type">
                            <option value="every">毎週</option>
                            <option value="nth">第n</option>
                        </select>

                        <select class="nth-week" style="display:none;">
                            <option value="1">第1</option>
                            <option value="2">第2</option>
                            <option value="3">第3</option>
                            <option value="4">第4</option>
                            <option value="5">第5</option>
                        </select>

                        <select class="day-of-week">
                            <option value="0">日曜日</option>
                            <option value="1">月曜日</option>
                            <option value="2">火曜日</option>
                            <option value="3">水曜日</option>
                            <option value="4">木曜日</option>
                            <option value="5">金曜日</option>
                            <option value="6">土曜日</option>
                        </select>

                        <button class="remove-schedule" style="display:none;">✕</button>
                    </div>
                </div>

                <button class="add-schedule" data-garbage-id="0">+ 曜日を追加</button>
                <button class="remove-garbage" style="display:none;">ゴミ設定を削除</button>
            </div>
        `;

        document.getElementById('notificationTime').value = '07:30';
        document.getElementById('nextGarbageDay').textContent = '';

        garbageCounter = 1;
        scheduleCounters = {};

        alert('設定をリセットしました');
    }
}