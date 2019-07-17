import AWS = require("aws-sdk");

const s3 = new AWS.S3();
const settingBucket = process.env.SETTING_BUCKET!;
const settingFile = process.env.SETTING_FILE!;


exports.handler = async (event: any) => {
  console.log(JSON.stringify(event));
    // オペレーション時間の取得
    const data = await s3.getObject( {
            Bucket: settingBucket,
            Key: settingFile
        }).promise();
    
    if (data == undefined || data.Body == undefined) {
        throw new Error("Read error " + settingFile);
    }
    const operationTime = data.Body.toString();
    var lines = operationTime.split('\n');
   
    // コメント削除及び、余分な空白削除
    lines = lines.map( line => {
      return line.replace(/#.*$/, '').replace(/\s+$/, '');
    });
    // 無効（空白）行の削除
    lines = lines.filter( line => {
      return line != '';
    });
   
    // 時間内かどうかのチェック
    const inTime = CheckInTime(lines);
   
    return { inTime: inTime };
  }
   
  function CheckInTime(lines: string[]) {
    // 現在時間
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const week = now.getDay();
    const hour = now.getHours();
    const miniute = now.getMinutes();
   
    var weekdays = ["日", "月", "火", "水", "木", "金", "土"];
   
    // 曜日指定の抽出
    const weeks = lines.filter(line => {
      return 0 < weekdays.indexOf(line.split(',')[0]);
    });
   
    // 祝日指定の抽出
    // (1) yyyy/mm/dd指定抽出
    let holidays = lines.filter(line => {
      return line.split(',')[0].split('/').length == 3;
    });
    // (2) mm/dd指定抽出
    holidays = holidays.concat(lines.filter(line => {
      return line.split(',')[0].split('/').length == 2;
    }).map(date => { return year + '/' + date }));

   
    // 曜日チェック
    let flg = false; // デフォルトで時間外（設定がない場合時間外となるため）
    weeks.forEach( line => {
      const tmp = line.split(',');
      const w = weekdays.indexOf(tmp[0]);
      if(week == w) { // 当該曜日の設定
        // 始業時間以降かどうかのチェック
        let t = tmp[1].split(':');
        if(t.length == 2) {
          if( Number(t[0]) * 60 + Number(t[1]) <= (hour * 60 + miniute )){
            // 終業時間前かどうかのチェック
            t = tmp[2].split(':');
            if(t.length == 2) {
              if((hour * 60 + miniute ) <= (Number(t[0]) * 60 + Number(t[1]))){
                flg = true;
              }
            }
          }
        }
      }
    });
   
    // 曜日指定で時間外の場合は、祝日に関係なく時間外となる
    if(!flg){
      return false;
    }
   
    // 祝日のチェック
    flg = true; // デフォルトで時間内（設定がない場合時間内となるため）
    holidays.forEach( line => {
      const date = line.split('/');
      if(date.length == 3){
        if(year == Number(date[0]) && month == Number(date[1]) && day == Number(date[2])) {
          flg = false;
        }
      }
    })
    return flg;
}

