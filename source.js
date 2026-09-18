javascript:(function(){
  const mode = location.href.includes('learning-activity') ? 'single' : (location.pathname.includes('/course/') ? 'course' : '');
  if (!mode) return;

  const ID = 'ncue-67';
  const existing = document.getElementById(ID);
  if (existing) existing.remove();

  const ui = document.createElement('div');
  ui.id = ID;
  ui.style = 'position:fixed;top:10%;left:5%;width:90%;max-width:360px;background:#fff;z-index:9999999;padding:15px;border:3px solid #000;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,0.5);font-family:sans-serif;color:#333;';
  ui.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:10px;"><b style="color:#000;">彰師大 TronClass 爆破</b><button id="ncue-67-close" style="padding:3px 10px;background:#dc3545;color:#fff;border:none;border-radius:4px;">關閉</button></div><div style="display:flex;gap:5px;margin-bottom:10px;"><button id="ncue-67-pause" style="flex:1;padding:6px;background:#17a2b8;color:#fff;border:none;border-radius:4px;">暫停</button><button id="ncue-67-stop" style="flex:1;padding:6px;background:#dc3545;color:#fff;border:none;border-radius:4px;">終止</button></div><div id="ncue-67-st" style="font-weight:bold;margin-bottom:5px;">[1] 初始化...</div><div style="background:#eee;height:10px;border-radius:5px;overflow:hidden;margin-bottom:10px;"><div id="ncue-67-bar" style="width:0%;height:100%;background:#28a745;transition:0.3s;"></div></div><div id="ncue-67-log" style="font-size:10px;height:150px;overflow-y:auto;background:#f8f8f8;padding:8px;border:1px solid #ccc;white-space:pre-wrap;"></div><center><small style="color:#808080;">資管119級張子夫製作 出事了別怪我哈</small></center>';
  document.body.appendChild(ui);

  const st = document.getElementById('ncue-67-st');
  const logEl = document.getElementById('ncue-67-log');
  const bar = document.getElementById('ncue-67-bar');
  let isP = false, isS = false;

  document.getElementById('ncue-67-pause').onclick = function () {
    isP = !isP;
    this.innerText = isP ? '繼續' : '暫停';
    this.style.background = isP ? '#28a745' : '#17a2b8';
  };

  document.getElementById('ncue-67-stop').onclick = function () { isS = true; };
  document.getElementById('ncue-67-close').onclick = function () { isS = true; ui.remove(); };

  function log(msg) {
    const t = new Date().toTimeString().split(' ')[0];
    logEl.innerHTML = '[' + t + '] ' + msg + '\n' + logEl.innerHTML;
  }

  function req(url, method, data) {
    return new Promise(function (resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.open(method || 'GET', url, true);
      xhr.withCredentials = true;
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      if (method === 'POST') xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            reject('非JSON');
          }
        } else {
          reject('HTTP ' + xhr.status);
        }
      };
      xhr.onerror = function () { reject('Error'); };
      xhr.send(data ? JSON.stringify(data) : null);
    });
  }

  async function run() {
    try {
      let tot = 0;
      const loaded = [];

      if (mode === 'single') {
        log('🚀 單點爆破');
        const aid = location.hash.match(/#\/(\d+)/)?.[1];
        if (!aid) throw '無ID';
        st.innerText = '[2] 抓取資料';
        const d = await req(location.origin + '/api/activities/' + aid + '?sub_course_id=0', 'GET');
        if (isS) throw 'STOP';
        const dur = d?.uploads?.[0]?.videos?.[0]?.duration ? parseInt(d.uploads[0].videos[0].duration) : (d.duration ? parseInt(d.duration) : 1200);
        tot += dur;
        loaded.push({ id: aid, dur, title: d.title || aid });
      } else {
        log('🚀 全課爆破');
        const cid = location.pathname.match(/course\/(\d+)/)?.[1];
        if (!cid) throw '無CID';
        st.innerText = '[2] 抓取清單';
        const data = await req(location.origin + '/api/courses/' + cid + '/activities?sub_course_id=0', 'GET');
        if (isS) throw 'STOP';

        let acts = data.activities || data.chapters || [];
        if (Array.isArray(data)) acts = data;
        const vids = [];

        function scan(items) {
          for (let i = 0; i < items.length; i++) {
            const a = items[i];
            if (a.type === 'online_video' || a.type === 'video') vids.push(a);
            if (a.activities) scan(a.activities);
            if (a.children) scan(a.children);
            if (a.chapters) scan(a.chapters);
          }
        }

        scan(acts);
        if (vids.length === 0) throw '無影片';
        log('✅ 鎖定 ' + vids.length + ' 個');

        for (let i = 0; i < vids.length; i++) {
          if (isS) throw 'STOP';
          const v = vids[i];
          log('⏳ 解析: ' + v.id);
          try {
            const dD = await req(location.origin + '/api/activities/' + v.id + '?sub_course_id=0', 'GET');
            const du = dD?.uploads?.[0]?.videos?.[0]?.duration ? parseInt(dD.uploads[0].videos[0].duration) : (v.duration ? parseInt(v.duration) : 1200);
            tot += du;
            loaded.push({ id: v.id, dur: du, title: v.title });
          } catch (e) {
            tot += 1200;
            loaded.push({ id: v.id, dur: 1200, title: v.title });
          }
        }
      }

      let curT = 0;
      const jsStep = 120;

      for (let i = 0; i < loaded.length; i++) {
        const v = loaded[i];
        let c = 0;
        if (st) st.innerText = '[3] 爆破 (' + (i + 1) + '/' + loaded.length + ')';
        log('💥 攻擊: ' + v.title);

        while (c < v.dur) {
          if (isS) throw 'STOP';
          while (isP) {
            if (isS) throw 'STOP';
            await new Promise(r => setTimeout(r, 500));
          }

          const n = c + jsStep;
          const end = n > v.dur ? v.dur : n;
          await req(location.origin + '/api/course/activities-read/' + v.id, 'POST', { start: c, end: end });
          curT += (end - c);
          c = end;

          if (bar) {
            const ratio = tot > 0 ? (curT / tot * 100) : 0;
            bar.style.width = ratio + '%';
          }

          await new Promise(r => setTimeout(r, 250));
        }
      }

      if (st) st.innerHTML = "<span style='color:green'>🎉 完成</span>";
      log('🏁 結束');
    } catch (e) {
      if (e === 'STOP') {
        if (st) st.innerHTML = "<span style='color:red'>⏹ 已終止</span>";
        log('已終止');
      } else {
        if (st) {
          st.style.color = 'red';
          st.innerText = '❌ 錯誤';
        }
        log('ERR: ' + e);
      }
    }
  }

  run();
})();
