# スマートスピーカー連携ガイド（Google Nest Hub / Alexa）

Google Nest HubやAlexaにゴミの日を音声で通知させる方法について説明します。

## 📱 カレンダーを使わない方法

### 1. IFTTT + Webhooks（推奨・カレンダー不要）
IFTTTを使ってWebアプリから直接スマートスピーカーに通知を送る方法。

#### 設定手順
1. **Googleカレンダーの作成**
   - ゴミの日専用のGoogleカレンダーを作成
   - このWebアプリから「Googleカレンダーに追加」ボタンでイベントを追加

2. **Google Homeアプリでルーティンを設定**
   - Google Homeアプリを開く
   - 「ルーティン」→「＋」で新規ルーティンを作成
   - 開始条件：時刻（例：朝7:30）
   - アクション：
     - 「カスタムメッセージを再生」
     - または「今日の予定を教えて」（カレンダーの予定を読み上げ）
   - 実行デバイス：Google Nest Hub Max

### 2. IFTTT連携
IFTTTのWebhooksとGoogle Assistantを連携させる方法。

#### 必要なもの
- IFTTTアカウント（無料プランでは月3つまでのアプレット）
- Google Assistantとの連携設定

#### 設定手順
1. IFTTTでアプレットを作成
2. If This: Webhooks（特定のURLへのリクエスト）
3. Then That: Google Assistant - Say a phrase

### 3. Google Apps Script + Google Calendar
自動化をより細かく制御したい場合。

#### 実装内容
```javascript
function createGarbageEvent() {
  const calendar = CalendarApp.getDefaultCalendar();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // ローカルストレージのデータを元にイベントを作成
  const event = calendar.createEvent(
    'ゴミの日: 燃えるゴミ',
    tomorrow,
    tomorrow,
    {
      description: '燃えるゴミを出してください',
      reminders: {
        useDefault: false,
        overrides: [
          {method: 'popup', minutes: 0}
        ]
      }
    }
  );
}
```

## Webアプリへの実装

### HTMLに追加するボタン
```html
<button id="addToGoogleCalendar" class="google-calendar-button">
  📅 Googleカレンダーに追加
</button>
```

### JavaScriptの実装
```javascript
function generateGoogleCalendarUrl(garbageName, date) {
  const startDate = date.toISOString().replace(/-|:|\.\d{3}/g, '');
  const endDate = new Date(date.getTime() + 60 * 60 * 1000)
    .toISOString().replace(/-|:|\.\d{3}/g, '');

  const details = `${garbageName}を出す日です`;
  const title = `ゴミの日: ${garbageName}`;

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.append('action', 'TEMPLATE');
  url.searchParams.append('text', title);
  url.searchParams.append('dates', `${startDate}/${endDate}`);
  url.searchParams.append('details', details);

  return url.toString();
}

document.getElementById('addToGoogleCalendar').addEventListener('click', function() {
  const nextGarbageInfo = getNextGarbageInfo(); // 次のゴミの日情報を取得
  if (nextGarbageInfo) {
    const url = generateGoogleCalendarUrl(
      nextGarbageInfo.names.join(', '),
      nextGarbageInfo.date
    );
    window.open(url, '_blank');
  }
});
```

## Google Nest Hubでの通知設定

### ルーティンの詳細設定
1. **朝のルーティン**
   - 時刻: 7:30
   - アクション:
     1. 「おはようございます」
     2. 「今日の予定を教えて」（カレンダーから読み上げ）
     3. 「今日は{ゴミの名前}の日です」（カスタムメッセージ）

2. **前夜のリマインダー**
   - 時刻: 21:00
   - アクション: 「明日は{ゴミの名前}の日です。準備をお忘れなく」

## メリット・デメリット

### Googleカレンダー方式
**メリット**
- 設定が簡単
- 無料で利用可能
- スマホとも同期される
- Google Nest Hubのルーティンと相性が良い

**デメリット**
- 手動でカレンダーに追加する必要がある
- 変更があった場合は手動で更新が必要

### IFTTT方式
**メリット**
- 自動化が可能
- カスタマイズ性が高い

**デメリット**
- 無料プランの制限あり
- 設定がやや複雑

## 推奨する実装方法

1. **第一段階**: Googleカレンダー追加ボタンの実装
   - 最も簡単で、すぐに使える
   - ユーザーが自分のカレンダーに追加できる

2. **第二段階**: Google Apps Scriptでの自動化（オプション）
   - より高度な自動化が必要な場合

3. **第三段階**: API連携（将来的な拡張）
   - Google Calendar APIを使用した本格的な連携

## 実装の優先順位

1. ✅ Googleカレンダー追加ボタンをUIに追加
2. ✅ カレンダーURL生成機能の実装
3. ✅ 複数のゴミの日に対応
4. ⬜ 定期的なイベントの自動生成（オプション）
5. ⬜ Google Apps Scriptテンプレートの提供（オプション）