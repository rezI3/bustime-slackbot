const scriptProperties = PropertiesService.getScriptProperties();
const botTokenKey = "Bot_User_OAuth_Token";
const pdfUrlKey = "PDF_URL";

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

  // slackbotで送信する機能
  doPost();
}

const doPost = () => {
  // slackbotのトークン
  const slack_token = scriptProperties.getProperty(botTokenKey);
  const slackBot = SlackApp.create(slack_token);

  const channelId = "#bus-time";

  // メッセージの送信テスト
  const message = "バスの時刻表に変化があったよ！\n" + scriptProperties.getProperty("PDF_URL")
  slackBot.chatPostMessage(channelId, message);

  // pdfをdriveから取得して、slackbotから送信(うまくいかない)
  // const pdf = DriveApp.getFilesByName("R5年度シャトルバス時刻表春学期_0410-0414.pdf");
  // slackBot.filesUpload(pdfBlob)
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