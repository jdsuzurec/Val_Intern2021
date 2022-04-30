// 各店舗から最寄駅までの所要時間
var Time_ShopForNearestStation = [];
// 指定駅からの店舗までの所要時間を含めた店舗情報配列
var new_places = JSON.parse(JSON.stringify(places));
// 指定駅から各店舗までの所要時間
var final_time = [];
var time=[];
// 現在表示している店舗情報配列
var display_places = [];
//絞り込みの要素
var narrow = [];
// 現在表示されている店舗情報配列
var display_places = [];


// windowを開いた時の処理
document.addEventListener('DOMContentLoaded', async function (){
  // 各店舗から最寄駅までの所要時間を配列に格納
  for(var i in places){
    time[i] = await returnTime_StationToShop(new_places[i]['lat'], new_places[i]['lng']);
    new_places[i]['time'] = time[i];
  }
  for(var i in places){
    Time_ShopForNearestStation.push(await returnTime_StationToShop(places[i]['lat'], places[i]['lng']));
  }
  await Display_Station_Uni();
});


// 「出発駅から検索」の検索ボタンを押されたときの処理
// 「絞り込み」ボタンが押されたときの処理
async function Search_Shop_From_Station(event){
  // 入力された駅名を取得
  var stationName = document.getElementById('station').value;
  // 並び替えドロップダウンリストの値を取得
  var sort_select = document.getElementById('sort').value;

  var par = document.getElementsByName('par');
  var dis = document.getElementsByName('dis');
  var time = document.getElementsByName('time');
  var num = document.getElementsByName('num'); 
  new_places = places; //new_placesを初期化

  narrow.splice(0);
  for(var i in par){
    if(par[i].checked == true)narrow.push(par[i].value);
  }
  for(var i in dis){
    if(dis[i].checked == true)narrow.push(dis[i].value);
  }
  for(var i in time){
    if(time[i].checked == true)narrow.push(time[i].value);
  }
  for(var i in num){
    if(num[i].checked == true)narrow.push(num[i].value);
  }
  final_time.splice(0);
  new_places = JSON.parse(JSON.stringify(places));
  if(!stationName == ""){
    // 指定駅から各店舗までの所要時間を取得
    final_time = await Time_InputStationToShop(stationName);
    for(var i in places){
      // 配列名['key'] = 値;  //連想配列に要素を追加
      new_places[i]['final_time']= final_time[i];
    }
    if(sort_select == 'nothing'){//並び替えドロップダウンリストの値が「指定なし」のとき
      // 全ての店舗情報(new_places)を表示する
      await  Display_user_Station_sortTime(stationName);
    }else if(sort_select == 'time'){//所要時間順が選択されている時
      // ここに所要時間順の検索結果を表示する処理を書く    
      Sort_final_time();
      await Display_user_Station_sortTime(stationName);
    }else if(sort_select == 'inf'){
      // 並び替えドロップダウンリストの値が「感染対策順」のとき
      Sort_inf();
      await Display_user_Station_sortTime(stationName);
    }
  }else{
    if(sort_select == 'nothing'){//並び替えドロップダウンリストの値が「指定なし」のとき
      // 全ての店舗情報(new_places)を表示する
      await Display_user_Station_sortTime(stationName);
    }else if(sort_select == 'time'){//所要時間順が選択されている時
      // ここに所要時間順の検索結果を表示する処理を書く    
      // for(var i in places){
      //   // 配列名['key'] = 値;  //連想配列に要素を追加
      //   new_places[i]['final_time']= final_time[i];
      // }
      Sort_time();
      await Display_user_Station_sortTime(stationName);
    }else if(sort_select == 'inf'){
      // 並び替えドロップダウンリストの値が「感染対策順」のとき
      Sort_inf();
      await Display_user_Station_sortTime(stationName);
    }
  }
  //console.log('narrow',narrow);
}


