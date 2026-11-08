/*
 * Tạo file Excel (.xlsx) bảng đáp án — không cần thư viện ngoài.
 * Sheet 1 "Bảng đáp án": Câu | Đề gốc | 101 | 102 | …  (chia theo từng phần)
 * Sheet 2 "Đối chiếu câu": Mã đề | Phần | Câu | Đáp án | Câu ở đề gốc
 */
(function (root) {
  'use strict';
  const zip = () => (root.XaoDeWord || require('./word.js')).zip;

  function x(s) {
    return String(s == null ? '' : s)
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function colName(i) {
    let s = '';
    i++;
    while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); }
    return s;
  }

  // Kiểu ô (chỉ số trong styles.xml)
  const ST = { normal: 0, title: 1, sub: 2, head: 3, cell: 4, section: 5, note: 6, cellLeft: 7 };
  const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="5">
<font><sz val="12"/><name val="Times New Roman"/><family val="1"/></font>
<font><b/><sz val="14"/><name val="Times New Roman"/><family val="1"/></font>
<font><b/><sz val="12"/><name val="Times New Roman"/><family val="1"/></font>
<font><i/><sz val="11"/><name val="Times New Roman"/><family val="1"/></font>
<font><sz val="12"/><name val="Times New Roman"/><family val="1"/></font>
</fonts>
<fills count="4">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFDCE6F7"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF2F2F2"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="2">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left style="thin"><color auto="1"/></left><right style="thin"><color auto="1"/></right><top style="thin"><color auto="1"/></top><bottom style="thin"><color auto="1"/></bottom><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="8">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="49" fontId="2" fillId="2" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="49" fontId="4" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="49" fontId="2" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="49" fontId="4" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

  /**
   * Một sheet: rows = [[{v, s, n}]] (n = true: số), merges = ['A1:D1'], widths = [số ký tự], freeze = số hàng cố định
   */
  function sheetXml(sh) {
    const rowsXml = sh.rows.map((r, ri) => {
      const cells = r.map((c, ci) => {
        if (c == null) return '';
        const ref = colName(ci) + (ri + 1);
        const s = c.s || 0;
        if (c.v === '' || c.v == null) return `<c r="${ref}" s="${s}"/>`;
        if (c.n && /^-?\d+(\.\d+)?$/.test(String(c.v))) return `<c r="${ref}" s="${s}"><v>${c.v}</v></c>`;
        return `<c r="${ref}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${x(c.v)}</t></is></c>`;
      }).join('');
      const ht = sh.heights && sh.heights[ri] ? ` ht="${sh.heights[ri]}" customHeight="1"` : '';
      return `<row r="${ri + 1}"${ht}>${cells}</row>`;
    }).join('');
    const maxCol = Math.max(1, ...sh.rows.map((r) => r.length));
    const dim = `A1:${colName(maxCol - 1)}${Math.max(1, sh.rows.length)}`;
    let pane = '';
    if (sh.freeze) {
      const fc = sh.freezeCols || 0;
      pane = `<pane${fc ? ` xSplit="${fc}"` : ''} ySplit="${sh.freeze}" topLeftCell="${colName(fc)}${sh.freeze + 1}" ` +
        `activePane="${fc ? 'bottomRight' : 'bottomLeft'}" state="frozen"/>`;
    }
    const cols = sh.widths ? '<cols>' + sh.widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('') + '</cols>' : '';
    const merges = sh.merges && sh.merges.length ? `<mergeCells count="${sh.merges.length}">${sh.merges.map((m) => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>` : '';
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<dimension ref="${dim}"/><sheetViews><sheetView workbookViewId="0">${pane}</sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="16.5"/>${cols}<sheetData>${rowsXml}</sheetData>${merges}
<pageMargins left="0.6" right="0.4" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>
<pageSetup paperSize="9" orientation="${sh.landscape ? 'landscape' : 'portrait'}" fitToHeight="0"/>
</worksheet>`;
  }

  function workbook(sheets, title) {
    const files = [];
    files.push({ name: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('\n')}
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>` });
    files.push({ name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>' });
    const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    files.push({ name: 'docProps/core.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${x(title)}</dc:title><dc:creator>Xáo Đề THPT</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>` });
    files.push({ name: 'docProps/app.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Xáo Đề THPT</Application></Properties>' });
    files.push({ name: 'xl/workbook.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<bookViews><workbookView activeTab="0"/></bookViews><sheets>${sheets.map((s, i) => `<sheet name="${x(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>` });
    files.push({ name: 'xl/_rels/workbook.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` });
    files.push({ name: 'xl/styles.xml', data: STYLES });
    sheets.forEach((s, i) => files.push({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(s) }));
    return zip()(files);
  }

  /**
   * columns: [{ label: 'Đề gốc' | '101', version }]
   * keyRows: [{ section } | { no, cells: [{ ans, orig }] }] — cùng thứ tự với columns
   * mapRows: [[mã đề, phần, câu, đáp án, câu gốc]]
   */
  function buildKeysXlsx(columns, keyRows, mapRows, meta) {
    const n = columns.length + 1;
    const last = colName(n - 1);
    const s1 = { name: 'Bảng đáp án', rows: [], merges: [], widths: [9, ...columns.map((c) => Math.max(10, c.label.length + 4))], heights: {} };
    const title = `BẢNG ĐÁP ÁN – MÔN ${String(meta.subject || '').toUpperCase()}`;
    s1.rows.push([{ v: title, s: ST.title }]); s1.merges.push(`A1:${last}1`); s1.heights[0] = 24;
    const sub = [meta.examName, meta.year ? 'Năm học ' + meta.year : ''].filter(Boolean).join(' – ');
    s1.rows.push([{ v: sub || (meta.school || ''), s: ST.sub }]); s1.merges.push(`A2:${last}2`);
    s1.rows.push([]);
    s1.rows.push([{ v: 'Câu', s: ST.head }, ...columns.map((c) => ({ v: c.label, s: ST.head }))]);
    s1.freeze = 4;
    s1.freezeCols = 1;
    keyRows.forEach((r) => {
      const ri = s1.rows.length + 1;
      if (r.section) {
        s1.rows.push([{ v: r.section, s: ST.section }, ...columns.map(() => ({ v: '', s: ST.section }))]);
        s1.merges.push(`A${ri}:${last}${ri}`);
      } else {
        s1.rows.push([{ v: r.no, s: ST.cell, n: true }, ...r.cells.map((c) => ({ v: c.ans, s: ST.cell }))]);
      }
    });
    s1.rows.push([]);
    s1.rows.push([{ v: 'Ghi chú: câu đúng/sai ghi theo thứ tự ý a, b, c, d (Đ = Đúng, S = Sai).', s: ST.note }]);
    if (columns.length > 6) s1.landscape = true;

    const partW = Math.min(80, Math.max(20, ...mapRows.map((r) => String(r[1]).length + 4)));
    const s2 = { name: 'Đối chiếu câu', rows: [], merges: [], widths: [10, partW, 8, 10, 14], freeze: 1, landscape: partW > 50 };
    s2.rows.push(['Mã đề', 'Phần', 'Câu', 'Đáp án', 'Câu ở đề gốc'].map((v) => ({ v, s: ST.head })));
    mapRows.forEach((r) => s2.rows.push([
      { v: r[0], s: ST.cell }, { v: r[1], s: ST.cellLeft }, { v: r[2], s: ST.cell, n: true }, { v: r[3], s: ST.cell }, { v: r[4], s: ST.cell, n: true },
    ]));
    return workbook([s1, s2], title);
  }

  const api = { buildKeysXlsx, workbook, colName };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.XaoDeXlsx = api;
})(typeof window !== 'undefined' ? window : globalThis);
