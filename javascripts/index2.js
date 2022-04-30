// 指定駅からの店舗までの所要時間を含めた店舗情報配列
var places2 = JSON.parse(JSON.stringify(places));//配列をディープコピー
// 現在表示している店舗情報配列(検索後に並び替えボタン押された時に使う)(並び替えられていない)
var display_places = [];
// 検索に使われた駅名
var search_stationName = "";
// ジャンル、メイン料理配列
var kinds = [];
var mains = [];
// 大学の周辺駅
var uniStations = [];

// ジャンルを配列に格納してドロップダウンメニューに追加
for(var i in places){
    kinds.push(places[i]['kind']);
}
kinds = Array.from(new Set(kinds));//重複を除く
var kind_menu = document.getElementById('kind-doropdown-menu');
var txt = '';
for(var i in kinds){
    txt += '<a class="dropdown-item text4 kind-type-item">'+ kinds[i] + '</a>';
}
kind_menu.innerHTML = txt;

// メイン料理を配列に格納してドロップダウンメニューに追加
for(var i in places){
    mains.push(places[i]['main_dish']);
}
mains = Array.from(new Set(mains));//重複を除く
var main_menu = document.getElementById('main-doropdown-menu');
var txt = '';
for(var i in mains){
    txt += '<a class="dropdown-item text4 main-type-item">'+ mains[i] + '</a>';
}
main_menu.innerHTML = txt;


// windowを開いた時の処理
document.addEventListener('DOMContentLoaded', async function (){
    //各店舗の「最寄駅」と「最寄駅から店舗までの所要時間」をそれぞれ追加した新たなplaces2を作成
    // ジャンルを配列に格納
    for(var i in places){
        places2[i]['nearest_station'] = await returnNearestStationName(places[i]['lat'], places[i]['lng']);
        places2[i]['time_station_to_shop'] = await returnTime_StationToShop(places[i]['lat'], places[i]['lng']);
    }
    //大学の周辺駅を表示
    await display_stations_uni(35.688306,139.738639);
});


// 「出発駅から検索」の検索ボタンを押されたときの処理
async function Search_Shop_From_Station(event){
    // 入力された駅名を取得
    var startStation = document.getElementById('start-station1').value;
    search_stationName = startStation;
    // 並び替えドロップダウンリストの値を取得
    var sort_select = document.getElementById('sort-type').textContent;
    // 詳細設定ドロップダウンリストの値を取得
    var types = [];
    var par_type = document.getElementById('par-type').textContent;
    types.push(par_type);
    var dis_type = document.getElementById('dis-type').textContent;
    types.push(dis_type);
    var time_type = document.getElementById('time-type').textContent;
    types.push(time_type);
    var num_type = document.getElementById('num-type').textContent;
    types.push(num_type);
    var bud_type = document.getElementById('budget-type').textContent;
    types.push(bud_type);
    var kind_type = document.getElementById('kind-type').textContent;
    types.push(kind_type);
    var trans_type = document.getElementById('trans-type').textContent;
    types.push(trans_type);
    var main_type = document.getElementById('main-type').textContent;
    types.push(main_type);
    // console.log(types);

    if(document.getElementById('check-from-univ').checked){
        // 大学から行くチェックボックスにチェックが入っていた時の処理

        // 大学最寄駅から各店舗までの所要時間を含む連想配列を取得
        var array = await returnPlace_StartStation(uniStations[0]);
        // 大学から大学最寄駅までの所要時間を取得
        var time_uniToStation = await returnTime_StationToShop(35.688306,139.738639);
        for(var i in array){
            array[i]['time_startStation_to_shop'] += time_uniToStation;
        }

        // 詳細設定でarrayの配列要素を絞り込む
        console.log('詳細設定前',array);
        array = returnPlaces_select_detail(array,types);
        console.log('詳細設定後',array);

        //表示処理
        switch(sort_select){//並び替え指定
            case '順番指定なし':
                display(array,'大学');//そのまま表示
            break;
                
            case '総所要時間が短い順':
                display(returnPlace_sort_time(array),'大学');
            break;

            case '感染対策順':
                display(returnPlace_sort_inf(array),'大学');
            break;
        }
    }else if(startStation == '' || startStation == null){
        //テキストボックスが空のときの処理
        // 詳細設定によって絞り込む
        var array = JSON.parse(JSON.stringify(places2));
        console.log('詳細設定前',array);
        array = returnPlaces_select_detail(array,types);
        console.log('詳細設定後',array);

        //表示処理
        switch(sort_select){//並び替え指定
            case '順番指定なし':
                display((array),null);
            break;

            case '総所要時間が短い順':
                var sortList =JSON.parse(JSON.stringify(array));
                display(returnPlace_sort_time(sortList),null);
            break;

            case '感染対策順':
                var sortList =JSON.parse(JSON.stringify(array));
                display(returnPlace_sort_inf(sortList),null);
            break;
        }
    }else{
        // テキストボックスに駅名が入力されていた場合の処理
        
        // 出発駅から各店舗までの所要時間を含む連想配列を取得
        var array = await returnPlace_StartStation(startStation);
        // 詳細設定でarrayの配列要素を絞り込む
        console.log('詳細設定前',array);
        array = returnPlaces_select_detail(array,types);
        console.log('詳細設定後',array);

        //表示処理
        switch(sort_select){//並び替え指定
            case '順番指定なし':
                display(array,startStation);//そのまま表示
            break;
                
            case '総所要時間が短い順':
                display(returnPlace_sort_time(array),startStation);
            break;

            case '感染対策順':
                display(returnPlace_sort_inf(array),startStation);
            break;
        }
    }
}