async function Display_user_Station_sortTime(stationName){
  var txt = '';
  for(var i = 0; i < new_places.length; i++){
    if(narrow[0]=='yes' && new_places[i]['partition'] == 'なし'){
      continue;
    }else if(narrow[0]=='no' && new_places[i]['partition'] == 'あり'){
      continue;
    }else if(narrow[1]=='yes' && new_places[i]['seat_distance'] == 0){
      continue;
    }else if(narrow[1]=='no' && new_places[i]['seat_distance'] != 0){
      continue;
    }else if(narrow[2]=='yes' && new_places[i]['time_limit'] == 0){
      continue;
    }else if(narrow[2]=='no' && new_places[i]['time_limit'] != 0){
      continue;
    }else if(narrow[3]=='yes' && new_places[i]['limit_num_people'] == 0){
      continue;
    }else if(narrow[3]=='no' && new_places[i]['limit_num_people'] != 0){
      continue;
    }
    var nearsetStation = await searchNearestStationName(new_places[i]['lat'], new_places[i]['lng']);  
    var time_StationToShop = await returnTime_StationToShop(new_places[i]['lat'], new_places[i]['lng']);
    if(new_places[i]['time_limit'] == 0){//時間制限なしの表現
      var timelimit_txt = 'なし';
    }else{
      var timelimit_txt = new_places[i]['time_limit'] + '分';
    }
    if(new_places[i]['limit_num_people'] == 0){//人数制限なしの表現
      var limit_num_pepole_txt = 'なし';
    }else{
      var limit_num_pepole_txt = new_places[i]['limit_num_people'] + '人';
    }
    txt += '<li><span class="text2 w8">'+new_places[i]['name'] + '</span><ul>';

    if(stationName != null && final_time[i] != null){
      txt += '<li class="red"><b class="w8">'+stationName+'</b>駅からの所要時間：'+ new_places[i]['final_time'] + '分</li>';
  }
    
    txt += '<li class="text3">ジャンル：' + new_places[i]['kind'] +
    '</li><li class="text3">メイン料理：' + new_places[i]['main_dish']+ '</li><li class="text3">最大人数：' + 
    new_places[i]['max_num_people'] + '人</li><li class="text3">パーティション：' + new_places[i]['partition'] +
      '</li><li class="text3">テイクアウト：' + new_places[i]['takeout'] + '</li><li class="text3">座席間隔：' + new_places[i]['seat_distance'] +
      'm</li><li class="text3">時間制限：' + timelimit_txt + '</li><li class="text3">人数制限：' +
        limit_num_pepole_txt + '</li><li class="text3">予算：' + new_places[i]['price'] +
        '円</li><li class="text3">最寄駅：'+ nearsetStation + '</li>' +
        '<li class="text3">駅からの所要時間：'+ time_StationToShop + '分</li>';

    txt += '</ul></li><br>';
  }

  var name_id = document.getElementById('name');
  name_id.innerHTML = txt;
}

//緯度経度から最寄駅情報を返す
async function searchNearestStationName(position_y, position_x){
  var url = config.ekispert.url + '/v1/json/geo/station';
  var params = {
    key: config.ekispert.key,
    geoPoint: position_y+','+position_x,
    type: 'train'
  };
  var response = await axios.get(url, { params: params });
  // console.log('最寄駅：'+response.data.ResultSet.Point.Station.Name);
  return response.data.ResultSet.Point.Station.Name; //[object Promise]
}

// 最寄駅から店舗までの時間を返す関数
async function returnTime_StationToShop(position_y, position_x){
  var url = config.ekispert.url + '/v1/json/geo/station';
  var params = {
    key: config.ekispert.key,
    geoPoint: position_y+','+position_x,
    type: 'train'
  };
  var response = await axios.get(url, { params: params });
  // console.log(response.data.ResultSet.Point.Distance);//距離
  var time = response.data.ResultSet.Point.Distance/80;//時間(分) = 距離(m)/分速(m/s)
  return Math.round(time);//四捨五入して返す
}

