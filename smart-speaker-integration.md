# スマートスピーカー連携ガイド（カレンダー不要版）

Googleカレンダーを使わずに、AlexaやGoogle Nest Hubでゴミの日を通知する方法をご紹介します。

## 🔔 Alexa向けソリューション

### 1. Alexaの定型アクション（最も簡単）
Alexaアプリで直接設定できる方法です。

#### 設定手順
1. **Alexaアプリを開く**
2. **「その他」→「定型アクション」→「＋」**
3. **実行条件を設定**
   - 「時刻」を選択
   - 例：毎週月曜日 朝7:30（燃えるゴミの日）
4. **アクションを追加**
   - 「Alexaのおしゃべり」を選択
   - カスタムメッセージ：「今日は燃えるゴミの日です。ゴミを出してください」
5. **実行デバイスを選択**

#### メリット
- ✅ 設定が超簡単
- ✅ カレンダー不要
- ✅ 曜日ごとに異なるゴミの通知を設定可能
- ✅ 無料

### 2. Alexaリマインダー
より柔軟な設定が可能です。

```
「アレクサ、毎週月曜日の朝7時半に燃えるゴミを出すことをリマインドして」
```

音声コマンドで簡単に設定できます。

## 🏠 Google Nest Hub向けソリューション

### 1. Google Homeルーティン（カレンダー不要版）
Google Homeアプリで直接設定する方法。

#### 設定手順
1. **Google Homeアプリを開く**
2. **「ルーティン」→「＋」で新規作成**
3. **開始条件**
   - 「時刻と曜日」を選択
   - 例：毎週月曜日・木曜日 7:30
4. **アクション**
   - 「カスタムメッセージを再生」
   - 「今日は燃えるゴミの日です。ゴミを出してください」
5. **実行デバイス：Google Nest Hub**

## 🔗 IFTTT連携（両方対応）

### IFTTTを使った自動化
Webアプリから直接通知を送る方法。

#### 必要なもの
- IFTTTアカウント（無料プランは月3アプレット）
- IFTTT Pro（月額約$5）なら無制限

#### Alexa用の設定
1. **IFTTTでアプレット作成**
2. **If This**: Date & Time - Every day at（時刻指定）
3. **Then That**: Alexa - Say a specific phrase
4. **設定内容**：
   - What phrase?: 「今日は{ゴミの種類}の日です」
   - Which device?: 使用するEchoデバイス

#### Google Assistant用の設定
1. **If This**: Date & Time
2. **Then That**: Google Assistant - Say a simple phrase
3. **フレーズ**: 「ゴミの日のお知らせです。{ゴミの種類}を出してください」

## 💡 Webアプリへの実装案

### 音声コマンド生成機能
設定を簡単にするため、音声コマンドを生成する機能を追加：

```javascript
function generateAlexaCommand() {
    const commands = [];
    const settings = JSON.parse(localStorage.getItem('garbageSettings'));

    settings.garbageItems.forEach(item => {
        item.schedules.forEach(schedule => {
            const dayName = ['日', '月', '火', '水', '木', '金', '土'][schedule.dayOfWeek];
            if (schedule.frequencyType === 'every') {
                commands.push(
                    `「アレクサ、毎週${dayName}曜日の朝7時半に${item.name}を出すことをリマインドして」`
                );
            }
        });
    });

    return commands;
}
```

### UIに追加するセクション
```html
<div class="voice-assistant-section">
    <h3>🔊 スマートスピーカー設定</h3>

    <div class="alexa-commands">
        <h4>Alexa用コマンド</h4>
        <div id="alexaCommandList"></div>
        <button onclick="copyAlexaCommands()">コマンドをコピー</button>
    </div>

    <div class="routine-guide">
        <h4>定型アクション設定ガイド</h4>
        <ol>
            <li>Alexaアプリを開く</li>
            <li>「その他」→「定型アクション」</li>
            <li>上記の曜日・時刻で設定</li>
        </ol>
    </div>
</div>
```

## 📊 各方法の比較

| 方法 | Alexa対応 | Google対応 | 設定の簡単さ | 柔軟性 | 無料 |
|------|-----------|------------|--------------|--------|------|
| Alexa定型アクション | ✅ | ❌ | ⭐⭐⭐ | ⭐⭐ | ✅ |
| Googleルーティン | ❌ | ✅ | ⭐⭐⭐ | ⭐⭐ | ✅ |
| IFTTT | ✅ | ✅ | ⭐⭐ | ⭐⭐⭐ | △ |
| 音声リマインダー | ✅ | ✅ | ⭐⭐⭐ | ⭐ | ✅ |

## 🎯 おすすめの設定方法

### Alexaをお持ちの場合
1. **定型アクション**で曜日ごとに設定（最も確実）
2. 複数のゴミがある日は複数のアクションを設定
3. 前夜のリマインダーも追加可能

### Google Nest Hubの場合
1. **Google Homeルーティン**で曜日ごとに設定
2. カスタムメッセージで具体的な内容を設定

### 両方使いたい場合
- IFTTT Pro（有料）を検討
- または各アプリで個別に設定

## 💬 設定例

### 月曜日・木曜日：燃えるゴミ
**Alexa定型アクション**
- 実行条件：月曜日 7:30、木曜日 7:30
- アクション：「今日は燃えるゴミの日です。ゴミを出してください」

### 第2・第4火曜日：資源ゴミ
**Alexa定型アクション**
- 実行条件：火曜日 7:30
- アクション：「今日は資源ゴミの日かもしれません。第2・第4火曜日です」
- ※月の第n週の判定は手動確認が必要

## 🚀 実装の優先順位

1. ✅ 音声コマンド生成機能（コピペで設定可能に）
2. ✅ 設定ガイドをアプリ内に表示
3. ⬜ IFTTT Webhook連携（上級者向け）
4. ⬜ スマートホームAPI直接連携（将来的に）