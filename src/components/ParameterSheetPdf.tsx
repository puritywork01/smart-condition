import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// ─── constants ───────────────────────────────────────────────────────────────
const F = {
  xs:  4.5,   // tiny unit labels
  sm:  5,     // label text
  md:  6,     // value text
  hd:  6.5,   // section headers inside tables
  ttl: 7,     // section title above tables
  sub: 9,     // page sub-heading
  big: 14,    // page title
};
const C = { black: '#000', blue: '#0052cc', grey: '#f2f2f2', white: '#fff' };
const BORDER = { borderRightWidth: 1, borderBottomWidth: 1, borderColor: C.black };

// ─── stylesheet ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    paddingTop: 12, paddingBottom: 14,
    paddingLeft: 18, paddingRight: 18,
    fontSize: F.sm,
    backgroundColor: C.white,
  },

  /* ── header ── */
  company: { fontSize: 8, fontWeight: 'bold', marginBottom: 1 },
  title:   { fontSize: F.big, fontStyle: 'italic', fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  infoTxt: { fontSize: F.sm },
  infoVal: { fontSize: F.sm, color: C.blue, fontWeight: 'bold' },

  /* ── section title ── */
  secTitle: { fontSize: F.ttl, fontWeight: 'bold', marginTop: 5, marginBottom: 1 },

  /* ── table shell ── */
  tbl: {
    borderTopWidth: 1, borderLeftWidth: 1, borderColor: C.black,
    flexDirection: 'column', width: '100%',
  },
  tblThick: { borderTopWidth: 2, borderLeftWidth: 2 },

  /* ── row ── */
  row: { flexDirection: 'row' },

  /* ── generic cell ── */
  cell: {
    ...BORDER,
    padding: 1.5,
    justifyContent: 'center',
  },

  /* ── text inside cells ── */
  lbl:  { fontSize: F.sm },
  val:  { fontSize: F.md, color: C.blue, fontWeight: 'bold', textAlign: 'center' },
  hdr:  { fontSize: F.hd, fontWeight: 'bold', textAlign: 'center' },
  unit: { fontSize: F.xs, color: '#555' },
});

// ─── helpers ─────────────────────────────────────────────────────────────────
type CellProps = { w?: number; bg?: string; style?: any; children?: any };
const Cell = ({ w = 1, bg, style, children }: CellProps) => (
  <View style={[s.cell, { flex: w, flexBasis: 0, backgroundColor: bg ?? C.white }, style]}>
    {children}
  </View>
);
const LCell = ({ w = 1, bg, children }: CellProps) => (
  <Cell w={w} bg={bg}><Text style={s.lbl}>{children ?? ''}</Text></Cell>
);
const VCell = ({ w = 1, children }: CellProps) => (
  <Cell w={w}><Text style={s.val}>{children ?? ''}</Text></Cell>
);
const HCell = ({ w = 1, bg, children }: CellProps) => (
  <Cell w={w} bg={bg}><Text style={s.hdr}>{children ?? ''}</Text></Cell>
);
const UCell = ({ w = 1, children }: CellProps) => (
  <Cell w={w}><Text style={s.unit}>{children ?? ''}</Text></Cell>
);
const Row = ({ children, bg }: { children: any; bg?: string }) => (
  <View style={[s.row, bg ? { backgroundColor: bg } : {}]}>{children}</View>
);
const Tbl = ({ children, style }: { children: any; style?: any }) => (
  <View style={[s.tbl, s.tblThick, style]}>{children}</View>
);

// ─── component ───────────────────────────────────────────────────────────────
interface Props { data: any; clamping: any; injection: any; temperature: any; cooling: any; }