// 検索結果が表示されている かつ 並び替え が選択されたときの処理
async function Sort_Places(event){
    if(display_places.length == 0)return;
    // 並び替えドロップダウンリストの値を取得
    var sort_select = document.getElementById('sort-type').textContent;
    var sortList = JSON.parse(JSON.stringify(display_places));

    //表示処理
    switch(sort_select){//並び替え指定
        case '順番指定なし':
            display(sortList,search_stationName);//そのまま表示
        break;
                
        case '総所要時間が短い順':
            display(returnPlace_sort_time(sortList),search_stationName);
        break;

        case '感染対策順':
            display(returnPlace_sort_inf(sortList),search_stationName);

        break;

    }

}

// 「表示する店舗情報の配列(連想配列)」を受け取ってhtmlに反映する
function display(array,startStation){
    // 現在表示されている店舗情報を空にしてから登録し直す
    display_places.splice(0);
    display_places = JSON.parse(JSON.stringify(array));
    console.log('display_places',display_places);

    var search_num = document.getElementById('search_num');
    search_num.textContent = '検索結果('+ display_places.length + '件)';

    var txt = '';
    for(var i = 0; i < array.length; i++){
        txt += '<div class="card outline-red radius mg-b-12">';
            txt += '<div class="background-red radius-top-right raidus-top-left">';
                if(startStation == null || !('time_startStation_to_shop' in array[i])){
                    txt += '<div class="heading3 white pd-card"></div>';
                }else if(startStation == '大学'){
                    txt += '<div class="heading3 white pd-card">'+startStation + 'から約'+array[i]['time_startStation_to_shop'] + '分</div>';
                }
                else{
                    txt += '<div class="heading3 white pd-card">'+startStation + '駅から約'+array[i]['time_startStation_to_shop'] + '分</div>';
                }
            txt += '</div>';

            txt += '<div class="card-detail pd-card">';
                txt += '<div class="text4 gray">' + array[i]['kind'] + '・' + array[i]['main_dish'] + '</div>';
                txt += '<div class="heading2 w8 mg-tb--2">'+ array[i]['name']+ '</div>';
                txt += '<div class="row mg-rl-0 text3 mg-b-8">';
                    txt += '<div class="mg-r-8"><i class="icofont-train-line red"></i><span class="gray">'+ array[i]['nearest_station'] +'駅から徒歩'+ array[i]['time_station_to_shop'] + '分</span></div>'
                    txt += '<div class="mg-r-8"><i class="icofont-yen red"></i><span class="gray">'+ array[i]['price'] + '円前後</span></div>';
                    txt += '<div class="mg-r-8"><i class="icofont-people red"></i><span class="gray">最大' + array[i]['max_num_people'] + '人</span></div>';
                    txt += '<div class="mg-r-8"><i class="icofont-bag red"></i><span class="gray">' + array[i]['takeout'] + '</span></div>';
                    txt += '<div class="mg-r-8"><i class="icofont-phone red"></i><span class="gray">' + array[i]['tel'] + '</span></div>';
                txt += '</div>';
                txt += '<div id="" class="text3 primary mg-b-4">感染対策</div>';
                txt += '<div class="row mg-rl-0 text4">';
                    txt += '<div class="mg-r-8"><i class="icofont-speech-comments primary"></i><span>パーティション' + array[i]['partition'] + '</span></div>';
                    txt += '<div class="mg-r-8"><i class="icofont-chair primary"></i><span>座席間隔';
                        if(array[i]['seat_distance'] == 0){
                            txt += 'なし';
                        }else{
                            txt += array[i]['seat_distance'] + 'm';
                        }
                        txt += '</span></div>';
                    txt += '<div class="mg-r-8"><i class="icofont-clock-time primary"></i><span>';
                        if(array[i]['time_limit'] == 0){
                            txt += '時間制限なし';
                        }else{
                            txt += array[i]['time_limit'] + '分制限';
                        }
                        txt += '</span></div>';
                    txt += '<div class="mg-r-8"><i class="icofont-people primary"></i><span>';
                        if(array[i]['limit_num_people'] == 0){
                            txt += '人数制限なし';
                        }else{
                            txt += array[i]['limit_num_people'] + '人制限';
                        }
                        txt += '</span></div>';
                txt += '</div>';
            txt += '</div>';
        txt += '</div>';
    }
    var search_results = document.getElementById('search_results');
    search_results.innerHTML = txt;
}


