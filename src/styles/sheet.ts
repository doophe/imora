/**
 * sheet.ts — Ortak Bottom Sheet & Kart Stilleri
 *
 * CSS modülü gibi kullanın:
 *   import { sheetStyles, COLORS, RADIUS, FONT, SHADOW } from '../styles/sheet';
 *
 * Yeni bir kart/sheet bileşeni oluşturulduğunda bu dosyadan token
 * ve hazır stil bloklarını alarak kod tekrarını önleyin.
 */

import { Dimensions, Platform, StyleSheet } from 'react-native';

const { height: SH } = Dimensions.get('window');

// ─── Tasarım Token'ları ───────────────────────────────────────────────────────
export const COLORS = {
  amber:        '#F59E0B',
  amberDark:    '#D97706',
  amberSub:     'rgba(245,158,11,0.15)',
  amberBorder:  'rgba(245,158,11,0.25)',
  blue:         '#0096C7',
  blueDark:     '#0077B6',
  teal:         '#0096C7',
  tealDark:     '#0077B6',
  bg:           '#0C0C1A',
  bgLight:      '#12102A',
  slate:        '#0F172A',
  textPrimary:  '#FFFFFF',
  textSub:      'rgba(255,255,255,0.55)',
  textMuted:    'rgba(255,255,255,0.28)',
  border:       'rgba(255,255,255,0.1)',
  borderStrong: 'rgba(255,255,255,0.18)',
  overlay:      'rgba(0,0,0,0.72)',
  black:        '#000000',
} as const;

export const RADIUS = {
  xs:  6,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 28,
} as const;

export const FONT = {
  labelXS: { fontSize: 9,  fontWeight: '700' as const, letterSpacing: 0.8 },
  labelSM: { fontSize: 10, fontWeight: '800' as const, letterSpacing: 1.2 },
  labelMD: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.5 },
  body:    { fontSize: 13, fontWeight: '400' as const, lineHeight: 21 },
  title:   { fontSize: 22, fontWeight: '800' as const, letterSpacing: 0.2 },
  btnText: { fontSize: 16, fontWeight: '800' as const, letterSpacing: 0.3 },
} as const;

