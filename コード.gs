const scriptProperties = PropertiesService.getScriptProperties();
const botTokenKey = "Bot_User_OAuth_Token";
const pdfUrlKey = "PDF_URL";

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
  const prevPdfUrl = scriptProperties.getProperty(pdfUrlKey);
  const nowPdfUrl = "aaaa" // スクレイピング

  if(prevPdfUrl === nowPdfUrl){
    console.log("バスの時刻表に変更はありませんでした");
    return;
  }

  scriptProperties.setProperty(pdfUrlKey, nowPdfUrl);
  console.log("バスの時刻表に変更がありました");
  console.log("SlackBotでURLを送信します");
  doPost();
}