// 指定駅(出発駅)から店舗までの所要時間を含む店舗情報の配列を返す
async function returnPlace_StartStation(startStation){
    var array = JSON.parse(JSON.stringify(places2));
    for(var i in array){
        if(startStation == array[i]['nearest_station']){//出発駅と最寄が同じなら 所要時間は 最寄りから店までの時間
            var time = array[i]['time_station_to_shop'];
        }else{
            // 所要時間は 出発駅から最寄までの平均時間 + 最寄りから店までの時間
            var time = await returnTime_StationToStation(startStation,array[i]['nearest_station']) + array[i]['time_station_to_shop'];
        }
        // 連想配列に新たに 出発駅から店舗までの所要時間 を加える
        array[i]['time_startStation_to_shop'] = time;
    }
    // console.log('array',array);
    // console.log('places2',places2);
    return array;
}

//緯度経度から最寄駅名を返す
async function returnNearestStationName(position_y, position_x){
  var url = config.ekispert.url + '/v1/json/geo/station';
  var params = {
    key: config.ekispert.key,
    geoPoint: position_y+','+position_x,
    type: 'train'
  };
  var response = await axios.get(url, { params: params });
  return response.data.ResultSet.Point.Station.Name;
}

// 駅から店までの所要時間を返す
async function returnTime_StationToShop(position_y, position_x){
  var url = config.ekispert.url + '/v1/json/geo/station';
  var params = {
    key: config.ekispert.key,
    geoPoint: position_y+','+position_x,
    type: 'train'
  };
  var response = await axios.get(url, { params: params });
  var time = response.data.ResultSet.Point.Distance/80;//時間(分) = 距離(m)/分速(m/s)
  return Math.round(time);//四捨五入して返す
}