export const SHADOW = {
  amber: Platform.select({
    ios: {
      shadowColor:   '#F59E0B',
      shadowOffset:  { width: 0, height: 4 },
      shadowOpacity: 0.45,
      shadowRadius:  12,
    },
    android: { elevation: 8 },
  }),
  card: Platform.select({
    ios: {
      shadowColor:   '#000',
      shadowOffset:  { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius:  16,
    },
    android: { elevation: 10 },
  }),
} as const;

// ─── Sheet Boyutları ─────────────────────────────────────────────────────────
export const SHEET_MAX_H    = SH * 0.92;
export const SNAP_THRESHOLD = SH * 0.18; // Bu kadar aşağı çekilirse kapat

// ─── Ortak StyleSheet ────────────────────────────────────────────────────────
export const sheetStyles = StyleSheet.create({

  // ── Backdrop ─────────────────────────────────────────────────────────────
  backdrop: {
    position:        'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },

  // ── Sheet kapsayıcı ──────────────────────────────────────────────────────
  sheet: {
    backgroundColor:      '#0C0C1A',
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    borderWidth:          1,
    borderBottomWidth:    0,
    borderColor:          'rgba(255,255,255,0.1)',
    overflow:             'hidden',
  },

  // ── Sürükleme çubuğu (handle) ────────────────────────────────────────────
  handleRow: {
    alignItems:    'center',
    paddingTop:    14,
    paddingBottom: 8,
  },
  handle: {
    width:           40,
    height:          4,
    borderRadius:    2,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  // ── X kapat butonu ───────────────────────────────────────────────────────
  closeBtn: {
    position:     'absolute',
    top:          14,
    right:        16,
    width:        34,
    height:       34,
    borderRadius: 17,
    overflow:     'hidden',
    zIndex:       10,
  },
  closeBtnInner: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.15)',
    borderRadius:    17,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  closeBtnText: {
    color:      'rgba(255,255,255,0.6)',
    fontSize:   13,
    fontWeight: '700',
  },

  // ── Kategori etiketi (amber pill) ────────────────────────────────────────
  categoryTag: {
    alignSelf:         'flex-start',
    backgroundColor:   'rgba(245,158,11,0.15)',
    borderRadius:      6,
    paddingHorizontal: 10,
    paddingVertical:   4,
    marginBottom:      10,
    borderWidth:       1,
    borderColor:       'rgba(245,158,11,0.25)',
  },
  categoryTagText: {
    color:         '#F59E0B',
    fontSize:      10,
    fontWeight:    '800',
    letterSpacing: 1.2,
  },

  // ── Sheet başlığı ────────────────────────────────────────────────────────
  sheetTitle: {
    color:         '#FFFFFF',
    fontSize:      22,
    fontWeight:    '800',
    letterSpacing: 0.2,
    lineHeight:    30,
  },

  // ── Etiket satırı ────────────────────────────────────────────────────────
  tagsRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           6,
    marginBottom:  20,
  },
  tag: {
    backgroundColor:   'rgba(255,255,255,0.06)',
    borderRadius:      8,
    paddingHorizontal: 10,
    paddingVertical:   5,
    borderWidth:       1,
    borderColor:       'rgba(255,255,255,0.1)',
  },
  tagText: {
    color:      'rgba(255,255,255,0.55)',
    fontSize:   11,
    fontWeight: '500',
  },

  // ── Bölüm başlığı (Önce/Sonra gibi) ─────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  12,
    gap:           10,
  },
  sectionAccent: {
    width:        3,
    height:       16,
    borderRadius: 2,
  },
  sectionTitle: {
    flex:          1,
    color:         '#FFFFFF',
    fontSize:      14,
    fontWeight:    '700',
    letterSpacing: 0.3,
  },
  sectionHint: {
    color:      'rgba(255,255,255,0.3)',
    fontSize:   10,
    fontWeight: '500',
  },

  // ── Carousel dot indikatörler ────────────────────────────────────────────
  dotsRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    gap:            6,
    marginTop:      12,
  },
  dot: {
    borderRadius: 4,
    height:       6,
  },
  dotActive: {
    width:           20,
    backgroundColor: '#F59E0B',
  },
  dotInactive: {
    width:           6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // ── Prompt metin bloğu ───────────────────────────────────────────────────
  promptBlock: {
    marginBottom:  20,
    borderRadius:  12,
    overflow:      'hidden',
    borderWidth:   1,
    borderColor:   'rgba(245,158,11,0.18)',
  },
  promptBgInner: {
    padding: 16,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  10,
    gap:           8,
  },
  promptDot: {
    width:           6,
    height:          6,
    borderRadius:    3,
    backgroundColor: '#F59E0B',
  },
  promptLabel: {
    color:         '#F59E0B',
    fontSize:      10,
    fontWeight:    '800',
    letterSpacing: 1.5,
  },
  promptText: {
    color:      'rgba(255,255,255,0.7)',
    fontSize:   13,
    lineHeight: 21,
    fontWeight: '400',
  },

  // ── Sabit aksiyon butonu alanı (tab bar gibi) ────────────────────────────
  stickyBtnArea: {
    position:          'absolute',
    left:              0,
    right:             0,
    bottom:            0,
    paddingHorizontal: 16,
    paddingTop:        12,
    backgroundColor:   'rgba(12,12,26,0.97)',
    borderTopWidth:    1,
    borderTopColor:    'rgba(255,255,255,0.07)',
  },
  stickyFade: {
    position: 'absolute',
    top:      -24,
    left:     0,
    right:    0,
    height:   24,
  },

  // ── Amber ana aksiyon butonu (Promptu Kopyala vb.) ───────────────────────
  primaryBtnWrap: {
    width: '100%',
  },
  primaryBtnTouch: {
    width:        '100%',
    borderRadius: 16,
    overflow:     'hidden',
    ...Platform.select({
      ios: {
        shadowColor:   '#F59E0B',
        shadowOffset:  { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius:  12,
      },
      android: { elevation: 8 },
    }),
  },
  primaryBtn: {
    width:           '100%',
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 17,
    gap:             10,
  },
  primaryBtnIcon: {
    color:      '#000000',
    fontSize:   18,
    fontWeight: '900',
  },
  primaryBtnText: {
    color:         '#000000',
    fontSize:      16,
    fontWeight:    '800',
    letterSpacing: 0.3,
  },
});
