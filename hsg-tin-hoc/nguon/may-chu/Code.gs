/**
 * LUYỆN HSG TIN — máy chủ lưu kết quả học sinh (Google Apps Script)
 * Dán toàn bộ file này vào Apps Script của Google Sheet, chạy hàm setup() một lần,
 * rồi Triển khai > Ứng dụng web (Chạy với tư cách: Tôi; Ai có quyền truy cập: Bất kỳ ai).
 */
const SH_HS = 'HocSinh';   // tài khoản
const SH_KQ = 'KetQua';    // kết quả

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  [[SH_HS, ['user','hoten','lop','salt','hash','ngaytao']],
   [SH_KQ, ['user','capnhat','tongcau','dung','sode','diemTB','state','summary']]].forEach(function (p) {
    let s = ss.getSheetByName(p[0]) || ss.insertSheet(p[0]);
    if (s.getLastRow() === 0) { s.appendRow(p[1]); s.setFrozenRows(1); }
  });
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SECRET')) props.setProperty('SECRET', Utilities.getUuid() + Utilities.getUuid());
  if (!props.getProperty('ADMIN_PASS')) props.setProperty('ADMIN_PASS', 'DOI-MAT-KHAU-NAY');
  if (!props.getProperty('JOIN_CODE')) props.setProperty('JOIN_CODE', 'HSG2027'); // mã đội tuyển: học sinh phải nhập khi tự đăng ký
  Logger.log('Xong. Hãy đổi ADMIN_PASS trong Project Settings > Script properties.');
}

function doPost(e) {
  let out;
  try {
    const req = JSON.parse(e.postData.contents);
    out = handle(req);
  } catch (err) { out = { ok: false, error: String(err) }; }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
function doGet() { return ContentService.createTextOutput('Luyện HSG Tin: máy chủ đang chạy.'); }

function sha(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join('');
}
function secret() { return PropertiesService.getScriptProperties().getProperty('SECRET'); }
function isAdmin(p) { return p && p === PropertiesService.getScriptProperties().getProperty('ADMIN_PASS'); }
function norm(u) { return String(u || '').trim().toLowerCase(); }
function tokenFor(user, hash) { return sha(user + '|' + hash + '|' + secret()); }

function findRow(sheet, user) {
  const v = sheet.getDataRange().getValues();
  for (let i = 1; i < v.length; i++) if (norm(v[i][0]) === user) return { row: i + 1, vals: v[i] };
  return null;
}

function handle(r) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hs = ss.getSheetByName(SH_HS), kq = ss.getSheetByName(SH_KQ);
    const a = r.a;
    if (a === 'register') {
      const jc = PropertiesService.getScriptProperties().getProperty('JOIN_CODE');
      if (jc && String(r.code || '').trim() !== jc) return { ok: false, error: 'Mã đội tuyển không đúng' };
      const u = norm(r.u);
      if (!/^[a-z0-9._-]{3,30}$/.test(u)) return { ok: false, error: 'Tên đăng nhập 3–30 ký tự: chữ không dấu, số, . _ -' };
      if (String(r.p || '').length < 6) return { ok: false, error: 'Mật khẩu tối thiểu 6 ký tự' };
      if (!String(r.name || '').trim()) return { ok: false, error: 'Hãy nhập họ tên' };
      if (findRow(hs, u)) return { ok: false, error: 'Tên đăng nhập đã có người dùng' };
      const salt = Utilities.getUuid().slice(0, 8), hash = sha(salt + '|' + r.p);
      hs.appendRow([u, String(r.name).trim(), String(r.lop || '').trim(), salt, hash, new Date()]);
      return { ok: true, token: tokenFor(u, hash), name: String(r.name).trim(), lop: String(r.lop || '').trim(), state: null };
    }
    if (a === 'login') {
      const u = norm(r.u), f = findRow(hs, u);
      if (!f) return { ok: false, error: 'Sai tên đăng nhập hoặc mật khẩu' };
      const h = sha(f.vals[3] + '|' + r.p);
      if (h !== f.vals[4]) return { ok: false, error: 'Sai tên đăng nhập hoặc mật khẩu' };
      const k = findRow(kq, u);
      let state = null;
      if (k && k.vals[6]) { try { state = JSON.parse(k.vals[6]); } catch (e) {} }
      return { ok: true, token: tokenFor(u, h), name: f.vals[1], lop: f.vals[2], state: state };
    }
    if (a === 'save') {
      const u = norm(r.u), f = findRow(hs, u);
      if (!f || r.t !== tokenFor(u, f.vals[4])) return { ok: false, error: 'Phiên hết hạn, hãy đăng nhập lại' };
      const s = r.sum || {};
      const row = [u, new Date(), s.n || 0, s.c || 0, s.ex || 0, s.avg || '', JSON.stringify(r.state || {}), JSON.stringify(s)];
      const k = findRow(kq, u);
      if (k) kq.getRange(k.row, 1, 1, 8).setValues([row]); else kq.appendRow(row);
      return { ok: true };
    }
    // ---- các lệnh của giáo viên ----
    if (!isAdmin(r.ap)) return { ok: false, error: 'Mật khẩu giáo viên không đúng' };
    if (a === 'admin_list') {
      const hv = hs.getDataRange().getValues(), kv = kq.getDataRange().getValues(), map = {};
      for (let i = 1; i < kv.length; i++) { let s = {}; try { s = JSON.parse(kv[i][7] || '{}'); } catch (e) {} map[norm(kv[i][0])] = { t: kv[i][1], sum: s }; }
      const list = [];
      for (let i = 1; i < hv.length; i++) {
        const u = norm(hv[i][0]), m = map[u] || {};
        list.push({ u: u, name: hv[i][1], lop: hv[i][2], t: m.t ? new Date(m.t).getTime() : 0, sum: m.sum || null });
      }
      return { ok: true, list: list };
    }
    if (a === 'admin_get') {
      const k = findRow(kq, norm(r.u));
      let st = null; if (k && k.vals[6]) { try { st = JSON.parse(k.vals[6]); } catch (e) {} }
      return { ok: true, state: st };
    }
    if (a === 'admin_add') {
      const res = [];
      (r.list || []).forEach(function (x) {
        const u = norm(x.u); if (!u) return;
        const pass = String(x.p || '');
        const salt = Utilities.getUuid().slice(0, 8), f = findRow(hs, u);
        const hash = sha(salt + '|' + pass);
        if (f) { hs.getRange(f.row, 2, 1, 4).setValues([[x.name || f.vals[1], x.lop || f.vals[2], salt, hash]]); res.push(u + ' (cập nhật)'); }
        else { hs.appendRow([u, x.name || u, x.lop || '', salt, hash, new Date()]); res.push(u + ' (mới)'); }
      });
      return { ok: true, done: res };
    }
    if (a === 'admin_reset') {
      const f = findRow(hs, norm(r.u)); if (!f) return { ok: false, error: 'Không có học sinh này' };
      const salt = Utilities.getUuid().slice(0, 8);
      hs.getRange(f.row, 4, 1, 2).setValues([[salt, sha(salt + '|' + r.p)]]); return { ok: true };
    }
    if (a === 'admin_delete') {
      const u = norm(r.u), f = findRow(hs, u); if (f) hs.deleteRow(f.row);
      const k = findRow(kq, u); if (k) kq.deleteRow(k.row);
      return { ok: true };
    }
    return { ok: false, error: 'Lệnh không hợp lệ' };
  } finally { lock.releaseLock(); }
}