// 駅から駅までの平均所要時間を返す
async function returnTime_StationToStation(stationName,nearestStation){
    // 名前から駅を検索して 店舗最寄駅からの平均所要時間を求める
  var url = config.ekispert.url + '/v1/json/search/course/extreme';
  var params = {
    key: config.ekispert.key,
    viaList: stationName+':'+nearestStation
  };
  var response = await axios.get(url, { params: params });

  var time = 0;
  for(const item in response.data.ResultSet.Course){
    // Number(数値)で数値に型変換
    time = time + Number(response.data.ResultSet.Course[item].Route.timeOnBoard);
  }
  return Math.round(time/Object.keys(response.data.ResultSet.Course).length);//駅から駅の平均所要時間
}

// 「表示する店舗情報の配列(連想配列)」を受け取り、所要時間順にソートして返す
function returnPlace_sort_time(array){
    if(array.length == 0)return;
    // '出発駅から店舗への所要時間'キーがある配列とない配列があるので場合分け
    if('time_startStation_to_shop' in array[0]){
        array.sort(function(a,b){
            if(a.time_startStation_to_shop < b.time_startStation_to_shop) return -1;
            if(a.time_startStation_to_shop > b.time_startStation_to_shop) return 1;
            return 0;
        });
    }else{
        array.sort(function(a,b){
            if(a.time_station_to_shop < b.time_station_to_shop) return -1;
            if(a.time_station_to_shop > b.time_station_to_shop) return 1;
            return 0;
        });
    }  
    return array;
}

//  「表示する店舗情報の配列(連想配列)」を受け取り、感染対策順にソートして返す
function returnPlace_sort_inf(array){
        array.sort(function(a,b){
            // パーティション、座席間隔、時間制限、人数制限、最大人数
            if(a.partition == 'あり' && b.partition == 'なし') return -1;
            if(a.partition == 'なし' && b.partition == 'あり') return 1;
            if(a.seat_distance > b.seat_distance) return -1;
            if(a.seat_distance < b.seat_distance) return 1;
            if(a.time_limit < b.time_limit) return -1;
            if(a.time_limit > b.time_limit) return 1;
            if(a.limit_num_people < b.limit_num_people) return -1;
            if(a.limit_num_people > b.limit_num_people) return 1;
            if(a.max_num_people < b.max_num_people) return -1;
            if(a.max_num_people > b.max_num_people) return 1;
            return 0;
        });
    return array;
}


// 詳細設定の配列を受け取り、絞り込みをして返す
function returnPlaces_select_detail(array,types){
    if(types[0] != '指定なし'){
        array = returnPlace_select_par(array,types[0]);
    }
    if(types[1] != '指定なし'){
        array = returnPlace_select_dis(array,types[1]);
    }
    if(types[2] != '指定なし'){
        array = returnPlace_select_time(array,types[2]);
    }
    if(types[3] != '指定なし'){
        array = returnPlace_select_num(array,types[3]);
    }
    if(types[4] != '指定なし'){
        array = returnPlace_select_bud(array,types[4]);
    }
    if(types[5] != '指定なし'){
        array = returnPlace_select_kind(array,types[5]);
    }
    if(types[6] != '指定なし' && search_stationName != ''){
        array = returnPlace_select_trans(array,types[6]);
    }
    if(types[7] != '指定なし'){
        array = returnPlace_select_main(array,types[7]);
    }
    return array;
}

// 「表示する店舗情報の配列(連想配列)」を受け取り、絞り込みをして返す
function returnPlace_select_par(array,type){
    var result = [];
    switch(type){
        case 'あり':
            for(var i in array){
                if(array[i]['partition'] == 'あり'){
                    result.push(array[i]);
                }
            }
        break;

        case 'なし':
            for(var i in array){
                if(array[i]['partition'] == 'なし'){
                    result.push(array[i]);
                }
            }
        break;
    }
    return result;
}