// 入力された駅から各店舗への所要時間の配列を返す
async function Time_InputStationToShop(stationName){
  var finalTime = [];
  for(var i in places){
    // 駅から駅までの平均所要時間+最寄から店までの所要時間 を返す
    var nearestStationName = await searchNearestStationName(places[i]['lat'], places[i]['lng']);
    if(stationName == nearestStationName){
      // 出発駅と最寄駅が同じだった場合は
      finalTime.push(Time_ShopForNearestStation[i]);
    }else{
      finalTime.push(Time_ShopForNearestStation[i] + await returnTime_StationToStation(stationName,nearestStationName));
    }
  }
  // console.log(finalTime);
  return finalTime;  //出発駅から各店舗への平均所要時間を格納した配列
}

// 駅から駅までの平均所要時間を返す
async function returnTime_StationToStation(stationName,nearestStation){
  // まずは入力された駅名の駅コードを取得する
  var url = config.ekispert.url + '/v1/json/search/course/extreme';
  var params = {
    key: config.ekispert.key,
    viaList: stationName+':'+nearestStation
  };
  var response = await axios.get(url, { params: params });
  // console.log('所要時間',response.data.ResultSet);

  var time = 0;
  for(const item in response.data.ResultSet.Course){
    // Number(数値)で数値に型変換
    time = time + Number(response.data.ResultSet.Course[item].Route.timeOnBoard);
  }

  // http://api.ekispert.jp/v1/json/search/course/extreme?key=8KDjqPaVCcSmZUNz&viaList=麹町:東京

  return Math.round(time/Object.keys(response.data.ResultSet.Course).length);//駅から駅の平均所要時間
  // Object.keys(連想配列の名前).length;
}

function Sort_final_time(){
  new_places.sort(function(a,b){
      if(a.final_time<b.final_time) return -1;
      if(a.final_time>b.final_time) return 1;
      return 0;
  });
}

function Sort_time(){
  new_places.sort(function(a,b){
      if(a.time<b.time) return -1;
      if(a.time>b.time) return 1;
      return 0;
  });
}

// 大学の周辺駅を返す
async function Search_Station_Uni(position_y,position_x){
  var url = config.ekispert.url + '/v1/json/geo/station';
  var params = {
    key: config.ekispert.key,
    geoPoint: position_y+','+position_x + ',1000',
    type: 'train'
  };
  var response = await axios.get(url, { params: params });
  console.log('周辺駅',response.data.ResultSet);
  var nameList = [];
  for(var i in response.data.ResultSet.Point){
    nameList.push(response.data.ResultSet.Point[i].Station.Name);
  }
  // console.log('nameList',nameList);
  return nameList;
}


  async function Display_Station_Uni(){
    var nameList = await Search_Station_Uni(35.688306,139.738639);
    var name_id = document.getElementById('Station_Uni');
    var txt = '';
    txt += '<p class="text3">';
    for(var i = 0; i < nameList.length; i++){
      txt += '周辺駅' + Number(i+1) + '：' + nameList[i]+'&emsp;';
    }
    txt += '</p>';
    console.log('周辺駅',txt);
    name_id.innerHTML = txt;
  }



  function Sort_inf(){
    new_places.sort(function(a,b){
        if(a['partition']=='あり' && b['partition']=='なし') return -1;
        if(a['partition']=='なし' && b['partition']=='あり') return 1;
        if(a['seat_distance'] > b['seat_distance']) return -1;
        if(a['seat_distance'] < b['seat_distance']) return 1;
        if(a['time_limit'] < b['time_limit']) return -1;
        if(a['time_limit'] > b['time_limit']) return 1;
        if(a['limit_num_people'] < b['limit_num_people']) return -1;
        if(a['limit_num_people'] > b['limit_num_people']) return 1;
        return 0;
    });
  }


