const scriptProperties = PropertiesService.getScriptProperties();
const botTokenKey = "Bot_User_OAuth_Token";
const pdfUrlKey = "PDF_URL";
const accountIdKey = "ACCOUNT_ID"
const channelId = "#bus-time";


const checkBusTableUpdates = () => {
  const prevPdfUrl = scriptProperties.getProperty(pdfUrlKey); // 過去のURL
  const nowPdfUrl = fetchBusTimePdfUrl();                     // 現在のURL

  // URLに変更がなければ、何もせず終了
  if(prevPdfUrl === nowPdfUrl){
    console.log("バスの時刻表に変更はありませんでした");
    return;
  }

  // URLに変更があれば、ScriptPropertiesを更新する
  scriptProperties.setProperty(pdfUrlKey, nowPdfUrl);

  console.log("バスの時刻表に変更がありました");
  console.log("SlackBotでURLを送信します");

  // slackbotでpdfを送信する
  doPost();
}

const doPost = () => {
  // slackbotのトークン
  const slack_token = scriptProperties.getProperty(botTokenKey);
  const slackBot = SlackApp.create(slack_token);
  
  const accountId = scriptProperties.getProperty(accountIdKey)
  const accountMention = "<" + accountId + ">"

  // メッセージの送信
  const message = accountMention + "\n最新のバス時刻表だよ！！";
  slackBot.chatPostMessage(channelId, message);

  // pdfを取得する
  const pdfPath = scriptProperties.getProperty(pdfUrlKey)
  const pdfBlob = UrlFetchApp.fetch(pdfPath).getBlob()

  // ファイル名用の現在時刻を取得する
  const date = getDateFileName();

  // ファイル名とチャンネルの指定
  const options = {
    filename: date + ".pdf",
    channels: channelId
  }

  // pdfファイルをアップロード
  const result = slackBot.filesUpload(pdfBlob, options);
  Logger.log(result)
}


const fetchBusTimePdfUrl = () => {
  // 大学HPからHttpResponseを取得
  const response = UrlFetchApp.fetch("https://www.chitose.ac.jp/info/access");
  const htmlText = response.getContentText("utf-8");
  
  // HttpResponseからバスの時刻表のpdfのpathを取得
  const busElement = Parser.data(htmlText).from('class="element_grp_link">').to('</a>').build();
  const path = Parser.data(busElement).from('<a href="').to('" target="_blank">').build()

  // ドメインにpathを結合
  const url = "https://www.chitose.ac.jp" + path;

  return url;
}

const getDateFileName = () => {
  const date = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).split("/").join("-");

  return date;
}