// 「表示する店舗情報の配列(連想配列)」を受け取り、絞り込みをして返す
function returnPlace_select_dis(array,type){
    var result = [];
    switch(type){
        case 'なし':
            for(var i in array){
                if(array[i]['seat_distance'] == 0){
                    result.push(array[i]);
                }
            }
        break;

        case 'あり':
            for(var i in array){
                if(0 < array[i]['seat_distance']){
                    result.push(array[i]);
                }
            }
        break;

        case '0.5m以下':
            for(var i in array){
                if(array[i]['seat_distance'] <= 0.5){
                    result.push(array[i]);
                }
            }
        break;

        case '0.6m以上':
            for(var i in array){
                if(0.6 <= array[i]['seat_distance']){
                    result.push(array[i]);
                }
            }
        break;
    }
    return result;
}

// 「表示する店舗情報の配列(連想配列)」を受け取り、絞り込みをして返す
function returnPlace_select_time(array,type){
    var result = [];
    switch(type){
        case 'なし':
            for(var i in array){
                if(array[i]['time_limit'] == 0){
                    result.push(array[i]);
                }
            }
        break;

        case 'あり':
            for(var i in array){
                if(0 < array[i]['time_limit']){
                    result.push(array[i]);
                }
            }
        break;

        case '60分以下':
            for(var i in array){
                if(array[i]['time_limit'] <= 60 && array[i]['time_limit'] != 0){
                    result.push(array[i]);
                }
            }
        break;

        case '61分以上':
            for(var i in array){
                if(61 <= array[i]['time_limit']){
                    result.push(array[i]);
                }
            }
        break;

    }
    return result;
}

// 「表示する店舗情報の配列(連想配列)」を受け取り、絞り込みをして返す
function returnPlace_select_num(array,type){
    var result = [];
    switch(type){
        case 'なし':
            for(var i in array){
                if(array[i]['limit_num_people'] == 0){
                    result.push(array[i]);
                }
            }
        break;

        case 'あり':
            for(var i in array){
                if(0 < array[i]['limit_num_people']){
                    result.push(array[i]);
                }
            }
        break;

        case '4人以下':
            for(var i in array){
                if(array[i]['limit_num_people'] <= 4 && array[i]['limit_num_people'] != 0){
                    result.push(array[i]);
                }
            }
        break;


    }
    return result;
}

// 「表示する店舗情報の配列(連想配列)」を受け取り、絞り込みをして返す
function returnPlace_select_bud(array,type){
    var result = [];
    switch(type){
        case '~1000円':
            for(var i in array){
                if(array[i]['price'] <= 1000){
                    result.push(array[i]);
                }
            }
        break;

        case '1001~2000円':
            for(var i in array){
                if(1001 <= array[i]['price'] && array[i]['price'] <= 2000){
                    result.push(array[i]);
                }
            }
        break;

        case '2001~3000円':
            for(var i in array){
                if(2001 <= array[i]['price'] && array[i]['price'] <= 3000){
                    result.push(array[i]);
                }
            }
        break;

        case  '3001~4000円':
            for(var i in array){
                if(3001 <= array[i]['price'] && array[i]['price'] <= 4000){
                    result.push(array[i]);
                }
            }
        break;

        case  '4001~円':
            for(var i in array){
                if(4001 <= array[i]['price']){
                    result.push(array[i]);
                }
            }
        break;
    }
    return result;
}

// 「表示する店舗情報の配列(連想配列)」を受け取り、絞り込みをして返す
function returnPlace_select_kind(array,type){
    var result = [];
    for(var i in array){
        if(array[i]['kind'] == type)result.push(array[i]);
    }
    return result;
}