const ParameterSheetPdf: React.FC<Props> = ({ data, clamping, injection, temperature, cooling }) => {
  // Support both camelCase (formData) and snake_case (DB) field naming
  const d = {
    id_code:    data?.idCode     ?? data?.id_code     ?? '',
    mc_no:      data?.mcNo       ?? data?.mc_no       ?? '',
    date:       data?.date       ?? '',
    model_name: data?.modelName  ?? data?.model_name  ?? '-',
    part_name:  data?.partName   ?? data?.part_name   ?? '',
    part_code:  data?.partCode   ?? data?.part_code   ?? '',
    mc_ton:     data?.mcTon      ?? data?.mc_ton      ?? '',
    part_weight:data?.partWeight ?? data?.part_weight ?? '',
    rn_weight:  data?.rnWeight   ?? data?.rn_weight   ?? '',
    cycle_time: data?.cycleTime  ?? data?.cycle_time  ?? '',
    matl1:      data?.matl1      ?? '',
    matl2:      data?.matl2      ?? '',
    grade:      data?.grade      ?? '',
    color_no:   data?.colorNo    ?? data?.color_no    ?? '',
  };
  const totalWeight = ((parseFloat(d.part_weight || '0') + parseFloat(d.rn_weight || '0')).toFixed(2));

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ═══ HEADER ═════════════════════════════════════════════════════ */}
        <Text style={s.company}>Purity Plastics Co.,Ltd.</Text>
        <Text style={s.title}>Injection Molding Parameter Sheet</Text>

        <View style={[s.infoRow, { marginBottom: 1 }]}>
          <Text style={s.infoTxt}>ID CODE : <Text style={s.infoVal}>{d.id_code}</Text></Text>
          <Text style={s.infoTxt}>DATE : <Text style={s.infoVal}>{d.date}</Text></Text>
        </View>
        <View style={[s.infoRow, { marginBottom: 3 }]}>
          <Text style={s.infoTxt}>MODEL : <Text style={s.infoVal}>{d.model_name}</Text></Text>
          <Text style={s.infoTxt}>M/C No. : <Text style={s.infoVal}>{d.mc_no}</Text></Text>
        </View>

        {/* ═══ PART INFO TABLE ════════════════════════════════════════════ */}
        {/* SCRAP-ABS-RETURN and ABS columns removed per user request */}
        <Tbl>
          <Row>
            <LCell w={7}>PART NAME</LCell>
            <VCell w={20}>{d.part_name}</VCell>
            <LCell w={7}>MATERIAL 1</LCell>
            <VCell w={12}>{d.matl1}</VCell>
            <LCell w={7}>MATERIAL 2</LCell>
            <VCell w={5}>{d.matl2}</VCell>
            <LCell w={5}>COLOR</LCell>
            <VCell w={5}>{d.color_no}</VCell>
          </Row>
          <Row>
            <LCell w={7}>PART CODE</LCell>
            <VCell w={20}>{d.part_code}</VCell>
            <LCell w={7}>GRADE</LCell>
            <VCell w={12}>{d.grade}</VCell>
            <LCell w={7}>GRADE</LCell>
            <VCell w={5}>-</VCell>
            <LCell w={5}>CP.No</LCell>
            <VCell w={5}>-</VCell>
          </Row>
        </Tbl>

        {/* ═══ MACHINE / CYCLE / WEIGHT ════════════════════════════════ */}
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 5 }}>
          {/* Machine */}
          <View style={{ flex: 1 }}>
            <Text style={s.secTitle}>MACHINE SPECIFICATION</Text>
            <Tbl>
              <Row><LCell w={6}>MAKER</LCell><VCell w={3}>-</VCell><UCell w={2}></UCell></Row>
              <Row><LCell w={6}>MODEL</LCell><VCell w={3}>-</VCell><UCell w={2}></UCell></Row>
              <Row><LCell w={6}>CLAMPING FORCE</LCell><VCell w={3}>{d.mc_ton}</VCell><UCell w={2}>t</UCell></Row>
              <Row><LCell w={6}>SCREW DIA. {'\u03a6'}</LCell><VCell w={3}>-</VCell><UCell w={2}>mm</UCell></Row>
              <Row><LCell w={6}>MAX INJ. PRESSURE</LCell><VCell w={3}>-</VCell><UCell w={2}>kgf/cm2</UCell></Row>
              <Row><LCell w={6}>MAX INJ. RATE</LCell><VCell w={3}>-</VCell><UCell w={2}>cm3/s</UCell></Row>
            </Tbl>
          </View>
          {/* Cycle */}
          <View style={{ flex: 1 }}>
            <Text style={s.secTitle}>CYCLE TIME</Text>
            <Tbl>
              <Row><LCell w={6}>INJ PRESSURE 1st-2nd</LCell><VCell w={3}>-</VCell><UCell w={2}>sec</UCell></Row>
              <Row><LCell w={6}>INJECTION TIME</LCell><VCell w={3}>-</VCell><UCell w={2}>sec</UCell></Row>
              <Row><LCell w={6}>COOLING</LCell><VCell w={3}>{cooling?.cooling_time || ''}</VCell><UCell w={2}>sec</UCell></Row>
              <Row><LCell w={6}>EJECTOR</LCell><VCell w={3}>-</VCell><UCell w={2}>sec</UCell></Row>
              <Row><LCell w={6}>PICK UP etc.</LCell><VCell w={3}>-</VCell><UCell w={2}>sec</UCell></Row>
              <Row><HCell w={6} bg={C.grey}>TOTAL</HCell><VCell w={3}>{d.cycle_time}</VCell><UCell w={2}>sec</UCell></Row>
            </Tbl>
          </View>
          {/* Weight */}
          <View style={{ flex: 1.3 }}>
            <Text style={s.secTitle}>WEIGHT</Text>
            <Tbl>
              <Row><LCell w={4}>PRODUCT 1</LCell><VCell w={2}>{d.part_weight}</VCell><UCell w={1}>g</UCell><LCell w={4}>PRODUCT 3</LCell><VCell w={2}>-</VCell><UCell w={1}>g</UCell></Row>
              <Row><LCell w={4}>PRODUCT 2</LCell><VCell w={2}>-</VCell><UCell w={1}>g</UCell><LCell w={4}>PRODUCT 4</LCell><VCell w={2}>-</VCell><UCell w={1}>g</UCell></Row>
              <Row><LCell w={4}>PRODUCT 5</LCell><VCell w={2}>-</VCell><UCell w={1}>g</UCell><LCell w={4}>PRODUCT 7</LCell><VCell w={2}>-</VCell><UCell w={1}>g</UCell></Row>
              <Row><LCell w={4}>PRODUCT 6</LCell><VCell w={2}>-</VCell><UCell w={1}>g</UCell><LCell w={4}>PRODUCT 8</LCell><VCell w={2}>-</VCell><UCell w={1}>g</UCell></Row>
              <Row><LCell w={4}>RUNNER</LCell><VCell w={2}>{d.rn_weight}</VCell><UCell w={1}>g</UCell><LCell w={4}>PRODUCT 9</LCell><VCell w={2}>-</VCell><UCell w={1}>g</UCell></Row>
              <Row><LCell w={4}>RUNNER</LCell><VCell w={2}>{d.rn_weight}</VCell><UCell w={1}>g</UCell><LCell w={4}>TOTAL(SHOT)</LCell><VCell w={2}>{totalWeight}</VCell><UCell w={1}>g</UCell></Row>
            </Tbl>
          </View>
        </View>

        {/* ═══ CLAMPING + EJECTOR ═══════════════════════════════════════ */}
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 5 }}>
          {/* Clamping */}
          <View style={{ flex: 7 }}>
            <Text style={s.secTitle}>CLAMPING UNIT</Text>
            <Tbl>
              {/* header: total 220 */}
              <Row style={{ height: 14 }}>
                <Cell w={40} bg={C.grey}></Cell>
                <HCell w={90} bg={C.grey}>MOLD CLOSE</HCell>
                <HCell w={90} bg={C.grey}>MOLD OPEN</HCell>
              </Row>
              <Row style={{ height: 14, backgroundColor: C.grey }}>
                <Cell w={40} bg={C.grey}></Cell>
                <HCell w={18}>1st</HCell><HCell w={18}>2nd</HCell><HCell w={18}>3rd</HCell><HCell w={18}>Low Prs</HCell>
                <Cell w={18} style={{ borderRightWidth: 2, borderColor: C.black }}><Text style={s.hdr}>Hi Prs</Text></Cell>
                <HCell w={18}>1st</HCell><HCell w={18}>2nd</HCell><HCell w={18}>3rd</HCell><HCell w={18}>4th</HCell><HCell w={18}>5th</HCell>
              </Row>
              {/* data */}
              <Row style={{ height: 14 }}>
                <Cell w={40}><Text style={s.lbl}>PRESSURE{'  '}<Text style={s.unit}>(Bar)</Text></Text></Cell>
                <VCell w={18}>{clamping?.mc_prs_1st||''}</VCell><VCell w={18}>{clamping?.mc_prs_2nd||''}</VCell><VCell w={18}>{clamping?.mc_prs_3rd||''}</VCell><VCell w={18}>{clamping?.mc_prs_low||''}</VCell>
                <Cell w={18} style={{ borderRightWidth: 2, borderColor: C.black }}><Text style={s.val}>{clamping?.mc_prs_hi||''}</Text></Cell>
                <VCell w={18}>{clamping?.mo_prs_1st||''}</VCell><VCell w={18}>{clamping?.mo_prs_2nd||''}</VCell><VCell w={18}>{clamping?.mo_prs_3rd||''}</VCell><VCell w={18}>{clamping?.mo_prs_4th||''}</VCell><VCell w={18}>{clamping?.mo_prs_5th||''}</VCell>
              </Row>
              <Row style={{ height: 14 }}>
                <Cell w={40}><Text style={s.lbl}>SPEED{'  '}<Text style={s.unit}>(%)</Text></Text></Cell>
                <VCell w={18}>{clamping?.mc_spd_1st||''}</VCell><VCell w={18}>{clamping?.mc_spd_2nd||''}</VCell><VCell w={18}>{clamping?.mc_spd_3rd||''}</VCell><VCell w={18}>{clamping?.mc_spd_low||''}</VCell>
                <Cell w={18} style={{ borderRightWidth: 2, borderColor: C.black }}><Text style={s.val}>{clamping?.mc_spd_hi||''}</Text></Cell>
                <VCell w={18}>{clamping?.mo_spd_1st||''}</VCell><VCell w={18}>{clamping?.mo_spd_2nd||''}</VCell><VCell w={18}>{clamping?.mo_spd_3rd||''}</VCell><VCell w={18}>{clamping?.mo_spd_4th||''}</VCell><VCell w={18}>{clamping?.mo_spd_5th||''}</VCell>
              </Row>
              <Row style={{ height: 14 }}>
                <Cell w={40}><Text style={s.lbl}>POSITION{'  '}<Text style={s.unit}>(mm)</Text></Text></Cell>
                <VCell w={18}>{clamping?.mc_pos_1st||''}</VCell><VCell w={18}>{clamping?.mc_pos_2nd||''}</VCell><VCell w={18}>{clamping?.mc_pos_3rd||''}</VCell><VCell w={18}>{clamping?.mc_pos_low||''}</VCell>
                <Cell w={18} style={{ borderRightWidth: 2, borderColor: C.black }}><Text style={s.val}>{clamping?.mc_pos_hi||''}</Text></Cell>
                <VCell w={18}>{clamping?.mo_pos_1st||''}</VCell><VCell w={18}>{clamping?.mo_pos_2nd||''}</VCell><VCell w={18}>{clamping?.mo_pos_3rd||''}</VCell><VCell w={18}>{clamping?.mo_pos_4th||''}</VCell><VCell w={18}>{clamping?.mo_pos_5th||''}</VCell>
              </Row>
            </Tbl>
          </View>
          {/* Ejector */}
          <View style={{ flex: 3 }}>
            <Text style={s.secTitle}>EJECTOR</Text>
            <Tbl>
              {/* Fix height on every row so all 5 rows are equal height */}
              <Row style={{ height: 14 }}>
                <HCell w={1} bg={C.grey}>Ejt.Mode</HCell><HCell w={1}>1</HCell>
                <HCell w={1} bg={C.grey}>Ejt count</HCell><HCell w={1}>1</HCell>
              </Row>
              <Row style={{ height: 14, backgroundColor: C.grey }}>
                <HCell w={1}>1st</HCell><HCell w={1}>2nd</HCell><HCell w={1}>1st</HCell><HCell w={1}>2nd</HCell>
              </Row>
              <Row style={{ height: 14 }}>
                <Cell w={1}></Cell><Cell w={1}></Cell><Cell w={1}></Cell><Cell w={1}></Cell>
              </Row>
              <Row style={{ height: 14 }}>
                <VCell w={1}>{clamping?.ej_spd_1st||''}</VCell><VCell w={1}>{clamping?.ej_spd_2nd||''}</VCell>
                <VCell w={1}>{clamping?.ej_prs_1st||''}</VCell><VCell w={1}>{clamping?.ej_prs_2nd||''}</VCell>
              </Row>
              <Row style={{ height: 14 }}>
                <VCell w={1}>{clamping?.ej_pos_1st||''}</VCell><VCell w={1}>{clamping?.ej_pos_2nd||''}</VCell>
                <LCell w={1} bg={C.grey}>DELAY TIME</LCell><VCell w={1}>{clamping?.ej_delay_time||''}</VCell>
              </Row>
            </Tbl>
          </View>
        </View>

        {/* ═══ INJECTION PARAMETER ═════════════════════════════════════ */}
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 5 }}>
          {/* Injection table */}
          <View style={{ flex: 7 }}>
            <Text style={s.secTitle}>INJECTION PARAMETER</Text>
            <Tbl>
              {/* header: total 220 */}
              <Row>
                <Cell w={40} bg={C.grey}></Cell>
                <HCell w={90} bg={C.grey}>2nd (Holding)</HCell>
                <HCell w={90} bg={C.grey}>1st (Injection)</HCell>
              </Row>
              <Row bg={C.grey}>
                <Cell w={40} bg={C.grey}></Cell>
                <HCell w={30}>3rd</HCell>
                <HCell w={30}>2nd</HCell>
                <Cell w={30} style={{ borderRightWidth: 2, borderColor: C.black }}><Text style={s.hdr}>1st</Text></Cell>
                <HCell w={15}>6th</HCell><HCell w={15}>5th</HCell><HCell w={15}>4th</HCell><HCell w={15}>3rd</HCell><HCell w={15}>2nd</HCell><HCell w={15}>1st</HCell>
              </Row>
              {/* data */}
              <Row>
                <Cell w={40}><Text style={s.lbl}>PRESSURE{'  '}<Text style={s.unit}>(Bar)</Text></Text></Cell>
                <VCell w={30}>{injection?.hl_prs_3rd||''}</VCell>
                <VCell w={30}>{injection?.hl_prs_2nd||''}</VCell>
                <Cell w={30} style={{ borderRightWidth: 2, borderColor: C.black }}><Text style={s.val}>{injection?.hl_prs_1st||''}</Text></Cell>
                <VCell w={15}>-</VCell>
                <VCell w={15}>{injection?.ij_prs_5th||''}</VCell><VCell w={15}>{injection?.ij_prs_4th||''}</VCell>
                <VCell w={15}>{injection?.ij_prs_3rd||''}</VCell><VCell w={15}>{injection?.ij_prs_2nd||''}</VCell><VCell w={15}>{injection?.ij_prs_1st||''}</VCell>
              </Row>
              <Row>
                <Cell w={40}><Text style={s.lbl}>SPEED{'  '}<Text style={s.unit}>(%)</Text></Text></Cell>
                <VCell w={30}>{injection?.hl_spd_3rd||''}</VCell>
                <VCell w={30}>{injection?.hl_spd_2nd||''}</VCell>
                <Cell w={30} style={{ borderRightWidth: 2, borderColor: C.black }}><Text style={s.val}>{injection?.hl_spd_1st||''}</Text></Cell>
                <VCell w={15}>-</VCell>
                <VCell w={15}>{injection?.ij_spd_5th||''}</VCell><VCell w={15}>{injection?.ij_spd_4th||''}</VCell>
                <VCell w={15}>{injection?.ij_spd_3rd||''}</VCell><VCell w={15}>{injection?.ij_spd_2nd||''}</VCell><VCell w={15}>{injection?.ij_spd_1st||''}</VCell>
              </Row>
              <Row>
                <Cell w={40}><Text style={s.lbl}>POSITION{'  '}<Text style={s.unit}>(mm)</Text></Text></Cell>
                <VCell w={30}>-</VCell>
                <VCell w={30}>-</VCell>
                <Cell w={30} style={{ borderRightWidth: 2, borderColor: C.black }}><Text style={s.val}>-</Text></Cell>
                <VCell w={15}>{injection?.ij_pos_6th||''}</VCell>
                <VCell w={15}>{injection?.ij_pos_5th||''}</VCell><VCell w={15}>{injection?.ij_pos_4th||''}</VCell>
                <VCell w={15}>{injection?.ij_pos_3rd||''}</VCell><VCell w={15}>{injection?.ij_pos_2nd||''}</VCell><VCell w={15}>{injection?.ij_pos_1st||''}</VCell>
              </Row>
              <Row>
                <Cell w={40}><Text style={s.lbl}>TIMER{'  '}<Text style={s.unit}>(Sec)</Text></Text></Cell>
                <VCell w={30}>{injection?.hl_time_3rd||''}</VCell>
                <VCell w={30}>{injection?.hl_time_2nd||''}</VCell>
                <Cell w={30} style={{ borderRightWidth: 2, borderColor: C.black }}><Text style={s.val}>{injection?.hl_time_1st||''}</Text></Cell>
                <VCell w={15}>-</VCell>
                <VCell w={15}>{injection?.ij_time_5th||''}</VCell><VCell w={15}>{injection?.ij_time_4th||''}</VCell>
                <VCell w={15}>{injection?.ij_time_3rd||''}</VCell><VCell w={15}>{injection?.ij_time_2nd||''}</VCell><VCell w={15}>{injection?.ij_time_1st||''}</VCell>
              </Row>
            </Tbl>
          </View>
          {/* VP Change & Suck Back */}
          <View style={{ flex: 3, justifyContent: 'flex-end' }}>
            <View style={{ borderWidth: 1, borderColor: C.black, padding: 4, marginBottom: 4 }}>
              <Text style={{ fontSize: F.sm, fontWeight: 'bold' }}>VP CHANGE POSITION [  ]</Text>
              <Text style={{ fontSize: F.sm, fontWeight: 'bold', marginTop: 2 }}>TIMER [ {'\u2713'} ]</Text>
              <Text style={{ fontSize: F.sm, fontWeight: 'bold', marginTop: 2 }}>PRESSURE [  ]</Text>
            </View>
            <View style={{ borderWidth: 1, borderColor: C.black, padding: 4 }}>
              <Text style={{ fontSize: F.sm, fontWeight: 'bold' }}>
                SUCK BACK: <Text style={{ color: C.blue }}>{injection?.sc_suck_back || ''}</Text> mm
              </Text>
            </View>
          </View>
        </View>

        {/* ═══ TEMPERATURE ════════════════════════════════════════════ */}
        <Text style={s.secTitle}>TEMPERATURE</Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {/* Barrel */}
          <View style={{ flex: 7 }}>
            <Tbl>
              <Row>
                <Cell w={1} style={{ borderBottomWidth: 2 }}><Text style={{ fontSize: F.hd, fontWeight: 'bold' }}>BAREL TEMPERATURE</Text></Cell>
              </Row>
              <Row bg={C.grey}>
                <HCell w={1}>NOZZLE</HCell><HCell w={1}>C1</HCell><HCell w={1}>C2</HCell><HCell w={1}>C3</HCell>
                <HCell w={1}>C4</HCell><HCell w={1}>C5</HCell><HCell w={1}>C6</HCell><HCell w={1}>C7</HCell>
              </Row>
              <Row>
                <VCell w={1}>{temperature?.nozzle ? `${temperature.nozzle}C` : ''}</VCell>
                <VCell w={1}>{temperature?.zone1 ? `${temperature.zone1}C` : ''}</VCell>
                <VCell w={1}>{temperature?.zone2 ? `${temperature.zone2}C` : ''}</VCell>
                <VCell w={1}>{temperature?.zone3 ? `${temperature.zone3}C` : ''}</VCell>
                <VCell w={1}>{temperature?.zone4 ? `${temperature.zone4}C` : ''}</VCell>
                <VCell w={1}>{temperature?.zone5 ? `${temperature.zone5}C` : ''}</VCell>
                <VCell w={1}>{temperature?.zone6 ? `${temperature.zone6}C` : ''}</VCell>
                <VCell w={1}>{temperature?.zone7 ? `${temperature.zone7}C` : ''}</VCell>
              </Row>
            </Tbl>
          </View>
          {/* Screw */}
          <View style={{ flex: 3 }}>
            <Tbl>
              <Row>
                <Cell w={1} style={{ borderBottomWidth: 2 }}><Text style={{ fontSize: F.hd, fontWeight: 'bold', textAlign: 'center' }}>SCREW CONDITION</Text></Cell>
              </Row>
              <Row>
                <LCell w={2.5}>BACK PRESSURE</LCell>
                <VCell w={1.5}>{injection?.sc_back_pressure || ''}</VCell>
                <UCell w={0.7}>MPa</UCell>
              </Row>
              <Row>
                <LCell w={2.5}>SCREW SPEED</LCell>
                <VCell w={1.5}>{injection?.sc_screw_speed || ''}</VCell>
                <UCell w={0.7}>rpm</UCell>
              </Row>
            </Tbl>
          </View>
        </View>

        {/* Hot Runner */}
        <Tbl style={{ marginTop: 4 }}>
          <Row>
            <Cell w={1} style={{ borderBottomWidth: 2 }}><Text style={{ fontSize: F.hd, fontWeight: 'bold' }}>HOT RUNNER TEMPERATURE [ YES / NO ]</Text></Cell>
          </Row>
          <Row bg={C.grey}>
            {['G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','G11','G12'].map(g => <HCell key={g} w={1}>{g}</HCell>)}
          </Row>
          <Row>
            {[temperature?.hr_zone1, temperature?.hr_zone2, temperature?.hr_zone3, temperature?.hr_zone4,
              temperature?.hr_zone5, temperature?.hr_zone6, temperature?.hr_zone7, temperature?.hr_zone8,
              null, null, null, null].map((v, i) => (
              <VCell key={i} w={1}>{v ? `${v}C` : ''}</VCell>
            ))}
          </Row>
        </Tbl>

        {/* Coolant */}
        <Tbl style={{ marginTop: 4 }}>
          <Row>
            <Cell w={1} style={{ borderBottomWidth: 2 }}><Text style={{ fontSize: F.hd, fontWeight: 'bold' }}>COOLANT TEMPERATURE AND MOLD TEMPERATURE</Text></Cell>
          </Row>
          <Row>
            <Cell w={1} style={{ padding: 4 }}>
              <Text style={{ fontSize: F.hd, fontWeight: 'bold' }}>CAVITY SIDE</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                <Text style={s.lbl}>COLD WATER: <Text style={{ color: C.blue, fontWeight: 'bold' }}>{cooling?.cavity_cold_water || ''}</Text> C</Text>
                <Text style={s.lbl}>HOT WATER: <Text style={{ color: C.blue, fontWeight: 'bold' }}>{cooling?.cavity_hot_water || ''}</Text> C</Text>
              </View>
            </Cell>
            <Cell w={1} style={{ padding: 4 }}>
              <Text style={{ fontSize: F.hd, fontWeight: 'bold' }}>CORE SIDE</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                <Text style={s.lbl}>COLD WATER: <Text style={{ color: C.blue, fontWeight: 'bold' }}>{cooling?.core_cold_water || ''}</Text> C</Text>
                <Text style={s.lbl}>HOT WATER: <Text style={{ color: C.blue, fontWeight: 'bold' }}>{cooling?.core_hot_water || ''}</Text> C</Text>
              </View>
            </Cell>
          </Row>
        </Tbl>

        {/* ═══ TOLERANCE + SIGNATURES ═══════════════════════════════ */}
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 5 }}>
          {/* Tolerance */}
          <View style={{ flex: 4 }}>
            <Tbl>
              <Row>
                <Cell w={1} style={{ borderBottomWidth: 2 }}>
                  <Text style={{ fontSize: F.hd, fontWeight: 'bold' }}>TOLERANCE</Text>
                </Cell>
              </Row>
              {[
                ['All Temperature', '+/- 10 C'],
                ['All Pressure',    '+/- 10 bar'],
                ['All Speed',       '+/- 10 %'],
                ['All Position',    '+/- 10 mm.'],
                ['All Time',        '+/- 10 sec.'],
              ].map(([label, val]) => (
                <Row key={label}>
                  <LCell w={5}>{label}</LCell>
                  <LCell w={1} bg={C.grey}>=</LCell>
                  <LCell w={4}>{val}</LCell>
                </Row>
              ))}
            </Tbl>
          </View>
          {/* Signatures */}
          <View style={{ flex: 6 }}>
            {/* explicit border approach - Tbl+flexGrow loses borders in react-pdf */}
            <View style={{
              borderWidth: 2, borderColor: C.black,
              flexDirection: 'column', flexGrow: 1,
            }}>
              {/* header row */}
              <View style={{ flexDirection: 'row', borderBottomWidth: 2, borderColor: C.black }}>
                <View style={{ flex: 1, padding: 2, borderRightWidth: 1, borderColor: C.black, backgroundColor: C.grey }}>
                  <Text style={s.hdr}>APPROVE BY</Text>
                </View>
                <View style={{ flex: 1, padding: 2, borderRightWidth: 1, borderColor: C.black, backgroundColor: C.grey }}>
                  <Text style={s.hdr}>CHECKED BY</Text>
                </View>
                <View style={{ flex: 1, padding: 2, backgroundColor: C.grey }}>
                  <Text style={s.hdr}>ISSUE BY</Text>
                </View>
              </View>
              {/* signature area - grows to fill remaining space */}
              <View style={{ flexGrow: 1, flexDirection: 'row', minHeight: 55 }}>
                <View style={{ flex: 1, borderRightWidth: 1, borderColor: C.black }}></View>
                <View style={{ flex: 1, borderRightWidth: 1, borderColor: C.black }}></View>
                <View style={{ flex: 1 }}></View>
              </View>
            </View>
            <Text style={{ textAlign: 'right', fontSize: F.sm, fontWeight: 'bold', marginTop: 2 }}>FM-PD-06-00</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};

export default ParameterSheetPdf;