// 「表示する店舗情報の配列(連想配列)」を受け取り、絞り込みをして返す
function returnPlace_select_trans(array,type){
    var result = [];
    switch(type){
        case '~30分':
            for(var i in array){
                if(array[i]['time_startStation_to_shop'] <= 30){
                    result.push(array[i]);
                }
            }
        break;

        case '31~60分':
            for(var i in array){
                if(31 <= array[i]['time_startStation_to_shop'] && array[i]['time_startStation_to_shop'] <= 60){
                    result.push(array[i]);
                }
            }
        break;

        case '61~90分':
            for(var i in array){
                if(61 <= array[i]['time_startStation_to_shop'] && array[i]['time_startStation_to_shop'] <= 90){
                    result.push(array[i]);
                }
            }
        break;

        case  '91~120分':
            for(var i in array){
                if(91 <= array[i]['time_startStation_to_shop'] && array[i]['time_startStation_to_shop'] <= 120){
                    result.push(array[i]);
                }
            }
        break;

        case  '121~分':
            for(var i in array){
                if(121 <= array[i]['time_startStation_to_shop']){
                    result.push(array[i]);
                }
            }
        break;
    }
    return result;
}

// 「表示する店舗情報の配列(連想配列)」を受け取り、絞り込みをして返す
function returnPlace_select_main(array,type){
    var result = [];
    for(var i in array){
        if(array[i]['main_dish'] != type)result.push(array[i]);
    }
    return result;
}



// 大学の周辺駅を表示する
async function display_stations_uni(position_y,position_x){
    var url = config.ekispert.url + '/v1/json/geo/station';
    var params = {
      key: config.ekispert.key,
      geoPoint: position_y+','+position_x + ',1000',
      type: 'train'
    };
    var response = await axios.get(url, { params: params });

    uniStations = [];
    for(var i in response.data.ResultSet.Point){
        uniStations.push(response.data.ResultSet.Point[i].Station.Name);
    }

    var station_uni = document.getElementById('Station_Uni');
    var txt = '';
    for(var i in uniStations){
        txt += ' ' + uniStations[i] + '駅,';
    }
    station_uni.textContent = txt.slice(0,-1); //1文字削ったtxtを表示
}




// 検索方法ドロップダウンリストの値を取得する
$(function(){
    $('.dropdown-menu .search-type-item').click(function(){
        var searchType = $('.search-type');
        var temp_searchType = searchType.text();
        searchType.text($(this).text());
        $(this).text(temp_searchType);
    });
});

// 並び替えドロップダウンリストの値を取得する
$(function(){
    $('.dropdown-menu .sort-type-item').click(function(){
        var sortType = $('.sort-type');
        var temp_sortType = sortType.text();
        sortType.text($(this).text());
        $(this).text(temp_sortType);
    });
});

// 詳細設定ドロップダウンリストの値を取得する
// パーティション
$(function(){
    $('.dropdown-menu .par-type-item').click(function(){
        var parTypeItem = $('.par-type-item').get();
        var array = [];
        for(var i in parTypeItem){
            array.push(parTypeItem[i].innerText);
        }
        
        var parType = $('.par-type');
        var temp_parType = parType.text();
        parType.text($(this).text());
        array.push(temp_parType);
        array = array.filter(function(item){
            return item !== parType.text();
        });
        console.log('ソート前',array);

        array.sort(function(a,b){
            if(a == "指定なし")return -1;
            if(a == "なし" && b != '指定なし')return -1;
            if(a == "あり")return 1;
            return 0;
        });
        console.log('ソート',array);

        for(var i in parTypeItem){
            parTypeItem[i].innerText = array[i];
        }
    });
});

// 座席間隔
$(function(){
    $('.dropdown-menu .dis-type-item').click(function(){
        var disTypeItem = $('.dis-type-item').get();
        var array = [];
        for(var i in disTypeItem){
            array.push(disTypeItem[i].innerText);
        }
        
        var disType = $('.dis-type');
        var temp_disType = disType.text();
        disType.text($(this).text());
        array.push(temp_disType);
        array = array.filter(function(item){
            return item !== disType.text();
        });
        console.log('ソート前',array);

        array.sort(function(a,b){
            if(a == "指定なし")return -1;
            if(a == "なし" && b != '指定なし')return -1;
            if(a == "あり" && (b != '指定なし' && b != 'なし'))return -1;
            if(a == "0.5m以下" && b == '0.6m以上')return -1;
            if(a == "0.6m以上")return 1;
            return 0;
        });
        console.log('ソート',array);

        for(var i in disTypeItem){
            disTypeItem[i].innerText = array[i];
        }
    });
});

// 時間制限
$(function(){
    $('.dropdown-menu .time-type-item').click(function(){
        var timeTypeItem = $('.time-type-item').get();
        var array = [];
        for(var i in timeTypeItem){
            array.push(timeTypeItem[i].innerText);
        }
        
        var timeType = $('.time-type');
        var temp_timeType = timeType.text();
        timeType.text($(this).text());
        array.push(temp_timeType);
        array = array.filter(function(item){
            return item !== timeType.text();
        });
        console.log('ソート前',array);

        array.sort(function(a,b){
            if(a == "指定なし")return -1;
            if(a == "なし" && b != '指定なし')return -1;
            if(a == "あり" && (b != '指定なし' && b != 'なし'))return -1;
            if(a == "60分以下" && b == '61分以上')return -1;
            if(a == "61分以上")return 1;
            return 0;
        });
        console.log('ソート',array);

        for(var i in timeTypeItem){
            timeTypeItem[i].innerText = array[i];
        }
    });
});

// 人数制限
$(function(){
    $('.dropdown-menu .num-type-item').click(function(){
        var numTypeItem = $('.num-type-item').get();
        var array = [];
        for(var i in numTypeItem){
            array.push(numTypeItem[i].innerText);
        }
        
        var numType = $('.num-type');
        var temp_numType = numType.text();
        numType.text($(this).text());
        array.push(temp_numType);
        array = array.filter(function(item){
            return item !== numType.text();
        });
        console.log('ソート前',array);

        array.sort(function(a,b){
            if(a == "指定なし")return -1;
            if(a == "なし" && b != '指定なし')return -1;
            if(a == "あり" && b == '4人以下')return -1;
            if(a == "4人以下")return 1;
            return 0;
        });
        console.log('ソート',array);

        for(var i in numTypeItem){
            numTypeItem[i].innerText = array[i];
        }
    });
});

// 予算制限
$(function(){
    $('.dropdown-menu .budget-type-item').click(function(){
        var budgetTypeItem = $('.budget-type-item').get();
        var array = [];
        for(var i in budgetTypeItem){
            array.push(budgetTypeItem[i].innerText);
        }
        
        var budgetType = $('.budget-type');
        var temp_budgetType = budgetType.text();
        budgetType.text($(this).text());
        array.push(temp_budgetType);
        array = array.filter(function(item){
            return item !== budgetType.text();
        });
        console.log('ソート前',array);

        array.sort(function(a,b){
            if(a == "指定なし")return -1;
            if(a == "~1000円" && b != '指定なし')return -1;
            if(a == "1001~2000円" && (b != '指定なし' && b != '~1000円'))return -1;
            if(a == "2001~3000円" && (b == '3001~4000円' || b == '4001~円'))return -1;
            if(a == "3001~4000円" && b == '4001~円')return -1;
            if(a == "4001~円")return 1;
            return 0;
        });
        console.log('ソート',array);

        for(var i in budgetTypeItem){
            budgetTypeItem[i].innerText = array[i];
        }
    });
});

// ジャンル制限
$(function(){
    $('.dropdown-menu .kind-type-item').click(function(){
        var kindTypeItem = $('.kind-type-item').get();
        var array = [];
        for(var i in kindTypeItem){
            array.push(kindTypeItem[i].innerText);
        }
        
        var kindType = $('.kind-type');
        var temp_kindType = kindType.text();
        kindType.text($(this).text());
        array.push(temp_kindType);
        array = array.filter(function(item){
            return item !== kindType.text();
        });
        console.log('ソート前',array);
    
        array.sort(function(a,b){
            if(a == "指定なし")return -1;
            for(var i in kinds){
                if(kinds[i] == a){
                    var ai = i;
                }else if(kinds[i] == b){
                    var bi = i;
                }
            }
            if(ai < bi && b != "指定なし")return -1;
            return 1;
        });
        console.log('ソート',array);
    
        for(var i in kindTypeItem){
            kindTypeItem[i].innerText = array[i];
        }
    });
});

// 所要時間制限
$(function(){
    $('.dropdown-menu .trans-type-item').click(function(){
        var transTypeItem = $('.trans-type-item').get();
        var array = [];
        for(var i in transTypeItem){
            array.push(transTypeItem[i].innerText);
        }
        
        var transType = $('.trans-type');
        var temp_transType = transType.text();
        transType.text($(this).text());
        array.push(temp_transType);
        array = array.filter(function(item){
            return item !== transType.text();
        });
        console.log('ソート前',array);

        array.sort(function(a,b){
            if(a == "指定なし")return -1;
            if(a == "~30分" && b != '指定なし')return -1;
            if(a == "31~60分" && (b != '指定なし' && b != '~30分'))return -1;
            if(a == "61~90分" && (b == '91~120分' || b == '121~分'))return -1;
            if(a == "91~120分" && b == '121~分')return -1;
            if(a == "121~分")return 1;
            return 0;
        });
        console.log('ソート',array);

        for(var i in transTypeItem){
            transTypeItem[i].innerText = array[i];
        }
    });
});

// ジャンル制限
$(function(){
    $('.dropdown-menu .main-type-item').click(function(){
        var mainTypeItem = $('.main-type-item').get();
        var array = [];
        for(var i in mainTypeItem){
            array.push(mainTypeItem[i].innerText);
        }
        
        var mainType = $('.main-type');
        var temp_mainType = mainType.text();
        mainType.text($(this).text());
        array.push(temp_mainType);
        array = array.filter(function(item){
            return item !== mainType.text();
        });
        console.log('ソート前',array);
    
        array.sort(function(a,b){
            if(a == "指定なし")return -1;
            for(var i in mains){
                if(mains[i] == a){
                    var ai = i;
                }else if(mains[i] == b){
                    var bi = i;
                }
            }
            if(ai < bi && b != "指定なし")return -1;
            return 1;
        });
        console.log('ソート',array);
    
        for(var i in mainTypeItem){
            mainTypeItem[i].innerText = array[i];
        }
    });
});




// 折り畳みをしまう関数
var fold = function(id){
    if(typeof(id) == 'object'){//配列でidを渡せば全部閉じる
        for(var i = 0, len = id.length; i < len; i++){
            fe(id[i]);
        }
    }else{
        fe(id);
    }
};

// クリックされたとき折り畳まれてたら広げて、広がってたら折りたたむ関数
var fe = function(id) {
    var target = document.getElementById(id);
    var icon = document.getElementById('detail-icon');
    // console.log(target.style.display);
    if (target.style.display === 'none') {
        target.style.display    = 'block';
        target.style.visibility = 'visible';
        icon.innerHTML = '<i class="icofont-rounded-up text4 white"></i>';
    } else {
        target.style.display    = 'none';
        target.style.visibility = 'hidden';
        icon.innerHTML = '<i class="icofont-rounded-down text4 white"></i>';
    }
};

//↓詳細設定が押された時の処理
function openDetails(event){
    fold('details');
    if(event.preventDefault){
        event.preventDefault();
    }else{
        event.returnValue = false;
    }
    if(event.stopPropagation){
        event.stopPropagation();
    }else{
        event.cancelBubble = true;
    }
}

// 折り畳み要素を畳む 詳細検索を畳んでる
fold('details');